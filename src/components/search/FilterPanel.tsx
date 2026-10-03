import React, { useState, type ReactNode } from 'react';
import type { JobFilters } from '../../types/search';
import { employmentTypes, experienceLevels, locations } from '../../data/skills';
import { DATE_OPTIONS } from '../../utils/filters';
import { Toggle } from '../ui/Toggle';
import { Chip } from '../ui/Chip';

interface FilterPanelProps {
  filters: JobFilters;
  onChange: (f: JobFilters) => void;
  skillOptions: string[];
  industryOptions: string[];
}

function toggle<T>(list: T[], v: T): T[] {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

function Section({ title, children }: {title: string;children: ReactNode;}) {
  return (
    <fieldset className="border-b border-line py-4 first:pt-0 last:border-0">
      <legend className="mb-2 text-sm font-semibold text-ink">{title}</legend>
      {children}
    </fieldset>);

}

function Check({ label, checked, onChange }: {label: string;checked: boolean;onChange: () => void;}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1 text-sm text-ink-soft hover:text-ink">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 rounded border-line-strong accent-sage-700" />
      {label}
    </label>);

}

export function FilterPanel({ filters, onChange, skillOptions, industryOptions }: FilterPanelProps) {
  const [showAllIndustries, setShowAllIndustries] = useState(false);
  const set = (patch: Partial<JobFilters>) => onChange({ ...filters, ...patch });
  const industries = showAllIndustries ? industryOptions : industryOptions.slice(0, 5);

  return (
    <div>
      <Section title="Job type">
        {employmentTypes.map((t) =>
        <Check key={t} label={t} checked={filters.jobTypes.includes(t)} onChange={() => set({ jobTypes: toggle(filters.jobTypes, t) })} />
        )}
      </Section>

      <Section title="Location">
        {locations.
        filter((l) => l !== 'Remote').
        map((l) =>
        <Check key={l} label={l} checked={filters.locations.includes(l)} onChange={() => set({ locations: toggle(filters.locations, l) })} />
        )}
        <div className="mt-3">
          <Toggle label="Remote only" checked={filters.remoteOnly} onChange={(v) => set({ remoteOnly: v })} />
        </div>
      </Section>

      <Section title="Experience">
        {experienceLevels.map((e) =>
        <Check key={e} label={e} checked={filters.experience.includes(e)} onChange={() => set({ experience: toggle(filters.experience, e) })} />
        )}
      </Section>

      <Section title="Salary">
        <div className="flex items-baseline justify-between text-sm">
          <label htmlFor="salary-min" className="text-ink-soft">
            Minimum
          </label>
          <span className="font-medium tabular-nums text-ink">{filters.salaryMin ? `₹${filters.salaryMin}L+ / yr` : 'Any'}</span>
        </div>
        <input
          id="salary-min"
          type="range"
          min={0}
          max={40}
          step={2}
          value={filters.salaryMin}
          onChange={(e) => set({ salaryMin: Number(e.target.value) })}
          className="mt-2 w-full" />
        
      </Section>

      <Section title="Date posted">
        {DATE_OPTIONS.map((d) =>
        <label key={d.value} className="flex cursor-pointer items-center gap-2.5 py-1 text-sm text-ink-soft hover:text-ink">
            <input type="radio" name="date-posted" checked={filters.datePosted === d.value} onChange={() => set({ datePosted: d.value })} className="h-4 w-4 accent-sage-700" />
            {d.label}
          </label>
        )}
      </Section>

      <Section title="Skills">
        <div className="flex flex-wrap gap-1.5">
          {skillOptions.map((s) =>
          <Chip key={s} size="sm" selected={filters.skills.includes(s)} onClick={() => set({ skills: toggle(filters.skills, s) })}>
              {s}
            </Chip>
          )}
        </div>
      </Section>

      <Section title="Industry">
        {industries.map((i) =>
        <Check key={i} label={i} checked={filters.industries.includes(i)} onChange={() => set({ industries: toggle(filters.industries, i) })} />
        )}
        {industryOptions.length > 5 &&
        <button type="button" onClick={() => setShowAllIndustries((v) => !v)} className="mt-1 text-sm font-medium text-sage-700 hover:text-sage-800">
            {showAllIndustries ? 'Show fewer' : `Show all ${industryOptions.length}`}
          </button>
        }
      </Section>
    </div>);

}