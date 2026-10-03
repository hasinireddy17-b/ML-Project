import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { ArrowLeftIcon, ShieldAlertIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from './Logo';
import { buttonStyles } from '../ui/Button';

const NAV = [
{ to: '/admin', label: 'Lifecycle overview', end: true },
{ to: '/admin/dataset', label: 'Dataset' },
{ to: '/admin/models', label: 'Model performance' },
{ to: '/admin/experiments', label: 'Model experiments' },
{ to: '/admin/clustering', label: 'Clustering & visualization' },
{ to: '/admin/monitoring', label: 'Monitoring' }];


const linkCls = ({ isActive }: {isActive: boolean;}) =>
`block whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 ${isActive ? 'bg-surface text-ink shadow-soft' : 'text-ink-soft hover:text-ink'}`;

export function AdminLayout() {
  const { user } = useAuth();

  if (user?.role !== 'admin') {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-cream px-6 text-center">
        <ShieldAlertIcon className="h-8 w-8 text-ink-muted" aria-hidden="true" />
        <h1 className="mt-4 font-display text-3xl text-ink">Admin access required</h1>
        <p className="mt-2 max-w-md text-[15px] text-ink-soft">This area is for system administrators and ML engineers.</p>
        <Link to="/" className={buttonStyles('primary', 'md', 'mt-6')}>
          Back to your feed
        </Link>
      </div>);

  }

  return (
    <div className="flex min-h-screen w-full bg-cream">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-cream-100 p-5 lg:flex">
        <Logo to="/admin" />
        <p className="mt-6 px-3 text-xs font-medium text-ink-muted">ML console</p>
        <nav aria-label="Admin" className="mt-2 space-y-0.5">
          {NAV.map((n) =>
          <NavLink key={n.to} to={n.to} end={n.end} className={linkCls}>
              {n.label}
            </NavLink>
          )}
        </nav>
        <Link to="/" className="mt-auto flex items-center gap-2 px-3 text-sm font-medium text-ink-soft hover:text-ink">
          <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
          Back to app
        </Link>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="border-b border-line bg-cream-100 lg:hidden">
          <div className="flex h-14 items-center justify-between px-4">
            <Logo to="/admin" />
            <Link to="/" className="text-sm font-medium text-ink-soft">
              Back to app
            </Link>
          </div>
          <nav aria-label="Admin" className="scrollbar-none flex gap-1 overflow-x-auto px-3 pb-2">
            {NAV.map((n) =>
            <NavLink key={n.to} to={n.to} end={n.end} className={linkCls}>
                {n.label}
              </NavLink>
            )}
          </nav>
        </div>
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
          <Outlet />
        </main>
      </div>
    </div>);

}