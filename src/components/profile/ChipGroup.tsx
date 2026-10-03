import React from 'react';
import { Chip } from '../ui/Chip';

interface ChipGroupProps<T extends string> {
  label: string;
  options: readonly T[];
  value: T[];
  onChange: (value: T[]) => void;
  hint?: string;
}

export function ChipGroup<T extends string>({ label, options, value, onChange, hint }: ChipGroupProps<T>) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-ink">{label}</legend>
      {hint && <p className="mt-0.5 text-sm text-ink-muted">{hint}</p>}
      <div className="mt-2.5 flex flex-wrap gap-2">
        {options.map((o) =>
        <Chip key={o} selected={value.includes(o)} onClick={() => onChange(value.includes(o) ? value.filter((v) => v !== o) : [...value, o])}>
            {o}
          </Chip>
        )}
      </div>
    </fieldset>);

}