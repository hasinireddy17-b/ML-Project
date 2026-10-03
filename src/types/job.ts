export type WorkMode = 'Remote' | 'Hybrid' | 'On-site';
export type ExperienceLevel = 'Internship' | 'Entry Level' | 'Mid Level' | 'Senior';
export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
export type JobCategory =
'Software Development' |
'Data' |
'AI/ML' |
'Web Development' |
'Cloud' |
'Cybersecurity';

export interface Company {
  name: string;
  industry: string;
  size: string;
  founded: number;
  headquarters: string;
  about: string;
  benefits: string[];
  color: string;
}

/** A job posting exactly as it arrives from source feeds — messy, inconsistent, sometimes incomplete. */
export interface RawJob {
  job_id: string;
  job_title: string;
  company: string;
  category: string;
  job_description: string | null;
  responsibilities?: string[];
  required_skills: string[];
  preferred_skills?: string[];
  location: string;
  work_mode: string;
  experience_level?: string | null;
  experience_min: number;
  experience_max: number;
  salary_min: number | null;
  salary_max: number | null;
  employment_type?: string;
  industry?: string | null;
  education?: string | null;
  posted_days_ago: number;
}

/** A cleaned, standardized job record produced by the preprocessing pipeline. */
export interface Job {
  job_id: string;
  job_title: string;
  company: string;
  category: JobCategory;
  job_description: string;
  responsibilities: string[];
  required_skills: string[];
  preferred_skills: string[];
  location: string;
  work_mode: WorkMode;
  experience_level: ExperienceLevel;
  experience_min: number;
  experience_max: number;
  salary_min: number;
  salary_max: number;
  salary_imputed: boolean;
  employment_type: EmploymentType;
  industry: string;
  education: string;
  posted_date: string;
  posted_days_ago: number;
  company_info: Company;
}