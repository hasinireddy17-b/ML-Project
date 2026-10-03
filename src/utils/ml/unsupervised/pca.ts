/**
 * MODULE 4 · DIMENSIONALITY REDUCTION — PCA via power iteration on the Gram matrix.
 * Efficient when rows (jobs) ≪ columns (vocabulary terms).
 */
export function pca(X: number[][], k = 2): {coords: number[][];explained: number[];} {
  const n = X.length;
  const d = X[0]?.length ?? 0;
  const mean = Array.from({ length: d }, (_, j) => X.reduce((s, r) => s + r[j], 0) / n);
  const C = X.map((r) => r.map((v, j) => v - mean[j]));
  const G = C.map((a) => C.map((b) => a.reduce((s, v, j) => s + v * b[j], 0)));
  const trace = G.reduce((s, row, i) => s + row[i], 0) || 1;

  const coords = X.map(() => new Array(k).fill(0));
  const explained: number[] = [];
  for (let c = 0; c < k; c++) {
    let v = Array.from({ length: n }, (_, i) => (i * 7 + c * 3) % 5 + 1);
    let lambda = 0;
    for (let it = 0; it < 120; it++) {
      const next = G.map((row) => row.reduce((s, g, j) => s + g * v[j], 0));
      const norm = Math.sqrt(next.reduce((s, x) => s + x * x, 0)) || 1;
      v = next.map((x) => x / norm);
      lambda = norm;
    }
    explained.push(lambda / trace);
    const scale = Math.sqrt(Math.max(lambda, 0));
    v.forEach((vi, i) => {
      coords[i][c] = vi * scale;
    });
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) G[i][j] -= lambda * v[i] * v[j];
  }
  return { coords, explained };
}