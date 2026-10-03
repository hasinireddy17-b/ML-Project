import type { ExperienceLevel, WorkMode } from './job';

export type InteractionType = 'view' | 'click' | 'save' | 'apply' | 'dismiss' | 'search' | 'similar_open';

export interface Interaction {
  type: InteractionType;
  job_id?: string;
  query?: string;
  at: number;
}

export type ApplicationStatus =
'Applied' |
'Under Review' |
'Shortlisted' |
'Interview' |
'Offer' |
'Rejected';

export interface Application {
  id: string;
  job_id: string;
  applied_at: number;
  status: ApplicationStatus;
  history: {status: ApplicationStatus;at: number;}[];
}

export interface SavedJob {
  job_id: string;
  saved_at: number;
}

export type AlertFrequency = 'Daily' | 'Weekly';

export interface JobAlert {
  id: string;
  name: string;
  role: string;
  skills: string[];
  location: string;
  work_mode: WorkMode | 'Any';
  experience: ExperienceLevel | 'Any';
  frequency: AlertFrequency;
  active: boolean;
  created_at: number;
}

export type NotificationKind = 'match' | 'application' | 'similar' | 'alert' | 'system';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  at: number;
  read: boolean;
  link?: string;
}

export interface SearchHistoryItem {
  query: string;
  at: number;
  results: number;
}

export interface ActivityState {
  saved: SavedJob[];
  applications: Application[];
  alerts: JobAlert[];
  interactions: Interaction[];
  notifications: AppNotification[];
  searchHistory: SearchHistoryItem[];
  compare: string[];
}