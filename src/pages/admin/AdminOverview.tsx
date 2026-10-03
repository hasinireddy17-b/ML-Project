import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CheckIcon } from 'lucide-react';
import { getFeatureStore, FEATURE_SCHEMA } from '../../utils/ml/engineering/featureStore';
import { MODEL_VERSIONS, SERVING_VERSION } from '../../utils/ml/engineering/registry';
import { getMonitoringSnapshot, populationStabilityIndex, driftLevel } from '../../utils/ml/engineering/monitoring';
import { getLastExperiment } from '../../utils/ml/evaluation/experiment';
import { driftFeatures } from '../../data/adminDemo';
import { AdminHeader, LiveBadge } from '../../components/admin/AdminHeader';
import { AdminPanel, StatList } from '../../components/admin/AdminPanel';

const ARCHITECTURE = ['Frontend (React)', 'Backend REST API', 'Recommendation API', 'ML pipeline', 'Packaged model', 'Prediction'];

export function AdminOverview() {
  const store = getFeatureStore();
  const snapshot = getMonitoringSnapshot();
  const experiment = getLastExperiment();
  const serving = MODEL_VERSIONS.find((m) => m.version === SERVING_VERSION);
  const report = store.report;
  const missingTotal = Object.values(report.missingByField).reduce((a, b) => a + b, 0);
  const held = store.anomalies.filter((a) => a.held).length;
  const maxPsi = useMemo(() => Math.max(...driftFeatures.map((f) => populationStabilityIndex(f.training, f.current))), []);
  const selected = experiment?.classifiers.find((c) => c.selected);

  const stages = [
  { name: 'Raw job data', metric: `${report.rawCount} records` },
  { name: 'Data cleaning', metric: `${report.duplicatesRemoved.length} duplicate removed · ${report.standardizedValues} values standardized` },
  { name: 'Feature engineering', metric: `${FEATURE_SCHEMA.engineered.length} match features` },
  { name: 'Representation', metric: `TF-IDF · ${store.vectorizers.combined.size} terms` },
  { name: 'Training', metric: experiment ? `${experiment.dataset.rows} labelled pairs` : 'Awaiting run' },
  { name: 'Evaluation', metric: selected ? `F1 ${selected.test.f1.toFixed(2)} (test)` : 'Awaiting run' },
  { name: 'Packaging', metric: SERVING_VERSION },
  { name: 'API serving', metric: `${snapshot.totalRequests} requests this session` },
  { name: 'Monitoring', metric: `Max PSI ${maxPsi.toFixed(2)}` },
  { name: 'Retraining', metric: 'Weekly · on drift' }];


  return (
    <div>
      <AdminHeader
        title="ML lifecycle"
        description="End-to-end health of the recommendation system — from raw postings to served predictions."
        actions={<span className="rounded-md border border-line bg-surface px-3 py-1.5 text-sm text-ink">Serving <span className="font-semibold">{SERVING_VERSION}</span></span>} />
      

      <section aria-labelledby="pipeline-title" className="rounded-lg border border-line bg-surface p-5">
        <h2 id="pipeline-title" className="text-base font-semibold text-ink">
          Pipeline
        </h2>
        <ol className="mt-5 grid gap-x-4 gap-y-5 sm:grid-cols-2 lg:grid-cols-5">
          {stages.map((s, i) =>
          <li key={s.name} className="relative flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage-600 text-cream-50">
                <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">
                  <span className="mr-1 tabular-nums text-ink-muted">{i + 1}.</span>
                  {s.name}
                </p>
                <p className="mt-0.5 text-xs text-ink-muted">{s.metric}</p>
              </div>
            </li>
          )}
        </ol>
      </section>

      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AdminPanel title="Data" badge={<LiveBadge />}>
          <StatList
            items={[
            { label: 'Dataset size', value: `${report.cleanCount} jobs`, hint: `${report.rawCount} raw` },
            { label: 'Missing values', value: missingTotal },
            { label: 'Duplicate records', value: report.duplicatesRemoved.length },
            { label: 'Held for review', value: held }]
            } />
          
        </AdminPanel>
        <AdminPanel title="Features" badge={<LiveBadge />}>
          <StatList
            items={[
            { label: 'Total features', value: FEATURE_SCHEMA.numerical.length + FEATURE_SCHEMA.categorical.length + FEATURE_SCHEMA.text.length + FEATURE_SCHEMA.engineered.length },
            { label: 'Numerical', value: FEATURE_SCHEMA.numerical.length },
            { label: 'Categorical', value: FEATURE_SCHEMA.categorical.length },
            { label: 'Text', value: FEATURE_SCHEMA.text.length, hint: `${store.vectorizers.combined.size}-term vocabulary` }]
            } />
          
        </AdminPanel>
        <AdminPanel title="Training">
          <StatList
            items={[
            { label: 'Last training date', value: serving?.trainedAt ?? '—' },
            { label: 'Model version', value: SERVING_VERSION },
            { label: 'Dataset version', value: store.datasetVersion },
            { label: 'Training status', value: <span className="text-sage-700">Completed</span> }]
            } />
          
        </AdminPanel>
        <AdminPanel title="Evaluation" badge={experiment ? <LiveBadge /> : undefined}>
          {selected ?
          <StatList
            items={[
            { label: 'Selected classifier', value: selected.name },
            { label: 'F1 (test)', value: selected.test.f1.toFixed(3) },
            { label: 'ROC-AUC (test)', value: selected.test.rocAuc.toFixed(3) },
            { label: 'NDCG@10 (ranker)', value: experiment?.ranking.find((r) => r.version === SERVING_VERSION)?.ndcgAt10.toFixed(3) ?? '—' }]
            } /> :


          <p className="text-sm text-ink-muted">
              No evaluation run this session.{' '}
              <Link to="/admin/models" className="font-medium text-sage-700 hover:text-sage-800">
                Run evaluation
              </Link>
            </p>
          }
        </AdminPanel>
        <AdminPanel title="Deployment" badge={<LiveBadge />}>
          <StatList
            items={[
            { label: 'Model status', value: <span className="text-sage-700">Serving</span> },
            { label: 'API status', value: <span className="text-sage-700">{snapshot.errorRate > 0.05 ? 'Degraded' : 'Operational'}</span> },
            { label: 'Package', value: `${serving?.label}` },
            { label: 'Feedback re-ranking', value: serving?.useFeedback ? 'Enabled' : 'Disabled' }]
            } />
          
        </AdminPanel>
        <AdminPanel title="Monitoring" badge={<LiveBadge />}>
          <StatList
            items={[
            { label: 'Prediction count', value: snapshot.totalPredictions, hint: 'this session' },
            { label: 'Avg response time', value: `${Math.round(snapshot.avgLatency)} ms` },
            { label: 'Data drift', value: <span className={driftLevel(maxPsi) === 'significant' ? 'text-rust-600' : 'text-ink'}>{driftLevel(maxPsi)}</span> },
            { label: 'Performance drift', value: 'NDCG −0.05 over 4 wks', hint: 'demo data' }]
            } />
          
        </AdminPanel>
      </div>

      <AdminPanel title="Serving architecture" className="mt-6" description="Every request from the product flows through the same layers.">
        <ol className="flex flex-wrap items-center gap-2 text-sm">
          {ARCHITECTURE.map((a, i) =>
          <li key={a} className="flex items-center gap-2">
              <span className="rounded-md border border-line bg-cream-100 px-3 py-1.5 text-ink">{a}</span>
              {i < ARCHITECTURE.length - 1 && <span className="text-ink-faint" aria-hidden="true">→</span>}
            </li>
          )}
        </ol>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="text-ink-muted">
              <tr className="border-b border-line">
                <th className="py-2 font-medium">Endpoint</th>
                <th className="py-2 text-right font-medium">Requests</th>
                <th className="py-2 text-right font-medium">Avg latency</th>
                <th className="py-2 text-right font-medium">p95</th>
                <th className="py-2 text-right font-medium">Errors</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.endpoints.length ?
              snapshot.endpoints.map((e) =>
              <tr key={e.endpoint} className="border-b border-line last:border-0">
                    <td className="py-2 font-mono text-[13px] text-ink">{e.endpoint}</td>
                    <td className="py-2 text-right tabular-nums">{e.count}</td>
                    <td className="py-2 text-right tabular-nums">{Math.round(e.avgMs)} ms</td>
                    <td className="py-2 text-right tabular-nums">{Math.round(e.p95Ms)} ms</td>
                    <td className="py-2 text-right tabular-nums">{e.errors}</td>
                  </tr>
              ) :

              <tr>
                  <td colSpan={5} className="py-4 text-center text-ink-muted">
                    No requests yet this session. Use the product and come back.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </AdminPanel>
    </div>);

}