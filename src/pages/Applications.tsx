import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BriefcaseIcon, CheckIcon, XIcon } from 'lucide-react';
import type { Application, ApplicationStatus } from '../types/activity';
import { useActivity } from '../contexts/ActivityContext';
import { getFeatureStore } from '../utils/ml/engineering/featureStore';
import { formatDate } from '../utils/format';
import { CompanyLogo } from '../components/jobs/CompanyLogo';
import { EmptyState } from '../components/ui/EmptyState';
import { SegmentedTabs } from '../components/ui/SegmentedTabs';
import { buttonStyles } from '../components/ui/Button';

const FLOW: ApplicationStatus[] = ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Offer'];

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  Applied: 'bg-cream-200 text-ink-soft',
  'Under Review': 'bg-taupe-100 text-taupe-700',
  Shortlisted: 'bg-sage-50 text-sage-800',
  Interview: 'bg-sage-100 text-sage-900',
  Offer: 'bg-sage-700 text-cream-50',
  Rejected: 'bg-rust-50 text-rust-600'
};

const NEXT_STEP: Record<ApplicationStatus, string> = {
  Applied: 'Employers usually review new applications within a week.',
  'Under Review': 'The hiring team is reviewing your profile. You’ll hear back if you’re shortlisted.',
  Shortlisted: 'You’re on the shortlist. Expect an interview invitation soon.',
  Interview: 'Prepare by revisiting the role’s responsibilities and required skills.',
  Offer: 'Congratulations! Review the offer details with the employer.',
  Rejected: 'This one didn’t work out. Similar roles are waiting in your feed.'
};

type Tab = 'all' | 'active' | 'interview' | 'closed';

function StatusPill({ status }: {status: ApplicationStatus;}) {
  return <span className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}>{status}</span>;
}

function Timeline({ app }: {app: Application;}) {
  const rejected = app.status === 'Rejected';
  const reachedIndex = rejected ? app.history.filter((h) => h.status !== 'Rejected').length - 1 : FLOW.indexOf(app.status);
  const steps: ApplicationStatus[] = rejected ? [...FLOW.slice(0, reachedIndex + 1), 'Rejected'] : FLOW;

  return (
    <ol className="relative">
      {steps.map((s, i) => {
        const entry = app.history.find((h) => h.status === s);
        const done = !!entry;
        const current = s === app.status;
        const isReject = s === 'Rejected';
        return (
          <li key={s} className="relative flex gap-4 pb-6 last:pb-0">
            {i < steps.length - 1 && <span className={`absolute left-[11px] top-6 h-[calc(100%-24px)] w-px ${done && steps[i + 1] && app.history.some((h) => h.status === steps[i + 1]) ? 'bg-sage-400' : 'bg-line-strong'}`} aria-hidden="true" />}
            <span
              className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
              isReject ? 'border-rust-500 bg-rust-50 text-rust-600' : done ? 'border-sage-600 bg-sage-600 text-cream-50' : 'border-line-strong bg-surface'}`
              }>
              
              {isReject ? <XIcon className="h-3 w-3" aria-hidden="true" /> : done ? <CheckIcon className="h-3 w-3" aria-hidden="true" /> : null}
            </span>
            <div className="-mt-0.5">
              <p className={`text-sm ${current ? 'font-semibold text-ink' : done ? 'text-ink' : 'text-ink-muted'}`}>
                {s}
                {current && <span className="sr-only"> (current status)</span>}
              </p>
              <p className="text-sm text-ink-muted">{entry ? formatDate(entry.at) : 'Pending'}</p>
            </div>
          </li>);

      })}
    </ol>);

}

function Detail({ app }: {app: Application;}) {
  const job = getFeatureStore().jobsById.get(app.job_id);
  if (!job) return null;
  return (
    <div>
      <div className="flex items-start gap-3">
        <CompanyLogo company={job.company_info} size="sm" />
        <div className="min-w-0">
          <p className="font-semibold text-ink">{job.job_title}</p>
          <p className="text-sm text-ink-soft">{job.company}</p>
        </div>
      </div>
      <p className="mt-4 rounded-md bg-cream-100 px-3 py-2.5 text-sm text-ink-soft">{NEXT_STEP[app.status]}</p>
      <div className="mt-5">
        <Timeline app={app} />
      </div>
      <Link to={`/jobs/${job.job_id}`} className={buttonStyles('secondary', 'sm', 'mt-6 w-full')}>
        View job
      </Link>
    </div>);

}

export function Applications() {
  const { applications } = useActivity();
  const store = getFeatureStore();
  const [tab, setTab] = useState<Tab>('all');
  const [selectedId, setSelectedId] = useState<string | null>(applications[0]?.id ?? null);

  const groups = useMemo(() => {
    const active = applications.filter((a) => ['Applied', 'Under Review', 'Shortlisted'].includes(a.status));
    const interview = applications.filter((a) => a.status === 'Interview' || a.status === 'Offer');
    const closed = applications.filter((a) => a.status === 'Rejected');
    return { all: applications, active, interview, closed };
  }, [applications]);

  const list = [...groups[tab]].sort((a, b) => b.applied_at - a.applied_at);
  const selected = list.find((a) => a.id === selectedId) ?? list[0];

  return (
    <div>
      <h1 className="font-display text-[34px] text-ink">My Applications</h1>
      <p className="mt-1 text-[15px] text-ink-soft">Track every application from submission to offer.</p>

      {applications.length === 0 ?
      <div className="mt-8 rounded-lg border border-line bg-surface">
          <EmptyState
          icon={BriefcaseIcon}
          title="No applications yet"
          description="Your applications will appear here once you apply."
          action={
          <Link to="/" className={buttonStyles('primary')}>
                Find jobs to apply to
              </Link>
          } />
        
        </div> :

      <>
          <div className="mt-6">
            <SegmentedTabs
            label="Filter applications"
            value={tab}
            onChange={setTab}
            tabs={[
            { value: 'all', label: 'All', count: groups.all.length },
            { value: 'active', label: 'In progress', count: groups.active.length },
            { value: 'interview', label: 'Interviews & offers', count: groups.interview.length },
            { value: 'closed', label: 'Closed', count: groups.closed.length }]
            } />
          
          </div>

          <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="rounded-lg border border-line bg-surface">
              {list.length === 0 ?
            <EmptyState compact icon={BriefcaseIcon} title="Nothing here" description="No applications match this filter." /> :

            <ul className="divide-y divide-line">
                  {list.map((app) => {
                const job = store.jobsById.get(app.job_id);
                if (!job) return null;
                const isSelected = selected?.id === app.id;
                return (
                  <li key={app.id}>
                        <button
                      type="button"
                      onClick={() => setSelectedId(app.id)}
                      aria-expanded={isSelected}
                      className={`flex w-full items-center gap-4 px-5 py-4 text-left transition-colors duration-150 ${isSelected ? 'bg-cream-100' : 'hover:bg-cream-50'}`}>
                      
                          <CompanyLogo company={job.company_info} size="sm" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-ink">{job.job_title}</p>
                            <p className="truncate text-sm text-ink-muted">
                              {job.company} · Applied {formatDate(app.applied_at)}
                            </p>
                          </div>
                          <StatusPill status={app.status} />
                        </button>
                        {isSelected &&
                    <div className="border-t border-line px-5 py-5 lg:hidden">
                            <Detail app={app} />
                          </div>
                    }
                      </li>);

              })}
                </ul>
            }
            </div>
            <aside className="hidden lg:block">
              {selected &&
            <div className="sticky top-24 rounded-lg border border-line bg-surface p-5">
                  <Detail app={selected} />
                </div>
            }
            </aside>
          </div>
        </>
      }
    </div>);

}