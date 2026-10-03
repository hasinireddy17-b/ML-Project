import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import type { UserProfile } from '../../types/user';
import { profileChecks, profileCompletion } from '../../utils/profile';
import { buttonStyles } from '../ui/Button';

interface ProfileStrengthProps {
  profile: UserProfile;
  limit?: number;
  showButton?: boolean;
}

export function ProfileStrength({ profile, limit = 3, showButton = true }: ProfileStrengthProps) {
  const pct = profileCompletion(profile);
  const missing = profileChecks(profile).
  filter((c) => !c.done).
  sort((a, b) => b.weight - a.weight).
  slice(0, limit);

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-semibold text-ink">Profile strength</p>
        <p className="text-sm tabular-nums text-ink-soft">
          <span className="font-semibold text-ink">{pct}%</span> complete
        </p>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-cream-200" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Profile completion">
        <div className="h-full rounded-full bg-sage-600 transition-[width] duration-300 ease-out" style={{ width: `${pct}%` }} />
      </div>
      {missing.length > 0 ?
      <ul className="mt-3 space-y-2">
          {missing.map((c) =>
        <li key={c.key}>
              <Link to={`/settings?section=${c.section}`} className="group block rounded-md py-1">
                <span className="flex items-center justify-between text-sm font-medium text-ink group-hover:text-sage-700">
                  {c.label}
                  <ArrowRightIcon className="h-3.5 w-3.5 text-ink-muted transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
                <span className="block text-sm text-ink-muted">{c.hint}</span>
              </Link>
            </li>
        )}
        </ul> :

      <p className="mt-3 text-sm text-ink-muted">Your profile is complete. Recommendations are as precise as they can be.</p>
      }
      {showButton && missing.length > 0 &&
      <Link to={`/settings?section=${missing[0].section}`} className={buttonStyles('secondary', 'sm', 'mt-4 w-full')}>
          Complete your profile
        </Link>
      }
    </div>);

}