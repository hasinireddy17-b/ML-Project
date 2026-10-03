import React, { useState } from 'react';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import type { WorkExperience } from '../../types/user';
import { useAuth, useProfile } from '../../contexts/AuthContext';
import { SettingsSection } from './SettingsSection';
import { TextField } from '../ui/TextField';
import { Button } from '../ui/Button';
import { PhotoUpload } from '../profile/PhotoUpload';
import { SkillPicker } from '../profile/SkillPicker';
import { StepEducation } from '../onboarding/StepEducation';

const EMPTY_EXP = { title: '', company: '', period: '', description: '' };

export function ProfileSettings() {
  const profile = useProfile();
  const { updateProfile } = useAuth();
  const pick = () => ({
    photo: profile.photo,
    headline: profile.headline,
    about: profile.about,
    location: profile.location,
    skills: profile.skills,
    education: profile.education,
    experience: profile.experience
  });
  const [draft, setDraft] = useState(pick);
  const [newExp, setNewExp] = useState(EMPTY_EXP);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(pick());

  const addExperience = () => {
    if (!newExp.title.trim() || !newExp.company.trim()) return;
    const entry: WorkExperience = { ...newExp, id: `exp-${Date.now().toString(36)}` };
    setDraft({ ...draft, experience: [entry, ...draft.experience] });
    setNewExp(EMPTY_EXP);
    setAdding(false);
  };

  const save = () => {
    setSaving(true);
    window.setTimeout(() => {
      updateProfile(draft);
      setSaving(false);
      toast.success('Profile saved', { description: 'Your recommendations have been refreshed.' });
    }, 450);
  };

  return (
    <SettingsSection title="Profile" description="What recruiters see, and what we use to match you." dirty={dirty} saving={saving} onSave={save} onReset={() => setDraft(pick())}>
      <PhotoUpload name={profile.name} photo={draft.photo} onChange={(photo) => setDraft({ ...draft, photo })} />
      <TextField label="Headline" value={draft.headline} onChange={(e) => setDraft({ ...draft, headline: e.target.value })} maxLength={90} placeholder="e.g. Frontend developer · React & TypeScript" />
      <TextField
        label="About"
        multiline
        value={draft.about}
        onChange={(e) => setDraft({ ...draft, about: e.target.value })}
        maxLength={800}
        hint={`${draft.about.length}/800 · A few sentences on what you’ve built and what you want next.`} />
      
      <TextField label="Current city" value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} />

      <div>
        <p className="mb-2 text-sm font-medium text-ink">Skills</p>
        <SkillPicker value={draft.skills} onChange={(skills) => setDraft({ ...draft, skills })} />
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-ink">Education</p>
        <StepEducation draft={{ ...profile, education: draft.education }} update={(p) => p.education && setDraft({ ...draft, education: p.education })} />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium text-ink">Experience</p>
          {!adding &&
          <Button variant="ghost" size="sm" onClick={() => setAdding(true)}>
              <PlusIcon className="h-4 w-4" aria-hidden="true" />
              Add experience
            </Button>
          }
        </div>
        {adding &&
        <div className="mb-4 grid gap-4 rounded-lg border border-line bg-surface p-4 sm:grid-cols-2">
            <TextField label="Title" value={newExp.title} onChange={(e) => setNewExp({ ...newExp, title: e.target.value })} />
            <TextField label="Company" value={newExp.company} onChange={(e) => setNewExp({ ...newExp, company: e.target.value })} />
            <TextField className="sm:col-span-2" label="Period" value={newExp.period} onChange={(e) => setNewExp({ ...newExp, period: e.target.value })} placeholder="e.g. Jan 2024 – Present" />
            <TextField className="sm:col-span-2" label="What you did" multiline value={newExp.description} onChange={(e) => setNewExp({ ...newExp, description: e.target.value })} />
            <div className="flex justify-end gap-2 sm:col-span-2">
              <Button variant="ghost" size="sm" onClick={() => setAdding(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={addExperience} disabled={!newExp.title.trim() || !newExp.company.trim()}>
                Add
              </Button>
            </div>
          </div>
        }
        {draft.experience.length ?
        <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
            {draft.experience.map((e) =>
          <li key={e.id} className="flex items-start justify-between gap-4 p-4">
                <div>
                  <p className="font-medium text-ink">{e.title}</p>
                  <p className="text-sm text-ink-muted">
                    {e.company} · {e.period}
                  </p>
                </div>
                <button
              type="button"
              onClick={() => setDraft({ ...draft, experience: draft.experience.filter((x) => x.id !== e.id) })}
              className="rounded-md p-1.5 text-ink-muted hover:bg-cream-100 hover:text-rust-600"
              aria-label={`Remove ${e.title}`}>
              
                  <Trash2Icon className="h-4 w-4" />
                </button>
              </li>
          )}
          </ul> :

        !adding && <p className="text-sm text-ink-muted">No experience added yet. Internships and projects count too.</p>
        }
      </div>
    </SettingsSection>);

}