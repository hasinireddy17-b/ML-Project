import React from 'react';
import { NavLink } from 'react-router-dom';
import { BookmarkIcon, BriefcaseIcon, HomeIcon, SearchIcon, UserIcon } from 'lucide-react';

const ITEMS = [
{ to: '/', label: 'Home', icon: HomeIcon, end: true },
{ to: '/search', label: 'Search', icon: SearchIcon },
{ to: '/saved', label: 'Saved', icon: BookmarkIcon },
{ to: '/applications', label: 'Applications', icon: BriefcaseIcon },
{ to: '/profile', label: 'Profile', icon: UserIcon }];


export function MobileNav() {
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <ul className="grid grid-cols-5">
        {ITEMS.map(({ to, label, icon: Icon, end }) =>
        <li key={to}>
            <NavLink
            to={to}
            end={end}
            className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors duration-150 ${isActive ? 'text-sage-700' : 'text-ink-muted'}`
            }>
            
              <Icon className="h-5 w-5" aria-hidden="true" />
              {label}
            </NavLink>
          </li>
        )}
      </ul>
    </nav>);

}