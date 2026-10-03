import { mulberry32, shuffle } from '../random';

/** Model-agnostic permutation importance: how much the metric drops when a feature is shuffled. */
export function permutationImportance(
predict: (X: number[][]) => number[],
X: number[][],
y: number[],
names: string[],
metric: (yTrue: number[], scores: number[]) => number,
seed = 5,
repeats = 5)
: {feature: string;importance: number;}[] {
  const rng = mulberry32(seed);
  const base = metric(y, predict(X));
  return names.
  map((feature, j) => {
    let drop = 0;
    for (let r = 0; r < repeats; r++) {
      const column = shuffle(X.map((row) => row[j]), rng);
      const permuted = X.map((row, i) => {
        const copy = [...row];
        copy[j] = column[i];
        return copy;
      });
      drop += base - metric(y, predict(permuted));
    }
    return { feature, importance: Math.max(0, drop / repeats) };
  }).
  sort((a, b) => b.importance - a.importance);
}