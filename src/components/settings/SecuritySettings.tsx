import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LaptopIcon, SmartphoneIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { SettingsSection } from './SettingsSection';
import { TextField } from '../ui/TextField';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';

const OTHER_SESSIONS = [
{ id: 's2', device: 'Chrome on Android', location: 'Hyderabad, IN', lastActive: '2 hours ago', icon: SmartphoneIcon },
{ id: 's3', device: 'Safari on macOS', location: 'Bengaluru, IN', lastActive: '3 days ago', icon: LaptopIcon }];


export function SecuritySettings() {
  const { changePassword, logout } = useAuth();
  const navigate = useNavigate();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{current?: string;next?: string;confirm?: string;}>({});
  const [saving, setSaving] = useState(false);
  const [sessions, setSessions] = useState(OTHER_SESSIONS);
  const [confirmAll, setConfirmAll] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!current) errs.current = 'Enter your current password.';
    if (next.length < 8) errs.next = 'Use at least 8 characters.';
    if (confirm !== next) errs.confirm = 'Passwords don’t match.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    try {
      await changePassword(current, next);
      toast.success('Password changed');
      setCurrent('');
      setNext('');
      setConfirm('');
    } catch (err) {
      setErrors({ current: err instanceof Error ? err.message : 'Something went wrong.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsSection title="Security" description="Keep your account secure.">
      <form onSubmit={submit} noValidate className="space-y-4 rounded-lg border border-line bg-surface p-5">
        <h3 className="font-semibold text-ink">Change password</h3>
        <TextField label="Current password" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} error={errors.current} />
        <TextField label="New password" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} error={errors.next} hint="At least 8 characters." />
        <TextField label="Confirm new password" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} />
        <div className="flex justify-end">
          <Button type="submit" loading={saving}>
            Update password
          </Button>
        </div>
      </form>

      <div className="rounded-lg border border-line bg-surface p-5">
        <h3 className="font-semibold text-ink">Active sessions</h3>
        <ul className="mt-3 divide-y divide-line">
          <li className="flex items-center gap-3 py-3">
            <LaptopIcon className="h-5 w-5 text-ink-muted" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-medium text-ink">This device</p>
              <p className="text-sm text-ink-muted">Active now</p>
            </div>
            <span className="rounded bg-sage-50 px-2 py-0.5 text-xs font-medium text-sage-800">Current</span>
          </li>
          {sessions.map(({ id, device, location, lastActive, icon: Icon }) =>
          <li key={id} className="flex items-center gap-3 py-3">
              <Icon className="h-5 w-5 text-ink-muted" aria-hidden="true" />
              <div className="flex-1">
                <p className="text-sm font-medium text-ink">{device}</p>
                <p className="text-sm text-ink-muted">
                  {location} · {lastActive}
                </p>
              </div>
            </li>
          )}
        </ul>
        <div className="mt-3 flex flex-wrap justify-end gap-2">
          <Button variant="secondary" disabled={!sessions.length} onClick={() => setConfirmAll(true)}>
            Log out all other devices
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              logout();
              navigate('/login');
            }}>
            
            Log out
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmAll}
        title="Log out all other devices?"
        description="You’ll stay signed in here. Other devices will need to log in again."
        confirmLabel="Log out others"
        onConfirm={() => {
          setSessions([]);
          toast.success('Logged out of other devices');
        }}
        onClose={() => setConfirmAll(false)} />
      
    </SettingsSection>);

}