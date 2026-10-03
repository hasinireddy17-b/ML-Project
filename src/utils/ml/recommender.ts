import type { Job } from '../../types/job';
import type { UserProfile } from '../../types/user';
import type { Interaction } from '../../types/activity';
import { cosine } from './lifecycle/tfidf';
import { employmentFit, experienceFit, interestFit, locationFit, salaryFit, workModeFit } from './lifecycle/features';
import { vectorizeCandidate } from './engineering/featureStore';
import { loadModel, type ModelVersionId, type RankingWeights } from './engineering/registry';
import { affinityScore, computeAffinity, type Affinity } from './engineering/feedback';
import { predictTier, type MatchTier } from './linear/models';
import { jobSimilarity } from './similar';

/**
 * PRIMARY RECOMMENDATION SYSTEM
 * Candidate profile + job content → feature representation → relevance → ranking.
 * The score means "how closely this job matches your profile" — never a hiring probability.
 */

export type MatchComponents = RankingWeights;

export interface MatchReason {
  key: string;
  label: string;
  detail: string;
}

export interface MatchResult {
  job_id: string;
  score: number;
  raw: number;
  tier: MatchTier;
  tierProbabilities: number[];
  components: MatchComponents;
  matchedSkills: string[];
  matchedRequired: string[];
  missingSkills: string[];
  reasons: MatchReason[];
  gaps: MatchReason[];
  activityBoost: number;
}

export type Matcher = ((job: Job) => MatchResult) & {affinity: Affinity;};

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const EMPTY = new Map<string, number>();

export function createMatcher(profile: UserProfile, interactions: Interaction[] = [], version?: ModelVersionId): Matcher {
  const model = loadModel(version);
  const candidate = vectorizeCandidate(profile);
  const affinity = computeAffinity(interactions, model.store.jobsById);
  const skillSet = new Set(profile.skills.map((s) => s.toLowerCase()));
  const cache = new Map<string, MatchResult>();

  const match = ((job: Job): MatchResult => {
    const hit = cache.get(job.job_id);
    if (hit) return hit;
    const jv = model.store.vectors.get(job.job_id);

    const matchedRequired = job.required_skills.filter((s) => skillSet.has(s.toLowerCase()));
    const matchedPreferred = job.preferred_skills.filter((s) => skillSet.has(s.toLowerCase()));
    const coverage = job.required_skills.length ? matchedRequired.length / job.required_skills.length : 0;
    const skillCos = cosine(candidate.skills, jv?.skills ?? EMPTY);

    const components: MatchComponents = {
      skills: profile.skills.length ? clamp(0.65 * coverage + 0.35 * clamp(skillCos / 0.55)) : 0,
      title: clamp(cosine(candidate.title, jv?.title ?? EMPTY) / 0.5),
      description: clamp(cosine(candidate.description, jv?.description ?? EMPTY) / 0.3),
      location: locationFit(profile, job),
      experience: experienceFit(profile, job),
      work_mode: workModeFit(profile, job),
      interest: interestFit(profile, job),
      salary: salaryFit(profile, job),
      employment: employmentFit(profile, job)
    };

    const w = model.weights;
    const keys = Object.keys(w) as (keyof RankingWeights)[];
    const base = keys.reduce((sum, k) => sum + w[k] * components[k], 0);
    const activityBoost = model.useFeedback ? clamp(affinityScore(job, affinity) * 0.07, -0.07, 0.07) : 0;
    const raw = clamp(base + activityBoost);
    const { tier, probabilities } = predictTier(raw);

    const matchedCount = matchedRequired.length + matchedPreferred.length;
    const candidates: (MatchReason & {weight: number;})[] = [];
    if (matchedCount > 0) {
      candidates.push({
        key: 'skills',
        label: `${matchedCount} relevant skill${matchedCount > 1 ? 's' : ''}`,
        detail:
        coverage >= 0.75 ?
        'Your skills strongly match the requirements.' :
        coverage >= 0.5 ?
        'You have most of the required skills.' :
        'Some of your skills overlap with this role.',
        weight: w.skills * components.skills + 0.05
      });
    }
    if (components.location >= 0.99) {
      candidates.push({
        key: 'location',
        label: job.work_mode === 'Remote' ? 'Remote, as you prefer' : 'Preferred location',
        detail: job.work_mode === 'Remote' ? 'Fully remote role.' : `${job.location} is one of your preferred locations.`,
        weight: w.location * components.location
      });
    }
    if (components.experience >= 0.9) {
      candidates.push({ key: 'experience', label: 'Experience level matches', detail: 'The experience asked for fits your background.', weight: w.experience * components.experience });
    }
    if (components.work_mode >= 0.99 && job.work_mode !== 'Remote') {
      candidates.push({ key: 'work_mode', label: 'Preferred work mode', detail: `${job.work_mode} matches how you like to work.`, weight: w.work_mode * components.work_mode });
    }
    if (components.interest >= 0.99 || components.title >= 0.6) {
      candidates.push({ key: 'interest', label: 'Role matches your interests', detail: `Aligned with your interest in ${job.category}.`, weight: w.interest + w.title * components.title });
    }
    if (components.salary >= 0.99 && profile.salary_expectation > 0) {
      candidates.push({ key: 'salary', label: 'Within your salary range', detail: `Pays up to ₹${job.salary_max}L, above your ₹${profile.salary_expectation}L expectation.`, weight: w.salary });
    }
    if (activityBoost > 0.02) {
      candidates.push({ key: 'activity', label: 'Similar to jobs you engaged with', detail: 'Based on jobs you viewed, saved, or applied to.', weight: activityBoost });
    }
    const reasons = candidates.sort((a, b) => b.weight - a.weight).map(({ key, label, detail }) => ({ key, label, detail }));

    const gaps: MatchReason[] = [];
    const missingSkills = job.required_skills.filter((s) => !skillSet.has(s.toLowerCase()));
    if (missingSkills.length) gaps.push({ key: 'skills', label: `${missingSkills.length} skill${missingSkills.length > 1 ? 's' : ''} to strengthen`, detail: missingSkills.join(', ') });
    if (components.location < 0.5) gaps.push({ key: 'location', label: 'Outside your preferred locations', detail: `${job.location} · ${job.work_mode}` });
    if (components.experience < 0.6) gaps.push({ key: 'experience', label: 'Asks for more experience', detail: `Looking for ${job.experience_min}+ years` });
    if (components.salary < 0.8) gaps.push({ key: 'salary', label: 'Below your salary expectation', detail: `Up to ₹${job.salary_max}L` });

    const result: MatchResult = {
      job_id: job.job_id,
      score: Math.round(clamp(raw, 0.12, 0.98) * 100),
      raw,
      tier,
      tierProbabilities: probabilities,
      components,
      matchedSkills: [...matchedRequired, ...matchedPreferred],
      matchedRequired,
      missingSkills,
      reasons,
      gaps,
      activityBoost
    };
    cache.set(job.job_id, result);
    return result;
  }) as Matcher;

  match.affinity = affinity;
  return match;
}

export type FeedLens = 'recommended' | 'skills' | 'location' | 'recent' | 'activity' | 'saved';

export interface RankedJob {
  job: Job;
  match: MatchResult;
  lensScore: number;
}

export function buildFeed(
jobs: Job[],
matcher: Matcher,
lens: FeedLens,
opts: {savedIds?: string[];appliedIds?: string[];limit?: number;} = {})
: RankedJob[] {
  const excluded = new Set([...matcher.affinity.dismissed, ...(opts.appliedIds ?? [])]);
  const savedIds = opts.savedIds ?? [];
  const savedJobs = jobs.filter((j) => savedIds.includes(j.job_id));
  const pool = jobs.filter((j) => !excluded.has(j.job_id));

  const ranked = pool.
  map((job): RankedJob | null => {
    const match = matcher(job);
    switch (lens) {
      case 'recommended':
        return { job, match, lensScore: match.score };
      case 'skills':
        return match.matchedRequired.length ? { job, match, lensScore: match.components.skills * 100 + match.score / 100 } : null;
      case 'location':
        return match.components.location >= 0.99 ? { job, match, lensScore: match.score } : null;
      case 'recent':
        return job.posted_days_ago <= 7 ? { job, match, lensScore: -job.posted_days_ago * 100 + match.score / 100 } : null;
      case 'activity':{
          const a = affinityScore(job, matcher.affinity);
          return a > 0.05 ? { job, match, lensScore: a * 100 + match.score / 100 } : null;
        }
      case 'saved':{
          if (!savedJobs.length || savedIds.includes(job.job_id)) return null;
          const sim = Math.max(...savedJobs.map((s) => jobSimilarity(s, job)));
          return sim > 0.3 ? { job, match, lensScore: sim * 100 } : null;
        }
      default:
        return null;
    }
  }).
  filter((r): r is RankedJob => r !== null).
  sort((a, b) => b.lensScore - a.lensScore);

  return opts.limit ? ranked.slice(0, opts.limit) : ranked;
}