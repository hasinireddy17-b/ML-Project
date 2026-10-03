import type { EmploymentType, ExperienceLevel, Job, WorkMode } from '../../types/job';
import { canonicalSkills, jobCategories, locationAliases, locations, roles, skillAliases } from '../../data/skills';
import { companies } from '../../data/companies';
import { getFeatureStore } from './engineering/featureStore';
import { cosine, skillTokens, tokenize } from './lifecycle/tfidf';
import { cleanText } from './lifecycle/preprocessing';

/**
 * SMART SEARCH
 * Typo correction (Damerau–Levenshtein over a domain vocabulary) → query understanding
 * (role, skill, location, work mode, experience, employment) → TF-IDF relevance + boosts.
 */

const QUERY_STOPWORDS = new Set(['in', 'with', 'for', 'jobs', 'job', 'and', 'at', 'the', 'a', 'an', 'role', 'roles', 'position', 'openings', 'near', 'me', 'using']);
const MODE_WORDS: Record<string, WorkMode> = { remote: 'Remote', wfh: 'Remote', hybrid: 'Hybrid', onsite: 'On-site', 'on-site': 'On-site', office: 'On-site' };
const EXPERIENCE_PHRASES: [string, ExperienceLevel][] = [
['entry level', 'Entry Level'], ['entry-level', 'Entry Level'], ['junior', 'Entry Level'], ['fresher', 'Entry Level'],
['internship', 'Internship'], ['intern', 'Internship'], ['senior', 'Senior'], ['mid level', 'Mid Level'], ['mid-level', 'Mid Level']];

const EMPLOYMENT_PHRASES: [string, EmploymentType][] = [
['contract', 'Contract'], ['part time', 'Part-time'], ['part-time', 'Part-time'], ['full time', 'Full-time'], ['full-time', 'Full-time']];

const EXTRA_WORDS = [
'developer', 'engineer', 'analyst', 'scientist', 'remote', 'hybrid', 'onsite', 'entry', 'level', 'junior', 'senior', 'fresher',
'intern', 'internship', 'contract', 'frontend', 'backend', 'full', 'stack', 'mid', 'graduate', 'part', 'time', 'data', 'web',
'cloud', 'security', 'mobile', 'software', 'machine', 'learning', 'python', 'java'];


let vocabCache: Map<string, number> | null = null;

function vocabulary(): Map<string, number> {
  if (vocabCache) return vocabCache;
  const freq = new Map<string, number>();
  const add = (text: string, weight = 1) =>
  cleanText(text).
  split(/[\s/]+/).
  filter((t) => t.length > 1).
  forEach((t) => freq.set(t, (freq.get(t) ?? 0) + weight));
  const store = getFeatureStore();
  store.servableJobs.forEach((j) => {
    add(j.job_title, 3);
    add([...j.required_skills, ...j.preferred_skills].join(' '), 2);
  });
  canonicalSkills.forEach((s) => add(s, 2));
  roles.forEach((r) => add(r, 2));
  companies.forEach((c) => add(c.name));
  jobCategories.forEach((c) => add(c));
  Object.keys(locationAliases).forEach((l) => add(l, 2));
  EXTRA_WORDS.forEach((w) => add(w, 2));
  vocabCache = freq;
  return freq;
}

export function damerauLevenshtein(a: string, b: string): number {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...new Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[a.length][b.length];
}

function correctToken(token: string): string {
  const vocab = vocabulary();
  if (token.length <= 2 || QUERY_STOPWORDS.has(token) || vocab.has(token) || /\d/.test(token)) return token;
  const maxDist = token.length <= 4 ? 1 : 2;
  let best = token;
  let bestD = Infinity;
  let bestF = 0;
  vocab.forEach((f, w) => {
    if (Math.abs(w.length - token.length) > maxDist) return;
    const dist = damerauLevenshtein(token, w);
    if (dist < bestD || dist === bestD && f > bestF) {
      best = w;
      bestD = dist;
      bestF = f;
    }
  });
  return bestD <= maxDist ? best : token;
}

export function correctQuery(query: string): {corrected: string;changed: boolean;} {
  const tokens = query.trim().split(/\s+/).filter(Boolean);
  const out = tokens.map((t) => {
    const lower = t.toLowerCase();
    const fixed = correctToken(lower);
    return fixed === lower ? t : fixed;
  });
  const corrected = out.join(' ');
  return { corrected, changed: corrected.toLowerCase() !== query.trim().toLowerCase() };
}

const SMALL_WORDS = new Set(['in', 'with', 'for', 'and', 'at', 'the', 'a', 'an']);

/** Presentable casing: "pyhton developer in hyderabad" → "Python Developer in Hyderabad". */
export function displayQuery(query: string): string {
  return query.
  trim().
  split(/\s+/).
  map((w, i) => {
    const lower = w.toLowerCase();
    if (i > 0 && SMALL_WORDS.has(lower)) return lower;
    const skill = canonicalSkills.find((s) => s.toLowerCase() === lower);
    if (skill) return skill;
    if (locationAliases[lower]) return locationAliases[lower];
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }).
  join(' ');
}

export interface ParsedQuery {
  terms: string[];
  skills: string[];
  location?: string;
  workMode?: WorkMode;
  experience?: ExperienceLevel;
  employment?: EmploymentType;
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function parseQuery(query: string): ParsedQuery {
  let text = ` ${cleanText(query)} `;
  const take = (phrase: string): boolean => {
    const re = new RegExp(`\\s${escapeRe(phrase)}\\s`);
    if (!re.test(text)) return false;
    text = text.replace(re, ' ');
    return true;
  };

  const parsed: ParsedQuery = { terms: [], skills: [] };
  const aliasKeys = Object.keys(locationAliases).filter((k) => k !== 'remote').sort((a, b) => b.length - a.length);
  for (const key of aliasKeys) {
    if (take(key)) {
      parsed.location = locationAliases[key];
      break;
    }
  }
  for (const [word, mode] of Object.entries(MODE_WORDS)) {
    if (take(word)) {
      parsed.workMode = mode;
      break;
    }
  }
  for (const [phrase, level] of EXPERIENCE_PHRASES) {
    if (take(phrase)) {
      parsed.experience = level;
      break;
    }
  }
  for (const [phrase, type] of EMPLOYMENT_PHRASES) {
    if (take(phrase)) {
      parsed.employment = type;
      break;
    }
  }

  const hasWord = (w: string) => new RegExp(`(^|\\s)${escapeRe(w)}(\\s|$)`).test(text);
  canonicalSkills.forEach((s) => {
    if (hasWord(s.toLowerCase())) parsed.skills.push(s);
  });
  Object.entries(skillAliases).forEach(([alias, skill]) => {
    if (hasWord(alias) && !parsed.skills.includes(skill)) parsed.skills.push(skill);
  });

  parsed.terms = text.split(' ').filter((t) => t && !QUERY_STOPWORDS.has(t));
  return parsed;
}

export interface SearchHit {
  job: Job;
  relevance: number;
}

export interface SearchOutcome {
  query: string;
  effectiveQuery: string;
  corrected: string | null;
  parsed: ParsedQuery;
  hits: SearchHit[];
}

export function searchJobs(query: string, opts: {exact?: boolean;} = {}): SearchOutcome {
  const store = getFeatureStore();
  const trimmed = query.trim();
  if (!trimmed) {
    return { query: '', effectiveQuery: '', corrected: null, parsed: { terms: [], skills: [] }, hits: store.servableJobs.map((job) => ({ job, relevance: 1 })) };
  }

  const correction = correctQuery(trimmed);
  const useCorrection = correction.changed && !opts.exact;
  const effective = useCorrection ? correction.corrected : trimmed;
  const parsed = parseQuery(effective);
  const qv = store.vectorizers.combined.transform([...tokenize(parsed.terms.join(' ')), ...skillTokens(parsed.skills)]);
  const skillWords = new Set(parsed.skills.flatMap((s) => s.toLowerCase().split(' ')));
  const roleTerms = parsed.terms.filter((t) => !skillWords.has(t));
  const phrase = parsed.terms.join(' ');

  const hits = store.servableJobs.
  filter((job) => {
    if (parsed.location && job.location !== parsed.location) return false;
    if (parsed.workMode && job.work_mode !== parsed.workMode) return false;
    if (parsed.experience && job.experience_level !== parsed.experience) return false;
    if (parsed.employment && job.employment_type !== parsed.employment) return false;
    return true;
  }).
  map((job): SearchHit => {
    if (!parsed.terms.length) return { job, relevance: 1 };
    const v = store.vectors.get(job.job_id);
    let relevance = v ? cosine(qv, v.combined) : 0;
    const title = job.job_title.toLowerCase();
    if (roleTerms.length && roleTerms.every((t) => title.includes(t))) relevance += 0.35;else
    if (roleTerms.some((t) => title.includes(t))) relevance += 0.12;
    const req = job.required_skills.map((s) => s.toLowerCase());
    const pref = job.preferred_skills.map((s) => s.toLowerCase());
    parsed.skills.forEach((s) => {
      const k = s.toLowerCase();
      if (req.includes(k)) relevance += 0.18;else
      if (pref.includes(k)) relevance += 0.08;
    });
    if (phrase && job.company.toLowerCase().includes(phrase)) relevance += 0.6;
    return { job, relevance };
  }).
  filter((h) => h.relevance > 0.08).
  sort((a, b) => b.relevance - a.relevance);

  return { query: trimmed, effectiveQuery: effective, corrected: useCorrection ? correction.corrected : null, parsed, hits };
}

export interface Suggestion {
  label: string;
  type: 'Role' | 'Skill' | 'Company' | 'Location';
}

let suggestionPool: Suggestion[] | null = null;

function getSuggestionPool(): Suggestion[] {
  if (suggestionPool) return suggestionPool;
  const titles = Array.from(new Set([...roles, ...getFeatureStore().servableJobs.map((j) => j.job_title)]));
  suggestionPool = [
  ...titles.map((label): Suggestion => ({ label, type: 'Role' })),
  ...canonicalSkills.map((label): Suggestion => ({ label, type: 'Skill' })),
  ...companies.map((c): Suggestion => ({ label: c.name, type: 'Company' })),
  ...locations.map((label): Suggestion => ({ label, type: 'Location' }))];

  return suggestionPool;
}

export function getSuggestions(input: string, limit = 7): Suggestion[] {
  const q = input.trim().toLowerCase();
  if (!q) return [];
  const pool = getSuggestionPool();
  const rank = (needle: string) => {
    const starts = pool.filter((s) => s.label.toLowerCase().startsWith(needle));
    const contains = pool.filter((s) => !s.label.toLowerCase().startsWith(needle) && s.label.toLowerCase().includes(needle));
    return [...starts, ...contains];
  };
  const direct = rank(q);
  if (direct.length >= 3 || !q.includes(' ')) return direct.slice(0, limit);

  const parts = input.trim().split(/\s+/);
  const last = parts.pop()?.toLowerCase() ?? '';
  const rest = parts.join(' ');
  const completions = last.length >= 2 ? rank(last).map((s) => ({ ...s, label: `${rest} ${s.label}` })) : [];
  return [...direct, ...completions].slice(0, limit);
}