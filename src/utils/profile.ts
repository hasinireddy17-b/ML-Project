import type { UserProfile } from '../types/user';

export type SettingsSection = 'account' | 'profile' | 'preferences' | 'notifications' | 'privacy' | 'security';

export interface ProfileCheck {
  key: string;
  label: string;
  hint: string;
  done: boolean;
  weight: number;
  section: SettingsSection;
}

export function createEmptyProfile(name: string, email: string): UserProfile {
  return {
    name,
    email,
    phone: '',
    photo: '',
    headline: '',
    about: '',
    location: '',
    skills: [],
    education: { degree: '', institution: '', field: '', graduation_year: '' },
    experience_level: 'Fresher',
    years_experience: 0,
    experience: [],
    preferred_roles: [],
    preferred_locations: [],
    salary_expectation: 0,
    work_modes: [],
    employment_types: ['Full-time'],
    career_interests: [],
    open_to_work: true,
    visibility: 'Recruiters only',
    notifications: { recommendations: true, alerts: true, applications: true, savedSearches: false }
  };
}

export function profileChecks(p: UserProfile): ProfileCheck[] {
  return [
  { key: 'photo', label: 'Add a profile photo', hint: 'Profiles with a photo are easier for recruiters to recognize.', done: !!p.photo, weight: 5, section: 'profile' },
  { key: 'headline', label: 'Write a headline', hint: 'A clear headline helps us understand the roles you want.', done: p.headline.trim().length > 3, weight: 10, section: 'profile' },
  { key: 'about', label: 'Add an About section', hint: 'A short summary sharpens matching for role descriptions.', done: p.about.trim().length > 40, weight: 10, section: 'profile' },
  { key: 'skills', label: 'List at least 5 skills', hint: 'Skills are the strongest signal in your matches.', done: p.skills.length >= 5, weight: 20, section: 'profile' },
  { key: 'education', label: 'Add your education', hint: 'Some roles ask for specific degrees.', done: !!(p.education.degree && p.education.institution), weight: 10, section: 'profile' },
  { key: 'experience', label: 'Add work experience', hint: 'Internships and projects count too.', done: p.experience.length > 0, weight: 15, section: 'profile' },
  { key: 'roles', label: 'Choose preferred roles', hint: 'Tells us which job titles to prioritize.', done: p.preferred_roles.length > 0, weight: 10, section: 'preferences' },
  { key: 'locations', label: 'Choose preferred locations', hint: 'Helps us surface jobs where you want to work.', done: p.preferred_locations.length > 0, weight: 10, section: 'preferences' },
  { key: 'salary', label: 'Set a salary expectation', hint: 'Lets us flag roles below your range.', done: p.salary_expectation > 0, weight: 5, section: 'preferences' },
  { key: 'phone', label: 'Add a phone number', hint: 'Recruiters sometimes prefer a quick call.', done: !!p.phone, weight: 5, section: 'account' }];

}

export function profileCompletion(p: UserProfile): number {
  return profileChecks(p).reduce((s, c) => s + (c.done ? c.weight : 0), 0);
}