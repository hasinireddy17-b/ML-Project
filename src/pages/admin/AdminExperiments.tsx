import React, { Fragment, useState } from 'react';
import { CheckIcon, ChevronDownIcon } from 'lucide-react';
import { experimentRuns, type RunStatus } from '../../data/adminDemo';
import { getLastExperiment } from '../../utils/ml/evaluation/experiment';
import { getFeatureStore } from '../../utils/ml/engineering/featureStore';
import { AdminHeader, DemoBadge, LiveBadge } from '../../components/admin/AdminHeader';
import { AdminPanel } from '../../components/admin/AdminPanel';
import { SegmentedTabs } from '../../components/ui/SegmentedTabs';

const STATUS_STYLE: Record<RunStatus, string> = {
  Selected: 'bg-sage-700 text-cream-50',
  Completed: 'bg-sage-50 text-sage-800',
  Archived: 'bg-cream-200 text-ink-soft',
  Failed: 'bg-rust-50 text-rust-600'
};

type Filter = 'all' | RunStatus;

export function AdminExperiments() {
  const [filter, setFilter] = useState<Filter>('all');
  const [open, setOpen] = useState<string | null>(null);
  const live = getLastExperiment();
  const liveSelected = live?.classifiers.find((c) => c.selected);
  const runs = filter === 'all' ? experimentRuns : experimentRuns.filter((r) => r.status === filter);
  const count = (s: RunStatus) => experimentRuns.filter((r) => r.status === s).length;

  return (
    <div>
      <AdminHeader
        title="Model experiments"
        description="Every training run with its data version, features, hyperparameters, and metrics. Runs from the offline ML service are shown with demo values." />
      

      {live && liveSelected &&
      <AdminPanel title="Latest in-browser run" badge={<LiveBadge />} className="mb-6">
          <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-5">
            <div>
              <dt className="text-ink-muted">Selected</dt>
              <dd className="font-medium text-ink">{liveSelected.name}</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Dataset</dt>
              <dd className="font-medium text-ink">{getFeatureStore().datasetVersion}</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Features</dt>
              <dd className="font-medium text-ink">{live.dataset.features} match features</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Test F1 / ROC-AUC</dt>
              <dd className="font-medium tabular-nums text-ink">
                {liveSelected.test.f1.toFixed(3)} / {liveSelected.test.rocAuc.toFixed(3)}
              </dd>
            </div>
            <div>
              <dt className="text-ink-muted">Duration</dt>
              <dd className="font-medium tabular-nums text-ink">{Math.round(live.durationMs)} ms</dd>
            </div>
          </dl>
        </AdminPanel>
      }

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SegmentedTabs
          label="Filter runs"
          value={filter}
          onChange={setFilter}
          tabs={[
          { value: 'all', label: 'All', count: experimentRuns.length },
          { value: 'Selected', label: 'Selected', count: count('Selected') },
          { value: 'Completed', label: 'Completed', count: count('Completed') },
          { value: 'Archived', label: 'Archived', count: count('Archived') },
          { value: 'Failed', label: 'Failed', count: count('Failed') }]
          } />
        
        <DemoBadge label="Demo data · ML service registry" />
      </div>

      <div className="overflow-x-auto rounded-lg border border-line bg-surface">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="text-ink-muted">
            <tr className="border-b border-line">
              <th className="px-4 py-3 font-medium">Model</th>
              <th className="px-4 py-3 font-medium">Trained</th>
              <th className="px-4 py-3 font-medium">Dataset</th>
              <th className="px-4 py-3 text-right font-medium">Features</th>
              <th className="px-4 py-3 text-right font-medium">F1</th>
              <th className="px-4 py-3 text-right font-medium">ROC-AUC</th>
              <th className="px-4 py-3 text-right font-medium">Duration</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-center font-medium">Selected</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((r) => {
              const expanded = open === r.id;
              return (
                <Fragment key={r.id}>
                  <tr className="border-b border-line">
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => setOpen(expanded ? null : r.id)} aria-expanded={expanded} className="flex items-center gap-2 text-left">
                        <ChevronDownIcon className={`h-4 w-4 text-ink-muted transition-transform duration-150 ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" />
                        <span>
                          <span className="block font-medium text-ink">{r.model}</span>
                          <span className="block text-xs text-ink-muted">{r.id}</span>
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-3 tabular-nums">{r.trainedAt}</td>
                    <td className="px-4 py-3 font-mono text-[12px]">{r.datasetVersion}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{r.features}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{r.status === 'Failed' ? '—' : r.metrics.f1.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{r.status === 'Failed' ? '—' : r.metrics.rocAuc.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{r.durationSec}s</td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${STATUS_STYLE[r.status]}`}>{r.status}</span>
                    </td>
                    <td className="px-4 py-3 text-center">{r.status === 'Selected' && <CheckIcon className="mx-auto h-4 w-4 text-sage-700" aria-label="Selected model" />}</td>
                  </tr>
                  {expanded &&
                  <tr className="border-b border-line bg-cream-50">
                      <td colSpan={9} className="px-4 py-4">
                        <dl className="grid gap-4 text-sm sm:grid-cols-3">
                          <div>
                            <dt className="text-ink-muted">Hyperparameters</dt>
                            <dd className="mt-1 font-mono text-[12px] text-ink">
                              {Object.entries(r.hyperparameters).
                            map(([k, v]) => `${k}=${v}`).
                            join(' · ')}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-ink-muted">Features used</dt>
                            <dd className="mt-1 text-ink">{r.featureSet}</dd>
                          </div>
                          <div>
                            <dt className="text-ink-muted">Precision / Recall</dt>
                            <dd className="mt-1 tabular-nums text-ink">
                              {r.status === 'Failed' ? 'Run failed — training diverged (learning rate too high).' : `${r.metrics.precision.toFixed(2)} / ${r.metrics.recall.toFixed(2)}`}
                            </dd>
                          </div>
                        </dl>
                      </td>
                    </tr>
                  }
                </Fragment>);

            })}
          </tbody>
        </table>
      </div>
    </div>);

}