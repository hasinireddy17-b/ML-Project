import type { EmploymentType, ExperienceLevel } from './job';

export type DatePosted = 'any' | '1' | '3' | '7' | '14';
export type SortOption = 'recommended' | 'relevant' | 'newest' | 'match';

export interface JobFilters {
  jobTypes: EmploymentType[];
  locations: string[];
  remoteOnly: boolean;
  experience: ExperienceLevel[];
  salaryMin: number;
  datePosted: DatePosted;
  skills: string[];
  industries: string[];
}