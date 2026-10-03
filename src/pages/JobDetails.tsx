import React, { useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, BriefcaseIcon, CheckIcon, CircleIcon, ClockIcon, MapPinIcon, MinusIcon, PlusIcon, SearchXIcon, WalletIcon } from 'lucide-react';
import { useActivity } from '../contexts/ActivityContext';
import { useMatcher } from '../hooks/useMatcher';
import { useAsync } from '../hooks/useAsync';
import { api } from '../utils/api';
import { formatExperience, formatPosted, formatSalary } from '../utils/format';
import { CompanyLogo } from '../components/jobs/CompanyLogo';
import { MatchScore } from '../components/jobs/MatchScore';
import { ApplyButton } from '../components/jobs/ApplyButton';
import { SaveButton } from '../components/jobs/SaveButton';
import { JobCompactCard } from '../components/jobs/JobCompactCard';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { buttonStyles } from '../components/ui/Button';

function FitRow({ label, value, status }: {label: string;value: string;status: 'match' | 'partial' | 'miss';}) {
  const Icon = status === 'match' ? CheckIcon : status === 'partial' ? MinusIcon : CircleIcon;
  const tone = status === 'match' ? 'text-sage-700' : status === 'partial' ? 'text-amber-600' : 'text-ink-muted';
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <dt className="text-sm text-ink-soft">{label}</dt>
      <dd className={`flex items-center gap-1.5 text-sm font-semibold ${tone}`}>
        <Icon className="h-4 w-4" aria-hidden="true" />
        {value}
      </dd>
    </div>);

}

const statusOf = (v: number): 'match' | 'partial' | 'miss' => v >= 0.99 ? 'match' : v >= 0.5 ? 'partial' : 'miss';
const labelOf = (v: number) => v >= 0.99 ? 'Matches' : v >= 0.5 ? 'Partly matches' : 'Doesn’t match';

export function JobDetails() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { track, compare, toggleCompare } = useActivity();
  const matcher = useMatcher();
  const { data: job, loading, error } = useAsync(() => api.getJob(id), [id]);
  const similar = useAsync(() => api.similarJobs(id, 4), [id]);
  const viewed = useRef<string | null>(null);

  useEffect(() => {
    if (job && viewed.current !== job.job_id) {
      viewed.current = job.job_id;
      track('view', job.job_id);
    }
  }, [job, track]);

  if (loading) {
    return (
      <div aria-busy="true" aria-label="Loading job">
        <Skeleton className="h-4 w-20" />
        <div className="mt-6 flex gap-5">
          <Skeleton className="h-16 w-16 rounded-md" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-3">
            {[0, 1, 2, 3, 4].map((i) =>
            <Skeleton key={i} className="h-4 w-full" />
            )}
          </div>
          <Skeleton className="h-72 w-full rounded-lg" />
        </div>
      </div>);

  }

  if (error || !job) {
    return (
      <div className="rounded-lg border border-line bg-surface">
        <EmptyState
          icon={SearchXIcon}
          title="This job is no longer available"
          description="It may have been filled or removed by the employer. Here are other roles you might like."
          action={
          <Link to="/search" className={buttonStyles('primary')}>
              Browse jobs
            </Link>
          } />
        
      </div>);

  }

  const match = matcher(job);
  const matched = new Set(match.matchedSkills);
  const inCompare = compare.includes(job.job_id);
  const c = match.components;
  const place = job.location === 'Remote' ? 'Remote' : `${job.location} · ${job.work_mode}`;

  return (
    <div>
      <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink">
        <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
        Back
      </button>

      <header className="mt-6 flex flex-col gap-6 border-b border-line pb-8 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-5">
          <CompanyLogo company={job.company_info} size="lg" />
          <div>
            <h1 className="font-display text-[30px] leading-tight text-ink sm:text-[36px]">{job.job_title}</h1>
            <p className="mt-1 text-[16px] text-ink-soft">
              {job.company} · {job.industry}
            </p>
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-soft">
              <li className="flex items-center gap-1.5">
                <MapPinIcon className="h-4 w-4 text-ink-muted" aria-hidden="true" />
                {place}
              </li>
              <li className="flex items-center gap-1.5">
                <WalletIcon className="h-4 w-4 text-ink-muted" aria-hidden="true" />
                {formatSalary(job.salary_min, job.salary_max)}
                {job.salary_imputed && <span className="text-ink-muted">(estimated)</span>}
              </li>
              <li className="flex items-center gap-1.5">
                <BriefcaseIcon className="h-4 w-4 text-ink-muted" aria-hidden="true" />
                {formatExperience(job.experience_min, job.experience_max)} · {job.employment_type}
              </li>
              <li className="flex items-center gap-1.5">
                <ClockIcon className="h-4 w-4 text-ink-muted" aria-hidden="true" />
                Posted {formatPosted(job.posted_days_ago).toLowerCase()}
              </li>
            </ul>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <ApplyButton job={job} size="lg" label="Apply Now" />
          <SaveButton job={job} size="lg" />
          <button type="button" onClick={() => toggleCompare(job.job_id)} aria-pressed={inCompare} className={buttonStyles(inCompare ? 'subtle' : 'ghost', 'lg')}>
            {inCompare ? <CheckIcon className="h-4 w-4" aria-hidden="true" /> : <PlusIcon className="h-4 w-4" aria-hidden="true" />}
            Compare
          </button>
        </div>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <article className="min-w-0 space-y-10 text-[15px] leading-relaxed text-ink-soft">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-ink">About the role</h2>
            <p>{job.job_description}</p>
          </section>

          {job.responsibilities.length > 0 &&
          <section>
              <h2 className="mb-3 text-lg font-semibold text-ink">Responsibilities</h2>
              <ul className="space-y-2">
                {job.responsibilities.map((r) =>
              <li key={r} className="flex gap-3">
                    <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-taupe-400" aria-hidden="true" />
                    {r}
                  </li>
              )}
              </ul>
            </section>
          }

          <section>
            <h2 className="mb-3 text-lg font-semibold text-ink">Requirements</h2>
            <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-ink-muted">Education</dt>
                <dd className="text-ink">{job.education}</dd>
              </div>
              <div>
                <dt className="text-sm text-ink-muted">Experience</dt>
                <dd className="text-ink">
                  {formatExperience(job.experience_min, job.experience_max)} · {job.experience_level}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-ink-muted">Employment type</dt>
                <dd className="text-ink">{job.employment_type}</dd>
              </div>
              <div>
                <dt className="text-sm text-ink-muted">Work mode</dt>
                <dd className="text-ink">{job.work_mode}</dd>
              </div>
            </dl>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-ink">Required skills</h2>
            <ul className="flex flex-wrap gap-2">
              {job.required_skills.map((s) =>
              <li
                key={s}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm ${matched.has(s) ? 'border-sage-200 bg-sage-50 font-medium text-sage-800' : 'border-line bg-surface text-ink-soft'}`}>
                
                  {matched.has(s) && <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />}
                  {s}
                  {matched.has(s) && <span className="sr-only">(on your profile)</span>}
                </li>
              )}
            </ul>
          </section>

          {job.preferred_skills.length > 0 &&
          <section>
              <h2 className="mb-3 text-lg font-semibold text-ink">Preferred skills</h2>
              <ul className="flex flex-wrap gap-2">
                {job.preferred_skills.map((s) =>
              <li key={s} className={`rounded-full border px-3 py-1 text-sm ${matched.has(s) ? 'border-sage-200 bg-sage-50 font-medium text-sage-800' : 'border-line bg-surface text-ink-soft'}`}>
                    {s}
                  </li>
              )}
              </ul>
            </section>
          }

          {job.company_info.benefits.length > 0 &&
          <section>
              <h2 className="mb-3 text-lg font-semibold text-ink">Benefits</h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {job.company_info.benefits.map((b) =>
              <li key={b} className="flex items-center gap-2.5">
                    <CheckIcon className="h-4 w-4 shrink-0 text-sage-600" aria-hidden="true" />
                    {b}
                  </li>
              )}
              </ul>
            </section>
          }

          <section className="border-t border-line pt-8">
            <h2 className="mb-3 text-lg font-semibold text-ink">About {job.company}</h2>
            <p>{job.company_info.about}</p>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              {[
              ['Industry', job.company_info.industry],
              ['Company size', job.company_info.size],
              ['Founded', job.company_info.founded ? String(job.company_info.founded) : '—'],
              ['Headquarters', job.company_info.headquarters]].
              map(([k, v]) =>
              <div key={k}>
                  <dt className="text-ink-muted">{k}</dt>
                  <dd className="mt-0.5 text-ink">{v}</dd>
                </div>
              )}
            </dl>
          </section>
        </article>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-lg border border-line bg-surface p-5" aria-labelledby="fit-title">
            <h2 id="fit-title" className="text-base font-semibold text-ink">
              Why you’re a good match
            </h2>
            <div className="mt-4">
              <MatchScore score={match.score} tier={match.tier} size="lg" />
            </div>
            <dl className="mt-4 divide-y divide-line border-t border-line">
              <FitRow
                label="Skills"
                value={`${match.matchedRequired.length} / ${job.required_skills.length} matched`}
                status={match.matchedRequired.length === job.required_skills.length ? 'match' : match.matchedRequired.length >= job.required_skills.length / 2 ? 'partial' : 'miss'} />
              
              <FitRow label="Location" value={labelOf(c.location)} status={statusOf(c.location)} />
              <FitRow label="Experience" value={c.experience >= 0.9 ? 'Matches' : labelOf(c.experience)} status={c.experience >= 0.9 ? 'match' : statusOf(c.experience)} />
              <FitRow label="Work mode" value={labelOf(c.work_mode)} status={statusOf(c.work_mode)} />
              <FitRow label="Salary" value={c.salary >= 0.99 ? 'In your range' : c.salary >= 0.5 ? 'Slightly below' : 'Below your range'} status={statusOf(c.salary)} />
            </dl>

            {match.reasons.length > 0 &&
            <ul className="mt-4 space-y-2 border-t border-line pt-4">
                {match.reasons.slice(0, 3).map((r) =>
              <li key={r.key} className="text-sm">
                    <span className="font-medium text-ink">{r.label}.</span> <span className="text-ink-muted">{r.detail}</span>
                  </li>
              )}
              </ul>
            }

            {match.missingSkills.length > 0 &&
            <div className="mt-4 border-t border-line pt-4">
                <p className="text-sm font-medium text-ink">Skills to strengthen</p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {match.missingSkills.map((s) =>
                <li key={s} className="rounded-full border border-dashed border-taupe-300 px-2.5 py-0.5 text-[13px] text-ink-soft">
                      {s}
                    </li>
                )}
                </ul>
              </div>
            }
            <p className="mt-4 text-xs leading-relaxed text-ink-muted">This score shows how closely the role fits your profile and preferences. It isn’t a prediction of whether you’ll be hired.</p>
          </section>
        </aside>
      </div>

      <section className="mt-14 border-t border-line pt-10" aria-labelledby="similar-title">
        <h2 id="similar-title" className="text-xl font-semibold text-ink">
          Similar Jobs
        </h2>
        <p className="mt-1 text-sm text-ink-muted">Roles with overlapping skills, responsibilities, and seniority.</p>
        <div className="mt-5">
          {similar.loading ?
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[0, 1, 2, 3].map((i) =>
            <Skeleton key={i} className="h-40 rounded-lg" />
            )}
            </div> :
          similar.data && similar.data.length ?
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {similar.data.map((s) =>
            <li key={s.job_id}>
                  <JobCompactCard job={s} match={matcher(s)} trackAs="similar_open" />
                </li>
            )}
            </ul> :

          <p className="text-sm text-ink-muted">No similar jobs right now.</p>
          }
        </div>
      </section>
    </div>);

}