import { mulberry32 } from '../random';

/** MODULE 4 · CLUSTERING — K-Means (k-means++ init), DBSCAN, agglomerative (average linkage). */

function sqDist(a: number[], b: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += (a[i] - b[i]) ** 2;
  return s;
}

export function kMeans(X: number[][], k: number, seed = 3, maxIter = 60) {
  const rng = mulberry32(seed);
  const n = X.length;
  const centroids: number[][] = [[...X[Math.floor(rng() * n)]]];
  while (centroids.length < k) {
    const d2 = X.map((x) => Math.min(...centroids.map((c) => sqDist(x, c))));
    const total = d2.reduce((a, b) => a + b, 0);
    let r = rng() * total;
    let idx = 0;
    while (idx < n - 1 && r > d2[idx]) r -= d2[idx++];
    centroids.push([...X[idx]]);
  }

  let labels = new Array(n).fill(0);
  let iterations = 0;
  for (; iterations < maxIter; iterations++) {
    const next = X.map((x) => {
      let best = 0;
      let bestD = Infinity;
      centroids.forEach((c, ci) => {
        const d = sqDist(x, c);
        if (d < bestD) {
          bestD = d;
          best = ci;
        }
      });
      return best;
    });
    const changed = next.some((l, i) => l !== labels[i]);
    labels = next;
    centroids.forEach((c, ci) => {
      const members = X.filter((_, i) => labels[i] === ci);
      if (!members.length) return;
      for (let j = 0; j < c.length; j++) c[j] = members.reduce((s, m) => s + m[j], 0) / members.length;
    });
    if (!changed && iterations > 0) break;
  }
  const inertia = X.reduce((s, x, i) => s + sqDist(x, centroids[labels[i]]), 0);
  return { labels, centroids, inertia, iterations: iterations + 1 };
}

/** Density-based clustering; label -1 marks noise / outlier points. */
export function dbscan(points: number[][], eps: number, minPts: number): number[] {
  const labels = new Array(points.length).fill(-2);
  const eps2 = eps * eps;
  const neighbors = (i: number) => points.map((_, j) => j).filter((j) => sqDist(points[i], points[j]) <= eps2);
  let cluster = 0;
  points.forEach((_, i) => {
    if (labels[i] !== -2) return;
    const nb = neighbors(i);
    if (nb.length < minPts) {
      labels[i] = -1;
      return;
    }
    labels[i] = cluster;
    const queue = [...nb];
    while (queue.length) {
      const q = queue.shift() as number;
      if (labels[q] === -1) labels[q] = cluster;
      if (labels[q] !== -2) continue;
      labels[q] = cluster;
      const qn = neighbors(q);
      if (qn.length >= minPts) queue.push(...qn);
    }
    cluster++;
  });
  return labels;
}

export interface Merge {
  left: string;
  right: string;
  distance: number;
  size: number;
}

/** Agglomerative clustering with average linkage; returns the merge sequence (a dendrogram). */
export function agglomerative(vectors: number[][], names: string[]): Merge[] {
  let clusters = vectors.map((v, i) => ({ name: names[i], members: [v] }));
  const merges: Merge[] = [];
  const linkage = (a: number[][], b: number[][]) => {
    let s = 0;
    a.forEach((x) => b.forEach((y) => s += Math.sqrt(sqDist(x, y))));
    return s / (a.length * b.length);
  };
  while (clusters.length > 1) {
    let best = { i: 0, j: 1, d: Infinity };
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const d = linkage(clusters[i].members, clusters[j].members);
        if (d < best.d) best = { i, j, d };
      }
    }
    const a = clusters[best.i];
    const b = clusters[best.j];
    const merged = { name: `${a.name} + ${b.name}`, members: [...a.members, ...b.members] };
    merges.push({ left: a.name, right: b.name, distance: best.d, size: merged.members.length });
    clusters = clusters.filter((_, k) => k !== best.i && k !== best.j).concat(merged);
  }
  return merges;
}