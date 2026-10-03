import React from 'react';
import { Link } from 'react-router-dom';
import type { Job } from '../../types/job';
import type { MatchResult } from '../../utils/ml/recommender';
import type { InteractionType } from '../../types/activity';
import { useActivity } from '../../contexts/ActivityContext';
import { formatPosted, formatSalary } from '../../utils/format';
import { CompanyLogo } from './CompanyLogo';
import { SaveButton } from './SaveButton';
import { TIER_COLORS } from './MatchScore';

interface JobCompactCardProps {
  job: Job;
  match: MatchResult;
  note?: string;
  trackAs?: InteractionType;
}

export function JobCompactCard({ job, match, note, trackAs = 'click' }: JobCompactCardProps) {
  const { track } = useActivity();
  const place = job.location === 'Remote' ? 'Remote' : `${job.location} · ${job.work_mode}`;

  return (
    <article className="flex h-full flex-col rounded-lg border border-line bg-surface p-4 transition-colors duration-150 hover:border-line-strong">
      <div className="flex items-start gap-3">
        <CompanyLogo company={job.company_info} size="sm" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-semibold text-ink">
            <Link to={`/jobs/${job.job_id}`} onClick={() => track(trackAs, job.job_id)} className="transition-colors duration-150 hover:text-sage-700">
              {job.job_title}
            </Link>
          </h3>
          <p className="truncate text-sm text-ink-soft">{job.company}</p>
        </div>
      </div>
      <p className="mt-3 text-sm text-ink-muted">{place}</p>
      <p className="text-sm text-ink-muted">
        {formatSalary(job.salary_min, job.salary_max)} · {formatPosted(job.posted_days_ago)}
      </p>
      {note && <p className="mt-2 text-sm text-sage-800">{note}</p>}
      <div className="mt-auto flex items-center justify-between pt-3">
        <span className="flex items-center gap-1.5 text-sm font-semibold tabular-nums text-ink">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: TIER_COLORS[match.tier] }} aria-hidden="true" />
          {match.score}% Match
        </span>
        <SaveButton job={job} iconOnly />
      </div>
    </article>);

}