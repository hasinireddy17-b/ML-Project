import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookmarkIcon } from 'lucide-react';
import { useActivity } from '../contexts/ActivityContext';
import { useMatcher } from '../hooks/useMatcher';
import { getFeatureStore } from '../utils/ml/engineering/featureStore';
import { formatSalary, relativeTime } from '../utils/format';
import { CompanyLogo } from '../components/jobs/CompanyLogo';
import { ApplyButton } from '../components/jobs/ApplyButton';
import { TIER_COLORS } from '../components/jobs/MatchScore';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { SelectField } from '../components/ui/SelectField';
import { buttonStyles } from '../components/ui/Button';

type SavedSort = 'recent' | 'match';

export function SavedJobs() {
  const { saved, removeSaved } = useActivity();
  const matcher = useMatcher();
  const store = getFeatureStore();
  const [sort, setSort] = useState<SavedSort>('recent');
  const [pendingRemove, setPendingRemove] = useState<string | null>(null);
  const servable = useMemo(() => new Set(store.servableJobs.map((j) => j.job_id)), [store]);

  const rows = useMemo(() => {
    const list = saved.
    map((s) => {
      const job = store.jobsById.get(s.job_id);
      return job ? { job, savedAt: s.saved_at, match: matcher(job), open: servable.has(job.job_id) } : null;
    }).
    filter((r): r is NonNullable<typeof r> => !!r);
    return sort === 'match' ? list.sort((a, b) => b.match.score - a.match.score) : list.sort((a, b) => b.savedAt - a.savedAt);
  }, [saved, store, matcher, servable, sort]);

  const pending = rows.find((r) => r.job.job_id === pendingRemove);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[34px] text-ink">Saved Jobs</h1>
          <p className="mt-1 text-[15px] text-ink-soft">{rows.length ? `${rows.length} saved ${rows.length === 1 ? 'job' : 'jobs'}` : 'Keep track of roles you’re considering.'}</p>
        </div>
        {rows.length > 1 &&
        <SelectField
          label="Sort saved jobs"
          hideLabel
          className="w-48"
          value={sort}
          onChange={(e) => setSort(e.target.value as SavedSort)}
          options={[
          { value: 'recent', label: 'Recently saved' },
          { value: 'match', label: 'Highest match' }]
          } />

        }
      </div>

      <div className="mt-8 rounded-lg border border-line bg-surface">
        {rows.length === 0 ?
        <EmptyState
          icon={BookmarkIcon}
          title="You haven't saved any jobs yet."
          description="Save jobs you’re interested in to review and compare them later."
          action={
          <Link to="/" className={buttonStyles('primary')}>
                See recommendations
              </Link>
          } /> :


        <ul className="divide-y divide-line">
            {rows.map(({ job, savedAt, match, open }) =>
          <li key={job.job_id} className="flex flex-col gap-4 p-5 md:flex-row md:items-center">
                <div className="flex min-w-0 flex-1 gap-4">
                  <CompanyLogo company={job.company_info} />
                  <div className="min-w-0">
                    <Link to={`/jobs/${job.job_id}`} className="font-semibold text-ink hover:text-sage-700">
                      {job.job_title}
                    </Link>
                    <p className="text-sm text-ink-soft">
                      {job.company} · {job.location === 'Remote' ? 'Remote' : `${job.location} · ${job.work_mode}`} · {formatSalary(job.salary_min, job.salary_max)}
                    </p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted">
                      <span>Saved {relativeTime(savedAt).toLowerCase()}</span>
                      {open ?
                  job.posted_days_ago > 10 ?
                  <span className="rounded bg-amber-50 px-1.5 py-0.5 text-xs font-medium text-amber-600">Closing soon</span> :

                  <span className="rounded bg-sage-50 px-1.5 py-0.5 text-xs font-medium text-sage-800">Accepting applications</span> :


                  <span className="rounded bg-cream-200 px-1.5 py-0.5 text-xs font-medium text-ink-soft">No longer available</span>
                  }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:shrink-0">
                  <span className="mr-2 flex items-center gap-1.5 text-sm font-semibold tabular-nums text-ink">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: TIER_COLORS[match.tier] }} aria-hidden="true" />
                    {match.score}% Match
                  </span>
                  <button type="button" onClick={() => setPendingRemove(job.job_id)} className={buttonStyles('ghost', 'sm')}>
                    Remove
                  </button>
                  <Link to={`/jobs/${job.job_id}`} className={buttonStyles('secondary', 'sm')}>
                    View details
                  </Link>
                  {open && <ApplyButton job={job} />}
                </div>
              </li>
          )}
          </ul>
        }
      </div>

      <ConfirmDialog
        open={!!pending}
        title="Remove saved job?"
        description={pending ? `${pending.job.job_title} at ${pending.job.company} will be removed from your saved jobs.` : ''}
        confirmLabel="Remove"
        onConfirm={() => pending && removeSaved(pending.job.job_id)}
        onClose={() => setPendingRemove(null)} />
      
    </div>);

}