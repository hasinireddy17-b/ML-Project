import React, { useId, useState } from 'react';
import { PlusIcon, SearchIcon, XIcon } from 'lucide-react';
import { canonicalSkills, popularSkills } from '../../data/skills';
import { normalizeSkill } from '../../utils/ml/lifecycle/preprocessing';
import { inputStyles } from '../ui/TextField';

interface SkillPickerProps {
  value: string[];
  onChange: (skills: string[]) => void;
  max?: number;
}

export function SkillPicker({ value, onChange, max = 25 }: SkillPickerProps) {
  const [query, setQuery] = useState('');
  const inputId = useId();
  const q = query.trim().toLowerCase();
  const pool = q ?
  canonicalSkills.filter((s) => s.toLowerCase().includes(q)) :
  [...popularSkills, ...canonicalSkills.filter((s) => !popularSkills.includes(s))];
  const options = pool.filter((s) => !value.includes(s)).slice(0, q ? 12 : 14);
  const exact = canonicalSkills.some((s) => s.toLowerCase() === q) || value.some((s) => s.toLowerCase() === q);
  const full = value.length >= max;

  const add = (skill: string) => {
    if (full || value.includes(skill)) return;
    onChange([...value, skill]);
    setQuery('');
  };

  return (
    <div>
      <div className="min-h-[44px]">
        {value.length ?
        <ul className="flex flex-wrap gap-1.5" aria-label="Your skills">
            {value.map((s) =>
          <li key={s}>
                <button
              type="button"
              onClick={() => onChange(value.filter((v) => v !== s))}
              className="inline-flex h-8 items-center gap-1.5 rounded-full bg-sage-700 pl-3 pr-2 text-sm font-medium text-cream-50 transition-colors duration-150 hover:bg-sage-800"
              aria-label={`Remove ${s}`}>
              
                  {s}
                  <XIcon className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </li>
          )}
          </ul> :

        <p className="py-2 text-sm text-ink-muted">No skills added yet — pick from the suggestions below.</p>
        }
      </div>

      <div className="relative mt-4">
        <label htmlFor={inputId} className="sr-only">
          Search skills
        </label>
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
        <input
          id={inputId}
          value={query}
          disabled={full}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== 'Enter') return;
            e.preventDefault();
            if (options[0]) add(options[0]);else
            if (q) add(normalizeSkill(query));
          }}
          placeholder={full ? `You’ve added the maximum of ${max} skills` : 'Search skills — e.g. Python, React, SQL'}
          className={`${inputStyles} h-11 pl-9`} />
        
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {options.map((s) =>
        <button
          key={s}
          type="button"
          onClick={() => add(s)}
          disabled={full}
          className="inline-flex h-8 items-center gap-1 rounded-full border border-line-strong bg-surface pl-2 pr-3 text-sm text-ink-soft transition-[border-color,color] duration-150 hover:border-taupe-400 hover:text-ink disabled:opacity-50">
          
            <PlusIcon className="h-3.5 w-3.5" aria-hidden="true" />
            {s}
          </button>
        )}
        {q && !exact &&
        <button
          type="button"
          onClick={() => add(normalizeSkill(query))}
          className="inline-flex h-8 items-center gap-1 rounded-full border border-dashed border-taupe-400 px-3 text-sm text-ink-soft hover:text-ink">
          
            <PlusIcon className="h-3.5 w-3.5" aria-hidden="true" />
            Add “{query.trim()}”
          </button>
        }
      </div>
    </div>);

}