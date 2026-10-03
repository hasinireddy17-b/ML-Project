import React from 'react';
import type { OnboardingStepProps } from '../../types/onboarding';
import { candidateLevels } from '../../data/skills';

export function StepExperience({ draft, update }: OnboardingStepProps) {
  return (
    <div role="radiogroup" aria-label="Experience level" className="space-y-2">
      {candidateLevels.map((l) => {
        const selected = draft.experience_level === l.value;
        return (
          <button
            key={l.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => update({ experience_level: l.value, years_experience: l.years })}
            className={`flex w-full items-center gap-4 rounded-lg border px-4 py-3.5 text-left transition-[border-color,background-color] duration-150 ${
            selected ? 'border-sage-600 bg-sage-50' : 'border-line bg-surface hover:border-line-strong'}`
            }>
            
            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${selected ? 'border-sage-700' : 'border-line-strong'}`}>
              {selected && <span className="h-2.5 w-2.5 rounded-full bg-sage-700" />}
            </span>
            <span>
              <span className="block font-medium text-ink">{l.value}</span>
              <span className="block text-sm text-ink-muted">{l.description}</span>
            </span>
          </button>);

      })}
    </div>);

}