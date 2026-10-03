import React from 'react';
import { XIcon } from 'lucide-react';
import type { JobFilters } from '../../types/search';
import { filterChips } from '../../utils/filters';

interface ActiveFilterChipsProps {
  filters: JobFilters;
  onChange: (f: JobFilters) => void;
  onClear: () => void;
}

export function ActiveFilterChips({ filters, onChange, onClear }: ActiveFilterChipsProps) {
  const chips = filterChips(filters);
  if (!chips.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5" aria-label="Active filters">
      {chips.map((c) =>
      <button
        key={c.id}
        type="button"
        onClick={() => onChange(c.remove(filters))}
        className="inline-flex items-center gap-1 rounded-full border border-sage-200 bg-sage-50 py-1 pl-3 pr-2 text-[13px] font-medium text-sage-800 transition-colors duration-150 hover:bg-sage-100"
        aria-label={`Remove filter ${c.label}`}>
        
          {c.label}
          <XIcon className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}
      <button type="button" onClick={onClear} className="ml-1 text-[13px] font-medium text-ink-soft underline-offset-2 hover:text-ink hover:underline">
        Clear all
      </button>
    </div>);

}