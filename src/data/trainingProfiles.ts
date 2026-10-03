import type { UserProfile } from '../types/user';

const base: UserProfile = {
  name: '',
  email: '',
  phone: '',
  photo: '',
  headline: '',
  about: '',
  location: '',
  skills: [],
  education: { degree: 'B.Tech', institution: '', field: 'Computer Science', graduation_year: '2024' },
  experience_level: 'Entry Level',
  years_experience: 1,
  experience: [],
  preferred_roles: [],
  preferred_locations: [],
  salary_expectation: 0,
  work_modes: [],
  employment_types: ['Full-time'],
  career_interests: [],
  open_to_work: true,
  visibility: 'Public',
  notifications: { recommendations: true, alerts: true, applications: true, savedSearches: true }
};

/** Synthetic candidate personas used to build offline training/evaluation pairs. */
export const trainingProfiles: UserProfile[] = [
{ ...base, name: 'Persona · Data analyst', headline: 'Data analyst', skills: ['SQL', 'Excel', 'Power BI', 'Python', 'Tableau'], preferred_roles: ['Data Analyst', 'Business Intelligence Analyst'], preferred_locations: ['Hyderabad', 'Delhi NCR'], work_modes: ['Hybrid'], career_interests: ['Data'], salary_expectation: 7, years_experience: 1 },
{ ...base, name: 'Persona · Backend Java', headline: 'Java backend engineer', skills: ['Java', 'Spring Boot', 'SQL', 'Microservices', 'Kafka', 'REST APIs'], preferred_roles: ['Backend Developer', 'Software Engineer'], preferred_locations: ['Bengaluru', 'Chennai', 'Pune'], work_modes: ['Hybrid', 'On-site'], career_interests: ['Software Development'], salary_expectation: 15, experience_level: 'Mid Level', years_experience: 3 },
{ ...base, name: 'Persona · ML engineer', headline: 'Machine learning engineer', skills: ['Python', 'Machine Learning', 'PyTorch', 'Pandas', 'Docker', 'Deep Learning'], preferred_roles: ['Machine Learning Engineer', 'Data Scientist'], preferred_locations: ['Bengaluru', 'Hyderabad'], work_modes: ['Hybrid', 'Remote'], career_interests: ['AI/ML', 'Data'], salary_expectation: 20, experience_level: 'Mid Level', years_experience: 3 },
{ ...base, name: 'Persona · Frontend', headline: 'Frontend developer', skills: ['React', 'JavaScript', 'TypeScript', 'CSS', 'HTML'], preferred_roles: ['Frontend Developer', 'Full Stack Developer'], preferred_locations: ['Pune', 'Bengaluru'], work_modes: ['Remote', 'Hybrid'], career_interests: ['Web Development'], salary_expectation: 10, years_experience: 2 },
{ ...base, name: 'Persona · Cloud', headline: 'Cloud and DevOps engineer', skills: ['AWS', 'Docker', 'Kubernetes', 'Linux', 'Terraform', 'CI/CD'], preferred_roles: ['Cloud Engineer', 'DevOps Engineer'], preferred_locations: ['Hyderabad', 'Pune'], work_modes: ['Hybrid'], career_interests: ['Cloud'], salary_expectation: 12, years_experience: 2 },
{ ...base, name: 'Persona · Security fresher', headline: 'Aspiring security analyst', skills: ['Linux', 'Network Security', 'Python', 'Networking'], preferred_roles: ['Security Analyst'], preferred_locations: ['Hyderabad', 'Mumbai'], work_modes: ['On-site', 'Hybrid'], career_interests: ['Cybersecurity'], salary_expectation: 6, experience_level: 'Fresher', years_experience: 0 }];