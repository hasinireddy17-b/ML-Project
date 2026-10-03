import React from 'react';

export function MetricTiles({ items }: {items: {label: string;value: string;hint?: string;}[];}) {
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3 lg:grid-cols-6">
      {items.map((m) =>
      <div key={m.label} className="bg-surface p-4">
          <dt className="text-xs text-ink-muted">{m.label}</dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums text-ink">{m.value}</dd>
          {m.hint && <dd className="text-xs text-ink-muted">{m.hint}</dd>}
        </div>
      )}
    </dl>);

}