import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeftIcon, CheckIcon, Loader2Icon } from 'lucide-react';
import type { UserProfile } from '../types/user';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from '../components/layout/Logo';
import { Button } from '../components/ui/Button';
import { StepAbout } from '../components/onboarding/StepAbout';
import { StepSkills } from '../components/onboarding/StepSkills';
import { StepEducation } from '../components/onboarding/StepEducation';
import { StepExperience } from '../components/onboarding/StepExperience';
import { StepPreferences } from '../components/onboarding/StepPreferences';
import { StepInterests } from '../components/onboarding/StepInterests';
import { getFeatureStore } from '../utils/ml/engineering/featureStore';

const STEPS = [
{ label: 'About you', title: 'Let’s start with you', subtitle: 'This is how you’ll appear to recruiters.', Component: StepAbout },
{ label: 'Skills', title: 'What are you good at?', subtitle: 'Skills are the strongest signal we use to match you with jobs.', Component: StepSkills },
{ label: 'Education', title: 'Your education', subtitle: 'Some roles look for specific degrees. You can skip this for now.', Component: StepEducation },
{ label: 'Experience', title: 'Where are you in your career?', subtitle: 'We’ll prioritize roles that fit your level.', Component: StepExperience },
{ label: 'Preferences', title: 'What are you looking for?', subtitle: 'Tell us where and how you want to work.', Component: StepPreferences },
{ label: 'Interests', title: 'Which areas excite you most?', subtitle: 'Pick one or more. You can change this anytime.', Component: StepInterests }];


function stepError(step: number, d: UserProfile): string | null {
  if (step === 0 && d.name.trim().length < 2) return 'Enter your name to continue.';
  if (step === 1 && d.skills.length < 3) return 'Add at least 3 skills.';
  if (step === 4 && !d.preferred_locations.length) return 'Choose at least one location.';
  if (step === 4 && !d.work_modes.length) return 'Choose at least one work mode.';
  if (step === 5 && !d.career_interests.length) return 'Pick at least one area.';
  return null;
}

export function Onboarding() {
  const { user, profile, completeOnboarding, logout } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [draft, setDraft] = useState<UserProfile | null>(profile);
  const [building, setBuilding] = useState(false);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!building || !draft) return;
    const timers = [
    window.setTimeout(() => setPhase(1), 550),
    window.setTimeout(() => setPhase(2), 1150),
    window.setTimeout(() => {
      completeOnboarding(draft);
      navigate('/', { replace: true });
    }, 1750)];

    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [building, draft, completeOnboarding, navigate]);

  if (!user) return <Navigate to="/login" replace />;
  if (user.onboarded && !building) return <Navigate to="/" replace />;
  if (!draft) return null;

  const current = STEPS[step];
  const error = stepError(step, draft);
  const update = (patch: Partial<UserProfile>) => setDraft((d) => d ? { ...d, ...patch } : d);
  const go = (next: number) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
    window.scrollTo({ top: 0 });
  };

  if (building) {
    const lines = ['Reading your profile', `Matching against ${getFeatureStore().servableJobs.length} open roles`, 'Ranking your feed'];
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-cream px-6">
        <div className="w-full max-w-sm" role="status" aria-live="polite">
          <h1 className="font-display text-3xl text-ink">Building your job feed</h1>
          <ul className="mt-6 space-y-3">
            {lines.map((l, i) =>
            <li key={l} className={`flex items-center gap-3 text-[15px] transition-colors duration-200 ${i <= phase ? 'text-ink' : 'text-ink-faint'}`}>
                {i < phase ?
              <CheckIcon className="h-4 w-4 text-sage-700" aria-hidden="true" /> :
              i === phase ?
              <Loader2Icon className="h-4 w-4 animate-spin text-sage-700" aria-hidden="true" /> :

              <span className="h-4 w-4" />
              }
                {l}
              </li>
            )}
          </ul>
        </div>
      </div>);

  }

  const { Component } = current;
  const last = step === STEPS.length - 1;

  return (
    <div className="min-h-screen w-full bg-cream">
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5">
          <Logo to="/onboarding" />
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="text-sm font-medium text-ink-soft hover:text-ink">
            
            Log out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 pb-16 pt-8 sm:pt-12">
        <nav aria-label="Onboarding progress">
          <ol className="grid grid-cols-6 gap-1.5">
            {STEPS.map((s, i) =>
            <li key={s.label}>
                <span className={`block h-1 rounded-full transition-colors duration-200 ${i <= step ? 'bg-sage-600' : 'bg-cream-300'}`} />
                <span className={`mt-2 hidden text-xs sm:block ${i === step ? 'font-medium text-ink' : 'text-ink-muted'}`} aria-current={i === step ? 'step' : undefined}>
                  {s.label}
                </span>
              </li>
            )}
          </ol>
        </nav>

        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <motion.section
            key={step}
            custom={dir}
            initial={{ opacity: 0, x: dir * 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -16 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="mt-10"
            aria-labelledby="step-title">
            
            <p className="text-sm text-ink-muted sm:hidden">{current.label}</p>
            <h1 id="step-title" className="font-display text-[32px] leading-tight text-ink">
              {current.title}
            </h1>
            <p className="mt-2 text-[15px] text-ink-soft">{current.subtitle}</p>
            <div className="mt-8">
              <Component draft={draft} update={update} />
            </div>
          </motion.section>
        </AnimatePresence>

        <div className="mt-10 flex items-center justify-between gap-4 border-t border-line pt-6">
          {step > 0 ?
          <Button variant="ghost" onClick={() => go(step - 1)}>
              <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
              Back
            </Button> :

          <span />
          }
          <div className="flex items-center gap-4">
            {error && <p className="hidden text-sm text-ink-muted sm:block">{error}</p>}
            {step === 2 && !draft.education.degree &&
            <Button variant="ghost" onClick={() => go(step + 1)}>
                Skip for now
              </Button>
            }
            <Button size="lg" disabled={!!error} onClick={() => last ? setBuilding(true) : go(step + 1)}>
              {last ? 'Build My Job Feed' : 'Continue'}
            </Button>
          </div>
        </div>
        {error && <p className="mt-3 text-right text-sm text-ink-muted sm:hidden">{error}</p>}
      </main>
    </div>);

}