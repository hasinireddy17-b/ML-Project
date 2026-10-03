import React from 'react';
import { BookmarkIcon } from 'lucide-react';
import type { Job } from '../../types/job';
import { useActivity } from '../../contexts/ActivityContext';
import { buttonStyles, type ButtonSize } from '../ui/Button';

interface SaveButtonProps {
  job: Job;
  iconOnly?: boolean;
  size?: ButtonSize;
}

export function SaveButton({ job, iconOnly = false, size = 'sm' }: SaveButtonProps) {
  const { isSaved, toggleSave } = useActivity();
  const saved = isSaved(job.job_id);
  const label = saved ? 'Saved' : 'Save';

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={() => toggleSave(job)}
        aria-pressed={saved}
        aria-label={saved ? `Remove ${job.job_title} from saved jobs` : `Save ${job.job_title}`}
        className={`rounded-md p-2 transition-colors duration-150 ${saved ? 'text-sage-700 hover:bg-sage-50' : 'text-ink-muted hover:bg-cream-100 hover:text-ink'}`}>
        
        <BookmarkIcon className="h-[18px] w-[18px]" fill={saved ? 'currentColor' : 'none'} />
      </button>);

  }

  return (
    <button
      type="button"
      onClick={() => toggleSave(job)}
      aria-pressed={saved}
      className={buttonStyles(saved ? 'subtle' : 'ghost', size)}>
      
      <BookmarkIcon className="h-4 w-4" fill={saved ? 'currentColor' : 'none'} aria-hidden="true" />
      {label}
    </button>);

}