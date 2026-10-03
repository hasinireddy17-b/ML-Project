import React from 'react';
import type { OnboardingStepProps } from '../../types/onboarding';
import { TextField } from '../ui/TextField';
import { SelectField } from '../ui/SelectField';

const DEGREES = ['B.Tech / B.E.', 'B.Sc', 'BCA', 'B.Com', 'MCA', 'M.Tech', 'M.Sc', 'MBA', 'Diploma', 'Other'];
const YEARS = Array.from({ length: 14 }, (_, i) => String(2017 + i));

export function StepEducation({ draft, update }: OnboardingStepProps) {
  const set = (patch: Partial<typeof draft.education>) => update({ education: { ...draft.education, ...patch } });
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <SelectField
        label="Degree"
        value={draft.education.degree}
        onChange={(e) => set({ degree: e.target.value })}
        options={[{ value: '', label: 'Select degree' }, ...DEGREES.map((d) => ({ value: d, label: d }))]} />
      
      <SelectField
        label="Graduation year"
        value={draft.education.graduation_year}
        onChange={(e) => set({ graduation_year: e.target.value })}
        options={[{ value: '', label: 'Select year' }, ...YEARS.map((y) => ({ value: y, label: y }))]} />
      
      <TextField className="sm:col-span-2" label="Institution" value={draft.education.institution} onChange={(e) => set({ institution: e.target.value })} placeholder="e.g. JNTU Hyderabad" />
      <TextField className="sm:col-span-2" label="Field of study" value={draft.education.field} onChange={(e) => set({ field: e.target.value })} placeholder="e.g. Computer Science" />
    </div>);

}