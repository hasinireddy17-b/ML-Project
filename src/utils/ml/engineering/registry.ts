import { getFeatureStore, type FeatureStore } from './featureStore';
import { TIER_MODEL } from '../linear/models';

/**
 * MODULE 6 · MODEL PACKAGING
 * Versioned, self-describing model packages. The serving layer only ever calls loadModel().
 */

export interface RankingWeights {
  skills: number;
  title: number;
  description: number;
  location: number;
  experience: number;
  work_mode: number;
  interest: number;
  salary: number;
  employment: number;
}

export type ModelVersionId = 'model_v1' | 'model_v2' | 'model_v3';

export interface ModelVersion {
  version: ModelVersionId;
  label: string;
  description: string;
  trainedAt: string;
  datasetVersion: string;
  weights: RankingWeights;
  useFeedback: boolean;
  status: 'archived' | 'serving';
}

export const MODEL_VERSIONS: ModelVersion[] = [
{
  version: 'model_v1',
  label: 'TF-IDF text baseline',
  description: 'Cosine similarity on title, skills and description only.',
  trainedAt: '2026-07-14',
  datasetVersion: 'jobs-2026.07.10',
  weights: { skills: 0.45, title: 0.25, description: 0.3, location: 0, experience: 0, work_mode: 0, interest: 0, salary: 0, employment: 0 },
  useFeedback: false,
  status: 'archived'
},
{
  version: 'model_v2',
  label: 'Weighted content match',
  description: 'Text similarity plus structured compatibility features.',
  trainedAt: '2026-08-22',
  datasetVersion: 'jobs-2026.08.20',
  weights: { skills: 0.34, title: 0.15, description: 0.08, location: 0.13, experience: 0.13, work_mode: 0.08, interest: 0.06, salary: 0.03, employment: 0 },
  useFeedback: false,
  status: 'archived'
},
{
  version: 'model_v3',
  label: 'Content match + feedback',
  description: 'Weighted content match re-ranked with implicit feedback signals.',
  trainedAt: '2026-09-28',
  datasetVersion: 'jobs-2026.09.28',
  weights: { skills: 0.32, title: 0.14, description: 0.08, location: 0.13, experience: 0.13, work_mode: 0.08, interest: 0.07, salary: 0.03, employment: 0.02 },
  useFeedback: true,
  status: 'serving'
}];


export const SERVING_VERSION: ModelVersionId = 'model_v3';

export interface PackagedModel extends ModelVersion {
  store: FeatureStore;
  tierModel: typeof TIER_MODEL;
  loadedAt: number;
}

const loaded = new Map<ModelVersionId, PackagedModel>();

export function loadModel(version: ModelVersionId = SERVING_VERSION): PackagedModel {
  const hit = loaded.get(version);
  if (hit) return hit;
  const meta = MODEL_VERSIONS.find((m) => m.version === version) ?? MODEL_VERSIONS[MODEL_VERSIONS.length - 1];
  const pkg: PackagedModel = { ...meta, store: getFeatureStore(), tierModel: TIER_MODEL, loadedAt: Date.now() };
  loaded.set(version, pkg);
  return pkg;
}

export function unloadModels(): void {
  loaded.clear();
}