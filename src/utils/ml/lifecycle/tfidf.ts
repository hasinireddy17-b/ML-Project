import { cleanText } from './preprocessing';

/**
 * LIFECYCLE STAGE: MODEL / REPRESENTATION CREATION
 * Baseline TF-IDF text representation + cosine similarity. Kept behind a small interface
 * so it can later be swapped for dense embeddings without touching the ranker.
 */

export type SparseVector = Map<string, number>;

const STOPWORDS = new Set(
  'a an and are as at be by for from has have in into is it its of on or our that the their this to we will with you your who what when where how all any can more than most across every so up out about over per also each day'.split(
    ' '
  )
);

export function tokenize(text: string): string[] {
  return cleanText(text).
  split(/[\s/]+/).
  map((t) => t.replace(/^[.\-]+|[.\-]+$/g, '')).
  filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

/** Skills are treated as atomic tokens so "machine learning" never splits into two words. */
export function skillTokens(skills: string[]): string[] {
  return skills.map((s) => `skill:${s.toLowerCase()}`);
}

export class TfidfVectorizer {
  private idf = new Map<string, number>();
  private docCount = 0;

  fit(docs: string[][]): this {
    this.docCount = docs.length;
    const df = new Map<string, number>();
    docs.forEach((doc) => new Set(doc).forEach((t) => df.set(t, (df.get(t) ?? 0) + 1)));
    this.idf = new Map([...df].map(([t, f]) => [t, Math.log((1 + this.docCount) / (1 + f)) + 1]));
    return this;
  }

  /** Sublinear TF × smoothed IDF, L2-normalized. Unseen tokens are ignored (same as at training time). */
  transform(tokens: string[]): SparseVector {
    const tf = new Map<string, number>();
    tokens.forEach((t) => {
      if (this.idf.has(t)) tf.set(t, (tf.get(t) ?? 0) + 1);
    });
    const vector: SparseVector = new Map();
    let norm = 0;
    tf.forEach((count, t) => {
      const w = (1 + Math.log(count)) * (this.idf.get(t) ?? 0);
      vector.set(t, w);
      norm += w * w;
    });
    norm = Math.sqrt(norm) || 1;
    vector.forEach((w, t) => vector.set(t, w / norm));
    return vector;
  }

  get vocabulary(): string[] {
    return [...this.idf.keys()];
  }

  get size(): number {
    return this.idf.size;
  }
}

/** Cosine similarity for L2-normalized sparse vectors (reduces to a dot product). */
export function cosine(a: SparseVector, b: SparseVector): number {
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  let dot = 0;
  small.forEach((w, t) => {
    const o = large.get(t);
    if (o) dot += w * o;
  });
  return dot;
}

export function toDense(vector: SparseVector, index: Map<string, number>): number[] {
  const out = new Array(index.size).fill(0);
  vector.forEach((w, t) => {
    const i = index.get(t);
    if (i !== undefined) out[i] = w;
  });
  return out;
}