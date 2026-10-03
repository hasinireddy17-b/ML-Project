import type { EmploymentType, ExperienceLevel, JobCategory, WorkMode } from '../types/job';
import type { CandidateLevel } from '../types/user';

export const canonicalSkills: string[] = [
'Python', 'Java', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL', 'PostgreSQL', 'MongoDB',
'Machine Learning', 'Deep Learning', 'NLP', 'PyTorch', 'Scikit-learn', 'Pandas', 'Statistics',
'Excel', 'Power BI', 'Tableau', 'AWS', 'Azure', 'Docker', 'Kubernetes', 'Terraform', 'Linux',
'CI/CD', 'Go', 'Kotlin', 'Android', 'Spring Boot', 'Django', 'REST APIs', 'Microservices', 'Kafka',
'Redis', 'Spark', 'Airflow', 'dbt', 'Data Modeling', 'HTML', 'CSS', 'Next.js', 'Redux', 'Testing',
'Selenium', 'Git', 'Data Structures', 'Network Security', 'SIEM', 'Incident Response',
'Cloud Security', 'IAM', 'Penetration Testing', 'Burp Suite', 'Networking', 'PowerShell',
'Prometheus', 'MLOps', 'Transformers', 'LLMs', 'OpenCV', 'C++', 'Firebase', 'Figma', 'WebGL',
'Unity', 'C#'];


export const popularSkills: string[] = [
'Python', 'Java', 'JavaScript', 'React', 'SQL', 'Machine Learning', 'AWS', 'Docker'];


export const skillAliases: Record<string, string> = {
  js: 'JavaScript',
  ts: 'TypeScript',
  ml: 'Machine Learning',
  dl: 'Deep Learning',
  k8s: 'Kubernetes',
  postgres: 'PostgreSQL',
  nodejs: 'Node.js',
  node: 'Node.js',
  sklearn: 'Scikit-learn',
  reactjs: 'React',
  golang: 'Go',
  powerbi: 'Power BI',
  springboot: 'Spring Boot',
  'rest api': 'REST APIs'
};

export const locations: string[] = ['Bengaluru', 'Hyderabad', 'Pune', 'Chennai', 'Mumbai', 'Delhi NCR', 'Remote'];

export const locationAliases: Record<string, string> = {
  bangalore: 'Bengaluru',
  bengaluru: 'Bengaluru',
  blr: 'Bengaluru',
  hyderabad: 'Hyderabad',
  hyd: 'Hyderabad',
  pune: 'Pune',
  chennai: 'Chennai',
  madras: 'Chennai',
  mumbai: 'Mumbai',
  bombay: 'Mumbai',
  delhi: 'Delhi NCR',
  'new delhi': 'Delhi NCR',
  gurgaon: 'Delhi NCR',
  gurugram: 'Delhi NCR',
  noida: 'Delhi NCR',
  'delhi ncr': 'Delhi NCR',
  ncr: 'Delhi NCR',
  remote: 'Remote'
};

export const roles: string[] = [
'Software Engineer', 'Backend Developer', 'Frontend Developer', 'Full Stack Developer',
'Data Analyst', 'Data Scientist', 'Data Engineer', 'Machine Learning Engineer', 'NLP Engineer',
'Cloud Engineer', 'DevOps Engineer', 'Security Analyst', 'Android Developer',
'QA Automation Engineer', 'Business Intelligence Analyst'];


export const jobCategories: JobCategory[] = [
'Software Development', 'Data', 'AI/ML', 'Web Development', 'Cloud', 'Cybersecurity'];


export const workModes: WorkMode[] = ['Remote', 'Hybrid', 'On-site'];
export const employmentTypes: EmploymentType[] = ['Full-time', 'Part-time', 'Contract', 'Internship'];
export const experienceLevels: ExperienceLevel[] = ['Internship', 'Entry Level', 'Mid Level', 'Senior'];

export const candidateLevels: {value: CandidateLevel;description: string;years: number;}[] = [
{ value: 'Student', description: 'Currently studying, looking for internships', years: 0 },
{ value: 'Fresher', description: 'Recently graduated, starting my career', years: 0 },
{ value: 'Entry Level', description: 'Up to 2 years of work experience', years: 1 },
{ value: 'Mid Level', description: '2–5 years of work experience', years: 3 },
{ value: 'Experienced', description: '5+ years, leading work independently', years: 6 }];