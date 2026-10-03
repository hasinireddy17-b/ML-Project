import type { Job } from '../types/job';
import type { DatePosted, JobFilters } from '../types/search';

export const defaultFilters: JobFilters = {
  jobTypes: [],
  locations: [],
  remoteOnly: false,
  experience: [],
  salaryMin: 0,
  datePosted: 'any',
  skills: [],
  industries: []
};

export const DATE_OPTIONS: {value: DatePosted;label: string;}[] = [
{ value: 'any', label: 'Any time' },
{ value: '1', label: 'Last 24 hours' },
{ value: '3', label: 'Last 3 days' },
{ value: '7', label: 'Last week' },
{ value: '14', label: 'Last 2 weeks' }];


export function applyFilters(jobs: Job[], f: JobFilters): Job[] {
  return jobs.filter((j) => {
    if (f.jobTypes.length && !f.jobTypes.includes(j.employment_type)) return false;
    if (f.remoteOnly && j.work_mode !== 'Remote') return false;
    if (f.locations.length && !f.locations.includes(j.location) && !(f.locations.includes('Remote') && j.work_mode === 'Remote')) return false;
    if (f.experience.length && !f.experience.includes(j.experience_level)) return false;
    if (f.salaryMin && j.salary_max < f.salaryMin) return false;
    if (f.datePosted !== 'any' && j.posted_days_ago > Number(f.datePosted)) return false;
    if (f.skills.length) {
      const all = [...j.required_skills, ...j.preferred_skills];
      if (!f.skills.some((s) => all.includes(s))) return false;
    }
    if (f.industries.length && !f.industries.includes(j.industry)) return false;
    return true;
  });
}

export interface FilterChip {
  id: string;
  label: string;
  remove: (f: JobFilters) => JobFilters;
}

export function filterChips(f: JobFilters): FilterChip[] {
  const chips: FilterChip[] = [];
  f.jobTypes.forEach((t) => chips.push({ id: `type-${t}`, label: t, remove: (x) => ({ ...x, jobTypes: x.jobTypes.filter((v) => v !== t) }) }));
  f.locations.forEach((l) => chips.push({ id: `loc-${l}`, label: l, remove: (x) => ({ ...x, locations: x.locations.filter((v) => v !== l) }) }));
  if (f.remoteOnly) chips.push({ id: 'remote', label: 'Remote only', remove: (x) => ({ ...x, remoteOnly: false }) });
  f.experience.forEach((e) => chips.push({ id: `exp-${e}`, label: e, remove: (x) => ({ ...x, experience: x.experience.filter((v) => v !== e) }) }));
  if (f.salaryMin) chips.push({ id: 'salary', label: `₹${f.salaryMin}L+`, remove: (x) => ({ ...x, salaryMin: 0 }) });
  if (f.datePosted !== 'any') {
    const label = DATE_OPTIONS.find((d) => d.value === f.datePosted)?.label ?? '';
    chips.push({ id: 'date', label, remove: (x) => ({ ...x, datePosted: 'any' }) });
  }
  f.skills.forEach((s) => chips.push({ id: `skill-${s}`, label: s, remove: (x) => ({ ...x, skills: x.skills.filter((v) => v !== s) }) }));
  f.industries.forEach((i) => chips.push({ id: `ind-${i}`, label: i, remove: (x) => ({ ...x, industries: x.industries.filter((v) => v !== i) }) }));
  return chips;
}