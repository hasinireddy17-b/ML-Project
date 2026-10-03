import type { Job } from '../../../types/job';
import { trainingProfiles } from '../../../data/trainingProfiles';
import { experienceLevels, jobCategories, locations, workModes } from '../../../data/skills';
import { getFeatureStore } from '../engineering/featureStore';
import { MODEL_VERSIONS, type RankingWeights } from '../engineering/registry';
import { createMatcher } from '../recommender';
import { LinearRegression, LogisticRegression, OneHotEncoder, StandardScaler, type Penalty } from '../linear/models';
import { DecisionTreeClassifier, GradientBoostingClassifier, RandomForestClassifier, type ProbabilisticClassifier } from '../trees/models';
import { permutationImportance } from '../trees/importance';
import { accuracy, f1, mae, mean, ndcgAtK, prAuc, precision, precisionAtK, r2, recall, recallAtK, rmse, rocAuc } from './metrics';
import { formatParams, gridSearch, kFold, randomSearch, stratifiedKFold, stratifiedSplit, type Params, type SearchTrial } from './validation';
import { gaussian, mulberry32 } from '../random';

/**
 * MODULE 5 · LIVE EXPERIMENT
 * Builds (candidate, job) pairs from synthetic personas with simulated feedback labels,
 * does a stratified train/test split, selects models with stratified 5-fold CV (grid search
 * for logistic regression, random search for the forest), and touches the test set once.
 */

export const FEATURE_LABELS: Record<keyof RankingWeights, string> = {
  skills: 'Skill match',
  title: 'Title similarity',
  description: 'Description similarity',
  location: 'Location fit',
  experience: 'Experience fit',
  work_mode: 'Work mode fit',
  interest: 'Career interest',
  salary: 'Salary fit',
  employment: 'Employment type'
};
const KEYS = Object.keys(FEATURE_LABELS) as (keyof RankingWeights)[];

export interface TestMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  rocAuc: number;
  prAuc: number;
}

export interface ClassifierScore {
  name: string;
  family: string;
  params: string;
  cvF1: number;
  cvAuc: number;
  test: TestMetrics;
  trainMs: number;
  selected: boolean;
}

export interface RegressionScore {
  name: string;
  params: string;
  rmse: number;
  mae: number;
  r2: number;
  nonZero: number;
}

export interface RankingScore {
  version: string;
  label: string;
  precisionAt5: number;
  recallAt10: number;
  ndcgAt10: number;
}

export interface CalibrationBin {
  bin: string;
  predicted: number;
  observed: number;
  count: number;
}

export interface LiveExperimentResult {
  ranAt: number;
  durationMs: number;
  dataset: {rows: number;positives: number;features: number;train: number;test: number;folds: number;};
  grid: {params: string;f1: number;auc: number;}[];
  random: {params: string;f1: number;auc: number;}[];
  classifiers: ClassifierScore[];
  regression: RegressionScore[];
  ranking: RankingScore[];
  importance: {feature: string;importance: number;}[];
  calibration: CalibrationBin[];
}

function testMetrics(y: number[], p: number[]): TestMetrics {
  const pred = p.map((v) => v >= 0.5 ? 1 : 0);
  return { accuracy: accuracy(y, pred), precision: precision(y, pred), recall: recall(y, pred), f1: f1(y, pred), rocAuc: rocAuc(y, p), prAuc: prAuc(y, p) };
}

function buildDataset(seed: number) {
  const store = getFeatureStore();
  const rng = mulberry32(seed);
  const X: number[][] = [];
  const y: number[] = [];
  const labelsByProfile: Map<string, number>[] = [];
  trainingProfiles.forEach((profile) => {
    const matcher = createMatcher(profile, [], 'model_v2');
    const labels = new Map<string, number>();
    store.servableJobs.forEach((job) => {
      const c = matcher(job).components;
      const hidden =
      0.36 * c.skills + 0.12 * c.title + 0.06 * c.description + 0.14 * c.experience + 0.12 * c.location +
      0.08 * c.work_mode + 0.07 * c.interest + 0.03 * c.salary + 0.02 * c.employment;
      const label = 10 * (hidden - 0.55) + gaussian(rng) * 0.9 > 0 ? 1 : 0;
      X.push(KEYS.map((k) => c[k]));
      y.push(label);
      labels.set(job.job_id, label);
    });
    labelsByProfile.push(labels);
  });
  return { X, y, labelsByProfile };
}

function salaryFeatures(jobs: Job[]): number[][] {
  const cat = new OneHotEncoder(jobCategories);
  const loc = new OneHotEncoder(locations);
  const mode = new OneHotEncoder(workModes);
  const lvl = new OneHotEncoder(experienceLevels);
  return jobs.map((j) => [
  j.experience_min,
  j.experience_max,
  ...cat.transform(j.category),
  ...loc.transform(j.location),
  ...mode.transform(j.work_mode),
  ...lvl.transform(j.experience_level)]
  );
}

const summarize = (t: SearchTrial) => ({ params: formatParams(t.params), f1: t.score, auc: t.metrics.auc });

let last: LiveExperimentResult | null = null;

export function getLastExperiment(): LiveExperimentResult | null {
  return last;
}

export function runLiveExperiment(seed = 42): LiveExperimentResult {
  const t0 = performance.now();
  const rng = mulberry32(seed);
  const { X: rawX, y, labelsByProfile } = buildDataset(seed);
  const { train, test } = stratifiedSplit(y, 0.2, rng);

  // Scaler is fit on training rows only — no information from the test set leaks in.
  const scaler = new StandardScaler().fit(train.map((i) => rawX[i]));
  const X = scaler.transform(rawX);
  const rows = (idx: number[]) => idx.map((i) => X[i]);
  const labels = (idx: number[]) => idx.map((i) => y[i]);
  const folds = stratifiedKFold(y, 5, rng, train);

  const cv = (make: () => ProbabilisticClassifier) => {
    const f1s: number[] = [];
    const aucs: number[] = [];
    folds.forEach((fold) => {
      const model = make().fit(rows(fold.train), labels(fold.train));
      const p = model.predictProba(rows(fold.val));
      const yv = labels(fold.val);
      f1s.push(f1(yv, p.map((v) => v >= 0.5 ? 1 : 0)));
      aucs.push(rocAuc(yv, p));
    });
    return { score: mean(f1s), metrics: { auc: mean(aucs) } };
  };

  const makeLogistic = (p: Params) => () =>
  new LogisticRegression({ penalty: p.penalty as Penalty, alpha: 0.1 / Number(p.C), l1Ratio: 0.5 });
  const grid = gridSearch({ penalty: ['l2', 'l1', 'elasticnet'], C: [0.1, 1, 10] }, (p) => cv(makeLogistic(p)));

  const makeForest = (p: Params) => () =>
  new RandomForestClassifier({ nTrees: Number(p.n_estimators), maxDepth: Number(p.max_depth), seed: 17 });
  const random = randomSearch(
    { n_estimators: (r) => 15 + Math.floor(r() * 3) * 5, max_depth: (r) => 3 + Math.floor(r() * 3) },
    3,
    rng,
    (p) => cv(makeForest(p))
  );

  const candidates: {name: string;family: string;params: Params;make: () => ProbabilisticClassifier;cv?: SearchTrial;}[] = [
  { name: 'Logistic Regression', family: 'Linear', params: grid[0].params, make: makeLogistic(grid[0].params), cv: grid[0] },
  { name: 'Decision Tree', family: 'Tree', params: { max_depth: 4, min_samples_leaf: 5 }, make: () => new DecisionTreeClassifier({ maxDepth: 4, minSamplesLeaf: 5 }) },
  { name: 'Random Forest', family: 'Ensemble', params: random[0].params, make: makeForest(random[0].params), cv: random[0] },
  {
    name: 'Gradient Boosting',
    family: 'Ensemble',
    params: { n_estimators: 40, learning_rate: 0.1, max_depth: 3 },
    make: () => new GradientBoostingClassifier({ nEstimators: 40, learningRate: 0.1, maxDepth: 3 })
  }];


  const trained = candidates.map((c) => {
    const cvRes = c.cv ?? { params: c.params, ...cv(c.make) };
    const start = performance.now();
    const model = c.make().fit(rows(train), labels(train));
    const trainMs = performance.now() - start;
    return {
      score: {
        name: c.name,
        family: c.family,
        params: formatParams(c.params),
        cvF1: cvRes.score,
        cvAuc: cvRes.metrics.auc,
        test: testMetrics(labels(test), model.predictProba(rows(test))),
        trainMs,
        selected: false
      } as ClassifierScore,
      model
    };
  });
  const best = trained.reduce((a, b) => b.score.cvF1 > a.score.cvF1 ? b : a);
  best.score.selected = true;

  const testRows = rows(test);
  const testLabels = labels(test);
  const importance = permutationImportance(
    (M) => best.model.predictProba(M),
    testRows,
    testLabels,
    KEYS.map((k) => FEATURE_LABELS[k]),
    rocAuc
  );

  const probs = best.model.predictProba(testRows);
  const calibration: CalibrationBin[] = Array.from({ length: 5 }, (_, b) => {
    const lo = b / 5;
    const hi = (b + 1) / 5;
    const idx = probs.map((p, i) => p >= lo && (p < hi || b === 4 && p <= 1) ? i : -1).filter((i) => i >= 0);
    return {
      bin: `${Math.round(lo * 100)}–${Math.round(hi * 100)}%`,
      predicted: idx.length ? mean(idx.map((i) => probs[i])) : (lo + hi) / 2,
      observed: idx.length ? mean(idx.map((i) => testLabels[i])) : 0,
      count: idx.length
    };
  });

  // Salary estimator: linear vs Ridge / Lasso / Elastic Net with 5-fold CV
  const jobs = getFeatureStore().servableJobs;
  const SX = salaryFeatures(jobs);
  const sy = jobs.map((j) => j.salary_max);
  const rFolds = kFold(jobs.length, 5, rng);
  const configs: {name: string;penalty: Penalty;alpha: number;}[] = [
  { name: 'Linear Regression', penalty: 'none', alpha: 0 },
  { name: 'Ridge (L2)', penalty: 'l2', alpha: 0.1 },
  { name: 'Lasso (L1)', penalty: 'l1', alpha: 0.02 },
  { name: 'Elastic Net', penalty: 'elasticnet', alpha: 0.05 }];

  const regression: RegressionScore[] = configs.map((cfg) => {
    const preds = new Array(jobs.length).fill(0);
    rFolds.forEach((fold) => {
      const sc = new StandardScaler().fit(fold.train.map((i) => SX[i]));
      const model = new LinearRegression({ penalty: cfg.penalty, alpha: cfg.alpha, l1Ratio: 0.5, epochs: 400, learningRate: 0.05 }).fit(
        sc.transform(fold.train.map((i) => SX[i])),
        fold.train.map((i) => sy[i])
      );
      const out = model.predict(sc.transform(fold.val.map((i) => SX[i])));
      fold.val.forEach((row, k) => preds[row] = out[k]);
    });
    const full = new LinearRegression({ penalty: cfg.penalty, alpha: cfg.alpha, l1Ratio: 0.5, epochs: 400, learningRate: 0.05 }).fit(
      new StandardScaler().fitTransform(SX),
      sy
    );
    return {
      name: cfg.name,
      params: cfg.penalty === 'none' ? '—' : `alpha=${cfg.alpha}${cfg.penalty === 'elasticnet' ? ', l1_ratio=0.5' : ''}`,
      rmse: rmse(sy, preds),
      mae: mae(sy, preds),
      r2: r2(sy, preds),
      nonZero: full.weights.filter((w) => Math.abs(w) > 1e-4).length
    };
  });

  const ranking: RankingScore[] = MODEL_VERSIONS.map((v) => {
    const perProfile = trainingProfiles.map((profile, pi) => {
      const matcher = createMatcher(profile, [], v.version);
      const ranked = [...jobs].sort((a, b) => matcher(b).raw - matcher(a).raw);
      const rel = ranked.map((j) => labelsByProfile[pi].get(j.job_id) ?? 0);
      return { p5: precisionAtK(rel, 5), r10: recallAtK(rel, 10), n10: ndcgAtK(rel, 10) };
    });
    return {
      version: v.version,
      label: v.label,
      precisionAt5: mean(perProfile.map((p) => p.p5)),
      recallAt10: mean(perProfile.map((p) => p.r10)),
      ndcgAt10: mean(perProfile.map((p) => p.n10))
    };
  });

  last = {
    ranAt: Date.now(),
    durationMs: performance.now() - t0,
    dataset: { rows: y.length, positives: y.filter((v) => v === 1).length, features: KEYS.length, train: train.length, test: test.length, folds: 5 },
    grid: grid.map(summarize),
    random: random.map(summarize),
    classifiers: trained.map((t) => t.score),
    regression,
    ranking,
    importance,
    calibration
  };
  return last;
}