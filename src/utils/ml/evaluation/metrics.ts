/** MODULE 5 · EVALUATION METRICS — classification, regression and ranking. */

export function confusion(yTrue: number[], yPred: number[]) {
  let tp = 0,fp = 0,tn = 0,fn = 0;
  yTrue.forEach((t, i) => {
    const p = yPred[i];
    if (t === 1 && p === 1) tp++;else
    if (t === 0 && p === 1) fp++;else
    if (t === 0 && p === 0) tn++;else
    fn++;
  });
  return { tp, fp, tn, fn };
}

export function accuracy(yTrue: number[], yPred: number[]): number {
  const { tp, tn } = confusion(yTrue, yPred);
  return (tp + tn) / (yTrue.length || 1);
}

export function precision(yTrue: number[], yPred: number[]): number {
  const { tp, fp } = confusion(yTrue, yPred);
  return tp + fp ? tp / (tp + fp) : 0;
}

export function recall(yTrue: number[], yPred: number[]): number {
  const { tp, fn } = confusion(yTrue, yPred);
  return tp + fn ? tp / (tp + fn) : 0;
}

export function f1(yTrue: number[], yPred: number[]): number {
  const p = precision(yTrue, yPred);
  const r = recall(yTrue, yPred);
  return p + r ? 2 * p * r / (p + r) : 0;
}

/** Rank-based ROC-AUC (Mann–Whitney U) with average ranks for ties. */
export function rocAuc(yTrue: number[], scores: number[]): number {
  const order = scores.map((s, i) => ({ s, y: yTrue[i] })).sort((a, b) => a.s - b.s);
  const ranks = new Array(order.length).fill(0);
  for (let i = 0; i < order.length;) {
    let j = i;
    while (j + 1 < order.length && order[j + 1].s === order[i].s) j++;
    const avg = (i + j) / 2 + 1;
    for (let k = i; k <= j; k++) ranks[k] = avg;
    i = j + 1;
  }
  const nPos = yTrue.filter((y) => y === 1).length;
  const nNeg = yTrue.length - nPos;
  if (!nPos || !nNeg) return 0.5;
  const sumPos = order.reduce((s, o, i) => o.y === 1 ? s + ranks[i] : s, 0);
  return (sumPos - nPos * (nPos + 1) / 2) / (nPos * nNeg);
}

/** Area under the precision–recall curve as average precision. */
export function prAuc(yTrue: number[], scores: number[]): number {
  const order = scores.map((s, i) => ({ s, y: yTrue[i] })).sort((a, b) => b.s - a.s);
  const nPos = yTrue.filter((y) => y === 1).length;
  if (!nPos) return 0;
  let tp = 0;
  let ap = 0;
  order.forEach((o, i) => {
    if (o.y === 1) {
      tp++;
      ap += tp / (i + 1);
    }
  });
  return ap / nPos;
}

export function rmse(yTrue: number[], yPred: number[]): number {
  return Math.sqrt(yTrue.reduce((s, t, i) => s + (t - yPred[i]) ** 2, 0) / (yTrue.length || 1));
}

export function mae(yTrue: number[], yPred: number[]): number {
  return yTrue.reduce((s, t, i) => s + Math.abs(t - yPred[i]), 0) / (yTrue.length || 1);
}

export function r2(yTrue: number[], yPred: number[]): number {
  const mean = yTrue.reduce((a, b) => a + b, 0) / (yTrue.length || 1);
  const ssTot = yTrue.reduce((s, t) => s + (t - mean) ** 2, 0);
  const ssRes = yTrue.reduce((s, t, i) => s + (t - yPred[i]) ** 2, 0);
  return ssTot ? 1 - ssRes / ssTot : 0;
}

export function precisionAtK(relevance: number[], k: number): number {
  return relevance.slice(0, k).reduce((a, b) => a + b, 0) / k;
}

export function recallAtK(relevance: number[], k: number): number {
  const total = relevance.reduce((a, b) => a + b, 0);
  return total ? relevance.slice(0, k).reduce((a, b) => a + b, 0) / total : 0;
}

export function ndcgAtK(relevance: number[], k: number): number {
  const dcg = (rels: number[]) => rels.slice(0, k).reduce((s, r, i) => s + r / Math.log2(i + 2), 0);
  const ideal = dcg([...relevance].sort((a, b) => b - a));
  return ideal ? dcg(relevance) / ideal : 0;
}

export const mean = (values: number[]): number => values.reduce((a, b) => a + b, 0) / (values.length || 1);