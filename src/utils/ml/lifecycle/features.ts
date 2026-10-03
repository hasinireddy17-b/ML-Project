import type { Job } from '../../../types/job';
import type { UserProfile } from '../../../types/user';
import { skillTokens, tokenize } from './tfidf';

/**
 * LIFECYCLE STAGE: FEATURE ENGINEERING
 * Text documents for representation + structured compatibility features (0–1) for ranking.
 * The same functions are used offline (training) and online (serving) to avoid skew.
 */

export interface TextDocuments {
  title: string[];
  skills: string[];
  description: string[];
  combined: string[];
}

export function jobDocuments(job: Job): TextDocuments {
  const title = tokenize(job.job_title);
  const skills = [
  ...skillTokens(job.required_skills),
  ...skillTokens(job.required_skills),
  ...skillTokens(job.preferred_skills)];

  const description = tokenize([job.job_description, ...job.responsibilities].join(' '));
  const combined = [
  ...title,
  ...title,
  ...skills,
  ...tokenize([...job.required_skills, ...job.preferred_skills].join(' ')),
  ...description,
  ...tokenize(job.category),
  ...tokenize(job.company)];

  return { title, skills, description, combined };
}

export function candidateDocuments(p: UserProfile): TextDocuments {
  const title = tokenize([...p.preferred_roles, p.headline].join(' '));
  const skills = skillTokens(p.skills);
  const description = tokenize(
    [
    p.headline,
    p.about,
    ...p.preferred_roles,
    ...p.career_interests,
    ...p.skills,
    ...p.experience.map((e) => `${e.title} ${e.description}`)].
    join(' ')
  );
  const combined = [...title, ...skills, ...tokenize(p.skills.join(' ')), ...description];
  return { title, skills, description, combined };
}

export function experienceFit(p: UserProfile, job: Job): number {
  if (job.experience_level === 'Internship') {
    return p.experience_level === 'Student' || p.experience_level === 'Fresher' ? 1 : 0.35;
  }
  const y = p.years_experience;
  if (y >= job.experience_min && y <= job.experience_max) return 1;
  if (y < job.experience_min) return Math.max(0, 1 - (job.experience_min - y) / 3);
  return y - job.experience_max <= 2 ? 0.85 : 0.55;
}

export function locationFit(p: UserProfile, job: Job): number {
  const prefersRemote = p.work_modes.includes('Remote') || p.preferred_locations.includes('Remote');
  if (job.work_mode === 'Remote') return prefersRemote ? 1 : 0.65;
  if (!p.preferred_locations.length) return 0.6;
  return p.preferred_locations.includes(job.location) ? 1 : 0.15;
}

export function workModeFit(p: UserProfile, job: Job): number {
  if (!p.work_modes.length) return 0.7;
  if (p.work_modes.includes(job.work_mode)) return 1;
  if (p.work_modes.includes('Hybrid') && job.work_mode === 'Remote') return 0.6;
  if (p.work_modes.includes('Hybrid')) return 0.45;
  return 0.15;
}

export function salaryFit(p: UserProfile, job: Job): number {
  if (!p.salary_expectation) return 0.7;
  if (job.salary_max >= p.salary_expectation) return 1;
  return Math.max(0, job.salary_max / p.salary_expectation) ** 2;
}

export function interestFit(p: UserProfile, job: Job): number {
  if (!p.career_interests.length) return 0.5;
  return p.career_interests.includes(job.category) ? 1 : 0.15;
}

export function employmentFit(p: UserProfile, job: Job): number {
  if (!p.employment_types.length) return 1;
  return p.employment_types.includes(job.employment_type) ? 1 : 0.25;
}