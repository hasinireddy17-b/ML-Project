import React, { useId } from 'react';
import { motion } from 'framer-motion';

interface SegmentedTabsProps<T extends string> {
  tabs: {value: T;label: string;count?: number;}[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}

export function SegmentedTabs<T extends string>({ tabs, value, onChange, label }: SegmentedTabsProps<T>) {
  const layoutId = useId();
  return (
    <div role="tablist" aria-label={label} className="scrollbar-none -mx-1 flex gap-1 overflow-x-auto px-1">
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(t.value)}
            className={`relative h-9 whitespace-nowrap rounded-md px-3 text-sm font-medium transition-colors duration-150 ${active ? 'text-ink' : 'text-ink-muted hover:text-ink'}`}>
            
            {active &&
            <motion.span
              layoutId={layoutId}
              className="absolute inset-0 rounded-md border border-line bg-surface shadow-soft"
              transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }} />

            }
            <span className="relative flex items-center gap-1.5">
              {t.label}
              {t.count !== undefined && <span className="text-xs tabular-nums text-ink-muted">{t.count}</span>}
            </span>
          </button>);

      })}
    </div>);

}