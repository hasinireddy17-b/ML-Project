import type { Interaction, InteractionType } from '../../../types/activity';
import type { Job } from '../../../types/job';
import { canonicalSkills } from '../../../data/skills';

/**
 * MODULE 6 · FEEDBACK LOOP
 * Implicit signals (view, save, apply, dismiss, search…) → time-decayed category and skill
 * affinities that re-rank future recommendations and become labels for retraining.
 */

export const SIGNAL_WEIGHTS: Record<InteractionType, number> = {
  view: 1,
  click: 0.5,
  similar_open: 1.5,
  save: 3,
  apply: 4,
  dismiss: -4,
  search: 1
};

const HALF_LIFE_MS = 14 * 86_400_000;

export interface Affinity {
  category: Record<string, number>;
  skills: Record<string, number>;
  dismissed: Set<string>;
  signalCount: number;
}

export function computeAffinity(interactions: Interaction[], jobsById: Map<string, Job>, now = Date.now()): Affinity {
  const category: Record<string, number> = {};
  const skills: Record<string, number> = {};
  const dismissed = new Set<string>();

  interactions.forEach((it) => {
    const decay = Math.pow(0.5, Math.max(0, now - it.at) / HALF_LIFE_MS);
    if (it.type === 'search' && it.query) {
      const q = ` ${it.query.toLowerCase()} `;
      canonicalSkills.forEach((s) => {
        if (q.includes(` ${s.toLowerCase()} `)) skills[s.toLowerCase()] = (skills[s.toLowerCase()] ?? 0) + decay;
      });
      return;
    }
    const job = it.job_id ? jobsById.get(it.job_id) : undefined;
    if (!job) return;
    if (it.type === 'dismiss') dismissed.add(job.job_id);
    const w = SIGNAL_WEIGHTS[it.type] * decay;
    category[job.category] = (category[job.category] ?? 0) + w;
    job.required_skills.forEach((s) => {
      const k = s.toLowerCase();
      skills[k] = (skills[k] ?? 0) + w * 0.5;
    });
  });

  const normalize = (rec: Record<string, number>) => {
    const max = Math.max(1e-9, ...Object.values(rec).map(Math.abs));
    Object.keys(rec).forEach((k) => {
      rec[k] = rec[k] / max;
    });
  };
  normalize(category);
  normalize(skills);

  return { category, skills, dismissed, signalCount: interactions.length };
}

export function affinityScore(job: Job, affinity: Affinity): number {
  const c = affinity.category[job.category] ?? 0;
  const skillVals = job.required_skills.map((s) => affinity.skills[s.toLowerCase()] ?? 0);
  const s = skillVals.length ? skillVals.reduce((a, b) => a + b, 0) / skillVals.length : 0;
  return Math.max(-1, Math.min(1, 0.6 * c + 0.4 * s));
}