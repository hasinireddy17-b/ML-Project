import { shuffle } from '../random';

/**
 * MODULE 5 · VALIDATION & HYPERPARAMETER SEARCH
 * Stratified splits and K-fold so the held-out test set is touched exactly once,
 * after model selection has been done on cross-validation folds.
 */

export function stratifiedSplit(y: number[], testSize: number, rng: () => number): {train: number[];test: number[];} {
  const pos = shuffle(y.map((v, i) => v === 1 ? i : -1).filter((i) => i >= 0), rng);
  const neg = shuffle(y.map((v, i) => v === 0 ? i : -1).filter((i) => i >= 0), rng);
  const tp = Math.round(pos.length * testSize);
  const tn = Math.round(neg.length * testSize);
  return {
    test: [...pos.slice(0, tp), ...neg.slice(0, tn)],
    train: [...pos.slice(tp), ...neg.slice(tn)]
  };
}

export function trainValTestSplit(y: number[], valSize: number, testSize: number, rng: () => number) {
  const { train: rest, test } = stratifiedSplit(y, testSize, rng);
  const restY = rest.map((i) => y[i]);
  const inner = stratifiedSplit(restY, valSize / (1 - testSize), rng);
  return { train: inner.train.map((i) => rest[i]), val: inner.test.map((i) => rest[i]), test };
}

/** Stratified K-fold over a subset of row indices (defaults to all rows). */
export function stratifiedKFold(y: number[], k: number, rng: () => number, subset?: number[]): {train: number[];val: number[];}[] {
  const rows = subset ?? y.map((_, i) => i);
  const pos = shuffle(rows.filter((i) => y[i] === 1), rng);
  const neg = shuffle(rows.filter((i) => y[i] === 0), rng);
  const buckets: number[][] = Array.from({ length: k }, () => []);
  [...pos, ...neg].forEach((row, n) => buckets[n % k].push(row));
  return buckets.map((val, f) => ({ val, train: buckets.filter((_, g) => g !== f).flat() }));
}

export function kFold(n: number, k: number, rng: () => number): {train: number[];val: number[];}[] {
  const rows = shuffle(Array.from({ length: n }, (_, i) => i), rng);
  const buckets: number[][] = Array.from({ length: k }, () => []);
  rows.forEach((row, i) => buckets[i % k].push(row));
  return buckets.map((val, f) => ({ val, train: buckets.filter((_, g) => g !== f).flat() }));
}

export type Params = Record<string, number | string>;

export interface SearchTrial {
  params: Params;
  score: number;
  metrics: Record<string, number>;
}

export function cartesian(grid: Record<string, (number | string)[]>): Params[] {
  return Object.entries(grid).reduce<Params[]>((acc, [key, values]) => acc.flatMap((p) => values.map((v) => ({ ...p, [key]: v }))), [{}]);
}

export function gridSearch(
grid: Record<string, (number | string)[]>,
evaluate: (p: Params) => {score: number;metrics: Record<string, number>;})
: SearchTrial[] {
  return cartesian(grid).
  map((params) => ({ params, ...evaluate(params) })).
  sort((a, b) => b.score - a.score);
}

export function randomSearch(
space: Record<string, (rng: () => number) => number | string>,
iterations: number,
rng: () => number,
evaluate: (p: Params) => {score: number;metrics: Record<string, number>;})
: SearchTrial[] {
  const trials: SearchTrial[] = [];
  for (let i = 0; i < iterations; i++) {
    const params = Object.fromEntries(Object.entries(space).map(([k, sample]) => [k, sample(rng)])) as Params;
    trials.push({ params, ...evaluate(params) });
  }
  return trials.sort((a, b) => b.score - a.score);
}

export function formatParams(p: Params): string {
  return Object.entries(p).
  map(([k, v]) => `${k}=${v}`).
  join(', ');
}