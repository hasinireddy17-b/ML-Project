import type { Job } from '../../../types/job';
import { cosine, type SparseVector } from '../lifecycle/tfidf';
import { mulberry32 } from '../random';

/**
 * MODULE 4 · ANOMALY DETECTION
 * Isolation Forest over structured job features + rule checks (robust salary z-score,
 * scam patterns, unverified employers, near-duplicates). Critical findings are held from the feed.
 */

export interface AnomalyResult {
  job_id: string;
  job_title: string;
  company: string;
  isolationScore: number;
  reasons: string[];
  flagged: boolean;
  held: boolean;
}

interface ITreeNode {
  size: number;
  feature?: number;
  split?: number;
  left?: ITreeNode;
  right?: ITreeNode;
}

const SUSPICIOUS = /(earn up to|registration fee|no experience needed|whatsapp|guaranteed income|weekly payout)/i;

function avgPathLength(n: number): number {
  if (n > 2) return 2 * (Math.log(n - 1) + 0.5772156649) - 2 * (n - 1) / n;
  return n === 2 ? 1 : 0;
}

function buildTree(rows: number[][], depth: number, limit: number, rng: () => number): ITreeNode {
  if (depth >= limit || rows.length <= 1) return { size: rows.length };
  const feature = Math.floor(rng() * rows[0].length);
  let min = Infinity;
  let max = -Infinity;
  rows.forEach((r) => {
    min = Math.min(min, r[feature]);
    max = Math.max(max, r[feature]);
  });
  if (min === max) return { size: rows.length };
  const split = min + rng() * (max - min);
  return {
    size: rows.length,
    feature,
    split,
    left: buildTree(rows.filter((r) => r[feature] < split), depth + 1, limit, rng),
    right: buildTree(rows.filter((r) => r[feature] >= split), depth + 1, limit, rng)
  };
}

function pathLength(x: number[], node: ITreeNode, depth: number): number {
  if (node.feature === undefined || node.split === undefined || !node.left || !node.right) {
    return depth + avgPathLength(node.size);
  }
  return x[node.feature] < node.split ? pathLength(x, node.left, depth + 1) : pathLength(x, node.right, depth + 1);
}

export function isolationForest(data: number[][], trees = 120, sampleSize = 24, seed = 7): number[] {
  if (!data.length) return [];
  const rng = mulberry32(seed);
  const sample = Math.min(sampleSize, data.length);
  const limit = Math.ceil(Math.log2(Math.max(2, sample)));
  const forest = Array.from({ length: trees }, () => {
    const rows: number[][] = [];
    for (let i = 0; i < sample; i++) rows.push(data[Math.floor(rng() * data.length)]);
    return buildTree(rows, 0, limit, rng);
  });
  const c = avgPathLength(sample) || 1;
  return data.map((x) => {
    const h = forest.reduce((s, t) => s + pathLength(x, t, 0), 0) / forest.length;
    return Math.pow(2, -h / c);
  });
}

function median(values: number[]): number {
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export function detectAnomalies(jobs: Job[], vectors: Map<string, {combined: SparseVector;}>): AnomalyResult[] {
  const wordCount = (j: Job) => j.job_description.split(/\s+/).filter(Boolean).length;
  const features = jobs.map((j) => [
  j.salary_min,
  j.salary_max,
  j.salary_max / (j.experience_max + 1),
  wordCount(j),
  j.required_skills.length,
  j.experience_min]
  );
  const scores = isolationForest(features);

  const byCategory = new Map<string, number[]>();
  jobs.forEach((j) => byCategory.set(j.category, [...(byCategory.get(j.category) ?? []), j.salary_max]));

  return jobs.
  map((j, i): AnomalyResult => {
    const reasons: string[] = [];
    let critical = false;

    const pool = byCategory.get(j.category) ?? [j.salary_max];
    const med = median(pool);
    const mad = median(pool.map((v) => Math.abs(v - med))) || 1;
    const robustZ = 0.6745 * (j.salary_max - med) / mad;
    if (robustZ > 3.5) {
      reasons.push(`Salary far above typical range for ${j.category} (₹${j.salary_max}L vs median ₹${med}L)`);
      critical = true;
    }
    if (!j.job_description) {
      reasons.push('Missing job description');
      critical = true;
    } else if (wordCount(j) < 12) {
      reasons.push('Unusually short description');
    }
    if (SUSPICIOUS.test(j.job_description)) {
      reasons.push('Description matches common scam patterns');
      critical = true;
    }
    if (j.company_info.industry === 'Unspecified') {
      reasons.push('Employer not verified');
      critical = true;
    }
    if (!j.responsibilities.length) reasons.push('Missing responsibilities');
    if (j.salary_imputed) reasons.push('Salary missing — estimated from similar roles');

    const own = vectors.get(j.job_id);
    jobs.forEach((o, k) => {
      if (k === i || o.company !== j.company || !own) return;
      const other = vectors.get(o.job_id);
      if (!other) return;
      const sim = cosine(own.combined, other.combined);
      if (sim > 0.9) reasons.push(`Near-duplicate of ${o.job_id} (${Math.round(sim * 100)}% overlap)`);
    });

    const isolationScore = scores[i];
    return {
      job_id: j.job_id,
      job_title: j.job_title,
      company: j.company,
      isolationScore,
      reasons,
      flagged: critical || isolationScore > 0.68 || reasons.length > 0,
      held: critical
    };
  }).
  sort((a, b) => b.isolationScore - a.isolationScore);
}