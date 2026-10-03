import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  hideLabel?: boolean;
}

export function Toggle({ checked, onChange, label, description, hideLabel }: ToggleProps) {
  const control =
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={hideLabel ? label : undefined}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-150 ease-out ${checked ? 'bg-sage-600' : 'bg-taupe-200'}`}>
    
      <span
      className={`inline-block h-5 w-5 rounded-full bg-surface shadow-soft transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
    
    </button>;

  if (hideLabel) return control;
  return (
    <div className="flex items-start justify-between gap-6">
      <div>
        <p className="text-sm font-medium text-ink">{label}</p>
        {description && <p className="mt-0.5 text-sm text-ink-muted">{description}</p>}
      </div>
      {control}
    </div>);

}