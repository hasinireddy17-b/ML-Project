import type { RawJob } from '../types/job';

/**
 * Raw job postings as ingested from partner feeds. Intentionally inconsistent:
 * mixed casing, location aliases, skill abbreviations, missing values, a duplicate,
 * and a couple of suspicious records — the preprocessing pipeline cleans all of this.
 */
export const rawJobs: RawJob[] = [
{
  job_id: 'j001', job_title: 'Software Engineer', company: 'Northwind Labs', category: 'Software Development',
  job_description: "Join the platform team building the workflow engine behind Northwind's project-management suite. You'll ship backend services in Python and Java, own features end to end, and work closely with product and design.",
  responsibilities: ['Design and build REST services used by 40,000+ teams', 'Write well-tested Python and Java code and review teammates’ changes', 'Improve reliability and performance of AWS-hosted services'],
  required_skills: ['Python', 'Java', 'SQL', 'AWS'], preferred_skills: ['Docker', 'REST APIs'],
  location: 'Hyderabad', work_mode: 'Hybrid', experience_level: 'Entry Level', experience_min: 1, experience_max: 2,
  salary_min: 8, salary_max: 14, employment_type: 'Full-time', education: 'B.Tech / B.E. in Computer Science or related field', posted_days_ago: 2
},
{
  job_id: 'j002', job_title: 'Backend Developer', company: 'Stackline Systems', category: 'Software Development',
  job_description: 'Build high-throughput integration services that move millions of transactions a day between enterprise systems. You will work on Java microservices, event streaming, and API design.',
  responsibilities: ['Develop Spring Boot microservices with clear API contracts', 'Design SQL schemas and optimize queries under load', 'Participate in on-call rotation for services you own'],
  required_skills: ['Java', 'Spring Boot', 'SQL', 'REST APIs', 'Microservices'], preferred_skills: ['Kafka', 'Docker'],
  location: 'Bangalore', work_mode: 'Hybrid', experience_level: 'Mid Level', experience_min: 2, experience_max: 4,
  salary_min: 14, salary_max: 22, employment_type: 'Full-time', education: 'B.Tech / B.E. or equivalent experience', posted_days_ago: 5
},
{
  job_id: 'j003', job_title: 'Python Backend Developer', company: 'Lumen Pay', category: 'Software Development',
  job_description: 'Build the merchant settlement and reconciliation services behind Lumen Pay. You will write Django services that handle money movement, so correctness and clear code matter more than speed.',
  responsibilities: ['Build Django services for settlements and payouts', 'Model financial data in PostgreSQL with strong consistency', 'Write thorough tests for every money-moving code path'],
  required_skills: ['Python', 'Django', 'postgres', 'REST APIs'], preferred_skills: ['Redis', 'Docker'],
  location: 'hyderabad', work_mode: 'onsite', experience_level: 'Entry Level', experience_min: 1, experience_max: 3,
  salary_min: 10, salary_max: 16, employment_type: 'Full-time', education: 'B.Tech / B.E. in Computer Science or related field', posted_days_ago: 1
},
{
  job_id: 'j004', job_title: 'Node.js Backend Developer', company: 'Harbor Commerce', category: 'Software Development',
  job_description: 'Own the order and inventory APIs that power checkout for 20,000 sellers. You will build Node.js services, improve API latency, and help migrate legacy endpoints to TypeScript.',
  responsibilities: ['Build and maintain Node.js order and inventory APIs', 'Reduce p95 latency on high-traffic endpoints', 'Migrate legacy JavaScript services to TypeScript'],
  required_skills: ['nodejs', 'js', 'MongoDB', 'REST APIs'], preferred_skills: ['TypeScript', 'AWS'],
  location: 'pune ', work_mode: 'remote', experience_level: 'Mid Level', experience_min: 2, experience_max: 5,
  salary_min: 12, salary_max: 20, employment_type: 'Full-time', education: 'Any bachelor’s degree', posted_days_ago: 3
},
{
  job_id: 'j005', job_title: 'Java Backend Developer', company: 'Meridian Bank Digital', category: 'Software Development',
  job_description: 'Modernize core banking services used by 12 million customers. You will break down monolithic Java systems into well-tested microservices with strong security and audit requirements.',
  responsibilities: ['Decompose legacy banking modules into Spring Boot services', 'Implement secure, auditable transaction flows', 'Work with QA and security teams on release readiness'],
  required_skills: ['Java', 'Spring Boot', 'Microservices', 'SQL'], preferred_skills: ['Kafka', 'k8s'],
  location: 'Chennai', work_mode: 'On-site', experience_level: 'Mid Level', experience_min: 3, experience_max: 5,
  salary_min: 12, salary_max: 19, employment_type: 'Full-time', education: 'B.Tech / B.E. / MCA', posted_days_ago: 8
},
{
  job_id: 'j006', job_title: 'Data Analyst', company: 'Kestrel Analytics', category: 'Data',
  job_description: 'Help retail brands understand what drives sales. You will write SQL, build Power BI dashboards, and present clear recommendations to client teams every week.',
  responsibilities: ['Write SQL to analyze sales, pricing, and promotions data', 'Build and maintain Power BI dashboards for clients', 'Present findings and recommendations to client stakeholders'],
  required_skills: ['SQL', 'Excel', 'Python', 'powerbi'], preferred_skills: ['Tableau', 'Statistics'],
  location: 'Hyderabad', work_mode: 'Hybrid', experience_level: 'Entry Level', experience_min: 0, experience_max: 2,
  salary_min: 6, salary_max: 10, employment_type: 'Full-time', education: 'Bachelor’s degree in a quantitative field', posted_days_ago: 1
},
{
  job_id: 'j006b', job_title: 'data analyst', company: 'Kestrel Analytics', category: 'data',
  job_description: 'Help retail brands understand what drives sales. You will write SQL, build Power BI dashboards, and present clear recommendations to client teams every week.',
  responsibilities: [], required_skills: ['SQL', 'Excel', 'Python'], preferred_skills: [],
  location: 'hyderabad', work_mode: 'hybrid', experience_level: null, experience_min: 0, experience_max: 2,
  salary_min: 6, salary_max: 10, employment_type: 'Full-time', education: null, posted_days_ago: 1
},
{
  job_id: 'j007', job_title: 'Junior Data Analyst', company: 'Arcadia Health', category: 'Data',
  job_description: 'Support hospital operations teams with reporting on patient flow, bed occupancy, and turnaround times. A great first role for someone who loves clean data and clear charts.',
  responsibilities: ['Maintain weekly operational reports in Tableau', 'Clean and validate hospital operations data', 'Answer ad-hoc questions from operations managers'],
  required_skills: ['SQL', 'Excel', 'Tableau'], preferred_skills: ['Python'],
  location: 'Bengaluru', work_mode: 'On-site', experience_level: 'Entry Level', experience_min: 0, experience_max: 1,
  salary_min: 5, salary_max: 8, employment_type: 'Full-time', education: 'Any bachelor’s degree', posted_days_ago: 4
},
{
  job_id: 'j008', job_title: 'Data Scientist', company: 'Tessellate AI', category: 'AI/ML',
  job_description: 'Build forecasting and classification models for insurance and logistics clients. You will own problems from data exploration through model evaluation and handoff to engineering.',
  responsibilities: ['Explore client datasets and frame modeling problems', 'Train and evaluate models with Scikit-learn and Pandas', 'Communicate model results and trade-offs to clients'],
  required_skills: ['Python', 'Machine Learning', 'Pandas', 'sklearn', 'SQL'], preferred_skills: ['Deep Learning', 'Statistics'],
  location: 'Bengaluru', work_mode: 'Hybrid', experience_level: 'Mid Level', experience_min: 2, experience_max: 4,
  salary_min: 18, salary_max: 28, employment_type: 'Full-time', education: 'B.Tech / M.Tech / M.Sc in a quantitative field', posted_days_ago: 2
},
{
  job_id: 'j009', job_title: 'Machine Learning Engineer', company: 'Tessellate AI', category: 'AI/ML',
  job_description: 'Take document-understanding models from research notebooks to production. You will build training pipelines, serve models behind APIs, and monitor them in the wild.',
  responsibilities: ['Build reproducible training and evaluation pipelines', 'Package and serve PyTorch models with Docker', 'Set up monitoring for model quality and drift'],
  required_skills: ['Python', 'ml', 'PyTorch', 'Docker', 'MLOps'], preferred_skills: ['Kubernetes', 'AWS'],
  location: 'Hyderabad', work_mode: 'Hybrid', experience_level: 'Mid Level', experience_min: 2, experience_max: 5,
  salary_min: 20, salary_max: 32, employment_type: 'Full-time', education: 'B.Tech / M.Tech in Computer Science or related', posted_days_ago: 6
},
{
  job_id: 'j010', job_title: 'Machine Learning Intern', company: 'Quill Learning', category: 'AI/ML',
  job_description: 'Spend six months helping build the recommendation models that suggest the next lesson for three million students. You will work alongside senior ML engineers on real production problems.',
  responsibilities: ['Prepare and analyze student learning data', 'Prototype recommendation models in Python', 'Present experiment results to the ML team'],
  required_skills: ['Python', 'Machine Learning', 'Pandas'], preferred_skills: ['NLP'],
  location: 'Remote', work_mode: 'Remote', experience_level: 'Internship', experience_min: 0, experience_max: 0,
  salary_min: 3, salary_max: 5, employment_type: 'Internship', education: 'Pursuing B.Tech / M.Tech / M.Sc', posted_days_ago: 3
},
{
  job_id: 'j011', job_title: 'NLP Engineer', company: 'Fernway Media', category: 'AI/ML',
  job_description: 'Build language models that summarize, translate, and tag news content across nine Indian languages. You will fine-tune transformer models and ship them into editorial tools.',
  responsibilities: ['Fine-tune transformer models for Indic languages', 'Build evaluation sets with the editorial team', 'Deploy models into newsroom tools'],
  required_skills: ['Python', 'NLP', 'PyTorch', 'Transformers'], preferred_skills: ['LLMs', 'AWS'],
  location: 'Mumbai', work_mode: 'Remote', experience_level: 'Mid Level', experience_min: 3, experience_max: 5,
  salary_min: 22, salary_max: 34, employment_type: 'Full-time', education: 'M.Tech / M.Sc or equivalent research experience', posted_days_ago: 10
},
{
  job_id: 'j012', job_title: 'Frontend Developer', company: 'Northwind Labs', category: 'Web Development',
  job_description: 'Craft the interfaces people use all day to plan their work. You will build accessible React components, shape our design system, and care about performance.',
  responsibilities: ['Build accessible, performant React interfaces', 'Contribute to the shared component library', 'Partner with designers on interaction details'],
  required_skills: ['React', 'JavaScript', 'TypeScript', 'CSS'], preferred_skills: ['Next.js', 'Testing'],
  location: 'Bangalore', work_mode: 'Hybrid', experience_level: 'Entry Level', experience_min: 1, experience_max: 3,
  salary_min: 9, salary_max: 15, employment_type: 'Full-time', education: 'Any bachelor’s degree', posted_days_ago: 2
},
{
  job_id: 'j013', job_title: 'React Developer', company: 'Quill Learning', category: 'Web Development',
  job_description: 'Build the student-facing learning app used daily by millions. You will turn designs into delightful, fast React screens that work well on low-end devices.',
  responsibilities: ['Implement new learning experiences in React', 'Optimize bundle size and runtime performance', 'Write component tests for critical flows'],
  required_skills: ['react', 'js', 'html', 'css'], preferred_skills: ['Redux', 'TypeScript'],
  location: 'Pune', work_mode: 'Remote', experience_level: 'Entry Level', experience_min: 1, experience_max: 2,
  salary_min: 7, salary_max: 12, employment_type: 'Full-time', education: 'Any bachelor’s degree', posted_days_ago: 1
},
{
  job_id: 'j014', job_title: 'Full Stack Developer', company: 'Harbor Commerce', category: 'Web Development',
  job_description: 'Build seller tools end to end — from React dashboards to Node.js APIs. You will ship features that help small businesses manage listings, orders, and payouts.',
  responsibilities: ['Ship seller-dashboard features across frontend and backend', 'Design APIs with the mobile team', 'Own feature quality from spec to release'],
  required_skills: ['React', 'Node.js', 'TypeScript', 'MongoDB'], preferred_skills: ['AWS', 'Docker'],
  location: 'Hyderabad', work_mode: 'Hybrid', experience_level: 'Mid Level', experience_min: 2, experience_max: 4,
  salary_min: 14, salary_max: 22, employment_type: 'Full-time', education: 'Any bachelor’s degree', posted_days_ago: 7
},
{
  job_id: 'j015', job_title: 'UI Engineer', company: 'Parallax Games', category: 'Web Development',
  job_description: 'Build the web launcher, storefront, and in-game overlays for our strategy titles. You will blend engineering rigor with a strong eye for motion and detail.',
  responsibilities: ['Build performant game UI and storefront screens', 'Prototype interactions with designers', 'Maintain a shared UI toolkit'],
  required_skills: ['JavaScript', 'TypeScript', 'React', 'CSS'], preferred_skills: ['WebGL', 'Figma'],
  location: 'Mumbai', work_mode: 'On-site', experience_level: 'Mid Level', experience_min: 3, experience_max: 6,
  salary_min: 16, salary_max: 24, employment_type: 'Full-time', education: 'Any bachelor’s degree', posted_days_ago: 12
},
{
  job_id: 'j016', job_title: 'Cloud Engineer', company: 'Cobalt Cloud', category: 'Cloud',
  job_description: 'Help mid-size companies move to the cloud safely. You will provision AWS infrastructure with Terraform, containerize applications, and support migrations.',
  responsibilities: ['Provision AWS infrastructure as code with Terraform', 'Containerize client applications with Docker', 'Support cutover and post-migration monitoring'],
  required_skills: ['AWS', 'Linux', 'Terraform', 'Docker'], preferred_skills: ['Python', 'Kubernetes'],
  location: 'Hyderabad', work_mode: 'hybrid', experience_level: 'Entry Level', experience_min: 1, experience_max: 3,
  salary_min: 10, salary_max: 16, employment_type: 'Full-time', education: 'B.Tech / B.E. or cloud certification', posted_days_ago: 3
},
{
  job_id: 'j017', job_title: 'DevOps Engineer', company: 'Stackline Systems', category: 'Cloud',
  job_description: 'Own the build, release, and runtime platform for 60 engineering teams. You will run Kubernetes clusters, improve CI/CD pipelines, and make deployments boring.',
  responsibilities: ['Operate and upgrade Kubernetes clusters', 'Speed up CI/CD pipelines across teams', 'Build self-service deployment tooling'],
  required_skills: ['Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Linux'], preferred_skills: ['Terraform', 'Python'],
  location: 'Pune', work_mode: 'Hybrid', experience_level: 'Mid Level', experience_min: 2, experience_max: 5,
  salary_min: 14, salary_max: 24, employment_type: 'Full-time', education: 'B.Tech / B.E. or equivalent experience', posted_days_ago: 4
},
{
  job_id: 'j018', job_title: 'Site Reliability Engineer', company: 'Lumen Pay', category: 'Cloud',
  job_description: 'Keep payments flowing at 99.99% availability. You will lead incident response, define SLOs, and build the observability that tells us about problems before merchants do.',
  responsibilities: ['Define and track SLOs for payment services', 'Lead incident response and blameless postmortems', 'Build observability with Prometheus and Grafana'],
  required_skills: ['Kubernetes', 'Linux', 'Go', 'Prometheus', 'AWS'], preferred_skills: ['Terraform'],
  location: 'Bengaluru', work_mode: 'On-site', experience_level: 'Senior', experience_min: 5, experience_max: 8,
  salary_min: 30, salary_max: 45, employment_type: 'Full-time', education: 'B.Tech / B.E. or equivalent experience', posted_days_ago: 9
},
{
  job_id: 'j019', job_title: 'Azure Cloud Associate', company: 'Meridian Bank Digital', category: 'Cloud',
  job_description: 'Start your cloud career supporting Azure workloads for a large bank. You will handle provisioning requests, monitor environments, and learn from senior cloud architects.',
  responsibilities: ['Handle Azure provisioning and access requests', 'Monitor environments and escalate issues', 'Document runbooks and standard procedures'],
  required_skills: ['Azure', 'Linux', 'Networking'], preferred_skills: ['PowerShell'],
  location: 'Gurgaon', work_mode: 'On-site', experience_level: 'Entry Level', experience_min: 0, experience_max: 2,
  salary_min: 6, salary_max: 10, employment_type: 'Full-time', education: 'B.Tech / B.E. / B.Sc IT', posted_days_ago: 14
},
{
  job_id: 'j020', job_title: 'Security Analyst', company: 'Sentinel Shield', category: 'Cybersecurity',
  job_description: 'Defend banks and hospitals from real attacks as part of our 24/7 security operations center. You will triage alerts, investigate incidents, and tune detections.',
  responsibilities: ['Triage and investigate SIEM alerts', 'Document and escalate security incidents', 'Tune detection rules to reduce noise'],
  required_skills: ['Network Security', 'SIEM', 'Linux', 'Incident Response'], preferred_skills: ['Python'],
  location: 'Hyderabad', work_mode: 'On-site', experience_level: 'Entry Level', experience_min: 1, experience_max: 3,
  salary_min: 8, salary_max: 13, employment_type: 'Full-time', education: 'B.Tech / B.Sc with security certification preferred', posted_days_ago: 2
},
{
  job_id: 'j021', job_title: 'Cloud Security Engineer', company: 'Sentinel Shield', category: 'Cybersecurity',
  job_description: 'Secure client AWS environments by design. You will review architectures, harden IAM policies, and automate security guardrails as code.',
  responsibilities: ['Review cloud architectures for security risks', 'Harden IAM policies and network boundaries', 'Automate guardrails with Python and Terraform'],
  required_skills: ['AWS', 'Cloud Security', 'IAM', 'Python'], preferred_skills: ['Terraform', 'Kubernetes'],
  location: 'Bengaluru', work_mode: 'Hybrid', experience_level: 'Mid Level', experience_min: 3, experience_max: 6,
  salary_min: 20, salary_max: 30, employment_type: 'Full-time', education: 'B.Tech / B.E. or equivalent experience', posted_days_ago: 5
},
{
  job_id: 'j022', job_title: 'Penetration Tester', company: 'Meridian Bank Digital', category: 'Cybersecurity',
  job_description: 'Find weaknesses before attackers do. You will run authorized tests against web, mobile, and network systems and help teams fix what you find.',
  responsibilities: ['Plan and run penetration tests on bank systems', 'Write clear, prioritized findings reports', 'Verify fixes with engineering teams'],
  required_skills: ['Penetration Testing', 'Network Security', 'Linux', 'Python'], preferred_skills: ['Burp Suite'],
  location: 'Mumbai', work_mode: 'Hybrid', experience_level: 'Mid Level', experience_min: 2, experience_max: 4,
  salary_min: 12, salary_max: 18, employment_type: 'Full-time', education: 'B.Tech with OSCP or equivalent', posted_days_ago: 11
},
{
  job_id: 'j023', job_title: 'Data Engineer', company: 'Kestrel Analytics', category: 'Data',
  job_description: 'Build the pipelines that feed forecasting models and client dashboards. You will design Spark jobs, orchestrate them with Airflow, and keep data fresh and trustworthy.',
  responsibilities: ['Build batch pipelines with Spark and Airflow', 'Model warehouse tables for analytics use', 'Monitor data quality and freshness'],
  required_skills: ['Python', 'SQL', 'Spark', 'Airflow', 'AWS'], preferred_skills: ['Kafka', 'dbt'],
  location: 'Pune', work_mode: 'Remote', experience_level: 'Mid Level', experience_min: 2, experience_max: 5,
  salary_min: 16, salary_max: 26, employment_type: 'Full-time', education: 'B.Tech / B.E. in Computer Science or related', posted_days_ago: 2
},
{
  job_id: 'j024', job_title: 'Business Intelligence Analyst', company: 'Harbor Commerce', category: 'Data',
  job_description: 'Be the go-to analyst for the marketplace growth team. You will build dashboards, define metrics, and run analyses that shape seller and shopper programs.',
  responsibilities: ['Own growth dashboards in Power BI', 'Define and document core marketplace metrics', 'Run deep-dive analyses for leadership'],
  required_skills: ['SQL', 'Power BI', 'Excel', 'Statistics'], preferred_skills: ['Python'],
  location: 'Noida', work_mode: 'Hybrid', experience_level: null, experience_min: 1, experience_max: 3,
  salary_min: 8, salary_max: 12, employment_type: 'Full-time', education: 'Bachelor’s degree in a quantitative field', posted_days_ago: 6
},
{
  job_id: 'j025', job_title: 'Android Developer', company: 'Orbit Mobility', category: 'Software Development',
  job_description: 'Build the rider and driver apps used for millions of EV trips each month. You will write modern Kotlin, improve app reliability, and ship weekly releases.',
  responsibilities: ['Build features in the rider and driver Android apps', 'Improve crash-free sessions and startup time', 'Collaborate with backend teams on API design'],
  required_skills: ['Kotlin', 'Android', 'Java', 'REST APIs'], preferred_skills: ['Firebase'],
  location: 'Bengaluru', work_mode: 'remote', experience_level: 'Entry Level', experience_min: 1, experience_max: 3,
  salary_min: 9, salary_max: 15, employment_type: 'Full-time', education: 'Any bachelor’s degree', posted_days_ago: 3
},
{
  job_id: 'j026', job_title: 'Software Engineer, Payments', company: 'Lumen Pay', category: 'Software Development',
  job_description: 'Build the core payment-routing engine that decides how every transaction flows. You will write Go services where latency and correctness both matter.',
  responsibilities: ['Build low-latency Go services for payment routing', 'Design idempotent APIs and data models', 'Improve observability for payment flows'],
  required_skills: ['Go', 'SQL', 'Microservices', 'REST APIs'], preferred_skills: ['Kafka', 'Kubernetes'],
  location: 'Remote', work_mode: 'Remote', experience_level: 'Mid Level', experience_min: 2, experience_max: 4,
  salary_min: 18, salary_max: 26, employment_type: 'Full-time', education: 'B.Tech / B.E. or equivalent experience', posted_days_ago: 1
},
{
  job_id: 'j027', job_title: 'Graduate Software Engineer', company: 'Stackline Systems', category: 'Software Development',
  job_description: 'A structured graduate program with mentorship, rotations across two product teams, and real ownership from month one. Ideal for 2025–2026 graduates.',
  responsibilities: ['Rotate across two product engineering teams', 'Ship production code with mentor support', 'Complete a structured learning curriculum'],
  required_skills: ['Java', 'Python', 'SQL', 'Data Structures'], preferred_skills: ['Git'],
  location: 'Chennai', work_mode: 'Hybrid', experience_level: 'Entry Level', experience_min: 0, experience_max: 1,
  salary_min: 6, salary_max: 9, employment_type: 'Full-time', education: 'B.Tech / B.E. / MCA (2025–2026 graduates)', posted_days_ago: 0
},
{
  job_id: 'j028', job_title: 'Computer Vision Engineer', company: 'Orbit Mobility', category: 'AI/ML',
  job_description: 'Build vision models that assess vehicle condition and driver safety from dashcam footage. You will train models, optimize them for edge devices, and measure real-world impact.',
  responsibilities: ['Train detection and classification models in PyTorch', 'Optimize models for in-vehicle edge hardware', 'Build labeling and evaluation workflows'],
  required_skills: ['Python', 'OpenCV', 'PyTorch', 'Deep Learning'], preferred_skills: ['C++'],
  location: 'Pune', work_mode: 'On-site', experience_level: 'Mid Level', experience_min: 2, experience_max: 5,
  salary_min: 18, salary_max: 28, employment_type: 'Full-time', education: 'B.Tech / M.Tech in Computer Science or related', posted_days_ago: 8
},
{
  job_id: 'j029', job_title: 'Analytics Engineer', company: 'Fernway Media', category: 'Data',
  job_description: 'Turn raw audience data into clean, documented models that every team trusts. You will own dbt models, define metrics, and partner with analysts and editors.',
  responsibilities: ['Build and document dbt models', 'Define shared audience and engagement metrics', 'Improve warehouse performance and cost'],
  required_skills: ['SQL', 'dbt', 'Python', 'Data Modeling'], preferred_skills: ['Airflow'],
  location: 'Remote', work_mode: 'wfh', experience_level: 'Mid Level', experience_min: 2, experience_max: 4,
  salary_min: 15, salary_max: 22, employment_type: 'Full-time', education: 'Any bachelor’s degree', posted_days_ago: 4
},
{
  job_id: 'j030', job_title: 'QA Automation Engineer', company: 'Arcadia Health', category: 'Software Development',
  job_description: 'Protect patient-facing software with reliable automated tests. You will build Selenium suites, integrate them into CI/CD, and help teams ship with confidence.',
  responsibilities: ['Build and maintain Selenium test suites', 'Integrate automated tests into CI/CD pipelines', 'Work with developers to improve testability'],
  required_skills: ['Selenium', 'Java', 'Testing', 'CI/CD'], preferred_skills: ['Python'],
  location: 'Chennai', work_mode: 'Hybrid', experience_level: 'Entry Level', experience_min: 1, experience_max: 3,
  salary_min: 7, salary_max: 11, employment_type: 'Full-time', education: 'Any bachelor’s degree', posted_days_ago: 5
},
{
  job_id: 'j031', job_title: 'AI Research Intern', company: 'Tessellate AI', category: 'AI/ML',
  job_description: 'Work on open research problems in document understanding with our applied research team. Interns co-author internal papers and ship prototypes.',
  responsibilities: ['Reproduce and extend recent research papers', 'Run deep learning experiments on GPU clusters', 'Share findings in weekly research reviews'],
  required_skills: ['Python', 'Deep Learning', 'PyTorch'], preferred_skills: ['NLP'],
  location: 'Bengaluru', work_mode: 'On-site', experience_level: 'Internship', experience_min: 0, experience_max: 0,
  salary_min: 4, salary_max: 6, employment_type: 'Internship', education: 'Pursuing M.Tech / M.Sc / Ph.D', posted_days_ago: 2
},
{
  job_id: 'j032', job_title: 'Data Analyst (Contract)', company: 'Fernway Media', category: 'Data',
  job_description: 'A six-month contract analyzing subscription and engagement trends for our streaming product. Remote, with flexible hours across Indian time zones.',
  responsibilities: ['Analyze subscription and churn trends', 'Build Tableau dashboards for the product team', 'Summarize insights in weekly readouts'],
  required_skills: ['SQL', 'Python', 'Tableau'], preferred_skills: [],
  location: 'Mumbai', work_mode: 'Remote', experience_level: 'Entry Level', experience_min: 1, experience_max: 2,
  salary_min: 8, salary_max: 11, employment_type: 'Contract', education: 'Any bachelor’s degree', posted_days_ago: 6
},
{
  job_id: 'j033', job_title: 'Senior Python Developer', company: 'Northwind Labs', category: 'Software Development',
  job_description: 'Lead the design of our automation platform and mentor a team of four engineers building Python services for enterprise customers.',
  responsibilities: ['Lead architecture for automation services', 'Mentor engineers through reviews and pairing', 'Partner with product on roadmap planning'],
  required_skills: ['Python', 'AWS', 'Microservices', 'SQL'], preferred_skills: ['Kubernetes'],
  location: 'Hyderabad', work_mode: 'Hybrid', experience_level: 'Senior', experience_min: 6, experience_max: 10,
  salary_min: 180, salary_max: 250, employment_type: 'Full-time', education: 'B.Tech / B.E. or equivalent experience', posted_days_ago: 3
},
{
  job_id: 'j034', job_title: 'Unity Developer', company: 'Parallax Games', category: 'Software Development',
  job_description: 'Build gameplay systems and tools for our next strategy title. You will work in Unity and C# with a small, senior team.',
  responsibilities: ['Implement gameplay systems in Unity', 'Build internal tools for designers', 'Profile and optimize game performance'],
  required_skills: ['Unity', 'C#'], preferred_skills: ['C++'],
  location: 'Mumbai', work_mode: 'On-site', experience_level: 'Mid Level', experience_min: 2, experience_max: 4,
  salary_min: null, salary_max: null, employment_type: 'Full-time', education: null, posted_days_ago: 9
},
{
  job_id: 'j035', job_title: 'Work From Home Data Entry', company: 'QuickHire Solutions', category: 'Data',
  job_description: 'Earn up to ₹50,000 weekly! No experience needed. Pay a small registration fee to get started today. Contact us on WhatsApp.',
  responsibilities: [],
  required_skills: ['Typing'], preferred_skills: [],
  location: 'Remote', work_mode: 'WFH', experience_level: 'Internship', experience_min: 0, experience_max: 0,
  salary_min: 26, salary_max: 60, employment_type: 'Part-time', education: null, posted_days_ago: 1
}];