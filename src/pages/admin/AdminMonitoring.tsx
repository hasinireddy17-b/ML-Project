import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertTriangleIcon, CheckIcon, Loader2Icon, RefreshCwIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { InteractionType } from '../../types/activity';
import { useActivity } from '../../contexts/ActivityContext';
import { driftFeatures, monitoringSeries, performanceTrend, retrainingHistory } from '../../data/adminDemo';
import { driftLevel, getMonitoringSnapshot, populationStabilityIndex, type DriftLevel } from '../../utils/ml/engineering/monitoring';
import { SIGNAL_WEIGHTS } from '../../utils/ml/engineering/feedback';
import { rebuildFeatureStore } from '../../utils/ml/engineering/featureStore';
import { unloadModels } from '../../utils/ml/engineering/registry';
import { resetClustering } from '../../utils/ml/unsupervised/analysis';
import { runLiveExperiment } from '../../utils/ml/evaluation/experiment';
import { AdminHeader, DemoBadge, LiveBadge } from '../../components/admin/AdminHeader';
import { AdminPanel } from '../../components/admin/AdminPanel';
import { MetricTiles } from '../../components/admin/MetricTiles';
import { Button } from '../../components/ui/Button';

const AXIS = { fontSize: 11, fill: '#74685E' };
const STAGES = ['Collecting feedback signals', 'Rebuilding features', 'Training candidate models', 'Evaluating on held-out data', 'Promoting model'];
const LEVEL_STYLE: Record<DriftLevel, string> = {
  stable: 'bg-sage-50 text-sage-800',
  moderate: 'bg-amber-50 text-amber-600',
  significant: 'bg-rust-50 text-rust-600'
};
const SIGNALS: {type: InteractionType;label: string;}[] = [
{ type: 'view', label: 'Viewed job' },
{ type: 'click', label: 'Clicked recommendation' },
{ type: 'similar_open', label: 'Opened similar job' },
{ type: 'save', label: 'Saved job' },
{ type: 'apply', label: 'Applied' },
{ type: 'dismiss', label: 'Dismissed' },
{ type: 'search', label: 'Searched' }];


export function AdminMonitoring() {
  const { interactions } = useActivity();
  const [snapshot, setSnapshot] = useState(getMonitoringSnapshot);
  const [stage, setStage] = useState(-1);
  const [retrained, setRetrained] = useState(false);
  const [history, setHistory] = useState(retrainingHistory);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const t = window.setInterval(() => setSnapshot(getMonitoringSnapshot()), 3000);
    return () => {
      window.clearInterval(t);
      timers.current.forEach((x) => window.clearTimeout(x));
    };
  }, []);

  const drift = useMemo(
    () =>
    driftFeatures.map((f) => {
      const psi = populationStabilityIndex(f.training, f.current);
      return { ...f, psi, level: driftLevel(psi) };
    }),
    []
  );
  const significant = !retrained && drift.some((d) => d.level === 'significant');
  const signalCounts = SIGNALS.map((s) => ({ ...s, count: interactions.filter((i) => i.type === s.type).length }));

  const retrain = () => {
    setStage(0);
    STAGES.forEach((_, i) => {
      timers.current.push(
        window.setTimeout(() => {
          if (i < STAGES.length - 1) {
            setStage(i + 1);
            return;
          }
          rebuildFeatureStore();
          unloadModels();
          resetClustering();
          const res = runLiveExperiment(7 + history.length);
          const best = res.classifiers.find((c) => c.selected);
          setRetrained(true);
          setStage(-1);
          setHistory((h) => [
          { version: 'model_v3 (refresh)', date: new Date().toISOString().slice(0, 10), trigger: `Manual · data drift · ${interactions.length} feedback signals`, result: `Promoted · F1 ${best?.test.f1.toFixed(3) ?? '—'}` },
          ...h]
          );
          toast.success('Retraining complete', { description: 'Features rebuilt, models re-evaluated, and the refreshed package is now serving.' });
        }, (i + 1) * 600)
      );
    });
  };

  return (
    <div>
      <AdminHeader
        title="Monitoring"
        description="Serving health, input drift, and the feedback that feeds retraining."
        actions={
        <Button onClick={retrain} loading={stage >= 0} variant={significant ? 'primary' : 'secondary'}>
            {stage < 0 && <RefreshCwIcon className="h-4 w-4" aria-hidden="true" />}
            Retrain Model
          </Button>
        } />
      

      {significant && stage < 0 &&
      <div role="alert" className="mb-6 flex items-start gap-3 rounded-lg border border-rust-500/30 bg-rust-50 p-4">
          <AlertTriangleIcon className="mt-0.5 h-5 w-5 shrink-0 text-rust-600" aria-hidden="true" />
          <div className="flex-1">
            <p className="font-semibold text-rust-600">Data distribution changed significantly.</p>
            <p className="mt-0.5 text-sm text-ink-soft">
              {drift.
            filter((d) => d.level === 'significant').
            map((d) => `${d.feature} (PSI ${d.psi.toFixed(2)})`).
            join(', ')}{' '}
              crossed the 0.25 threshold. Retraining is recommended.
            </p>
          </div>
        </div>
      }

      {stage >= 0 &&
      <div className="mb-6 rounded-lg border border-line bg-surface p-5" role="status" aria-live="polite">
          <p className="font-semibold text-ink">Retraining in progress</p>
          <ol className="mt-3 grid gap-2 sm:grid-cols-5">
            {STAGES.map((s, i) =>
          <li key={s} className={`flex items-center gap-2 text-sm ${i <= stage ? 'text-ink' : 'text-ink-faint'}`}>
                {i < stage ? <CheckIcon className="h-4 w-4 text-sage-700" aria-hidden="true" /> : i === stage ? <Loader2Icon className="h-4 w-4 animate-spin text-sage-700" aria-hidden="true" /> : <span className="h-4 w-4" />}
                {s}
              </li>
          )}
          </ol>
        </div>
      }

      <div className="mb-2 flex items-center gap-2 text-sm text-ink-soft">
        This session <LiveBadge />
      </div>
      <MetricTiles
        items={[
        { label: 'Requests', value: String(snapshot.totalRequests) },
        { label: 'Predictions', value: String(snapshot.totalPredictions) },
        { label: 'Avg latency', value: `${Math.round(snapshot.avgLatency)} ms` },
        { label: 'Error rate', value: `${(snapshot.errorRate * 100).toFixed(1)}%` },
        { label: 'Feedback signals', value: String(interactions.length) },
        { label: 'Model status', value: retrained ? 'Refreshed' : 'Serving' }]
        } />
      

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <AdminPanel title="Prediction volume" badge={<DemoBadge />} description="Daily recommendation and match requests, last 14 days.">
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monitoringSeries} margin={{ right: 8 }}>
                <CartesianGrid vertical={false} stroke="#EDE6DA" />
                <XAxis dataKey="day" tick={AXIS} interval={2} />
                <YAxis tick={AXIS} width={44} tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} />
                <Tooltip />
                <Area type="monotone" dataKey="predictions" stroke="#5B7257" fill="#C7D3C1" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </AdminPanel>
        <AdminPanel title="API latency" badge={<DemoBadge />} description="p50 and p95 response time (ms).">
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monitoringSeries} margin={{ right: 8 }}>
                <CartesianGrid vertical={false} stroke="#EDE6DA" />
                <XAxis dataKey="day" tick={AXIS} interval={2} />
                <YAxis tick={AXIS} width={36} />
                <Tooltip />
                <Line type="monotone" dataKey="p50" stroke="#5B7257" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="p95" stroke="#A07E4E" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </AdminPanel>
      </div>

      <AdminPanel title="Input drift" className="mt-6" badge={<DemoBadge label="Demo distributions · live PSI" />} description="Population Stability Index between training data and the last 7 days of requests. >0.10 moderate, >0.25 significant.">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="text-ink-muted">
              <tr className="border-b border-line">
                <th className="py-2 font-medium">Feature</th>
                <th className="py-2 text-right font-medium">PSI</th>
                <th className="py-2 pl-4 font-medium">Level</th>
                <th className="py-2 pl-4 font-medium">Largest shifts</th>
              </tr>
            </thead>
            <tbody>
              {drift.map((d) => {
                const shifts = d.labels.
                map((l, i) => ({ l, a: d.training[i], b: d.current[i] })).
                filter((s) => Math.abs(s.b - s.a) >= 0.02).
                sort((x, y) => Math.abs(y.b - y.a) - Math.abs(x.b - x.a)).
                slice(0, 3);
                const level = retrained ? 'stable' : d.level;
                return (
                  <tr key={d.feature} className="border-b border-line last:border-0">
                    <td className="py-2.5 font-medium text-ink">{d.feature}</td>
                    <td className="py-2.5 text-right tabular-nums">{retrained ? '0.01' : d.psi.toFixed(3)}</td>
                    <td className="py-2.5 pl-4">
                      <span className={`rounded px-1.5 py-0.5 text-xs font-medium capitalize ${LEVEL_STYLE[level]}`}>{level}</span>
                    </td>
                    <td className="py-2.5 pl-4 text-ink-soft">
                      {retrained ? 'Re-baselined after retraining' : shifts.length ? shifts.map((s) => `${s.l} ${Math.round(s.a * 100)}% → ${Math.round(s.b * 100)}%`).join(' · ') : '—'}
                    </td>
                  </tr>);

              })}
            </tbody>
          </table>
        </div>
      </AdminPanel>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <AdminPanel title="Recommendation performance" badge={<DemoBadge />} description="Weekly NDCG@10 and Precision@5 from logged feedback.">
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceTrend} margin={{ right: 8 }}>
                <CartesianGrid vertical={false} stroke="#EDE6DA" />
                <XAxis dataKey="week" tick={AXIS} />
                <YAxis tick={AXIS} width={36} domain={[0.5, 0.9]} />
                <Tooltip />
                <Line type="monotone" dataKey="ndcg" name="NDCG@10" stroke="#5B7257" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="precision" name="Precision@5" stroke="#917C68" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </AdminPanel>

        <AdminPanel title="Feedback loop" badge={<LiveBadge />} description="Signals from your session, and how strongly each one moves future rankings.">
          <table className="w-full text-left text-sm">
            <thead className="text-ink-muted">
              <tr className="border-b border-line">
                <th className="py-2 font-medium">Signal</th>
                <th className="py-2 text-right font-medium">Collected</th>
                <th className="py-2 text-right font-medium">Weight</th>
              </tr>
            </thead>
            <tbody>
              {signalCounts.map((s) =>
              <tr key={s.type} className="border-b border-line last:border-0">
                  <td className="py-1.5 text-ink">{s.label}</td>
                  <td className="py-1.5 text-right tabular-nums">{s.count}</td>
                  <td className={`py-1.5 text-right tabular-nums ${SIGNAL_WEIGHTS[s.type] < 0 ? 'text-rust-600' : 'text-ink-soft'}`}>
                    {SIGNAL_WEIGHTS[s.type] > 0 ? '+' : ''}
                    {SIGNAL_WEIGHTS[s.type]}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-ink-muted">User → recommendation → interaction → feedback → data collection → model update → better recommendations.</p>
        </AdminPanel>
      </div>

      <AdminPanel title="Retraining history" className="mt-6">
        <ul className="divide-y divide-line">
          {history.map((h, i) =>
          <li key={`${h.version}-${i}`} className="flex flex-wrap items-baseline justify-between gap-2 py-2.5 text-sm">
              <span>
                <span className="font-medium text-ink">{h.version}</span>
                <span className="ml-2 text-ink-muted">{h.trigger}</span>
              </span>
              <span className="text-ink-soft">
                {h.result} · <span className="tabular-nums">{h.date}</span>
              </span>
            </li>
          )}
        </ul>
      </AdminPanel>
    </div>);

}