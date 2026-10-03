import React from 'react';
import { useSearchParams } from 'react-router-dom';
import type { SettingsSection } from '../utils/profile';
import { AccountSettings } from '../components/settings/AccountSettings';
import { ProfileSettings } from '../components/settings/ProfileSettings';
import { PreferenceSettings } from '../components/settings/PreferenceSettings';
import { NotificationSettings } from '../components/settings/NotificationSettings';
import { PrivacySettings } from '../components/settings/PrivacySettings';
import { SecuritySettings } from '../components/settings/SecuritySettings';

const SECTIONS: {value: SettingsSection;label: string;}[] = [
{ value: 'account', label: 'Account' },
{ value: 'profile', label: 'Profile' },
{ value: 'preferences', label: 'Job preferences' },
{ value: 'notifications', label: 'Notifications' },
{ value: 'privacy', label: 'Privacy' },
{ value: 'security', label: 'Security' }];


const CONTENT: Record<SettingsSection, React.ComponentType> = {
  account: AccountSettings,
  profile: ProfileSettings,
  preferences: PreferenceSettings,
  notifications: NotificationSettings,
  privacy: PrivacySettings,
  security: SecuritySettings
};

export function Settings() {
  const [params, setParams] = useSearchParams();
  const raw = params.get('section');
  const section: SettingsSection = SECTIONS.some((s) => s.value === raw) ? raw as SettingsSection : 'account';
  const Content = CONTENT[section];

  return (
    <div>
      <h1 className="font-display text-[34px] text-ink">Settings</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="Settings sections" className="scrollbar-none -mx-4 overflow-x-auto px-4 lg:mx-0 lg:overflow-visible lg:px-0">
          <ul className="flex gap-1 lg:flex-col">
            {SECTIONS.map((s) =>
            <li key={s.value}>
                <button
                type="button"
                onClick={() => setParams({ section: s.value })}
                aria-current={section === s.value ? 'page' : undefined}
                className={`w-full whitespace-nowrap rounded-md px-3 py-2 text-left text-sm font-medium transition-colors duration-150 ${
                section === s.value ? 'bg-sage-50 text-sage-800' : 'text-ink-soft hover:bg-cream-100 hover:text-ink'}`
                }>
                
                  {s.label}
                </button>
              </li>
            )}
          </ul>
        </nav>
        <div className="max-w-2xl">
          <Content key={section} />
        </div>
      </div>
    </div>);

}