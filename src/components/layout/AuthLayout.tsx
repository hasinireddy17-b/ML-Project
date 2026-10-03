import React, { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { CheckIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from './Logo';

interface AuthLayoutProps {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  allowSignedIn?: boolean;
}

export function AuthLayout({ title, subtitle, children, allowSignedIn = false }: AuthLayoutProps) {
  const { user } = useAuth();
  if (user && !allowSignedIn) return <Navigate to={user.onboarded ? '/' : '/onboarding'} replace />;

  return (
    <div className="flex min-h-screen w-full bg-cream">
      <aside className="relative hidden w-[46%] flex-col justify-between bg-sage-800 p-12 lg:flex">
        <Logo inverted />
        <div className="max-w-md">
          <h2 className="font-display text-[42px] font-normal leading-[1.1] text-cream-50">Find work that fits the way you work.</h2>
          <p className="mt-4 text-[17px] leading-relaxed text-sage-100">
            Tell us what you’re good at and what you want next. We’ll surface the roles worth your time — and explain why.
          </p>

          <figure className="mt-10 rounded-lg bg-sage-700 p-5" aria-label="Example job match">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-cream-50">Machine Learning Engineer</p>
                <p className="mt-0.5 text-sm text-sage-100">Tessellate AI · Hyderabad · Hybrid</p>
              </div>
              <span className="rounded-full bg-cream-50 px-2.5 py-1 text-sm font-semibold tabular-nums text-sage-800">92% Match</span>
            </div>
            <ul className="mt-4 space-y-1.5 text-sm text-cream-100">
              {['5 relevant skills', 'Preferred location', 'Experience level matches'].map((r) =>
              <li key={r} className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-sage-200" aria-hidden="true" />
                  {r}
                </li>
              )}
            </ul>
          </figure>
        </div>
        <p className="text-sm text-sage-200">Your data is used only to personalize your job feed.</p>
      </aside>

      <main className="flex flex-1 flex-col px-5 py-8 sm:px-10">
        <div className="lg:hidden">
          <Logo />
        </div>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <h1 className="font-display text-[32px] font-normal leading-tight text-ink">{title}</h1>
          {subtitle && <div className="mt-2 text-[15px] text-ink-soft">{subtitle}</div>}
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>);

}