import { canonicalSkills, jobCategories } from '../../../data/skills';
import { getFeatureStore } from '../engineering/featureStore';
import { toDense } from '../lifecycle/tfidf';
import { agglomerative, dbscan, kMeans, type Merge } from './clustering';
import { pca } from './pca';

/** Runs the job-structure discovery pass used by the admin analytics area. */

export interface ClusterPoint {
  job_id: string;
  title: string;
  company: string;
  category: string;
  x: number;
  y: number;
  cluster: number;
  outlier: boolean;
}

export interface ClusterSummary {
  id: number;
  label: string;
  size: number;
  topTerms: string[];
  dominantCategory: string;
  purity: number;
}

export interface ClusteringResult {
  points: ClusterPoint[];
  clusters: ClusterSummary[];
  merges: Merge[];
  explained: number[];
  inertia: number;
  iterations: number;
  dimensions: number;
}

let cached: ClusteringResult | null = null;

function termLabel(term: string): string {
  const raw = term.replace(/^skill:/, '');
  return canonicalSkills.find((s) => s.toLowerCase() === raw) ?? raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function runJobClustering(k = 6): ClusteringResult {
  if (cached) return cached;
  const store = getFeatureStore();
  const jobs = store.servableJobs;
  const vocab = store.vectorizers.combined.vocabulary;
  const index = new Map(vocab.map((t, i) => [t, i]));
  const X = jobs.map((j) => {
    const v = store.vectors.get(j.job_id);
    return v ? toDense(v.combined, index) : new Array(vocab.length).fill(0);
  });

  const { labels, centroids, inertia, iterations } = kMeans(X, k, 11);
  const { coords, explained } = pca(X, 2);

  const sx = Math.max(...coords.map((c) => Math.abs(c[0]))) || 1;
  const sy = Math.max(...coords.map((c) => Math.abs(c[1]))) || 1;
  const scaled = coords.map((c) => [c[0] / sx, c[1] / sy]);
  const density = dbscan(scaled, 0.28, 3);

  const points: ClusterPoint[] = jobs.map((j, i) => ({
    job_id: j.job_id,
    title: j.job_title,
    company: j.company,
    category: j.category,
    x: Number(scaled[i][0].toFixed(3)),
    y: Number(scaled[i][1].toFixed(3)),
    cluster: labels[i],
    outlier: density[i] === -1
  }));

  const clusters: ClusterSummary[] = centroids.
  map((c, id) => {
    const members = jobs.filter((_, i) => labels[i] === id);
    const counts = new Map<string, number>();
    members.forEach((m) => counts.set(m.category, (counts.get(m.category) ?? 0) + 1));
    const [dominantCategory, top] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0] ?? ['—', 0];
    const topTerms = c.
    map((w, i) => ({ w, t: vocab[i] })).
    filter((x) => x.t.startsWith('skill:')).
    sort((a, b) => b.w - a.w).
    slice(0, 4).
    map((x) => termLabel(x.t));
    return { id, label: dominantCategory, size: members.length, topTerms, dominantCategory, purity: members.length ? top / members.length : 0 };
  }).
  filter((c) => c.size > 0).
  sort((a, b) => b.size - a.size);

  const seenLabels = new Map<string, number>();
  clusters.forEach((c) => {
    const n = seenLabels.get(c.label) ?? 0;
    seenLabels.set(c.label, n + 1);
    if (n > 0 && c.topTerms[0]) c.label = `${c.label} · ${c.topTerms[0]}`;
  });

  const categoryCentroids = jobCategories.map((cat) => {
    const rows = X.filter((_, i) => jobs[i].category === cat);
    return X[0].map((_, j) => rows.reduce((s, r) => s + r[j], 0) / (rows.length || 1));
  });
  const merges = agglomerative(categoryCentroids, [...jobCategories]);

  cached = { points, clusters, merges, explained, inertia, iterations, dimensions: vocab.length };
  return cached;
}

export function resetClustering(): void {
  cached = null;
}