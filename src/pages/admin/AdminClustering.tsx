import React, { useEffect, useState } from 'react';
import { CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from 'recharts';
import { runJobClustering, type ClusterPoint, type ClusteringResult } from '../../utils/ml/unsupervised/analysis';
import { AdminHeader, LiveBadge } from '../../components/admin/AdminHeader';
import { AdminPanel } from '../../components/admin/AdminPanel';
import { Skeleton } from '../../components/ui/Skeleton';
import { Tooltip as HintTooltip } from '../../components/ui/Tooltip';

const COLORS = ['#5B7257', '#917C68', '#5C6B7A', '#A07E4E', '#7A6A8A', '#9A6B55', '#6B7B5A', '#4F6B63'];
const AXIS = { fontSize: 11, fill: '#74685E' };

type Projection = 'pca' | 'tsne' | 'umap';

function PointTooltip({ active, payload }: {active?: boolean;payload?: {payload: ClusterPoint;}[];}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-md border border-line bg-surface px-3 py-2 text-xs shadow-lift">
      <p className="font-semibold text-ink">{p.title}</p>
      <p className="text-ink-muted">
        {p.company} · {p.category}
      </p>
      {p.outlier && <p className="mt-1 font-medium text-rust-600">Density outlier</p>}
    </div>);

}

export function AdminClustering() {
  const [result, setResult] = useState<ClusteringResult | null>(null);
  const [projection, setProjection] = useState<Projection>('pca');

  useEffect(() => {
    const t = window.setTimeout(() => setResult(runJobClustering()), 60);
    return () => window.clearTimeout(t);
  }, []);

  if (!result) {
    return (
      <div>
        <AdminHeader title="Clustering & visualization" description="Discovering structure in the job dataset…" />
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>);

  }

  const outliers = result.points.filter((p) => p.outlier);
  const clusterIds = Array.from(new Set(result.points.map((p) => p.cluster))).sort((a, b) => a - b);
  const labelFor = (id: number) => result.clusters.find((c) => c.id === id)?.label ?? `Cluster ${id + 1}`;

  return (
    <div>
      <AdminHeader
        title="Clustering & visualization"
        description={`Jobs are embedded as ${result.dimensions}-dimensional TF-IDF vectors, grouped with K-Means, projected to 2D, and screened for density outliers.`} />
      

      <AdminPanel
        title="Job map"
        badge={<LiveBadge label={projection === 'pca' ? 'PCA' : ''} />}
        description={`PC1 + PC2 explain ${((result.explained[0] + result.explained[1]) * 100).toFixed(1)}% of variance · K-Means k=${result.clusters.length}, converged in ${result.iterations} iterations (inertia ${result.inertia.toFixed(2)}).`}
        actions={
        <div role="radiogroup" aria-label="Projection" className="flex rounded-md border border-line p-0.5">
            {(
          [
          ['pca', 'PCA', ''],
          ['tsne', 't-SNE', 'Computed nightly in the offline pipeline (perplexity 30). Not available in-browser.'],
          ['umap', 'UMAP', 'Computed nightly in the offline pipeline (n_neighbors 15). Not available in-browser.']] as
          [Projection, string, string][]).
          map(([value, label, hint]) => {
            const btn =
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={projection === value}
              disabled={value !== 'pca'}
              onClick={() => setProjection(value)}
              className={`rounded px-3 py-1 text-sm font-medium ${projection === value ? 'bg-sage-700 text-cream-50' : 'text-ink-soft disabled:text-ink-faint'}`}>
              
                  {label}
                </button>;

            return hint ?
            <HintTooltip key={value} content={hint} side="bottom" align="end">
                  {btn}
                </HintTooltip> :

            btn;

          })}
          </div>
        }>
        
        <div className="h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid stroke="#EDE6DA" />
              <XAxis type="number" dataKey="x" name="PC1" tick={AXIS} domain={[-1.1, 1.1]} tickCount={5} />
              <YAxis type="number" dataKey="y" name="PC2" tick={AXIS} domain={[-1.1, 1.1]} tickCount={5} width={32} />
              <ZAxis range={[70, 70]} />
              <Tooltip content={<PointTooltip />} cursor={{ strokeDasharray: '3 3' }} />
              {clusterIds.map((id) =>
              <Scatter
                key={id}
                name={labelFor(id)}
                data={result.points.filter((p) => p.cluster === id)}
                fill={COLORS[id % COLORS.length]}
                shape={(props: {cx?: number;cy?: number;payload?: ClusterPoint;fill?: string;}) =>
                <circle
                  cx={props.cx}
                  cy={props.cy}
                  r={props.payload?.outlier ? 7 : 5.5}
                  fill={props.payload?.outlier ? '#FFFDF9' : props.fill}
                  stroke={props.payload?.outlier ? '#A9563B' : '#FFFDF9'}
                  strokeWidth={props.payload?.outlier ? 2 : 1} />

                } />

              )}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink-soft">
          {clusterIds.map((id) =>
          <li key={id} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[id % COLORS.length] }} aria-hidden="true" />
              {labelFor(id)}
            </li>
          )}
          <li className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full border-2 border-rust-500" aria-hidden="true" />
            DBSCAN outlier
          </li>
        </ul>
      </AdminPanel>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <AdminPanel title="K-Means clusters" badge={<LiveBadge />}>
          <table className="w-full text-left text-sm">
            <thead className="text-ink-muted">
              <tr className="border-b border-line">
                <th className="py-2 font-medium">Cluster</th>
                <th className="py-2 text-right font-medium">Jobs</th>
                <th className="py-2 text-right font-medium">Purity</th>
                <th className="py-2 pl-4 font-medium">Top skills</th>
              </tr>
            </thead>
            <tbody>
              {result.clusters.map((c) =>
              <tr key={c.id} className="border-b border-line last:border-0">
                  <td className="py-2">
                    <span className="flex items-center gap-2 font-medium text-ink">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[c.id % COLORS.length] }} aria-hidden="true" />
                      {c.label}
                    </span>
                  </td>
                  <td className="py-2 text-right tabular-nums">{c.size}</td>
                  <td className="py-2 text-right tabular-nums">{Math.round(c.purity * 100)}%</td>
                  <td className="py-2 pl-4 text-ink-soft">{c.topTerms.join(', ')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </AdminPanel>

        <AdminPanel title="Hierarchical clustering" badge={<LiveBadge label="Average linkage" />} description="How job families merge, closest first.">
          <ol className="space-y-2.5 text-sm">
            {result.merges.map((m, i) =>
            <li key={i} className="flex items-start justify-between gap-3">
                <span className="text-ink">
                  <span className="mr-1.5 tabular-nums text-ink-muted">{i + 1}.</span>
                  {m.left} <span className="text-ink-muted">+</span> {m.right}
                </span>
                <span className="shrink-0 tabular-nums text-ink-muted">{m.distance.toFixed(3)}</span>
              </li>
            )}
          </ol>
        </AdminPanel>
      </div>

      <AdminPanel title="Density outliers" className="mt-6" badge={<LiveBadge label="DBSCAN · eps 0.28, min 3" />} description="Postings that sit far from any dense group — often unusual skill combinations.">
        {outliers.length ?
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {outliers.map((o) =>
          <li key={o.job_id} className="rounded-md border border-line px-3 py-2 text-sm">
                <p className="font-medium text-ink">{o.title}</p>
                <p className="text-xs text-ink-muted">
                  {o.company} · {o.category}
                </p>
              </li>
          )}
          </ul> :

        <p className="text-sm text-ink-muted">No density outliers detected.</p>
        }
      </AdminPanel>
    </div>);

}