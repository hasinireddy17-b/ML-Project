import React, { type ReactNode } from 'react';

export function DemoBadge({ label = 'Demo data' }: {label?: string;}) {
  return <span className="rounded border border-amber-500/40 bg-amber-50 px-1.5 py-0.5 text-[11px] font-semibold text-amber-600">{label}</span>;
}

export function LiveBadge({ label = 'Live' }: {label?: string;}) {
  return <span className="rounded border border-sage-300 bg-sage-50 px-1.5 py-0.5 text-[11px] font-semibold text-sage-800">{label}</span>;
}

export function AdminHeader({ title, description, actions }: {title: string;description?: ReactNode;actions?: ReactNode;}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-ink">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-[15px] text-ink-soft">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>);

}