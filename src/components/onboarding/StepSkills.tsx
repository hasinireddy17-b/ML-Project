import React from 'react';
import type { OnboardingStepProps } from '../../types/onboarding';
import { SkillPicker } from '../profile/SkillPicker';

export function StepSkills({ draft, update }: OnboardingStepProps) {
  return (
    <div>
      <SkillPicker value={draft.skills} onChange={(skills) => update({ skills })} />
      <p className="mt-5 text-sm text-ink-muted">
        {draft.skills.length < 3 ?
        `Add at least ${3 - draft.skills.length} more to continue. Five or more gives the most precise matches.` :
        draft.skills.length < 5 ?
        'Good start. A couple more skills will sharpen your matches.' :
        'Great — that’s plenty to match you well.'}
      </p>
    </div>);

}