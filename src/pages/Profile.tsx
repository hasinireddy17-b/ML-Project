import React, { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCapIcon, MapPinIcon, PencilIcon } from 'lucide-react';
import { useAuth, useProfile } from '../contexts/AuthContext';
import { Avatar } from '../components/ui/Avatar';
import { Toggle } from '../components/ui/Toggle';
import { ProfileStrength } from '../components/profile/ProfileStrength';
import { buttonStyles } from '../components/ui/Button';

function Section({ title, edit, children }: {title: string;edit: string;children: ReactNode;}) {
  return (
    <section className="border-b border-line py-7 first:pt-0 last:border-0">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        <Link to={`/settings?section=${edit}`} className="flex items-center gap-1.5 text-sm font-medium text-sage-700 hover:text-sage-800" aria-label={`Edit ${title}`}>
          <PencilIcon className="h-3.5 w-3.5" aria-hidden="true" />
          Edit
        </Link>
      </div>
      {children}
    </section>);

}

function Tags({ items, empty }: {items: string[];empty: string;}) {
  if (!items.length) return <p className="text-[15px] text-ink-muted">{empty}</p>;
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((i) =>
      <li key={i} className="rounded-full border border-line bg-cream-100 px-3 py-1 text-sm text-ink">
          {i}
        </li>
      )}
    </ul>);

}

export function Profile() {
  const profile = useProfile();
  const { updateProfile } = useAuth();
  const edu = profile.education;

  return (
    <div>
      <header className="flex flex-col gap-6 border-b border-line pb-8 sm:flex-row sm:items-center">
        <Avatar name={profile.name} photo={profile.photo} size="xl" />
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-[34px] leading-tight text-ink">{profile.name}</h1>
          <p className="mt-1 text-[16px] text-ink-soft">{profile.headline || 'Add a headline so recruiters know what you do.'}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-muted">
            {profile.location &&
            <span className="flex items-center gap-1.5">
                <MapPinIcon className="h-4 w-4" aria-hidden="true" />
                {profile.location}
              </span>
            }
            {profile.open_to_work && <span className="rounded-full bg-sage-50 px-2.5 py-0.5 font-medium text-sage-800">Open to work</span>}
            <span>{profile.visibility === 'Public' ? 'Visible to everyone' : profile.visibility === 'Private' ? 'Private profile' : 'Visible to recruiters only'}</span>
          </div>
        </div>
        <Link to="/settings?section=profile" className={buttonStyles('secondary')}>
          Edit profile
        </Link>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <Section title="About" edit="profile">
            {profile.about ?
            <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink-soft">{profile.about}</p> :

            <p className="text-[15px] text-ink-muted">Tell recruiters about yourself in a few sentences — what you’ve built and what you want next.</p>
            }
          </Section>

          <Section title="Skills" edit="profile">
            <Tags items={profile.skills} empty="No skills added yet." />
          </Section>

          <Section title="Experience" edit="profile">
            <p className="mb-3 text-sm text-ink-muted">{profile.experience_level}</p>
            {profile.experience.length ?
            <ul className="space-y-5">
                {profile.experience.map((e) =>
              <li key={e.id}>
                    <p className="font-medium text-ink">{e.title}</p>
                    <p className="text-sm text-ink-soft">
                      {e.company} · {e.period}
                    </p>
                    {e.description && <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">{e.description}</p>}
                  </li>
              )}
              </ul> :

            <p className="text-[15px] text-ink-muted">Add internships, jobs, or significant projects.</p>
            }
          </Section>

          <Section title="Education" edit="profile">
            {edu.degree || edu.institution ?
            <div className="flex gap-3">
                <GraduationCapIcon className="mt-0.5 h-5 w-5 text-ink-muted" aria-hidden="true" />
                <div>
                  <p className="font-medium text-ink">{[edu.degree, edu.field].filter(Boolean).join(', ')}</p>
                  <p className="text-sm text-ink-soft">
                    {edu.institution}
                    {edu.graduation_year && ` · ${edu.graduation_year}`}
                  </p>
                </div>
              </div> :

            <p className="text-[15px] text-ink-muted">No education added.</p>
            }
          </Section>

          <Section title="Preferred roles" edit="preferences">
            <Tags items={profile.preferred_roles} empty="No preferred roles yet." />
          </Section>

          <Section title="Preferred locations" edit="preferences">
            <Tags items={profile.preferred_locations} empty="No preferred locations yet." />
            <p className="mt-3 text-sm text-ink-muted">
              {profile.work_modes.join(' · ') || 'Any work mode'} · {profile.salary_expectation ? `₹${profile.salary_expectation}L+ per year` : 'Flexible salary'}
            </p>
          </Section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-lg border border-line bg-surface p-5">
            <ProfileStrength profile={profile} />
          </section>
          <section className="rounded-lg border border-line bg-surface p-5">
            <Toggle
              label="Open to work"
              description="Let recruiters know you’re actively looking."
              checked={profile.open_to_work}
              onChange={(v) => updateProfile({ open_to_work: v })} />
            
          </section>
        </aside>
      </div>
    </div>);

}