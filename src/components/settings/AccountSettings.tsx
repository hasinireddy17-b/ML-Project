import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth, useProfile } from '../../contexts/AuthContext';
import { SettingsSection } from './SettingsSection';
import { TextField } from '../ui/TextField';

export function AccountSettings() {
  const profile = useProfile();
  const { updateAccountDetails, updateProfile } = useAuth();
  const initial = { name: profile.name, email: profile.email, phone: profile.phone };
  const [draft, setDraft] = useState(initial);
  const [errors, setErrors] = useState<{name?: string;email?: string;phone?: string;}>({});
  const [saving, setSaving] = useState(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);

  const save = () => {
    const next: typeof errors = {};
    if (draft.name.trim().length < 2) next.name = 'Enter your full name.';
    if (!/^\S+@\S+\.\S+$/.test(draft.email)) next.email = 'Enter a valid email address.';
    if (draft.phone && !/^[+\d][\d\s-]{7,}$/.test(draft.phone)) next.phone = 'Enter a valid phone number.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    window.setTimeout(() => {
      updateAccountDetails({ name: draft.name.trim(), email: draft.email.trim() });
      updateProfile({ phone: draft.phone.trim() });
      setSaving(false);
      toast.success('Account updated');
    }, 400);
  };

  return (
    <SettingsSection title="Account" description="Your sign-in details and contact information." dirty={dirty} saving={saving} onSave={save} onReset={() => setDraft(initial)}>
      <TextField label="Full name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} error={errors.name} />
      <TextField label="Email" type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} error={errors.email} />
      <TextField label="Phone" type="tel" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} error={errors.phone} placeholder="+91 98765 43210" hint="Only shared with employers you apply to." />
      <div>
        <p className="text-sm font-medium text-ink">Password</p>
        <p className="mt-1 text-sm text-ink-muted">
          Change your password in{' '}
          <Link to="/settings?section=security" className="font-medium text-sage-700 hover:text-sage-800">
            Security
          </Link>
          .
        </p>
      </div>
    </SettingsSection>);

}