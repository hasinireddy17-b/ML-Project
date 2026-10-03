import type { Job } from '../types/job';
import type { UserProfile } from '../types/user';
import type { Interaction } from '../types/activity';
import { getFeatureStore } from './ml/engineering/featureStore';
import { recordRequest } from './ml/engineering/monitoring';
import { buildFeed, createMatcher, type FeedLens, type MatchResult, type RankedJob } from './ml/recommender';
import { searchJobs, type SearchOutcome } from './ml/search';
import { similarJobs } from './ml/similar';
import { predictTier, type MatchTier } from './ml/linear/models';

/**
 * REST client. In this build the recommendation service runs in-process; each call goes
 * through the same request wrapper a network client would (latency, errors, telemetry),
 * so swapping in fetch() to a real backend only changes this file.
 *
 *   GET  /jobs              GET  /jobs/:id          POST /recommendations
 *   POST /search            POST /match             POST /predict
 *   GET  /similar-jobs/:id  POST /applications      GET  /applications
 *   POST /saved-jobs        GET/PUT /profile        GET/POST /alerts
 */

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function request<T>(endpoint: string, handler: () => T, latency: [number, number] = [160, 380]): Promise<T> {
  const start = performance.now();
  await wait(latency[0] + Math.random() * (latency[1] - latency[0]));
  try {
    const result = handler();
    recordRequest(endpoint, performance.now() - start, true);
    return result;
  } catch (e) {
    recordRequest(endpoint, performance.now() - start, false);
    throw e;
  }
}

/** Records a fire-and-forget write (saved jobs, applications, alerts, feedback events). */
export function track(endpoint: string): void {
  recordRequest(endpoint, 18 + Math.random() * 40, true);
}

function findServable(id: string): Job {
  const store = getFeatureStore();
  const job = store.servableJobs.find((j) => j.job_id === id);
  if (!job) throw new Error('This job is no longer available.');
  return job;
}

export const api = {
  getJobs: (): Promise<Job[]> => request('GET /jobs', () => getFeatureStore().servableJobs),

  getJob: (id: string): Promise<Job> => request('GET /jobs/:id', () => findServable(id), [120, 280]),

  recommendations: (
  profile: UserProfile,
  interactions: Interaction[],
  lens: FeedLens = 'recommended',
  opts: {savedIds?: string[];appliedIds?: string[];limit?: number;} = {})
  : Promise<RankedJob[]> =>
  request('POST /recommendations', () => buildFeed(getFeatureStore().servableJobs, createMatcher(profile, interactions), lens, opts), [280, 520]),

  search: (query: string, exact = false): Promise<SearchOutcome> => request('POST /search', () => searchJobs(query, { exact }), [180, 360]),

  match: (profile: UserProfile, interactions: Interaction[], jobId: string): Promise<MatchResult> =>
  request('POST /match', () => createMatcher(profile, interactions)(findServable(jobId))),

  predict: (relevance: number): Promise<{tier: MatchTier;probabilities: number[];}> => request('POST /predict', () => predictTier(relevance), [40, 90]),

  similarJobs: (id: string, k = 4): Promise<Job[]> =>
  request('GET /similar-jobs/:id', () => similarJobs(findServable(id), getFeatureStore().servableJobs, k).map((r) => r.job), [200, 420])
};