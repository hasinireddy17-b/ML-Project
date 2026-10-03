import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart3Icon, LogOutIcon, SettingsIcon, ShieldIcon, UserIcon } from 'lucide-react';
import { useAuth, useProfile } from '../../contexts/AuthContext';
import { Avatar } from '../ui/Avatar';

export function UserMenu() {
  const { user, logout } = useAuth();
  const profile = useProfile();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const items = [
  { to: '/profile', label: 'Profile', icon: UserIcon },
  { to: '/insights', label: 'Job search insights', icon: BarChart3Icon },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
  ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin console', icon: ShieldIcon }] : [])];


  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex items-center rounded-full ring-offset-2 ring-offset-cream transition-shadow duration-150 hover:ring-2 hover:ring-line-strong">
        
        <Avatar name={profile.name} photo={profile.photo} size="sm" />
      </button>
      <AnimatePresence>
        {open &&
        <motion.div
          role="menu"
          initial={{ opacity: 0, scale: 0.96, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
          style={{ transformOrigin: 'top right' }}
          className="absolute right-0 top-full z-40 mt-2 w-64 overflow-hidden rounded-lg border border-line bg-surface shadow-lift">
          
            <div className="border-b border-line px-4 py-3">
              <p className="truncate text-sm font-semibold text-ink">{profile.name}</p>
              <p className="truncate text-sm text-ink-muted">{profile.email}</p>
            </div>
            <div className="py-1.5">
              {items.map(({ to, label, icon: Icon }) =>
            <Link
              key={to}
              to={to}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-ink-soft transition-colors duration-150 hover:bg-cream-100 hover:text-ink">
              
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {label}
                </Link>
            )}
            </div>
            <div className="border-t border-line py-1.5">
              <button
              type="button"
              role="menuitem"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-ink-soft transition-colors duration-150 hover:bg-cream-100 hover:text-ink">
              
                <LogOutIcon className="h-4 w-4" aria-hidden="true" />
                Log out
              </button>
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}