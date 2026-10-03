import React, { type ComponentType, type ReactNode } from 'react';

interface EmptyStateProps {
  icon: ComponentType<{className?: string;}>;
  title: string;
  description: string;
  action?: ReactNode;
  compact?: boolean;
}

export function EmptyState({ icon: Icon, title, description, action, compact = false }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center text-center ${compact ? 'px-4 py-8' : 'px-6 py-16'}`}>
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-sage-50 text-sage-700">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-ink-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>);

}