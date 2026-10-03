import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { BellIcon } from 'lucide-react';
import { useActivity } from '../../contexts/ActivityContext';
import { Logo } from './Logo';
import { UserMenu } from './UserMenu';
import { SearchBox } from '../search/SearchBox';

const NAV = [
{ to: '/', label: 'For you', end: true },
{ to: '/search', label: 'Search' },
{ to: '/saved', label: 'Saved' },
{ to: '/applications', label: 'Applications' },
{ to: '/alerts', label: 'Alerts' },
{ to: '/insights', label: 'Insights' }];


export function TopNav() {
  const { unreadCount } = useActivity();
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-cream/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) =>
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
            `whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 ${isActive ? 'bg-sage-50 text-sage-800' : 'text-ink-soft hover:text-ink'}`
            }>
            
              {item.label}
            </NavLink>
          )}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {pathname !== '/search' && pathname !== '/' &&
          <div className="hidden w-72 xl:block">
              <SearchBox size="compact" shortcut />
            </div>
          }
          <Link
            to="/notifications"
            className="relative rounded-md p-2 text-ink-soft transition-colors duration-150 hover:bg-cream-100 hover:text-ink"
            aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'}>
            
            <BellIcon className="h-5 w-5" />
            {unreadCount > 0 &&
            <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rust-500 px-1 text-[10px] font-semibold text-white">
                {unreadCount}
              </span>
            }
          </Link>
          <UserMenu />
        </div>
      </div>
    </header>);

}