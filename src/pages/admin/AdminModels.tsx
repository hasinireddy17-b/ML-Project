import React, { useCallback, useEffect, useState } from 'react';
import { CheckIcon, RefreshCwIcon } from 'lucide-react';
import { getLastExperiment, runLiveExperiment, type LiveExperimentResult } from '../../utils/ml/evaluation/experiment';
import { experimentRuns } from '../../data/adminDemo';
import { AdminHeader, DemoBadge, LiveBadge } from '../../components/admin/AdminHeader';
import { AdminPanel } from '../../components/admin/AdminPanel';
import { MetricTiles } from '../../components/admin/MetricTiles';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';

const f3 = (v: number) => v.toFixed(3);

export function AdminModels() {
  const [result, setResult] = useState<LiveExperimentResult | null>(getLastExperiment());
  const [running, setRunning] = useState(false);
  const [seed, setSeed] = useState(42);

  const run = useCallback((s: number) => {
    setRunning(true);
    window.setTimeout(() => {
      setResult(runLiveExperiment(s));
      setRunning(false);
    }, 60);
  }, []);

  useEffect(() => {
    if (!getLastExperiment()) run(42);
  }, [run]);

  const demoRows = experimentRuns.filter((r) => (r.model === 'XGBoost' || r.model === 'LightGBM') && r.status !== 'Failed').slice(0, 2);

  if (!result || running) {
    return (
      <div>
        <AdminHeader title="Model performance" description="Training candidate models, cross-validating, and scoring the held-out test set…" />
        <div className="space-y-6" aria-busy="true">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-56 rounded-lg" />
            <Skeleton className="h-56 rounded-lg" />
          </div>
        </div>
      </div>);

  }

  const selected = result.classifiers.find((c) => c.selected) ?? result.classifiers[0];
  const maxImp = Math.max(1e-6, ...result.importance.map((i) => i.importance));
  const bestRegression = [...result.regression].sort((a, b) => a.rmse - b.rmse)[0];

  return (
    <div>
      <AdminHeader
        title="Model performance"
        description={
        <>
            Relevance classifier trained in-browser on {result.dataset.rows} simulated candidate–job pairs ({result.dataset.positives} relevant). Stratified {result.dataset.train}/
            {result.dataset.test} split → {result.dataset.folds}-fold stratified CV on the training set for selection → test set scored once. Ran in {Math.round(result.durationMs)} ms.
          </>
        }
        actions={
        <Button
          variant="secondary"
          onClick={() => {
            const next = seed + 1;
            setSeed(next);
            run(next);
          }}>
          
            <RefreshCwIcon className="h-4 w-4" aria-hidden="true" />
            Re-run with new seed
          </Button>
        } />
      

      <div className="mb-3 flex items-center gap-2 text-sm text-ink-soft">
        Selected by cross-validation: <span className="font-semibold text-ink">{selected.name}</span>
        <LiveBadge label="Test set" />
      </div>
      <MetricTiles
        items={[
        { label: 'Accuracy', value: f3(selected.test.accuracy) },
        { label: 'Precision', value: f3(selected.test.precision) },
        { label: 'Recall', value: f3(selected.test.recall) },
        { label: 'F1', value: f3(selected.test.f1) },
        { label: 'ROC-AUC', value: f3(selected.test.rocAuc) },
        { label: 'PR-AUC', value: f3(selected.test.prAuc) }]
        } />
      

      <AdminPanel title="Model comparison" className="mt-6" description="Selection uses mean CV F1 only; test columns are reported after selection.">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-ink-muted">
              <tr className="border-b border-line">
                <th className="py-2 font-medium">Model</th>
                <th className="py-2 font-medium">Hyperparameters</th>
                <th className="py-2 text-right font-medium">CV F1</th>
                <th className="py-2 text-right font-medium">CV ROC-AUC</th>
                <th className="py-2 text-right font-medium">Test F1</th>
                <th className="py-2 text-right font-medium">Test ROC-AUC</th>
                <th className="py-2 text-right font-medium">Fit time</th>
              </tr>
            </thead>
            <tbody>
              {result.classifiers.map((c) =>
              <tr key={c.name} className={`border-b border-line ${c.selected ? 'bg-sage-50' : ''}`}>
                  <td className="py-2.5 pr-3">
                    <span className="flex items-center gap-2 font-medium text-ink">
                      {c.name}
                      {c.selected && <CheckIcon className="h-4 w-4 text-sage-700" aria-label="Selected" />}
                    </span>
                    <span className="text-xs text-ink-muted">{c.family}</span>
                  </td>
                  <td className="py-2.5 pr-3 font-mono text-[12px] text-ink-soft">{c.params}</td>
                  <td className="py-2.5 text-right tabular-nums">{f3(c.cvF1)}</td>
                  <td className="py-2.5 text-right tabular-nums">{f3(c.cvAuc)}</td>
                  <td className="py-2.5 text-right tabular-nums">{f3(c.test.f1)}</td>
                  <td className="py-2.5 text-right tabular-nums">{f3(c.test.rocAuc)}</td>
                  <td className="py-2.5 text-right tabular-nums text-ink-muted">{Math.max(1, Math.round(c.trainMs))} ms</td>
                </tr>
              )}
              {demoRows.map((r) =>
              <tr key={r.id} className="border-b border-line last:border-0">
                  <td className="py-2.5 pr-3">
                    <span className="flex items-center gap-2 font-medium text-ink">
                      {r.model} <DemoBadge />
                    </span>
                    <span className="text-xs text-ink-muted">ML service · {r.id}</span>
                  </td>
                  <td className="py-2.5 pr-3 font-mono text-[12px] text-ink-soft">
                    {Object.entries(r.hyperparameters).
                  map(([k, v]) => `${k}=${v}`).
                  join(', ')}
                  </td>
                  <td className="py-2.5 text-right tabular-nums text-ink-muted">—</td>
                  <td className="py-2.5 text-right tabular-nums text-ink-muted">—</td>
                  <td className="py-2.5 text-right tabular-nums">{r.metrics.f1.toFixed(2)}</td>
                  <td className="py-2.5 text-right tabular-nums">{r.metrics.rocAuc.toFixed(2)}</td>
                  <td className="py-2.5 text-right tabular-nums text-ink-muted">{r.durationSec}s</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </AdminPanel>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <AdminPanel title="Feature importance" badge={<LiveBadge label="Permutation · ROC-AUC drop" />} description={`Measured on the test set for ${selected.name}.`}>
          <ul className="space-y-2.5">
            {result.importance.map((i) =>
            <li key={i.feature} className="grid grid-cols-[150px_minmax(0,1fr)_52px] items-center gap-3 text-sm">
                <span className="text-ink">{i.feature}</span>
                <span className="h-2 overflow-hidden rounded-full bg-cream-200">
                  <span className="block h-full rounded-full bg-sage-600" style={{ width: `${i.importance / maxImp * 100}%` }} />
                </span>
                <span className="text-right tabular-nums text-ink-soft">{i.importance.toFixed(3)}</span>
              </li>
            )}
          </ul>
        </AdminPanel>
        <AdminPanel title="Calibration" description="Predicted probability vs. observed relevance rate on the test set.">
          <table className="w-full text-left text-sm">
            <thead className="text-ink-muted">
              <tr className="border-b border-line">
                <th className="py-2 font-medium">Bin</th>
                <th className="py-2 text-right font-medium">Mean predicted</th>
                <th className="py-2 text-right font-medium">Observed</th>
                <th className="py-2 text-right font-medium">Rows</th>
              </tr>
            </thead>
            <tbody>
              {result.calibration.map((b) =>
              <tr key={b.bin} className="border-b border-line last:border-0">
                  <td className="py-2">{b.bin}</td>
                  <td className="py-2 text-right tabular-nums">{b.count ? b.predicted.toFixed(2) : '—'}</td>
                  <td className="py-2 text-right tabular-nums">{b.count ? b.observed.toFixed(2) : '—'}</td>
                  <td className="py-2 text-right tabular-nums text-ink-muted">{b.count}</td>
                </tr>
              )}
            </tbody>
          </table>
        </AdminPanel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <AdminPanel title="Grid search · Logistic Regression" badge={<LiveBadge />} description="penalty × C, scored by mean 5-fold CV F1.">
          <table className="w-full text-left text-sm">
            <thead className="text-ink-muted">
              <tr className="border-b border-line">
                <th className="py-2 font-medium">Parameters</th>
                <th className="py-2 text-right font-medium">CV F1</th>
                <th className="py-2 text-right font-medium">CV AUC</th>
              </tr>
            </thead>
            <tbody>
              {result.grid.map((g, i) =>
              <tr key={g.params} className={`border-b border-line last:border-0 ${i === 0 ? 'font-medium text-ink' : 'text-ink-soft'}`}>
                  <td className="py-1.5 font-mono text-[12px]">{g.params}</td>
                  <td className="py-1.5 text-right tabular-nums">{f3(g.f1)}</td>
                  <td className="py-1.5 text-right tabular-nums">{f3(g.auc)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </AdminPanel>
        <AdminPanel title="Random search · Random Forest" badge={<LiveBadge />} description="3 sampled configurations of n_estimators and max_depth.">
          <table className="w-full text-left text-sm">
            <thead className="text-ink-muted">
              <tr className="border-b border-line">
                <th className="py-2 font-medium">Parameters</th>
                <th className="py-2 text-right font-medium">CV F1</th>
                <th className="py-2 text-right font-medium">CV AUC</th>
              </tr>
            </thead>
            <tbody>
              {result.random.map((g, i) =>
              <tr key={`${g.params}-${i}`} className={`border-b border-line last:border-0 ${i === 0 ? 'font-medium text-ink' : 'text-ink-soft'}`}>
                  <td className="py-1.5 font-mono text-[12px]">{g.params}</td>
                  <td className="py-1.5 text-right tabular-nums">{f3(g.f1)}</td>
                  <td className="py-1.5 text-right tabular-nums">{f3(g.auc)}</td>
                </tr>
              )}
            </tbody>
          </table>
          <p className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3 text-xs text-ink-muted">
            Bayesian optimization (TPE, 60 trials) tunes the gradient-boosted models in the offline ML service. <DemoBadge />
          </p>
        </AdminPanel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <AdminPanel title="Salary estimator · regularized regression" badge={<LiveBadge label="5-fold CV" />} description="Predicts salary_max from experience, category, location, work mode, and level.">
          <table className="w-full text-left text-sm">
            <thead className="text-ink-muted">
              <tr className="border-b border-line">
                <th className="py-2 font-medium">Model</th>
                <th className="py-2 text-right font-medium">RMSE</th>
                <th className="py-2 text-right font-medium">MAE</th>
                <th className="py-2 text-right font-medium">R²</th>
                <th className="py-2 text-right font-medium">Non-zero coefs</th>
              </tr>
            </thead>
            <tbody>
              {result.regression.map((r) =>
              <tr key={r.name} className={`border-b border-line last:border-0 ${r.name === bestRegression.name ? 'bg-sage-50' : ''}`}>
                  <td className="py-2">
                    <span className="font-medium text-ink">{r.name}</span>
                    <span className="block font-mono text-[11px] text-ink-muted">{r.params}</span>
                  </td>
                  <td className="py-2 text-right tabular-nums">₹{r.rmse.toFixed(2)}L</td>
                  <td className="py-2 text-right tabular-nums">₹{r.mae.toFixed(2)}L</td>
                  <td className="py-2 text-right tabular-nums">{r.r2.toFixed(3)}</td>
                  <td className="py-2 text-right tabular-nums">{r.nonZero}</td>
                </tr>
              )}
            </tbody>
          </table>
        </AdminPanel>
        <AdminPanel title="Recommendation quality" badge={<LiveBadge />} description="Ranking metrics per packaged model, averaged over evaluation personas.">
          <table className="w-full text-left text-sm">
            <thead className="text-ink-muted">
              <tr className="border-b border-line">
                <th className="py-2 font-medium">Version</th>
                <th className="py-2 text-right font-medium">Precision@5</th>
                <th className="py-2 text-right font-medium">Recall@10</th>
                <th className="py-2 text-right font-medium">NDCG@10</th>
              </tr>
            </thead>
            <tbody>
              {result.ranking.map((r) =>
              <tr key={r.version} className="border-b border-line last:border-0">
                  <td className="py-2">
                    <span className="font-medium text-ink">{r.version}</span>
                    <span className="block text-xs text-ink-muted">{r.label}</span>
                  </td>
                  <td className="py-2 text-right tabular-nums">{f3(r.precisionAt5)}</td>
                  <td className="py-2 text-right tabular-nums">{f3(r.recallAt10)}</td>
                  <td className="py-2 text-right tabular-nums">{f3(r.ndcgAt10)}</td>
                </tr>
              )}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-ink-muted">Feedback re-ranking in model_v3 is not reflected here — offline personas have no interaction history.</p>
        </AdminPanel>
      </div>
    </div>);

}