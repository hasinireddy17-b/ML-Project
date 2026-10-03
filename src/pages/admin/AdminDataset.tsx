import React, { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getFeatureStore, FEATURE_SCHEMA } from '../../utils/ml/engineering/featureStore';
import { AdminHeader, LiveBadge } from '../../components/admin/AdminHeader';
import { AdminPanel } from '../../components/admin/AdminPanel';
import { Toggle } from '../../components/ui/Toggle';

const AXIS = { fontSize: 12, fill: '#74685E' };

function countBy<T>(items: T[], key: (t: T) => string) {
  const m = new Map<string, number>();
  items.forEach((i) => m.set(key(i), (m.get(key(i)) ?? 0) + 1));
  return [...m.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
}

export function AdminDataset() {
  const store = getFeatureStore();
  const r = store.report;
  const [showAll, setShowAll] = useState(false);
  const categories = useMemo(() => countBy(store.allJobs, (j) => j.category), [store]);
  const locationsDist = useMemo(() => countBy(store.allJobs, (j) => j.location), [store]);
  const missing = Object.entries(r.missingByField).sort((a, b) => b[1] - a[1]);
  const anomalies = showAll ? store.anomalies : store.anomalies.filter((a) => a.flagged);

  const stats = [
  { label: 'Rows', value: `${r.cleanCount}`, sub: `${r.rawCount} raw` },
  { label: 'Columns', value: r.columns, sub: 'raw schema' },
  { label: 'Missing values', value: Object.values(r.missingByField).reduce((a, b) => a + b, 0), sub: `${Object.values(r.imputedByField).reduce((a, b) => a + b, 0)} imputed` },
  { label: 'Duplicates', value: r.duplicatesRemoved.length, sub: 'removed' },
  { label: 'Categories', value: categories.length, sub: 'job families' },
  { label: 'Standardized', value: r.standardizedValues, sub: 'values normalized' }];


  return (
    <div>
      <AdminHeader title="Dataset overview" description={`Version ${store.datasetVersion}. Raw postings are cleaned, de-duplicated, standardized, and screened for anomalies before any model sees them.`} />

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) =>
        <div key={s.label} className="bg-surface p-4">
            <dt className="text-xs text-ink-muted">{s.label}</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums text-ink">{s.value}</dd>
            <dd className="text-xs text-ink-muted">{s.sub}</dd>
          </div>
        )}
      </dl>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <AdminPanel title="Jobs by category" badge={<LiveBadge />}>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categories} layout="vertical" margin={{ left: 20, right: 12 }}>
                <CartesianGrid horizontal={false} stroke="#EDE6DA" />
                <XAxis type="number" tick={AXIS} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={AXIS} width={130} />
                <Tooltip cursor={{ fill: '#F6F1E8' }} />
                <Bar dataKey="count" fill="#5B7257" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AdminPanel>
        <AdminPanel title="Jobs by location" badge={<LiveBadge />}>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locationsDist} margin={{ right: 8 }}>
                <CartesianGrid vertical={false} stroke="#EDE6DA" />
                <XAxis dataKey="name" tick={AXIS} interval={0} />
                <YAxis tick={AXIS} allowDecimals={false} width={28} />
                <Tooltip cursor={{ fill: '#F6F1E8' }} />
                <Bar dataKey="count" fill="#917C68" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AdminPanel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <AdminPanel title="Missing values by field" description="Counted on the raw feed, before imputation.">
          <ul className="space-y-2.5">
            {missing.map(([field, n]) =>
            <li key={field} className="grid grid-cols-[150px_minmax(0,1fr)_40px] items-center gap-3 text-sm">
                <span className="font-mono text-[13px] text-ink">{field}</span>
                <span className="h-1.5 overflow-hidden rounded-full bg-cream-200">
                  <span className="block h-full bg-taupe-400" style={{ width: `${n / r.rawCount * 100}%` }} />
                </span>
                <span className="text-right tabular-nums text-ink-soft">{n}</span>
              </li>
            )}
          </ul>
          <p className="mt-4 text-xs text-ink-muted">
            Imputation: salary → category median · experience level → derived from years · industry → employer profile · education → default requirement.
          </p>
        </AdminPanel>
        <AdminPanel title="Feature schema">
          <dl className="space-y-3 text-sm">
            {(Object.entries(FEATURE_SCHEMA) as [string, string[]][]).map(([group, fields]) =>
            <div key={group}>
                <dt className="font-medium capitalize text-ink">
                  {group} <span className="font-normal text-ink-muted">({fields.length})</span>
                </dt>
                <dd className="mt-1 flex flex-wrap gap-1">
                  {fields.map((f) =>
                <span key={f} className="rounded bg-cream-100 px-1.5 py-0.5 font-mono text-[12px] text-ink-soft">
                      {f}
                    </span>
                )}
                </dd>
              </div>
            )}
          </dl>
          {r.duplicatesRemoved.length > 0 &&
          <p className="mt-4 border-t border-line pt-3 text-xs text-ink-muted">
              Duplicates removed: {r.duplicatesRemoved.map((d) => `${d.job_id} (of ${d.duplicateOf})`).join(', ')}
            </p>
          }
        </AdminPanel>
      </div>

      <AdminPanel
        title="Anomaly screening"
        className="mt-6"
        badge={<LiveBadge label="Isolation Forest + rules" />}
        description="Critical findings are held from candidate feeds until reviewed. One-Class SVM is available as an alternative detector in the offline pipeline."
        actions={<Toggle label="Show all records" checked={showAll} onChange={setShowAll} />}>
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-ink-muted">
              <tr className="border-b border-line">
                <th className="py-2 font-medium">Job</th>
                <th className="py-2 font-medium">Anomaly score</th>
                <th className="py-2 font-medium">Findings</th>
                <th className="py-2 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {anomalies.map((a) =>
              <tr key={a.job_id} className="border-b border-line align-top last:border-0">
                  <td className="py-2.5 pr-4">
                    <p className="font-medium text-ink">{a.job_title}</p>
                    <p className="text-xs text-ink-muted">
                      {a.job_id} · {a.company}
                    </p>
                  </td>
                  <td className="w-40 py-2.5 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-20 overflow-hidden rounded-full bg-cream-200">
                        <span className={`block h-full ${a.isolationScore > 0.68 ? 'bg-rust-500' : 'bg-taupe-400'}`} style={{ width: `${a.isolationScore * 100}%` }} />
                      </span>
                      <span className="tabular-nums text-ink-soft">{a.isolationScore.toFixed(2)}</span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-4 text-ink-soft">{a.reasons.length ? a.reasons.join(' · ') : '—'}</td>
                  <td className="py-2.5 text-right">
                    <span
                    className={`rounded px-1.5 py-0.5 text-xs font-medium ${a.held ? 'bg-rust-50 text-rust-600' : a.flagged ? 'bg-amber-50 text-amber-600' : 'bg-sage-50 text-sage-800'}`}>
                    
                      {a.held ? 'Held' : a.flagged ? 'Review' : 'OK'}
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </AdminPanel>
    </div>);

}