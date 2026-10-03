import React from 'react';
import { toast } from 'sonner';
import type { Visibility } from '../../types/user';
import { useAuth, useProfile } from '../../contexts/AuthContext';
import { SettingsSection } from './SettingsSection';

const OPTIONS: {value: Visibility;description: string;}[] = [
{ value: 'Public', description: 'Anyone can find your profile, including through search engines.' },
{ value: 'Recruiters only', description: 'Only verified recruiters can view your profile. Recommended.' },
{ value: 'Private', description: 'Only employers you apply to can see your profile.' }];


export function PrivacySettings() {
  const profile = useProfile();
  const { updateProfile } = useAuth();

  return (
    <SettingsSection title="Privacy" description="Control who can see your profile. Your activity is only used to personalize your own feed.">
      <div role="radiogroup" aria-label="Profile visibility" className="space-y-2">
        {OPTIONS.map((o) => {
          const selected = profile.visibility === o.value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => {
                updateProfile({ visibility: o.value });
                toast.success('Visibility updated', { description: o.value });
              }}
              className={`flex w-full items-start gap-4 rounded-lg border p-4 text-left transition-[border-color,background-color] duration-150 ${selected ? 'border-sage-600 bg-sage-50' : 'border-line bg-surface hover:border-line-strong'}`}>
              
              <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${selected ? 'border-sage-700' : 'border-line-strong'}`}>
                {selected && <span className="h-2.5 w-2.5 rounded-full bg-sage-700" />}
              </span>
              <span>
                <span className="block font-medium text-ink">{o.value}</span>
                <span className="block text-sm text-ink-muted">{o.description}</span>
              </span>
            </button>);

        })}
      </div>
    </SettingsSection>);

}