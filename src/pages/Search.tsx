import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BellPlusIcon, CheckIcon, RefreshCwIcon, SearchXIcon, SlidersHorizontalIcon } from 'lucide-react';
import type { JobFilters, SortOption } from '../types/search';
import { useProfile } from '../contexts/AuthContext';
import { useActivity } from '../contexts/ActivityContext';
import { useMatcher } from '../hooks/useMatcher';
import { useAsync } from '../hooks/useAsync';
import { api } from '../utils/api';
import { applyFilters, defaultFilters, filterChips } from '../utils/filters';
import { displayQuery } from '../utils/ml/search';
import { getFeatureStore } from '../utils/ml/engineering/featureStore';
import { SearchBox } from '../components/search/SearchBox';
import { FilterPanel } from '../components/search/FilterPanel';
import { ActiveFilterChips } from '../components/search/ActiveFilterChips';
import { JobCard } from '../components/jobs/JobCard';
import { JobCardSkeleton } from '../components/jobs/JobCardSkeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { SelectField } from '../components/ui/SelectField';
import { BottomSheet } from '../components/ui/BottomSheet';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';

const SORTS: {value: SortOption;label: string;}[] = [
{ value: 'recommended', label: 'Recommended' },
{ value: 'relevant', label: 'Most relevant' },
{ value: 'newest', label: 'Newest' },
{ value: 'match', label: 'Highest match' }];


const PAGE = 10;

export function Search() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const exact = params.get('exact') === '1';
  const profile = useProfile();
  const { recordSearch, dismiss, alerts, addAlert, searchHistory } = useActivity();
  const matcher = useMatcher();
  const [filters, setFilters] = useState<JobFilters>(defaultFilters);
  const [sort, setSort] = useState<SortOption>('recommended');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [visible, setVisible] = useState(PAGE);

  const { data, loading, error, retry } = useAsync(() => api.search(q, exact), [q, exact]);
  const recorded = useRef<unknown>(null);

  useEffect(() => {
    if (data && q && recorded.current !== data) {
      recorded.current = data;
      recordSearch(data.effectiveQuery, data.hits.length);
    }
  }, [data, q, recordSearch]);

  useEffect(() => setVisible(PAGE), [q, exact, filters, sort]);

  const results = useMemo(() => {
    if (!data) return [];
    const allowed = new Set(applyFilters(data.hits.map((h) => h.job), filters).map((j) => j.job_id));
    const maxRel = Math.max(1e-6, ...data.hits.map((h) => h.relevance));
    const rows = data.hits.
    filter((h) => allowed.has(h.job.job_id) && !matcher.affinity.dismissed.has(h.job.job_id)).
    map((h) => ({ ...h, match: matcher(h.job) }));
    const hasQuery = !!data.query;
    return rows.sort((a, b) => {
      if (sort === 'newest') return a.job.posted_days_ago - b.job.posted_days_ago;
      if (sort === 'match' || !hasQuery) return b.match.score - a.match.score;
      if (sort === 'relevant') return b.relevance - a.relevance;
      return 0.5 * (b.relevance / maxRel) + 0.5 * (b.match.score / 100) - (0.5 * (a.relevance / maxRel) + 0.5 * (a.match.score / 100));
    });
  }, [data, filters, sort, matcher]);

  const skillOptions = useMemo(() => {
    const counts = new Map<string, number>();
    (data?.hits ?? []).forEach((h) => h.job.required_skills.forEach((s) => counts.set(s, (counts.get(s) ?? 0) + 1)));
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([s]) => s);
    return Array.from(new Set([...filters.skills, ...top]));
  }, [data, filters.skills]);

  const industryOptions = useMemo(() => Array.from(new Set(getFeatureStore().servableJobs.map((j) => j.industry))).sort(), []);
  const activeCount = filterChips(filters).length;

  const alertName = data?.effectiveQuery ? displayQuery(data.effectiveQuery) : '';
  const alertExists = alerts.some((a) => a.name.toLowerCase() === alertName.toLowerCase());
  const createAlert = () => {
    if (!data) return;
    const p = data.parsed;
    const skillWords = new Set(p.skills.flatMap((s) => s.toLowerCase().split(' ')));
    const role = p.terms.filter((t) => !skillWords.has(t)).join(' ');
    addAlert({
      name: alertName,
      role: displayQuery(role || p.skills[0] || data.effectiveQuery),
      skills: p.skills,
      location: p.location ?? 'Any',
      work_mode: p.workMode ?? 'Any',
      experience: p.experience ?? 'Any',
      frequency: 'Daily'
    });
  };

  const understood = data?.query ?
  [
  ...data.parsed.skills.map((s) => `Skill: ${s}`),
  data.parsed.location && `Location: ${data.parsed.location}`,
  data.parsed.workMode && `Work mode: ${data.parsed.workMode}`,
  data.parsed.experience && `Level: ${data.parsed.experience}`,
  data.parsed.employment && `Type: ${data.parsed.employment}`].
  filter((x): x is string => !!x) :
  [];

  const clearFilters = () => setFilters(defaultFilters);

  return (
    <div>
      <div className="max-w-3xl">
        <SearchBox size="lg" initialValue={q} shortcut />
        {data?.corrected &&
        <div className="mt-3 text-[15px] text-ink-soft" role="status">
            <p>
              Showing results for <span className="font-semibold text-ink">{displayQuery(data.corrected)}</span>
            </p>
            <p className="mt-0.5 text-sm">
              Search instead for{' '}
              <button type="button" className="font-medium text-sage-700 underline-offset-2 hover:underline" onClick={() => setParams({ q, exact: '1' })}>
                “{q}”
              </button>
            </p>
          </div>
        }
        {understood.length > 0 &&
        <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-muted">
            <span>Understood as</span>
            {understood.map((u) =>
          <span key={u} className="rounded border border-line bg-surface px-2 py-0.5 text-[13px] text-ink-soft">
                {u}
              </span>
          )}
          </p>
        }
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[232px_minmax(0,1fr)] xl:grid-cols-[232px_minmax(0,1fr)_280px]">
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink">Filters</h2>
            {activeCount > 0 &&
            <button type="button" onClick={clearFilters} className="text-sm font-medium text-sage-700 hover:text-sage-800">
                Clear all
              </button>
            }
          </div>
          <FilterPanel filters={filters} onChange={setFilters} skillOptions={skillOptions} industryOptions={industryOptions} />
        </aside>

        <section aria-labelledby="results-title" className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 id="results-title" className="text-lg font-semibold text-ink" aria-live="polite">
              {loading ? 'Searching…' : `${results.length} ${results.length === 1 ? 'job' : 'jobs'}${data?.query ? '' : ' open now'}`}
            </h1>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" className="lg:hidden" onClick={() => setSheetOpen(true)}>
                <SlidersHorizontalIcon className="h-4 w-4" aria-hidden="true" />
                Filters{activeCount ? ` (${activeCount})` : ''}
              </Button>
              <SelectField label="Sort by" hideLabel value={sort} onChange={(e) => setSort(e.target.value as SortOption)} options={SORTS} className="w-44" />
            </div>
          </div>

          <div className="mt-3">
            <ActiveFilterChips filters={filters} onChange={setFilters} onClear={clearFilters} />
          </div>

          <div className="mt-4">
            {loading ?
            <div className="space-y-3" aria-busy="true">
                {[0, 1, 2, 3].map((i) =>
              <JobCardSkeleton key={i} />
              )}
              </div> :
            error ?
            <div className="rounded-lg border border-line bg-surface">
                <EmptyState icon={RefreshCwIcon} title="Search is temporarily unavailable" description={error} action={<Button onClick={retry}>Try again</Button>} />
              </div> :
            results.length === 0 ?
            <div className="rounded-lg border border-line bg-surface">
                <EmptyState
                icon={SearchXIcon}
                title="No jobs found"
                description="Try changing your filters or searching for another role."
                action={
                activeCount ?
                <Button variant="secondary" onClick={clearFilters}>
                        Clear filters
                      </Button> :
                undefined
                } />
              
              </div> :

            <>
                <ul className="space-y-3">
                  {results.slice(0, visible).map((r) =>
                <li key={r.job.job_id}>
                      <JobCard job={r.job} match={r.match} onDismiss={dismiss} />
                    </li>
                )}
                </ul>
                {results.length > visible &&
              <div className="mt-4 flex justify-center">
                    <Button variant="secondary" onClick={() => setVisible((v) => v + PAGE)}>
                      Show more jobs
                    </Button>
                  </div>
              }
              </>
            }
          </div>
        </section>

        <aside className="hidden space-y-5 xl:block" aria-label="Your profile and saved searches">
          <section className="rounded-lg border border-line bg-surface p-5">
            <div className="flex items-center gap-3">
              <Avatar name={profile.name} photo={profile.photo} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{profile.name}</p>
                <p className="truncate text-sm text-ink-muted">{profile.headline || 'Add a headline'}</p>
              </div>
            </div>
            <dl className="mt-4 space-y-2.5 text-sm">
              <div>
                <dt className="text-ink-muted">Matching on</dt>
                <dd className="mt-0.5 text-ink">{profile.skills.slice(0, 5).join(', ') || '—'}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Where</dt>
                <dd className="mt-0.5 text-ink">{[...profile.preferred_locations, ...profile.work_modes.filter((m) => m !== 'On-site')].join(' · ') || '—'}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Salary</dt>
                <dd className="mt-0.5 text-ink">{profile.salary_expectation ? `₹${profile.salary_expectation}L+ per year` : 'Flexible'}</dd>
              </div>
            </dl>
            <Link to="/settings?section=preferences" className="mt-4 inline-block text-sm font-medium text-sage-700 hover:text-sage-800">
              Edit preferences
            </Link>
          </section>

          {data?.query &&
          <section className="rounded-lg border border-line bg-surface p-5">
              <h2 className="text-sm font-semibold text-ink">Save this search</h2>
              <p className="mt-1 text-sm text-ink-muted">Get notified when new jobs match “{alertName}”.</p>
              <Button variant={alertExists ? 'subtle' : 'secondary'} size="sm" className="mt-3 w-full" disabled={alertExists} onClick={createAlert}>
                {alertExists ? <CheckIcon className="h-4 w-4" aria-hidden="true" /> : <BellPlusIcon className="h-4 w-4" aria-hidden="true" />}
                {alertExists ? 'Alert active' : 'Create alert'}
              </Button>
            </section>
          }

          {searchHistory.length > 0 &&
          <section className="rounded-lg border border-line bg-surface p-5">
              <h2 className="text-sm font-semibold text-ink">Recent searches</h2>
              <ul className="mt-2 space-y-1">
                {searchHistory.slice(0, 5).map((h) =>
              <li key={h.query}>
                    <Link to={`/search?q=${encodeURIComponent(h.query)}`} className="flex justify-between gap-3 py-1 text-sm text-ink-soft hover:text-ink">
                      <span className="truncate">{h.query}</span>
                      <span className="shrink-0 tabular-nums text-ink-muted">{h.results}</span>
                    </Link>
                  </li>
              )}
              </ul>
            </section>
          }
        </aside>
      </div>

      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Filters"
        footer={
        <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={clearFilters}>
              Clear all
            </Button>
            <Button className="flex-1" onClick={() => setSheetOpen(false)}>
              Show {results.length} jobs
            </Button>
          </div>
        }>
        
        <FilterPanel filters={filters} onChange={setFilters} skillOptions={skillOptions} industryOptions={industryOptions} />
      </BottomSheet>
    </div>);

}