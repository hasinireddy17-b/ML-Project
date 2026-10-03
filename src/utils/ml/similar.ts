import type { Job } from '../../types/job';
import { getFeatureStore } from './engineering/featureStore';
import { cosine } from './lifecycle/tfidf';

/** Job-to-job similarity over title, skills, description, category, experience and location. */
export function jobSimilarity(a: Job, b: Job): number {
  const store = getFeatureStore();
  const va = store.vectors.get(a.job_id);
  const vb = store.vectors.get(b.job_id);
  if (!va || !vb) return 0;
  const expGap = Math.abs(a.experience_min - b.experience_min);
  return (
    0.32 * cosine(va.title, vb.title) +
    0.33 * cosine(va.skills, vb.skills) +
    0.15 * cosine(va.description, vb.description) +
    0.1 * (a.category === b.category ? 1 : 0) +
    0.06 * Math.max(0, 1 - expGap / 4) +
    0.04 * (a.location === b.location ? 1 : 0));

}

export function similarJobs(job: Job, pool: Job[], k = 4): {job: Job;similarity: number;}[] {
  return pool.
  filter((j) => j.job_id !== job.job_id).
  map((j) => ({ job: j, similarity: jobSimilarity(job, j) })).
  sort((a, b) => b.similarity - a.similarity).
  slice(0, k);
}