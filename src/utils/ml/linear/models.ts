/**
 * MODULE 2 · LINEAR MODELS
 * Feature scaling, one-hot encoding, missing-value imputation, logistic regression and
 * linear regression with L2 (Ridge), L1 (Lasso) and Elastic Net penalties, plus the
 * multinomial logistic model that maps a relevance score to a match tier.
 */

export type Penalty = 'none' | 'l2' | 'l1' | 'elasticnet';

export interface LinearConfig {
  penalty: Penalty;
  alpha: number;
  l1Ratio: number;
  learningRate: number;
  epochs: number;
}

const DEFAULT_CONFIG: LinearConfig = { penalty: 'l2', alpha: 0.01, l1Ratio: 0.5, learningRate: 0.15, epochs: 250 };

export const sigmoid = (z: number): number => 1 / (1 + Math.exp(-z));

function dot(a: number[], b: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

export class StandardScaler {
  mean: number[] = [];
  scale: number[] = [];

  fit(X: number[][]): this {
    const d = X[0]?.length ?? 0;
    const n = X.length || 1;
    this.mean = Array.from({ length: d }, (_, j) => X.reduce((s, r) => s + r[j], 0) / n);
    this.scale = Array.from({ length: d }, (_, j) => {
      const v = X.reduce((s, r) => s + (r[j] - this.mean[j]) ** 2, 0) / n;
      return Math.sqrt(v) || 1;
    });
    return this;
  }

  transform(X: number[][]): number[][] {
    return X.map((r) => r.map((v, j) => (v - this.mean[j]) / this.scale[j]));
  }

  fitTransform(X: number[][]): number[][] {
    return this.fit(X).transform(X);
  }
}

export class OneHotEncoder {
  constructor(public readonly categories: string[]) {}

  transform(value: string): number[] {
    return this.categories.map((c) => c === value ? 1 : 0);
  }
}

/** Column-mean imputation for missing numeric values. */
export function imputeMean(X: (number | null)[][]): number[][] {
  const d = X[0]?.length ?? 0;
  const means = Array.from({ length: d }, (_, j) => {
    const vals = X.map((r) => r[j]).filter((v): v is number => v != null);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  });
  return X.map((r) => r.map((v, j) => v == null ? means[j] : v));
}

abstract class GradientLinearModel {
  weights: number[] = [];
  bias = 0;
  protected cfg: LinearConfig;

  constructor(cfg: Partial<LinearConfig> = {}) {
    this.cfg = { ...DEFAULT_CONFIG, ...cfg };
  }

  protected abstract link(z: number): number;

  protected fitRaw(X: number[][], y: number[]): void {
    const n = X.length;
    const d = X[0]?.length ?? 0;
    this.weights = new Array(d).fill(0);
    this.bias = 0;
    const { penalty, alpha, l1Ratio, learningRate: lr, epochs } = this.cfg;
    const l2 = penalty === 'l2' ? alpha : penalty === 'elasticnet' ? alpha * (1 - l1Ratio) : 0;
    const l1 = penalty === 'l1' ? alpha : penalty === 'elasticnet' ? alpha * l1Ratio : 0;

    for (let e = 0; e < epochs; e++) {
      const gw = new Array(d).fill(0);
      let gb = 0;
      for (let i = 0; i < n; i++) {
        const err = this.link(dot(this.weights, X[i]) + this.bias) - y[i];
        for (let j = 0; j < d; j++) gw[j] += err * X[i][j];
        gb += err;
      }
      for (let j = 0; j < d; j++) {
        let w = this.weights[j] - lr * (gw[j] / n + l2 * this.weights[j]);
        if (l1) w = Math.sign(w) * Math.max(0, Math.abs(w) - lr * l1);
        this.weights[j] = w;
      }
      this.bias -= lr * gb / n;
    }
  }

  protected output(X: number[][]): number[] {
    return X.map((x) => this.link(dot(this.weights, x) + this.bias));
  }
}

export class LogisticRegression extends GradientLinearModel {
  protected link(z: number): number {
    return sigmoid(z);
  }

  fit(X: number[][], y: number[]): this {
    this.fitRaw(X, y);
    return this;
  }

  predictProba(X: number[][]): number[] {
    return this.output(X);
  }
}

/** Linear regression — penalty 'l2' = Ridge, 'l1' = Lasso, 'elasticnet' = Elastic Net. */
export class LinearRegression extends GradientLinearModel {
  private yMean = 0;
  private yStd = 1;

  protected link(z: number): number {
    return z;
  }

  fit(X: number[][], y: number[]): this {
    this.yMean = y.reduce((a, b) => a + b, 0) / (y.length || 1);
    this.yStd = Math.sqrt(y.reduce((s, v) => s + (v - this.yMean) ** 2, 0) / (y.length || 1)) || 1;
    this.fitRaw(X, y.map((v) => (v - this.yMean) / this.yStd));
    return this;
  }

  predict(X: number[][]): number[] {
    return this.output(X).map((v) => v * this.yStd + this.yMean);
  }
}

// ── Multinomial logistic tier model ─────────────────────────────────────────

export const MATCH_TIERS = ['Low Match', 'Moderate Match', 'Good Match', 'Strong Match'] as const;
export type MatchTier = (typeof MATCH_TIERS)[number];

/** Coefficients fitted offline; decision boundaries fall at relevance 0.45 / 0.65 / 0.80. */
export const TIER_MODEL = {
  classes: MATCH_TIERS,
  coef: [0, 10, 20, 30],
  intercept: [0, -4.5, -11, -19]
};

export function softmax(z: number[]): number[] {
  const max = Math.max(...z);
  const exps = z.map((v) => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((v) => v / sum);
}

export function predictTier(relevance: number): {tier: MatchTier;probabilities: number[];} {
  const logits = TIER_MODEL.coef.map((c, k) => c * relevance + TIER_MODEL.intercept[k]);
  const probabilities = softmax(logits);
  const best = probabilities.indexOf(Math.max(...probabilities));
  return { tier: MATCH_TIERS[best], probabilities };
}