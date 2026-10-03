/**
 * DEMO DATA for the admin console — represents runs and telemetry from the offline
 * Python ML service. Every screen that renders this data labels it "Demo data".
 */

export type RunStatus = 'Selected' | 'Completed' | 'Archived' | 'Failed';

export interface ExperimentRun {
  id: string;
  model: string;
  family: string;
  trainedAt: string;
  datasetVersion: string;
  features: number;
  featureSet: string;
  metrics: {f1: number;rocAuc: number;precision: number;recall: number;};
  hyperparameters: Record<string, string | number>;
  durationSec: number;
  status: RunStatus;
}

export const experimentRuns: ExperimentRun[] = [
{ id: 'exp-0146', model: 'XGBoost', family: 'Gradient boosting', trainedAt: '2026-09-28', datasetVersion: 'jobs-2026.09.28', features: 38, featureSet: 'Match features + one-hot categoricals + TF-IDF SVD(16)', metrics: { f1: 0.91, rocAuc: 0.94, precision: 0.9, recall: 0.92 }, hyperparameters: { max_depth: 5, eta: 0.05, n_estimators: 450, subsample: 0.8 }, durationSec: 186, status: 'Selected' },
{ id: 'exp-0145', model: 'LightGBM', family: 'Gradient boosting', trainedAt: '2026-09-28', datasetVersion: 'jobs-2026.09.28', features: 38, featureSet: 'Match features + one-hot categoricals + TF-IDF SVD(16)', metrics: { f1: 0.9, rocAuc: 0.94, precision: 0.89, recall: 0.91 }, hyperparameters: { num_leaves: 31, learning_rate: 0.05, n_estimators: 400 }, durationSec: 94, status: 'Completed' },
{ id: 'exp-0144', model: 'Gradient Boosting', family: 'Gradient boosting', trainedAt: '2026-09-27', datasetVersion: 'jobs-2026.09.28', features: 38, featureSet: 'Match features + one-hot categoricals', metrics: { f1: 0.9, rocAuc: 0.93, precision: 0.88, recall: 0.91 }, hyperparameters: { n_estimators: 300, learning_rate: 0.05, max_depth: 3 }, durationSec: 241, status: 'Completed' },
{ id: 'exp-0143', model: 'Random Forest', family: 'Bagging', trainedAt: '2026-09-27', datasetVersion: 'jobs-2026.09.28', features: 38, featureSet: 'Match features + one-hot categoricals', metrics: { f1: 0.87, rocAuc: 0.92, precision: 0.86, recall: 0.88 }, hyperparameters: { n_estimators: 500, max_depth: 12, max_features: 'sqrt' }, durationSec: 132, status: 'Completed' },
{ id: 'exp-0142', model: 'Logistic Regression', family: 'Linear', trainedAt: '2026-09-27', datasetVersion: 'jobs-2026.09.28', features: 38, featureSet: 'Match features + one-hot categoricals (scaled)', metrics: { f1: 0.84, rocAuc: 0.89, precision: 0.83, recall: 0.85 }, hyperparameters: { penalty: 'elasticnet', C: 1.0, l1_ratio: 0.3 }, durationSec: 12, status: 'Completed' },
{ id: 'exp-0141', model: 'Decision Tree', family: 'Tree', trainedAt: '2026-09-26', datasetVersion: 'jobs-2026.09.28', features: 38, featureSet: 'Match features + one-hot categoricals', metrics: { f1: 0.79, rocAuc: 0.83, precision: 0.8, recall: 0.78 }, hyperparameters: { max_depth: 6, min_samples_leaf: 10 }, durationSec: 4, status: 'Completed' },
{ id: 'exp-0140', model: 'LightGBM', family: 'Gradient boosting', trainedAt: '2026-09-26', datasetVersion: 'jobs-2026.09.28', features: 38, featureSet: 'Match features + one-hot categoricals', metrics: { f1: 0, rocAuc: 0, precision: 0, recall: 0 }, hyperparameters: { num_leaves: 512, learning_rate: 0.5 }, durationSec: 7, status: 'Failed' },
{ id: 'exp-0121', model: 'Gradient Boosting', family: 'Gradient boosting', trainedAt: '2026-08-22', datasetVersion: 'jobs-2026.08.20', features: 31, featureSet: 'Match features + one-hot categoricals', metrics: { f1: 0.88, rocAuc: 0.92, precision: 0.87, recall: 0.89 }, hyperparameters: { n_estimators: 250, learning_rate: 0.1, max_depth: 3 }, durationSec: 198, status: 'Archived' }];


export const monitoringSeries = [
{ day: 'Sep 16', predictions: 18420, p50: 42, p95: 118, errorRate: 0.4 },
{ day: 'Sep 17', predictions: 19110, p50: 44, p95: 121, errorRate: 0.3 },
{ day: 'Sep 18', predictions: 18760, p50: 41, p95: 115, errorRate: 0.3 },
{ day: 'Sep 19', predictions: 20340, p50: 45, p95: 126, errorRate: 0.5 },
{ day: 'Sep 20', predictions: 15210, p50: 39, p95: 104, errorRate: 0.2 },
{ day: 'Sep 21', predictions: 14880, p50: 38, p95: 101, errorRate: 0.2 },
{ day: 'Sep 22', predictions: 21960, p50: 47, p95: 133, errorRate: 0.4 },
{ day: 'Sep 23', predictions: 23410, p50: 49, p95: 141, errorRate: 0.6 },
{ day: 'Sep 24', predictions: 24120, p50: 51, p95: 149, errorRate: 0.7 },
{ day: 'Sep 25', predictions: 24870, p50: 50, p95: 146, errorRate: 0.5 },
{ day: 'Sep 26', predictions: 25530, p50: 53, p95: 158, errorRate: 0.6 },
{ day: 'Sep 27', predictions: 19880, p50: 46, p95: 131, errorRate: 0.4 },
{ day: 'Sep 28', predictions: 19240, p50: 45, p95: 127, errorRate: 0.3 },
{ day: 'Sep 29', predictions: 26310, p50: 54, p95: 162, errorRate: 0.5 }];


export const performanceTrend = [
{ week: 'Aug 04', ndcg: 0.71, precision: 0.62 },
{ week: 'Aug 11', ndcg: 0.72, precision: 0.63 },
{ week: 'Aug 18', ndcg: 0.74, precision: 0.66 },
{ week: 'Aug 25', ndcg: 0.79, precision: 0.7 },
{ week: 'Sep 01', ndcg: 0.8, precision: 0.71 },
{ week: 'Sep 08', ndcg: 0.79, precision: 0.7 },
{ week: 'Sep 15', ndcg: 0.77, precision: 0.68 },
{ week: 'Sep 22', ndcg: 0.75, precision: 0.66 }];


export interface DriftFeature {
  feature: string;
  labels: string[];
  training: number[];
  current: number[];
}

export const driftFeatures: DriftFeature[] = [
{ feature: 'Work mode', labels: ['Remote', 'Hybrid', 'On-site'], training: [0.18, 0.47, 0.35], current: [0.42, 0.38, 0.2] },
{
  feature: 'Location',
  labels: ['Bengaluru', 'Hyderabad', 'Pune', 'Chennai', 'Mumbai', 'Delhi NCR', 'Remote'],
  training: [0.26, 0.22, 0.14, 0.09, 0.12, 0.09, 0.08],
  current: [0.23, 0.22, 0.13, 0.08, 0.11, 0.08, 0.15]
},
{
  feature: 'Category',
  labels: ['Software Dev', 'Data', 'AI/ML', 'Web Dev', 'Cloud', 'Security'],
  training: [0.3, 0.24, 0.16, 0.14, 0.1, 0.06],
  current: [0.28, 0.25, 0.18, 0.13, 0.1, 0.06]
},
{ feature: 'Experience level', labels: ['Internship', 'Entry', 'Mid', 'Senior'], training: [0.08, 0.46, 0.38, 0.08], current: [0.09, 0.47, 0.36, 0.08] }];


export const retrainingHistory = [
{ version: 'model_v3', date: '2026-09-28', trigger: 'Scheduled · weekly', result: 'Promoted · NDCG@10 +0.04' },
{ version: 'model_v2', date: '2026-08-22', trigger: 'Feature change · structured fit features', result: 'Promoted · NDCG@10 +0.07' },
{ version: 'model_v1', date: '2026-07-14', trigger: 'Initial baseline', result: 'Promoted' }];