import React, { useState } from 'react';
import { toast } from 'sonner';
import type { CandidateLevel } from '../../types/user';
import { useAuth, useProfile } from '../../contexts/AuthContext';
import { candidateLevels, employmentTypes, jobCategories, locations, roles, workModes } from '../../data/skills';
import { SettingsSection } from './SettingsSection';
import { ChipGroup } from '../profile/ChipGroup';
import { SelectField } from '../ui/SelectField';

export function PreferenceSettings() {
  const profile = useProfile();
  const { updateProfile } = useAuth();
  const pick = () => ({
    preferred_roles: profile.preferred_roles,
    preferred_locations: profile.preferred_locations,
    salary_expectation: profile.salary_expectation,
    experience_level: profile.experience_level,
    years_experience: profile.years_experience,
    employment_types: profile.employment_types,
    work_modes: profile.work_modes,
    career_interests: profile.career_interests
  });
  const [draft, setDraft] = useState(pick);
  const [saving, setSaving] = useState(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(pick());

  const save = () => {
    setSaving(true);
    window.setTimeout(() => {
      updateProfile(draft);
      setSaving(false);
      toast.success('Preferences saved', { description: 'Your job feed now reflects these changes.' });
    }, 400);
  };

  return (
    <SettingsSection title="Job preferences" description="These shape what appears in your feed and how jobs are ranked." dirty={dirty} saving={saving} onSave={save} onReset={() => setDraft(pick())}>
      <ChipGroup label="Preferred roles" options={roles} value={draft.preferred_roles} onChange={(preferred_roles) => setDraft({ ...draft, preferred_roles })} />
      <ChipGroup label="Career interests" options={jobCategories} value={draft.career_interests} onChange={(career_interests) => setDraft({ ...draft, career_interests })} />
      <ChipGroup label="Locations" options={locations} value={draft.preferred_locations} onChange={(preferred_locations) => setDraft({ ...draft, preferred_locations })} />
      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor="pref-salary" className="text-sm font-medium text-ink">
            Minimum salary
          </label>
          <span className="text-sm font-semibold tabular-nums text-ink">{draft.salary_expectation ? `₹${draft.salary_expectation}L per year` : 'Flexible'}</span>
        </div>
        <input id="pref-salary" type="range" min={0} max={40} value={draft.salary_expectation} onChange={(e) => setDraft({ ...draft, salary_expectation: Number(e.target.value) })} className="mt-3 w-full" />
      </div>
      <SelectField
        label="Experience level"
        className="max-w-xs"
        value={draft.experience_level}
        onChange={(e) => {
          const lvl = candidateLevels.find((l) => l.value === e.target.value);
          if (lvl) setDraft({ ...draft, experience_level: lvl.value as CandidateLevel, years_experience: lvl.years });
        }}
        options={candidateLevels.map((l) => ({ value: l.value, label: `${l.value} — ${l.description}` }))} />
      
      <ChipGroup label="Employment type" options={employmentTypes} value={draft.employment_types} onChange={(employment_types) => setDraft({ ...draft, employment_types })} />
      <ChipGroup label="Work mode" options={workModes} value={draft.work_modes} onChange={(work_modes) => setDraft({ ...draft, work_modes })} />
      <p className="text-sm text-ink-muted">Skills are managed in the Profile section.</p>
    </SettingsSection>);

}