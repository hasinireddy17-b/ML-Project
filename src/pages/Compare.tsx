import React, { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ColumnsIcon, XIcon } from 'lucide-react';
import type { Job } from '../types/job';
import { useActivity } from '../contexts/ActivityContext';
import { useMatcher } from '../hooks/useMatcher';
import { getFeatureStore } from '../utils/ml/engineering/featureStore';
import { formatExperience, formatPosted, formatSalary } from '../utils/format';
import { CompanyLogo } from '../components/jobs/CompanyLogo';
import { ApplyButton } from '../components/jobs/ApplyButton';
import { EmptyState } from '../components/ui/EmptyState';
import { buttonStyles } from '../components/ui/Button';

function Best() {
  return <span className="ml-2 rounded bg-sage-50 px-1.5 py-0.5 text-[11px] font-semibold text-sage-800">Best</span>;
}

export function Compare() {
  const { compare, removeCompare, clearCompare } = useActivity();
  const matcher = useMatcher();
  const store = getFeatureStore();
  const jobs = compare.map((id) => store.jobsById.get(id)).filter((j): j is Job => !!j);

  if (jobs.length < 2) {
    return (
      <div>
        <h1 className="font-display text-[34px] text-ink">Compare jobs</h1>
        <div className="mt-6 rounded-lg border border-line bg-surface">
          <EmptyState
            icon={ColumnsIcon}
            title={jobs.length === 1 ? 'Add one more job to compare' : 'Pick jobs to compare'}
            description="Use “Compare” on any job card to add up to three jobs side by side."
            action={
            <Link to="/search" className={buttonStyles('primary')}>
                Browse jobs
              </Link>
            } />
          
        </div>
      </div>);

  }

  const matches = jobs.map((j) => matcher(j));
  const bestSalary = Math.max(...jobs.map((j) => j.salary_max));
  const bestMatch = Math.max(...matches.map((m) => m.score));

  const rows: {label: string;render: (j: Job, i: number) => ReactNode;}[] = [
  {
    label: 'Match',
    render: (_, i) =>
    <span className="font-semibold tabular-nums text-ink">
          {matches[i].score}%<span className="ml-1.5 font-normal text-ink-muted">{matches[i].tier}</span>
          {matches[i].score === bestMatch && <Best />}
        </span>

  },
  {
    label: 'Salary',
    render: (j) =>
    <span className="tabular-nums">
          {formatSalary(j.salary_min, j.salary_max)}
          {j.salary_max === bestSalary && <Best />}
        </span>

  },
  { label: 'Location', render: (j) => j.location },
  { label: 'Work Mode', render: (j) => j.work_mode },
  { label: 'Experience', render: (j) => `${formatExperience(j.experience_min, j.experience_max)} · ${j.experience_level}` },
  {
    label: 'Skills',
    render: (j, i) =>
    <div>
          <p className="mb-2 text-sm text-ink-muted">
            {matches[i].matchedRequired.length} of {j.required_skills.length} required skills matched
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {j.required_skills.map((s) =>
        <li
          key={s}
          className={`rounded-full border px-2.5 py-0.5 text-[13px] ${matches[i].matchedSkills.includes(s) ? 'border-sage-200 bg-sage-50 font-medium text-sage-800' : 'border-line bg-cream-100 text-ink-soft'}`}>
          
                {s}
              </li>
        )}
          </ul>
        </div>

  },
  { label: 'Employment Type', render: (j) => j.employment_type },
  { label: 'Posted', render: (j) => formatPosted(j.posted_days_ago) },
  { label: '', render: (j) => <ApplyButton job={j} /> }];


  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[34px] text-ink">Compare jobs</h1>
          <p className="mt-1 text-[15px] text-ink-soft">Side by side on the things that usually decide it.</p>
        </div>
        <button type="button" onClick={clearCompare} className="text-sm font-medium text-ink-soft hover:text-ink">
          Clear comparison
        </button>
      </div>

      <div className="mt-8 overflow-x-auto rounded-lg border border-line bg-surface">
        <table className="w-full min-w-[720px] border-collapse text-left text-[15px]">
          <caption className="sr-only">Job comparison</caption>
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="w-40 p-5 align-bottom text-sm font-medium text-ink-muted">
                <span className="sr-only">Attribute</span>
              </th>
              {jobs.map((j) =>
              <th key={j.job_id} scope="col" className="p-5 align-top font-normal">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3">
                      <CompanyLogo company={j.company_info} size="sm" />
                      <div>
                        <Link to={`/jobs/${j.job_id}`} className="font-semibold text-ink hover:text-sage-700">
                          {j.job_title}
                        </Link>
                        <p className="text-sm text-ink-soft">{j.company}</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => removeCompare(j.job_id)} className="rounded p-1 text-ink-muted hover:bg-cream-100 hover:text-ink" aria-label={`Remove ${j.job_title}`}>
                      <XIcon className="h-4 w-4" />
                    </button>
                  </div>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) =>
            <tr key={row.label || 'actions'} className="border-b border-line last:border-0">
                <th scope="row" className="p-5 align-top text-sm font-medium text-ink-muted">
                  {row.label}
                </th>
                {jobs.map((j, i) =>
              <td key={j.job_id} className="p-5 align-top text-ink">
                    {row.render(j, i)}
                  </td>
              )}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>);

}