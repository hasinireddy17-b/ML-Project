import React from 'react';
import type { OnboardingStepProps } from '../../types/onboarding';
import { TextField } from '../ui/TextField';
import { PhotoUpload } from '../profile/PhotoUpload';

export function StepAbout({ draft, update }: OnboardingStepProps) {
  return (
    <div className="space-y-6">
      <PhotoUpload name={draft.name} photo={draft.photo} onChange={(photo) => update({ photo })} />
      <TextField label="Full name" value={draft.name} onChange={(e) => update({ name: e.target.value })} autoComplete="name" />
      <TextField
        label="Headline"
        value={draft.headline}
        onChange={(e) => update({ headline: e.target.value })}
        placeholder="e.g. Frontend developer · React & TypeScript"
        hint="One line on what you do or want to do next."
        maxLength={90} />
      
      <TextField label="Current city" value={draft.location} onChange={(e) => update({ location: e.target.value })} placeholder="e.g. Hyderabad" />
    </div>);

}