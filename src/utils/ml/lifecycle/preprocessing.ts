import type { Company, EmploymentType, ExperienceLevel, Job, JobCategory, RawJob, WorkMode } from '../../../types/job';
import { companies } from '../../../data/companies';
import { canonicalSkills, jobCategories, locationAliases, skillAliases } from '../../../data/skills';

/**
 * LIFECYCLE STAGE: DATA CLEANING
 * Missing values · duplicates · text cleaning · categorical standardization · numeric preparation.
 */

export interface PreprocessingReport {
  rawCount: number;
  cleanCount: number;
  columns: number;
  duplicatesRemoved: {job_id: string;duplicateOf: string;}[];
  missingByField: Record<string, number>;
  imputedByField: Record<string, number>;
  standardizedValues: number;
}

const DAY_MS = 86_400_000;
const RAW_COLUMNS = 19;

const WORK_MODE_MAP: Record<string, WorkMode> = {
  remote: 'Remote',
  wfh: 'Remote',
  'work from home': 'Remote',
  hybrid: 'Hybrid',
  onsite: 'On-site',
  'on-site': 'On-site',
  'on site': 'On-site',
  office: 'On-site'
};

const EMPLOYMENT_MAP: Record<string, EmploymentType> = {
  'full-time': 'Full-time',
  'full time': 'Full-time',
  fulltime: 'Full-time',
  'part-time': 'Part-time',
  'part time': 'Part-time',
  contract: 'Contract',
  internship: 'Internship',
  intern: 'Internship'
};

const LEVEL_MAP: Record<string, ExperienceLevel> = {
  internship: 'Internship',
  intern: 'Internship',
  'entry level': 'Entry Level',
  entry: 'Entry Level',
  junior: 'Entry Level',
  'mid level': 'Mid Level',
  mid: 'Mid Level',
  senior: 'Senior'
};

export function cleanText(value: string | null | undefined): string {
  return (value ?? '').
  toLowerCase().
  replace(/[^a-z0-9+#.\s/-]/g, ' ').
  replace(/\s+/g, ' ').
  trim();
}

export function titleCase(value: string): string {
  return value.trim().toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function normalizeSkill(skill: string): string {
  const key = skill.trim().toLowerCase();
  if (skillAliases[key]) return skillAliases[key];
  return canonicalSkills.find((s) => s.toLowerCase() === key) ?? titleCase(skill);
}

export function normalizeLocation(location: string): string {
  const key = location.trim().toLowerCase();
  return locationAliases[key] ?? titleCase(location);
}

export function normalizeWorkMode(mode: string | null | undefined): WorkMode {
  return WORK_MODE_MAP[(mode ?? '').trim().toLowerCase()] ?? 'On-site';
}

function normalizeCategory(category: string): JobCategory {
  const key = category.toLowerCase().replace(/[^a-z]/g, '');
  return jobCategories.find((c) => c.toLowerCase().replace(/[^a-z]/g, '') === key) ?? 'Software Development';
}

function levelFromYears(min: number): ExperienceLevel {
  if (min <= 1) return 'Entry Level';
  if (min <= 5) return 'Mid Level';
  return 'Senior';
}

function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function findCompany(name: string): Company {
  const found = companies.find((c) => c.name.toLowerCase() === name.trim().toLowerCase());
  if (found) return found;
  return {
    name: name.trim(),
    industry: 'Unspecified',
    size: 'Unknown',
    founded: 0,
    headquarters: '—',
    about: 'Company details have not been verified yet.',
    benefits: [],
    color: '#AC9784'
  };
}

export function preprocessJobs(raw: RawJob[], now: number = Date.now()): {jobs: Job[];report: PreprocessingReport;} {
  const missing: Record<string, number> = {};
  const imputed: Record<string, number> = {};
  let standardized = 0;
  const bump = (record: Record<string, number>, key: string) => {
    record[key] = (record[key] ?? 0) + 1;
  };

  // 1 · Missing-value audit on the raw feed
  raw.forEach((r) => {
    if (!r.job_description?.trim()) bump(missing, 'job_description');
    if (r.salary_min == null) bump(missing, 'salary_min');
    if (r.salary_max == null) bump(missing, 'salary_max');
    if (!r.experience_level) bump(missing, 'experience_level');
    if (!r.industry) bump(missing, 'industry');
    if (!r.education) bump(missing, 'education');
    if (!r.preferred_skills?.length) bump(missing, 'preferred_skills');
    if (!r.responsibilities?.length) bump(missing, 'responsibilities');
  });

  // 2 · Duplicate removal on normalized (title, company, location)
  const seen = new Map<string, string>();
  const duplicatesRemoved: PreprocessingReport['duplicatesRemoved'] = [];
  const unique: RawJob[] = [];
  raw.forEach((r) => {
    const key = [cleanText(r.job_title), cleanText(r.company), normalizeLocation(r.location)].join('|');
    const prev = seen.get(key);
    if (prev) {
      duplicatesRemoved.push({ job_id: r.job_id, duplicateOf: prev });
      return;
    }
    seen.set(key, r.job_id);
    unique.push(r);
  });

  // 3 · Category salary pools for median imputation
  const salaryPool = new Map<JobCategory, {min: number[];max: number[];}>();
  unique.forEach((r) => {
    if (r.salary_min == null || r.salary_max == null) return;
    const c = normalizeCategory(r.category);
    const pool = salaryPool.get(c) ?? { min: [], max: [] };
    pool.min.push(r.salary_min);
    pool.max.push(r.salary_max);
    salaryPool.set(c, pool);
  });

  // 4 · Standardize every field
  const jobs = unique.map((r): Job => {
    const category = normalizeCategory(r.category);
    if (category !== r.category) standardized++;
    const location = normalizeLocation(r.location);
    if (location !== r.location) standardized++;
    const work_mode = normalizeWorkMode(r.work_mode);
    if (work_mode !== r.work_mode) standardized++;

    const normalizeList = (list: string[] = []) => {
      const out: string[] = [];
      list.forEach((s) => {
        const n = normalizeSkill(s);
        if (n !== s) standardized++;
        if (!out.includes(n)) out.push(n);
      });
      return out;
    };
    const required_skills = normalizeList(r.required_skills);
    const preferred_skills = normalizeList(r.preferred_skills).filter((s) => !required_skills.includes(s));
    const company_info = findCompany(r.company);

    let salary_min = r.salary_min;
    let salary_max = r.salary_max;
    let salary_imputed = false;
    if (salary_min == null || salary_max == null) {
      const pool = salaryPool.get(category);
      salary_min = Math.round(median(pool?.min ?? [8]));
      salary_max = Math.round(median(pool?.max ?? [14]));
      salary_imputed = true;
      bump(imputed, 'salary');
    }

    const employment_type = EMPLOYMENT_MAP[(r.employment_type ?? '').trim().toLowerCase()] ?? 'Full-time';
    let experience_level = LEVEL_MAP[(r.experience_level ?? '').trim().toLowerCase()];
    if (!experience_level) {
      experience_level = employment_type === 'Internship' ? 'Internship' : levelFromYears(r.experience_min);
      bump(imputed, 'experience_level');
    }

    const industry = r.industry?.trim() || company_info.industry;
    if (!r.industry) bump(imputed, 'industry');
    const education = r.education?.trim() || 'Bachelor’s degree or equivalent experience';
    if (!r.education) bump(imputed, 'education');

    const title = r.job_title.trim();
    return {
      job_id: r.job_id,
      job_title: title === title.toLowerCase() ? titleCase(title) : title,
      company: company_info.name,
      category,
      job_description: (r.job_description ?? '').replace(/\s+/g, ' ').trim(),
      responsibilities: r.responsibilities ?? [],
      required_skills,
      preferred_skills,
      location,
      work_mode,
      experience_level,
      experience_min: Math.max(0, r.experience_min),
      experience_max: Math.max(r.experience_min, r.experience_max),
      salary_min,
      salary_max,
      salary_imputed,
      employment_type,
      industry,
      education,
      posted_days_ago: r.posted_days_ago,
      posted_date: new Date(now - r.posted_days_ago * DAY_MS).toISOString(),
      company_info
    };
  });

  return {
    jobs,
    report: {
      rawCount: raw.length,
      cleanCount: jobs.length,
      columns: RAW_COLUMNS,
      duplicatesRemoved,
      missingByField: missing,
      imputedByField: imputed,
      standardizedValues: standardized
    }
  };
}