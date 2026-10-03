import React, { useState } from 'react';
import { CheckIcon, FileTextIcon } from 'lucide-react';
import type { Job } from '../../types/job';
import { useActivity } from '../../contexts/ActivityContext';
import { useProfile } from '../../contexts/AuthContext';
import { Button, type ButtonSize } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { TextField } from '../ui/TextField';

interface ApplyButtonProps {
  job: Job;
  size?: ButtonSize;
  className?: string;
  label?: string;
}

export function ApplyButton({ job, size = 'sm', className = '', label = 'Apply' }: ApplyButtonProps) {
  const { applicationFor, apply } = useActivity();
  const profile = useProfile();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [note, setNote] = useState('');
  const existing = applicationFor(job.job_id);

  if (existing) {
    return (
      <Button variant="subtle" size={size} className={className} disabled>
        <CheckIcon className="h-4 w-4" aria-hidden="true" />
        Applied
      </Button>);

  }

  const submit = () => {
    setSubmitting(true);
    window.setTimeout(() => {
      apply(job);
      setSubmitting(false);
      setOpen(false);
      setNote('');
    }, 650);
  };

  return (
    <>
      <Button size={size} className={className} onClick={() => setOpen(true)}>
        {label}
      </Button>
      <Modal
        open={open}
        onClose={() => !submitting && setOpen(false)}
        title={`Apply to ${job.job_title}`}
        description={`${job.company} · ${job.location === 'Remote' ? 'Remote' : `${job.location} · ${job.work_mode}`}`}
        footer={
        <>
            <Button variant="secondary" onClick={() => setOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={submit} loading={submitting}>
              Submit application
            </Button>
          </>
        }>
        
        <p className="text-sm text-ink-soft">We’ll share the following with {job.company}:</p>
        <dl className="mt-3 divide-y divide-line rounded-md border border-line">
          {[
          ['Name', profile.name],
          ['Email', profile.email],
          ['Headline', profile.headline || '—'],
          ['Top skills', profile.skills.slice(0, 5).join(', ') || '—']].
          map(([k, v]) =>
          <div key={k} className="flex gap-4 px-3 py-2 text-sm">
              <dt className="w-24 shrink-0 text-ink-muted">{k}</dt>
              <dd className="min-w-0 truncate text-ink">{v}</dd>
            </div>
          )}
          <div className="flex items-center gap-2 px-3 py-2 text-sm text-ink">
            <FileTextIcon className="h-4 w-4 text-ink-muted" aria-hidden="true" />
            Profile résumé (generated from your profile)
          </div>
        </dl>
        <TextField
          className="mt-4"
          label="Note to the recruiter"
          hint="Optional — a sentence on why you’re interested."
          multiline
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={400} />
        
      </Modal>
    </>);

}