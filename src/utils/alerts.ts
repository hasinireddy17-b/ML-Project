import type { JobAlert } from '../types/activity';
import { searchJobs } from './ml/search';

type AlertCriteria = Pick<JobAlert, 'role' | 'skills' | 'location' | 'work_mode' | 'experience'>;

/** Turns alert criteria into the same natural-language query the search engine understands. */
export function alertQuery(a: AlertCriteria): string {
  const role = a.role.trim();
  const parts: string[] = [];
  if (a.experience !== 'Any') parts.push(a.experience === 'Internship' ? 'internship' : a.experience.toLowerCase());
  if (role) parts.push(role);
  a.skills.filter((s) => !role.toLowerCase().includes(s.toLowerCase())).forEach((s) => parts.push(s));
  if (a.work_mode === 'Remote') parts.push('remote');else
  if (a.work_mode === 'Hybrid') parts.push('hybrid');else
  if (a.work_mode === 'On-site') parts.push('onsite');
  if (a.location !== 'Any' && a.location !== 'Remote') parts.push(`in ${a.location}`);
  return parts.join(' ');
}

export function alertMatchCount(a: AlertCriteria): number {
  return searchJobs(alertQuery(a), { exact: true }).hits.length;
}