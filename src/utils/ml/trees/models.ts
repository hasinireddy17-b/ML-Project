import { mulberry32, shuffle } from '../random';
import { sigmoid } from '../linear/models';

/**
 * MODULE 3 · TREE MODELS
 * CART regression tree (variance reduction) as the shared building block for a Decision Tree
 * classifier, a bagged Random Forest, and a Gradient Boosted Trees classifier.
 * Impurity-based feature importance is accumulated during tree growth.
 */

export interface ProbabilisticClassifier {
  fit(X: number[][], y: number[]): ProbabilisticClassifier;
  predictProba(X: number[][]): number[];
}

type TreeNode =
{leaf: true;value: number;} |
{leaf: false;feature: number;threshold: number;left: TreeNode;right: TreeNode;};

export interface TreeConfig {
  maxDepth: number;
  minSamplesLeaf: number;
  maxFeatures?: number;
  seed?: number;
}

export class RegressionTree {
  importances: number[] = [];
  private root: TreeNode = { leaf: true, value: 0 };
  private rng: () => number;

  constructor(private cfg: TreeConfig) {
    this.rng = mulberry32(cfg.seed ?? 1);
  }

  fit(X: number[][], y: number[], indices?: number[]): this {
    this.importances = new Array(X[0]?.length ?? 0).fill(0);
    this.root = this.build(X, y, indices ?? X.map((_, i) => i), 0);
    return this;
  }

  private build(X: number[][], y: number[], idx: number[], depth: number): TreeNode {
    const n = idx.length;
    let sumAll = 0;
    let sqAll = 0;
    idx.forEach((i) => {
      sumAll += y[i];
      sqAll += y[i] * y[i];
    });
    const mean = sumAll / (n || 1);
    const minLeaf = this.cfg.minSamplesLeaf;
    if (depth >= this.cfg.maxDepth || n < 2 * minLeaf) return { leaf: true, value: mean };

    const d = X[0].length;
    let features = Array.from({ length: d }, (_, j) => j);
    if (this.cfg.maxFeatures && this.cfg.maxFeatures < d) features = shuffle(features, this.rng).slice(0, this.cfg.maxFeatures);

    const parentSSE = sqAll - sumAll * sumAll / n;
    let best = { gain: 1e-9, feature: -1, threshold: 0 };
    for (const f of features) {
      const sorted = [...idx].sort((a, b) => X[a][f] - X[b][f]);
      let sl = 0;
      let ql = 0;
      for (let p = 0; p < n - 1; p++) {
        const i = sorted[p];
        sl += y[i];
        ql += y[i] * y[i];
        const nl = p + 1;
        const nr = n - nl;
        if (nl < minLeaf || nr < minLeaf) continue;
        const xv = X[i][f];
        const xn = X[sorted[p + 1]][f];
        if (xv === xn) continue;
        const sr = sumAll - sl;
        const qr = sqAll - ql;
        const sse = ql - sl * sl / nl + (qr - sr * sr / nr);
        const gain = parentSSE - sse;
        if (gain > best.gain) best = { gain, feature: f, threshold: (xv + xn) / 2 };
      }
    }
    if (best.feature < 0) return { leaf: true, value: mean };

    this.importances[best.feature] += best.gain;
    const left = idx.filter((i) => X[i][best.feature] <= best.threshold);
    const right = idx.filter((i) => X[i][best.feature] > best.threshold);
    return {
      leaf: false,
      feature: best.feature,
      threshold: best.threshold,
      left: this.build(X, y, left, depth + 1),
      right: this.build(X, y, right, depth + 1)
    };
  }

  predictOne(x: number[]): number {
    let node: TreeNode = this.root;
    while (!node.leaf) node = x[node.feature] <= node.threshold ? node.left : node.right;
    return node.value;
  }

  predict(X: number[][]): number[] {
    return X.map((x) => this.predictOne(x));
  }
}

export class DecisionTreeClassifier implements ProbabilisticClassifier {
  private tree: RegressionTree;

  constructor(cfg: Partial<TreeConfig> = {}) {
    this.tree = new RegressionTree({ maxDepth: 4, minSamplesLeaf: 5, ...cfg });
  }

  fit(X: number[][], y: number[]): this {
    this.tree.fit(X, y);
    return this;
  }

  predictProba(X: number[][]): number[] {
    return this.tree.predict(X).map((p) => Math.min(1, Math.max(0, p)));
  }

  get importances(): number[] {
    return this.tree.importances;
  }
}

export class RandomForestClassifier implements ProbabilisticClassifier {
  private trees: RegressionTree[] = [];

  constructor(private opts: {nTrees: number;maxDepth: number;minSamplesLeaf?: number;seed?: number;}) {}

  fit(X: number[][], y: number[]): this {
    const rng = mulberry32(this.opts.seed ?? 17);
    const d = X[0]?.length ?? 0;
    this.trees = Array.from({ length: this.opts.nTrees }, (_, t) => {
      const boot = Array.from({ length: X.length }, () => Math.floor(rng() * X.length));
      return new RegressionTree({
        maxDepth: this.opts.maxDepth,
        minSamplesLeaf: this.opts.minSamplesLeaf ?? 3,
        maxFeatures: Math.max(1, Math.ceil(Math.sqrt(d))),
        seed: (this.opts.seed ?? 17) + t * 31
      }).fit(X, y, boot);
    });
    return this;
  }

  predictProba(X: number[][]): number[] {
    return X.map((x) => this.trees.reduce((s, t) => s + t.predictOne(x), 0) / (this.trees.length || 1));
  }
}

export class GradientBoostingClassifier implements ProbabilisticClassifier {
  private trees: RegressionTree[] = [];
  private f0 = 0;

  constructor(private opts: {nEstimators: number;learningRate: number;maxDepth: number;}) {}

  fit(X: number[][], y: number[]): this {
    const p = Math.min(0.99, Math.max(0.01, y.reduce((a, b) => a + b, 0) / (y.length || 1)));
    this.f0 = Math.log(p / (1 - p));
    const F = new Array(X.length).fill(this.f0);
    this.trees = [];
    for (let m = 0; m < this.opts.nEstimators; m++) {
      const residual = y.map((yi, i) => yi - sigmoid(F[i]));
      const tree = new RegressionTree({ maxDepth: this.opts.maxDepth, minSamplesLeaf: 4, seed: m + 1 }).fit(X, residual);
      const pred = tree.predict(X);
      for (let i = 0; i < F.length; i++) F[i] += this.opts.learningRate * pred[i] * 4;
      this.trees.push(tree);
    }
    return this;
  }

  predictProba(X: number[][]): number[] {
    return X.map((x) => sigmoid(this.trees.reduce((s, t) => s + this.opts.learningRate * t.predictOne(x) * 4, this.f0)));
  }
}