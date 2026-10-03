import React from 'react';
import { Link } from 'react-router-dom';
import { BriefcaseIcon, CheckIcon, ClockIcon, MapPinIcon, PlusIcon, WalletIcon, XIcon } from 'lucide-react';
import type { Job } from '../../types/job';
import type { MatchResult } from '../../utils/ml/recommender';
import { useActivity } from '../../contexts/ActivityContext';
import { formatExperience, formatPosted, formatSalary } from '../../utils/format';
import { buttonStyles } from '../ui/Button';
import { CompanyLogo } from './CompanyLogo';
import { MatchScore } from './MatchScore';
import { SaveButton } from './SaveButton';
import { ApplyButton } from './ApplyButton';

interface JobCardProps {
  job: Job;
  match: MatchResult;
  showReasons?: boolean;
  onDismiss?: (job: Job) => void;
}

export function JobCard({ job, match, showReasons = true, onDismiss }: JobCardProps) {
  const { track, compare, toggleCompare } = useActivity();
  const inCompare = compare.includes(job.job_id);
  const matched = new Set(match.matchedSkills);
  const skills = [...job.required_skills, ...job.preferred_skills].slice(0, 6);
  const place = job.location === 'Remote' ? 'Remote' : `${job.location} · ${job.work_mode}`;

  return (
    <article className="rounded-lg border border-line bg-surface p-4 transition-colors duration-150 hover:border-line-strong sm:p-5">
      <div className="flex items-start gap-4">
        <CompanyLogo company={job.company_info} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-[17px] font-semibold leading-snug text-ink">
                <Link to={`/jobs/${job.job_id}`} onClick={() => track('click', job.job_id)} className="transition-colors duration-150 hover:text-sage-700">
                  {job.job_title}
                </Link>
              </h3>
              <p className="mt-0.5 text-sm text-ink-soft">{job.company}</p>
            </div>
            <MatchScore score={match.score} tier={match.tier} />
          </div>

          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-ink-muted">
            <li className="flex items-center gap-1.5">
              <MapPinIcon className="h-4 w-4" aria-hidden="true" />
              {place}
            </li>
            <li className="flex items-center gap-1.5">
              <WalletIcon className="h-4 w-4" aria-hidden="true" />
              {formatSalary(job.salary_min, job.salary_max)}
            </li>
            <li className="flex items-center gap-1.5">
              <BriefcaseIcon className="h-4 w-4" aria-hidden="true" />
              {formatExperience(job.experience_min, job.experience_max)}
            </li>
            <li className="flex items-center gap-1.5">
              <ClockIcon className="h-4 w-4" aria-hidden="true" />
              {formatPosted(job.posted_days_ago)}
            </li>
          </ul>

          <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Skills">
            {skills.map((s) =>
            <li
              key={s}
              className={`rounded-full border px-2.5 py-0.5 text-[13px] ${matched.has(s) ? 'border-sage-200 bg-sage-50 font-medium text-sage-800' : 'border-line bg-cream-100 text-ink-soft'}`}>
              
                {s}
                {matched.has(s) && <span className="sr-only"> (you have this skill)</span>}
              </li>
            )}
          </ul>

          {showReasons && match.reasons.length > 0 &&
          <div className="mt-4 rounded-md bg-cream-100 px-3 py-2.5">
              <p className="mb-1.5 text-xs font-medium text-ink-muted">Why this matches</p>
              <ul className="flex flex-wrap gap-x-4 gap-y-1">
                {match.reasons.slice(0, 3).map((r) =>
              <li key={r.key} className="flex items-center gap-1.5 text-sm text-sage-800">
                    <CheckIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {r.label}
                  </li>
              )}
              </ul>
            </div>
          }

          <div className="mt-4 flex flex-wrap items-center gap-1 border-t border-line pt-3">
            <SaveButton job={job} />
            <button
              type="button"
              onClick={() => toggleCompare(job.job_id)}
              aria-pressed={inCompare}
              className={buttonStyles(inCompare ? 'subtle' : 'ghost', 'sm')}>
              
              {inCompare ? <CheckIcon className="h-4 w-4" aria-hidden="true" /> : <PlusIcon className="h-4 w-4" aria-hidden="true" />}
              Compare
            </button>
            {onDismiss &&
            <button type="button" onClick={() => onDismiss(job)} className={buttonStyles('ghost', 'sm', 'hidden sm:inline-flex')}>
                <XIcon className="h-4 w-4" aria-hidden="true" />
                Not interested
              </button>
            }
            <div className="ml-auto flex items-center gap-2">
              <Link to={`/jobs/${job.job_id}`} onClick={() => track('click', job.job_id)} className={buttonStyles('secondary', 'sm')}>
                View details
              </Link>
              <ApplyButton job={job} />
            </div>
          </div>
        </div>
      </div>
    </article>);

}