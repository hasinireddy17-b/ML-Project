/**
 * MODULE 6 · MONITORING & DRIFT DETECTION
 * In-process request telemetry for the serving layer + Population Stability Index for drift.
 */

interface EndpointStat {
  count: number;
  errors: number;
  latencies: number[];
}

const stats = new Map<string, EndpointStat>();
const PREDICTION_ENDPOINTS = ['POST /recommendations', 'POST /search', 'POST /match', 'POST /predict', 'GET /similar-jobs/:id'];

export function recordRequest(endpoint: string, ms: number, ok: boolean): void {
  const s = stats.get(endpoint) ?? { count: 0, errors: 0, latencies: [] };
  s.count += 1;
  if (!ok) s.errors += 1;
  s.latencies.push(ms);
  if (s.latencies.length > 500) s.latencies.shift();
  stats.set(endpoint, s);
}

function percentile(values: number[], p: number): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(p / 100 * sorted.length))];
}

export interface MonitoringSnapshot {
  endpoints: {endpoint: string;count: number;errors: number;avgMs: number;p95Ms: number;}[];
  totalRequests: number;
  totalPredictions: number;
  avgLatency: number;
  errorRate: number;
}

export function getMonitoringSnapshot(): MonitoringSnapshot {
  const endpoints = [...stats.entries()].
  map(([endpoint, s]) => ({
    endpoint,
    count: s.count,
    errors: s.errors,
    avgMs: s.latencies.reduce((a, b) => a + b, 0) / (s.latencies.length || 1),
    p95Ms: percentile(s.latencies, 95)
  })).
  sort((a, b) => b.count - a.count);
  const totalRequests = endpoints.reduce((s, e) => s + e.count, 0);
  const totalErrors = endpoints.reduce((s, e) => s + e.errors, 0);
  const all = [...stats.values()].flatMap((s) => s.latencies);
  return {
    endpoints,
    totalRequests,
    totalPredictions: endpoints.filter((e) => PREDICTION_ENDPOINTS.includes(e.endpoint)).reduce((s, e) => s + e.count, 0),
    avgLatency: all.reduce((a, b) => a + b, 0) / (all.length || 1),
    errorRate: totalRequests ? totalErrors / totalRequests : 0
  };
}

/** PSI between two categorical distributions given as proportions over the same bins. */
export function populationStabilityIndex(expected: number[], actual: number[]): number {
  const eps = 1e-4;
  return expected.reduce((sum, e, i) => {
    const a = Math.max(actual[i] ?? 0, eps);
    const ex = Math.max(e, eps);
    return sum + (a - ex) * Math.log(a / ex);
  }, 0);
}

export type DriftLevel = 'stable' | 'moderate' | 'significant';

export function driftLevel(psi: number): DriftLevel {
  if (psi < 0.1) return 'stable';
  if (psi < 0.25) return 'moderate';
  return 'significant';
}