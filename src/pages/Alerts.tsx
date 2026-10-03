import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BellIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useActivity } from '../contexts/ActivityContext';
import { alertMatchCount, alertQuery } from '../utils/alerts';
import { formatDate } from '../utils/format';
import { AlertFormModal } from '../components/alerts/AlertFormModal';
import { Toggle } from '../components/ui/Toggle';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { SelectField } from '../components/ui/SelectField';

export function Alerts() {
  const { alerts, addAlert, updateAlert, deleteAlert } = useActivity();
  const [creating, setCreating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const pending = alerts.find((a) => a.id === pendingDelete);

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[34px] text-ink">Job alerts</h1>
          <p className="mt-1 text-[15px] text-ink-soft">Get notified when new jobs match what you’re looking for.</p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <PlusIcon className="h-4 w-4" aria-hidden="true" />
          Create alert
        </Button>
      </div>

      <div className="mt-8 rounded-lg border border-line bg-surface">
        {alerts.length === 0 ?
        <EmptyState
          icon={BellIcon}
          title="No alerts yet"
          description="Create an alert and we’ll let you know when new jobs match your criteria."
          action={<Button onClick={() => setCreating(true)}>Create your first alert</Button>} /> :


        <ul className="divide-y divide-line">
            {alerts.map((a) => {
            const count = alertMatchCount(a);
            const criteria = [a.role, a.skills.join(', '), a.location !== 'Any' ? a.location : null, a.work_mode !== 'Any' ? a.work_mode : null, a.experience !== 'Any' ? a.experience : null].filter(
              (x): x is string => !!x
            );
            return (
              <li key={a.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink">{a.name}</p>
                    <p className="mt-0.5 text-sm text-ink-muted">{criteria.join(' · ')}</p>
                    <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                      <span className={`flex items-center gap-1.5 ${a.active ? 'text-sage-700' : 'text-ink-muted'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${a.active ? 'bg-sage-600' : 'bg-taupe-300'}`} aria-hidden="true" />
                        {a.active ? 'Your alert is active.' : 'Paused'}
                      </span>
                      <Link to={`/search?q=${encodeURIComponent(alertQuery(a))}&exact=1`} className="font-medium text-sage-700 hover:text-sage-800">
                        {count} {count === 1 ? 'job matches' : 'jobs match'} now
                      </Link>
                      <span className="text-ink-muted">Created {formatDate(a.created_at)}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <SelectField
                    label={`Frequency for ${a.name}`}
                    hideLabel
                    className="w-28"
                    value={a.frequency}
                    onChange={(e) => updateAlert(a.id, { frequency: e.target.value as 'Daily' | 'Weekly' })}
                    options={[
                    { value: 'Daily', label: 'Daily' },
                    { value: 'Weekly', label: 'Weekly' }]
                    } />
                  
                    <Toggle hideLabel label={`${a.active ? 'Pause' : 'Resume'} ${a.name}`} checked={a.active} onChange={(v) => updateAlert(a.id, { active: v })} />
                    <button
                    type="button"
                    onClick={() => setPendingDelete(a.id)}
                    className="rounded-md p-2 text-ink-muted transition-colors duration-150 hover:bg-cream-100 hover:text-rust-600"
                    aria-label={`Delete ${a.name}`}>
                    
                      <Trash2Icon className="h-4 w-4" />
                    </button>
                  </div>
                </li>);

          })}
          </ul>
        }
      </div>
      <p className="mt-4 text-sm text-ink-muted">
        Alerts only notify you about genuinely new matches. Manage delivery in{' '}
        <Link to="/settings?section=notifications" className="font-medium text-sage-700 hover:text-sage-800">
          notification settings
        </Link>
        .
      </p>

      <AlertFormModal open={creating} onClose={() => setCreating(false)} onSubmit={addAlert} />
      <ConfirmDialog
        open={!!pending}
        title="Delete this alert?"
        description={pending ? `You’ll stop getting updates for “${pending.name}”.` : ''}
        confirmLabel="Delete alert"
        onConfirm={() => pending && deleteAlert(pending.id)}
        onClose={() => setPendingDelete(null)} />
      
    </div>);

}