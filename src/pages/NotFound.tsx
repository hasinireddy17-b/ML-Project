import React from 'react';
import { Link } from 'react-router-dom';
import { buttonStyles } from '../components/ui/Button';

export function NotFound() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-cream px-6 text-center">
      <p className="text-sm font-medium text-ink-muted">404</p>
      <h1 className="mt-2 font-display text-4xl text-ink">We couldn’t find that page</h1>
      <p className="mt-3 max-w-md text-[15px] text-ink-soft">The link may be broken, or the page may have moved.</p>
      <Link to="/" className={buttonStyles('primary', 'md', 'mt-8')}>
        Go to your feed
      </Link>
    </div>);

}