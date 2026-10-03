import React from 'react';
import { toast } from 'sonner';
import type { NotificationPrefs } from '../../types/user';
import { useAuth, useProfile } from '../../contexts/AuthContext';
import { SettingsSection } from './SettingsSection';
import { Toggle } from '../ui/Toggle';

const ITEMS: {key: keyof NotificationPrefs;label: string;description: string;}[] = [
{ key: 'recommendations', label: 'Job recommendations', description: 'A short digest when strong new matches appear. Never more than once a day.' },
{ key: 'alerts', label: 'Job alerts', description: 'Updates for the alerts you’ve created, at the frequency you chose.' },
{ key: 'applications', label: 'Application updates', description: 'When an employer changes the status of your application.' },
{ key: 'savedSearches', label: 'Saved searches', description: 'When jobs similar to ones you’ve saved are posted.' }];


export function NotificationSettings() {
  const profile = useProfile();
  const { updateProfile } = useAuth();

  const set = (key: keyof NotificationPrefs, value: boolean) => {
    updateProfile({ notifications: { ...profile.notifications, [key]: value } });
    toast.success(value ? 'Notifications on' : 'Notifications off', { description: ITEMS.find((i) => i.key === key)?.label });
  };

  return (
    <SettingsSection title="Notifications" description="We keep notifications useful and infrequent. Changes save automatically.">
      <div className="divide-y divide-line rounded-lg border border-line bg-surface">
        {ITEMS.map((i) =>
        <div key={i.key} className="p-4">
            <Toggle label={i.label} description={i.description} checked={profile.notifications[i.key]} onChange={(v) => set(i.key, v)} />
          </div>
        )}
      </div>
    </SettingsSection>);

}