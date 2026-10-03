import type { EmploymentType, WorkMode } from './job';

export type CandidateLevel = 'Student' | 'Fresher' | 'Entry Level' | 'Mid Level' | 'Experienced';
export type Visibility = 'Public' | 'Recruiters only' | 'Private';
export type Role = 'candidate' | 'admin';

export interface Education {
  degree: string;
  institution: string;
  field: string;
  graduation_year: string;
}

export interface WorkExperience {
  id: string;
  title: string;
  company: string;
  period: string;
  description: string;
}

export interface NotificationPrefs {
  recommendations: boolean;
  alerts: boolean;
  applications: boolean;
  savedSearches: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  photo: string;
  headline: string;
  about: string;
  location: string;
  skills: string[];
  education: Education;
  experience_level: CandidateLevel;
  years_experience: number;
  experience: WorkExperience[];
  preferred_roles: string[];
  preferred_locations: string[];
  salary_expectation: number;
  work_modes: WorkMode[];
  employment_types: EmploymentType[];
  career_interests: string[];
  open_to_work: boolean;
  visibility: Visibility;
  notifications: NotificationPrefs;
}

export interface Account {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  onboarded: boolean;
  createdAt: number;
  profile: UserProfile;
}

export type SessionUser = Omit<Account, 'password' | 'profile'>;