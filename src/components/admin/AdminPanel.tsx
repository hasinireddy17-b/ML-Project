import React, { type ReactNode } from 'react';

interface AdminPanelProps {
  title: string;
  badge?: ReactNode;
  description?: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}

export function AdminPanel({ title, badge, description, children, className = '', actions }: AdminPanelProps) {
  return (
    <section className={`rounded-lg border border-line bg-surface p-5 ${className}`}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
            {title}
            {badge}
          </h2>
          {description && <p className="mt-0.5 text-sm text-ink-muted">{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>);

}

export function StatList({ items }: {items: {label: string;value: ReactNode;hint?: string;}[];}) {
  return (
    <dl className="divide-y divide-line">
      {items.map((i) =>
      <div key={i.label} className="flex items-baseline justify-between gap-4 py-2 first:pt-0 last:pb-0">
          <dt className="text-sm text-ink-muted">{i.label}</dt>
          <dd className="text-right text-sm font-medium tabular-nums text-ink">
            {i.value}
            {i.hint && <span className="block text-xs font-normal text-ink-muted">{i.hint}</span>}
          </dd>
        </div>
      )}
    </dl>);

}