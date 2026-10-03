import React from 'react';
import type { OnboardingStepProps } from '../../types/onboarding';
import { employmentTypes, locations, roles, workModes } from '../../data/skills';
import { ChipGroup } from '../profile/ChipGroup';

export function StepPreferences({ draft, update }: OnboardingStepProps) {
  return (
    <div className="space-y-7">
      <ChipGroup label="Preferred roles" hint="Pick any that interest you." options={roles} value={draft.preferred_roles} onChange={(preferred_roles) => update({ preferred_roles })} />
      <ChipGroup label="Locations" options={locations} value={draft.preferred_locations} onChange={(preferred_locations) => update({ preferred_locations })} />
      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor="onb-salary" className="text-sm font-medium text-ink">
            Minimum salary
          </label>
          <span className="text-sm font-semibold tabular-nums text-ink">{draft.salary_expectation ? `₹${draft.salary_expectation}L per year` : 'Flexible'}</span>
        </div>
        <input
          id="onb-salary"
          type="range"
          min={0}
          max={40}
          step={1}
          value={draft.salary_expectation}
          onChange={(e) => update({ salary_expectation: Number(e.target.value) })}
          className="mt-3 w-full" />
        
        <div className="mt-1 flex justify-between text-xs text-ink-muted">
          <span>Flexible</span>
          <span>₹40L+</span>
        </div>
      </div>
      <ChipGroup label="Work mode" options={workModes} value={draft.work_modes} onChange={(work_modes) => update({ work_modes })} />
      <ChipGroup label="Employment type" options={employmentTypes} value={draft.employment_types} onChange={(employment_types) => update({ employment_types })} />
    </div>);

}