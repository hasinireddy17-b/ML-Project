import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { HistoryIcon, PlusIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth, useProfile } from '../contexts/AuthContext';
import { useActivity } from '../contexts/ActivityContext';
import { useMatcher } from '../hooks/useMatcher';
import { getFeatureStore } from '../utils/ml/engineering/featureStore';
import { relativeTime } from '../utils/format';
import { ProfileStrength } from '../components/profile/ProfileStrength';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';

type Demand = 'High demand' | 'Medium demand' | 'Low demand';
const DEMAND_STYLE: Record<Demand, string> = {
  'High demand': 'text-sage-800',
  'Medium demand': 'text-taupe-700',
  'Low demand': 'text-ink-muted'
};

export function Insights() {
  const profile = useProfile();
  const { updateProfile } = useAuth();
  const { interactions, saved, applications, searchHistory, clearSearchHistory } = useActivity();
  const matcher = useMatcher();
  const [confirmClear, setConfirmClear] = useState(false);

  const { skillDemand, missingDemand, poolSize } = useMemo(() => {
    const jobs = getFeatureStore().servableJobs;
    const top = [...jobs].sort((a, b) => matcher(b).score - matcher(a).score).slice(0, 15);
    const freq = (skill: string) => top.filter((j) => [...j.required_skills, ...j.preferred_skills].includes(skill)).length / top.length;
    const skillDemand = profile.skills.
    map((s) => {
      const share = freq(s);
      const level: Demand = share >= 0.35 ? 'High demand' : share >= 0.15 ? 'Medium demand' : 'Low demand';
      return { skill: s, share, level };
    }).
    sort((a, b) => b.share - a.share);
    const counts = new Map<string, number>();
    top.forEach((j) => j.required_skills.forEach((s) => !profile.skills.includes(s) && counts.set(s, (counts.get(s) ?? 0) + 1)));
    const missingDemand = [...counts.entries()].
    sort((a, b) => b[1] - a[1]).
    slice(0, 5).
    map(([skill, count]) => ({ skill, count }));
    return { skillDemand, missingDemand, poolSize: top.length };
  }, [profile.skills, matcher]);

  const viewed = new Set(interactions.filter((i) => i.type === 'view').map((i) => i.job_id)).size;
  const interviews = applications.filter((a) => a.status === 'Interview' || a.status === 'Offer').length;
  const stats = [
  { label: 'Jobs viewed', value: viewed },
  { label: 'Jobs saved', value: saved.length },
  { label: 'Applications', value: applications.length },
  { label: 'Interviews', value: interviews }];


  return (
    <div>
      <h1 className="font-display text-[34px] text-ink">Your job search</h1>
      <p className="mt-1 text-[15px] text-ink-soft">How your search is going, and where your profile could work harder.</p>

      <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-4">
        {stats.map((s) =>
        <div key={s.label} className="bg-surface p-5">
            <dt className="text-sm text-ink-muted">{s.label}</dt>
            <dd className="mt-1 text-3xl font-semibold tabular-nums text-ink">{s.value}</dd>
          </div>
        )}
      </dl>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-10">
          <section aria-labelledby="demand-title">
            <h2 id="demand-title" className="text-xl font-semibold text-ink">
              Skill demand
            </h2>
            <p className="mt-1 text-sm text-ink-muted">How often your skills appear in the {poolSize} jobs that match you best.</p>
            {skillDemand.length ?
            <ul className="mt-5 space-y-3">
                {skillDemand.map((s) =>
              <li key={s.skill} className="grid grid-cols-[120px_minmax(0,1fr)_120px] items-center gap-4 text-sm sm:grid-cols-[160px_minmax(0,1fr)_130px]">
                    <span className="truncate font-medium text-ink">{s.skill}</span>
                    <span className="h-2 overflow-hidden rounded-full bg-cream-200" aria-hidden="true">
                      <span className="block h-full rounded-full bg-sage-600" style={{ width: `${Math.max(4, s.share * 100)}%` }} />
                    </span>
                    <span className={`text-right font-medium ${DEMAND_STYLE[s.level]}`}>{s.level}</span>
                  </li>
              )}
              </ul> :

            <p className="mt-4 text-sm text-ink-muted">Add skills to your profile to see how in-demand they are.</p>
            }
          </section>

          {missingDemand.length > 0 &&
          <section aria-labelledby="gap-title" className="border-t border-line pt-8">
              <h2 id="gap-title" className="text-xl font-semibold text-ink">
                Skills that would widen your matches
              </h2>
              <p className="mt-1 text-sm text-ink-muted">Frequently required in your best-matching jobs, but not on your profile yet.</p>
              <ul className="mt-5 divide-y divide-line rounded-lg border border-line bg-surface">
                {missingDemand.map((m) =>
              <li key={m.skill} className="flex items-center justify-between gap-4 px-5 py-3">
                    <div>
                      <p className="font-medium text-ink">{m.skill}</p>
                      <p className="text-sm text-ink-muted">
                        Required in {m.count} of your top {poolSize} matches
                      </p>
                    </div>
                    <button
                  type="button"
                  onClick={() => {
                    updateProfile({ skills: [...profile.skills, m.skill] });
                    toast.success(`${m.skill} added to your skills`);
                  }}
                  className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-sage-700 transition-colors duration-150 hover:bg-sage-50">
                  
                      <PlusIcon className="h-4 w-4" aria-hidden="true" />I have this
                    </button>
                  </li>
              )}
              </ul>
            </section>
          }

          <section aria-labelledby="history-title" className="border-t border-line pt-8">
            <div className="flex items-center justify-between">
              <h2 id="history-title" className="text-xl font-semibold text-ink">
                Search history
              </h2>
              {searchHistory.length > 0 &&
              <button type="button" onClick={() => setConfirmClear(true)} className="text-sm font-medium text-ink-soft hover:text-ink">
                  Clear history
                </button>
              }
            </div>
            {searchHistory.length ?
            <ul className="mt-4 divide-y divide-line rounded-lg border border-line bg-surface">
                {searchHistory.map((h) =>
              <li key={h.query}>
                    <Link to={`/search?q=${encodeURIComponent(h.query)}`} className="flex items-center justify-between gap-4 px-5 py-3 transition-colors duration-150 hover:bg-cream-50">
                      <span className="min-w-0 truncate text-ink">{h.query}</span>
                      <span className="shrink-0 text-sm text-ink-muted">
                        {h.results} results · {relativeTime(h.at)}
                      </span>
                    </Link>
                  </li>
              )}
              </ul> :

            <div className="mt-4 rounded-lg border border-dashed border-line-strong">
                <EmptyState compact icon={HistoryIcon} title="No searches yet" description="Your recent searches will appear here." />
              </div>
            }
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-lg border border-line bg-surface p-5">
            <ProfileStrength profile={profile} limit={5} />
            <p className="mt-4 border-t border-line pt-4 text-sm text-ink-muted">Missing details make recommendations less precise — each one you add sharpens your feed.</p>
          </section>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmClear}
        title="Clear search history?"
        description="Your past searches will be removed. This won’t affect saved jobs or alerts."
        confirmLabel="Clear history"
        onConfirm={clearSearchHistory}
        onClose={() => setConfirmClear(false)} />
      
    </div>);

}