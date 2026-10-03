import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BellIcon, CompassIcon, RefreshCwIcon, SparklesIcon, UserRoundPenIcon } from 'lucide-react';
import { useProfile } from '../contexts/AuthContext';
import { useActivity } from '../contexts/ActivityContext';
import { useMatcher } from '../hooks/useMatcher';
import { useAsync } from '../hooks/useAsync';
import { api } from '../utils/api';
import { buildFeed, type FeedLens, type RankedJob } from '../utils/ml/recommender';
import { jobSimilarity } from '../utils/ml/similar';
import { getFeatureStore } from '../utils/ml/engineering/featureStore';
import { firstName, formatPosted, greeting } from '../utils/format';
import { SearchBox } from '../components/search/SearchBox';
import { JobCard } from '../components/jobs/JobCard';
import { JobCompactCard } from '../components/jobs/JobCompactCard';
import { JobCardSkeleton } from '../components/jobs/JobCardSkeleton';
import { ProfileStrength } from '../components/profile/ProfileStrength';
import { SegmentedTabs } from '../components/ui/SegmentedTabs';
import { EmptyState } from '../components/ui/EmptyState';
import { Button, buttonStyles } from '../components/ui/Button';

type ExploreLens = Exclude<FeedLens, 'recommended'>;

const LENSES: {value: ExploreLens;label: string;}[] = [
{ value: 'skills', label: 'Based on your skills' },
{ value: 'location', label: 'Near your preferred locations' },
{ value: 'recent', label: 'Recently added' },
{ value: 'activity', label: 'Based on your activity' },
{ value: 'saved', label: 'Similar to jobs you saved' }];


const LENS_EMPTY: Record<ExploreLens, {title: string;description: string;}> = {
  skills: { title: 'No skill matches yet', description: 'Add more skills to your profile to see jobs that use them.' },
  location: { title: 'Nothing in your locations right now', description: 'Try adding another city or opening up to remote work.' },
  recent: { title: 'No new jobs this week', description: 'Check back soon — new roles are added every day.' },
  activity: { title: 'We’re still learning what you like', description: 'Browse and save a few jobs, and we’ll tailor this section to you.' },
  saved: { title: 'Save jobs to see similar ones', description: 'When you save a job, we’ll find others like it here.' }
};

export function Home() {
  const profile = useProfile();
  const { interactions, savedIds, appliedIds, applications, alerts, dismiss } = useActivity();
  const matcher = useMatcher();
  const [lens, setLens] = useState<ExploreLens>('skills');
  const [visible, setVisible] = useState(5);
  const jobs = getFeatureStore().servableJobs;

  const feed = useAsync(() => api.recommendations(profile, interactions, 'recommended', { appliedIds, limit: 12 }), [profile]);
  const recommended = (feed.data ?? []).filter((r) => !matcher.affinity.dismissed.has(r.job.job_id));

  const lensItems = useMemo(() => buildFeed(jobs, matcher, lens, { savedIds, appliedIds, limit: 8 }), [jobs, matcher, lens, savedIds, appliedIds]);
  const savedJobs = useMemo(() => jobs.filter((j) => savedIds.includes(j.job_id)), [jobs, savedIds]);

  const noteFor = (r: RankedJob): string => {
    switch (lens) {
      case 'skills':
        return `Uses your ${r.match.matchedRequired.slice(0, 2).join(' and ')} skills`;
      case 'location':
        return r.job.work_mode === 'Remote' ? 'Fully remote' : `In ${r.job.location}`;
      case 'recent':
        return `Posted ${formatPosted(r.job.posted_days_ago).toLowerCase()}`;
      case 'activity':
        return 'Like roles you’ve explored';
      case 'saved':{
          const closest = savedJobs.reduce((best, s) => jobSimilarity(s, r.job) > jobSimilarity(best, r.job) ? s : best, savedJobs[0]);
          return closest ? `Similar to ${closest.job_title}` : '';
        }
      default:
        return '';
    }
  };

  const viewed = new Set(interactions.filter((i) => i.type === 'view').map((i) => i.job_id)).size;
  const interviews = applications.filter((a) => a.status === 'Interview' || a.status === 'Offer').length;
  const stats = [
  { label: 'Jobs viewed', value: viewed },
  { label: 'Saved', value: savedIds.length },
  { label: 'Applications', value: applications.length },
  { label: 'Interviews', value: interviews }];


  return (
    <div>
      <header className="max-w-3xl">
        <h1 className="font-display text-[34px] leading-tight text-ink sm:text-[40px]">
          {greeting()}, {firstName(profile.name)}
        </h1>
        <p className="mt-2 text-[16px] text-ink-soft">Here are opportunities selected around your profile and interests.</p>
        <div className="mt-6">
          <SearchBox size="md" shortcut />
        </div>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section aria-labelledby="rec-title">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 id="rec-title" className="text-xl font-semibold text-ink">
                Recommended for You
              </h2>
              <p className="mt-1 text-sm text-ink-muted">Ranked by how closely each role fits your skills, experience, and preferences.</p>
            </div>
            <Link to="/search" className="hidden whitespace-nowrap text-sm font-medium text-sage-700 hover:text-sage-800 sm:block">
              Browse all jobs
            </Link>
          </div>

          {profile.skills.length === 0 ?
          <div className="rounded-lg border border-line bg-surface">
              <EmptyState
              icon={UserRoundPenIcon}
              title="No recommendations yet"
              description="Complete your profile to get more personalized recommendations."
              action={
              <Link to="/settings?section=profile" className={buttonStyles('primary')}>
                    Complete your profile
                  </Link>
              } />
            
            </div> :
          feed.loading ?
          <div className="space-y-3" aria-busy="true" aria-label="Loading recommendations">
              {[0, 1, 2].map((i) =>
            <JobCardSkeleton key={i} />
            )}
            </div> :
          feed.error ?
          <div className="rounded-lg border border-line bg-surface">
              <EmptyState
              icon={RefreshCwIcon}
              title="We couldn’t load your recommendations"
              description={feed.error}
              action={<Button onClick={feed.retry}>Try again</Button>} />
            
            </div> :
          recommended.length === 0 ?
          <div className="rounded-lg border border-line bg-surface">
              <EmptyState icon={SparklesIcon} title="You’re all caught up" description="You’ve seen every recommendation for now. New matches will show up here." />
            </div> :

          <>
              <motion.ul className="space-y-3" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.04 } } }}>
                <AnimatePresence initial={false}>
                  {recommended.slice(0, visible).map((r) =>
                <motion.li
                  key={r.job.job_id}
                  layout
                  variants={{ hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}>
                  
                      <JobCard job={r.job} match={matcher(r.job)} onDismiss={dismiss} />
                    </motion.li>
                )}
                </AnimatePresence>
              </motion.ul>
              {recommended.length > visible &&
            <div className="mt-4 flex justify-center">
                  <Button variant="secondary" onClick={() => setVisible((v) => v + 5)}>
                    Show more recommendations
                  </Button>
                </div>
            }
            </>
          }
        </section>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-lg border border-line bg-surface p-5" aria-labelledby="search-stats">
            <div className="flex items-center justify-between">
              <h2 id="search-stats" className="text-sm font-semibold text-ink">
                Your job search
              </h2>
              <Link to="/insights" className="text-sm font-medium text-sage-700 hover:text-sage-800">
                Insights
              </Link>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4">
              {stats.map((s) =>
              <div key={s.label}>
                  <dt className="text-sm text-ink-muted">{s.label}</dt>
                  <dd className="mt-0.5 text-2xl font-semibold tabular-nums text-ink">{s.value}</dd>
                </div>
              )}
            </dl>
          </section>

          <section className="rounded-lg border border-line bg-surface p-5">
            <ProfileStrength profile={profile} limit={2} />
          </section>

          <section className="rounded-lg border border-line bg-surface p-5" aria-labelledby="alerts-summary">
            <div className="flex items-center justify-between">
              <h2 id="alerts-summary" className="text-sm font-semibold text-ink">
                Job alerts
              </h2>
              <Link to="/alerts" className="text-sm font-medium text-sage-700 hover:text-sage-800">
                Manage
              </Link>
            </div>
            {alerts.length ?
            <ul className="mt-3 space-y-2">
                {alerts.slice(0, 3).map((a) =>
              <li key={a.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate text-ink">{a.name}</span>
                    <span className={`shrink-0 text-xs ${a.active ? 'text-sage-700' : 'text-ink-muted'}`}>{a.active ? a.frequency : 'Paused'}</span>
                  </li>
              )}
              </ul> :

            <Link to="/alerts" className="mt-3 flex items-center gap-2 text-sm text-ink-soft hover:text-ink">
                <BellIcon className="h-4 w-4" aria-hidden="true" />
                Get notified when new jobs match
              </Link>
            }
          </section>
        </aside>
      </div>

      <section className="mt-14" aria-labelledby="explore-title">
        <h2 id="explore-title" className="text-xl font-semibold text-ink">
          More ways to explore
        </h2>
        <div className="mt-4">
          <SegmentedTabs label="Explore jobs by" tabs={LENSES} value={lens} onChange={setLens} />
        </div>
        <div className="mt-5">
          {lensItems.length ?
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {lensItems.map((r) =>
            <li key={r.job.job_id}>
                  <JobCompactCard job={r.job} match={r.match} note={noteFor(r)} trackAs={lens === 'saved' ? 'similar_open' : 'click'} />
                </li>
            )}
            </ul> :

          <div className="rounded-lg border border-dashed border-line-strong">
              <EmptyState compact icon={CompassIcon} title={LENS_EMPTY[lens].title} description={LENS_EMPTY[lens].description} />
            </div>
          }
        </div>
      </section>
    </div>);

}