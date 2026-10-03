import type { Account } from '../types/user';
import type { ActivityState } from '../types/activity';

export const DEMO_ACCOUNT_ID = 'acct-demo';
export const DEMO_EMAIL = 'aarav@demo.jobs';
export const DEMO_PASSWORD = 'demo1234';

export const demoAccount: Account = {
  id: DEMO_ACCOUNT_ID,
  name: 'Aarav Mehta',
  email: DEMO_EMAIL,
  password: DEMO_PASSWORD,
  role: 'admin',
  onboarded: true,
  createdAt: new Date('2026-08-02').getTime(),
  profile: {
    name: 'Aarav Mehta',
    email: DEMO_EMAIL,
    phone: '',
    photo: '',
    headline: 'Software engineer · Python, SQL & applied ML',
    about: '',
    location: 'Hyderabad',
    skills: ['Python', 'SQL', 'Machine Learning', 'Pandas', 'AWS', 'Docker', 'Java', 'Git'],
    education: { degree: 'B.Tech', institution: 'JNTU Hyderabad', field: 'Computer Science', graduation_year: '2024' },
    experience_level: 'Entry Level',
    years_experience: 1,
    experience: [
    {
      id: 'exp-1',
      title: 'Associate Software Engineer',
      company: 'Brightline Services',
      period: 'Jul 2024 – Present',
      description: 'Build Python data services and internal dashboards; automated weekly reporting with SQL and Pandas.'
    },
    {
      id: 'exp-2',
      title: 'ML Intern',
      company: 'Openfield Analytics',
      period: 'Jan 2024 – Jun 2024',
      description: 'Trained churn models with Scikit-learn and presented results to the product team.'
    }],

    preferred_roles: ['Software Engineer', 'Machine Learning Engineer', 'Data Scientist', 'Backend Developer'],
    preferred_locations: ['Hyderabad', 'Bengaluru'],
    salary_expectation: 9,
    work_modes: ['Hybrid', 'Remote'],
    employment_types: ['Full-time'],
    career_interests: ['Software Development', 'AI/ML', 'Data'],
    open_to_work: true,
    visibility: 'Recruiters only',
    notifications: { recommendations: true, alerts: true, applications: true, savedSearches: true }
  }
};

const DAY = 86_400_000;

export function createDemoActivity(): ActivityState {
  const now = Date.now();
  return {
    saved: [
    { job_id: 'j008', saved_at: now - 3 * DAY },
    { job_id: 'j016', saved_at: now - 1 * DAY }],

    applications: [
    {
      id: 'app-1',
      job_id: 'j001',
      applied_at: now - 12 * DAY,
      status: 'Interview',
      history: [
      { status: 'Applied', at: now - 12 * DAY },
      { status: 'Under Review', at: now - 9 * DAY },
      { status: 'Shortlisted', at: now - 6 * DAY },
      { status: 'Interview', at: now - 2 * DAY }]

    },
    {
      id: 'app-2',
      job_id: 'j006',
      applied_at: now - 5 * DAY,
      status: 'Under Review',
      history: [
      { status: 'Applied', at: now - 5 * DAY },
      { status: 'Under Review', at: now - 3 * DAY }]

    },
    {
      id: 'app-3',
      job_id: 'j019',
      applied_at: now - 20 * DAY,
      status: 'Rejected',
      history: [
      { status: 'Applied', at: now - 20 * DAY },
      { status: 'Under Review', at: now - 16 * DAY },
      { status: 'Rejected', at: now - 11 * DAY }]

    }],

    alerts: [
    { id: 'alert-1', name: 'Python Jobs in Hyderabad', role: 'Python Developer', skills: ['Python'], location: 'Hyderabad', work_mode: 'Any', experience: 'Any', frequency: 'Daily', active: true, created_at: now - 14 * DAY },
    { id: 'alert-2', name: 'Remote ML roles', role: 'Machine Learning', skills: ['Machine Learning'], location: 'Any', work_mode: 'Remote', experience: 'Any', frequency: 'Weekly', active: true, created_at: now - 8 * DAY }],

    interactions: [
    { type: 'search', query: 'python developer', at: now - 4 * DAY },
    { type: 'view', job_id: 'j008', at: now - 3 * DAY },
    { type: 'save', job_id: 'j008', at: now - 3 * DAY },
    { type: 'view', job_id: 'j009', at: now - 2 * DAY },
    { type: 'view', job_id: 'j023', at: now - 2 * DAY },
    { type: 'search', query: 'machine learning jobs', at: now - 2 * DAY },
    { type: 'view', job_id: 'j016', at: now - 1 * DAY },
    { type: 'save', job_id: 'j016', at: now - 1 * DAY }],

    notifications: [
    { id: 'n-1', kind: 'match', title: '5 new jobs match your Python Developer preferences', body: 'Including roles at Lumen Pay and Stackline Systems.', at: now - 3 * 3_600_000, read: false, link: '/search?q=python%20developer' },
    { id: 'n-2', kind: 'application', title: 'Your application status changed', body: 'Northwind Labs moved your Software Engineer application to Interview.', at: now - 2 * DAY, read: false, link: '/applications' },
    { id: 'n-3', kind: 'similar', title: '3 jobs similar to your saved jobs were added', body: 'Based on Data Scientist at Tessellate AI.', at: now - 3 * DAY, read: true, link: '/' },
    { id: 'n-4', kind: 'alert', title: 'Weekly digest: Remote ML roles', body: '2 new remote machine learning roles this week.', at: now - 6 * DAY, read: true, link: '/alerts' }],

    searchHistory: [
    { query: 'machine learning jobs', at: now - 2 * DAY, results: 7 },
    { query: 'python developer', at: now - 4 * DAY, results: 6 },
    { query: 'data analyst hyderabad', at: now - 6 * DAY, results: 2 }],

    compare: []
  };
}

export function createEmptyActivity(): ActivityState {
  return {
    saved: [],
    applications: [],
    alerts: [],
    interactions: [],
    notifications: [
    {
      id: 'n-welcome',
      kind: 'system',
      title: 'Your job feed is ready',
      body: 'We’ll keep refining it as you search, save, and apply.',
      at: Date.now(),
      read: false,
      link: '/'
    }],

    searchHistory: [],
    compare: []
  };
}