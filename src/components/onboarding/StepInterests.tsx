import React from 'react';
import { BarChart3Icon, BrainCircuitIcon, CheckIcon, CloudIcon, CodeIcon, GlobeIcon, ShieldCheckIcon } from 'lucide-react';
import type { OnboardingStepProps } from '../../types/onboarding';
import type { JobCategory } from '../../types/job';

const INTERESTS: {value: JobCategory;label: string;description: string;icon: typeof CodeIcon;}[] = [
{ value: 'Software Development', label: 'Software Development', description: 'Backend, mobile, and platform engineering', icon: CodeIcon },
{ value: 'Data', label: 'Data', description: 'Analytics, BI, and data engineering', icon: BarChart3Icon },
{ value: 'AI/ML', label: 'AI / ML', description: 'Machine learning, NLP, and computer vision', icon: BrainCircuitIcon },
{ value: 'Web Development', label: 'Web Development', description: 'Frontend and full-stack product work', icon: GlobeIcon },
{ value: 'Cloud', label: 'Cloud', description: 'Infrastructure, DevOps, and reliability', icon: CloudIcon },
{ value: 'Cybersecurity', label: 'Cybersecurity', description: 'Security operations and cloud security', icon: ShieldCheckIcon }];


export function StepInterests({ draft, update }: OnboardingStepProps) {
  const toggle = (v: string) =>
  update({ career_interests: draft.career_interests.includes(v) ? draft.career_interests.filter((x) => x !== v) : [...draft.career_interests, v] });

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {INTERESTS.map(({ value, label, description, icon: Icon }) => {
        const selected = draft.career_interests.includes(value);
        return (
          <button
            key={value}
            type="button"
            aria-pressed={selected}
            onClick={() => toggle(value)}
            className={`relative flex items-start gap-3 rounded-lg border p-4 text-left transition-[border-color,background-color] duration-150 ${
            selected ? 'border-sage-600 bg-sage-50' : 'border-line bg-surface hover:border-line-strong'}`
            }>
            
            <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${selected ? 'text-sage-700' : 'text-ink-muted'}`} aria-hidden="true" />
            <span className="pr-6">
              <span className="block font-medium text-ink">{label}</span>
              <span className="block text-sm text-ink-muted">{description}</span>
            </span>
            {selected &&
            <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-sage-700 text-cream-50">
                <CheckIcon className="h-3 w-3" aria-hidden="true" />
              </span>
            }
          </button>);

      })}
    </div>);

}