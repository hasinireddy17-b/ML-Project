import type { Job } from '../../../types/job';
import type { UserProfile } from '../../../types/user';
import { rawJobs } from '../../../data/jobs';
import { preprocessJobs, type PreprocessingReport } from '../lifecycle/preprocessing';
import { TfidfVectorizer, type SparseVector } from '../lifecycle/tfidf';
import { candidateDocuments, jobDocuments } from '../lifecycle/features';
import { detectAnomalies, type AnomalyResult } from '../unsupervised/anomaly';

/**
 * MODULE 6 · FEATURE STORE
 * Single source of fitted transformers + precomputed job vectors. Candidate vectors are
 * produced with the *same* fitted vectorizers at serving time (training–serving skew prevention).
 */

export interface JobVectors {
  title: SparseVector;
  skills: SparseVector;
  description: SparseVector;
  combined: SparseVector;
}

type VectorKey = keyof JobVectors;

export interface FeatureStore {
  datasetVersion: string;
  builtAt: string;
  allJobs: Job[];
  servableJobs: Job[];
  jobsById: Map<string, Job>;
  report: PreprocessingReport;
  vectorizers: Record<VectorKey, TfidfVectorizer>;
  vectors: Map<string, JobVectors>;
  anomalies: AnomalyResult[];
}

export const FEATURE_SCHEMA = {
  numerical: ['salary_min', 'salary_max', 'experience_min', 'experience_max', 'job_age_days'],
  categorical: ['category', 'location', 'work_mode', 'experience_level', 'employment_type', 'industry'],
  text: ['job_title', 'job_description', 'required_skills', 'preferred_skills'],
  engineered: [
  'skill_match',
  'title_similarity',
  'description_similarity',
  'location_fit',
  'experience_fit',
  'work_mode_fit',
  'interest_fit',
  'salary_fit',
  'employment_fit']

};

const KEYS: VectorKey[] = ['title', 'skills', 'description', 'combined'];
let cached: FeatureStore | null = null;

function build(): FeatureStore {
  const { jobs, report } = preprocessJobs(rawJobs);
  const docs = jobs.map(jobDocuments);
  const vectorizers = Object.fromEntries(
    KEYS.map((k) => [k, new TfidfVectorizer().fit(docs.map((d) => d[k]))])
  ) as Record<VectorKey, TfidfVectorizer>;

  const vectors = new Map<string, JobVectors>(
    jobs.map((j, i) => [
    j.job_id,
    Object.fromEntries(KEYS.map((k) => [k, vectorizers[k].transform(docs[i][k])])) as unknown as JobVectors]
    )
  );

  const anomalies = detectAnomalies(jobs, vectors);
  const held = new Set(anomalies.filter((a) => a.held).map((a) => a.job_id));

  return {
    datasetVersion: 'jobs-2026.09.28',
    builtAt: new Date().toISOString(),
    allJobs: jobs,
    servableJobs: jobs.filter((j) => !held.has(j.job_id)),
    jobsById: new Map(jobs.map((j) => [j.job_id, j])),
    report,
    vectorizers,
    vectors,
    anomalies
  };
}

export function getFeatureStore(): FeatureStore {
  if (!cached) cached = build();
  return cached;
}

/** Re-runs the full data pipeline (used by the retraining flow). */
export function rebuildFeatureStore(): FeatureStore {
  cached = build();
  return cached;
}

export function vectorizeCandidate(profile: UserProfile): JobVectors {
  const store = getFeatureStore();
  const docs = candidateDocuments(profile);
  return Object.fromEntries(KEYS.map((k) => [k, store.vectorizers[k].transform(docs[k])])) as unknown as JobVectors;
}