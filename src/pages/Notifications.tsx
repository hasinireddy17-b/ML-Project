import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BellIcon, BellRingIcon, BriefcaseIcon, CopyIcon, InfoIcon, SparklesIcon } from 'lucide-react';
import type { AppNotification, NotificationKind } from '../types/activity';
import { useActivity } from '../contexts/ActivityContext';
import { relativeTime } from '../utils/format';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';

const ICONS: Record<NotificationKind, typeof BellIcon> = {
  match: SparklesIcon,
  application: BriefcaseIcon,
  similar: CopyIcon,
  alert: BellRingIcon,
  system: InfoIcon
};

function isToday(ts: number) {
  return new Date(ts).toDateString() === new Date().toDateString();
}

export function Notifications() {
  const { notifications, markRead, markAllRead, unreadCount } = useActivity();
  const navigate = useNavigate();
  const sorted = [...notifications].sort((a, b) => b.at - a.at);
  const groups: {label: string;items: AppNotification[];}[] = [
  { label: 'Today', items: sorted.filter((n) => isToday(n.at)) },
  { label: 'Earlier', items: sorted.filter((n) => !isToday(n.at)) }].
  filter((g) => g.items.length);

  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[34px] text-ink">Notifications</h1>
          <p className="mt-1 text-[15px] text-ink-soft">{unreadCount ? `${unreadCount} unread` : 'You’re all caught up.'}</p>
        </div>
        {unreadCount > 0 &&
        <Button variant="secondary" size="sm" onClick={markAllRead}>
            Mark all as read
          </Button>
        }
      </div>

      {notifications.length === 0 ?
      <div className="mt-8 rounded-lg border border-line bg-surface">
          <EmptyState icon={BellIcon} title="No notifications" description="We’ll let you know about strong new matches and application updates." />
        </div> :

      <div className="mt-8 space-y-8">
          {groups.map((g) =>
        <section key={g.label} aria-labelledby={`notif-${g.label}`}>
              <h2 id={`notif-${g.label}`} className="mb-2 text-sm font-medium text-ink-muted">
                {g.label}
              </h2>
              <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
                {g.items.map((n) => {
              const Icon = ICONS[n.kind];
              return (
                <li key={n.id}>
                      <button
                    type="button"
                    onClick={() => {
                      markRead(n.id);
                      if (n.link) navigate(n.link);
                    }}
                    className="flex w-full items-start gap-4 px-5 py-4 text-left transition-colors duration-150 hover:bg-cream-50">
                    
                        <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${n.read ? 'bg-cream-100 text-ink-muted' : 'bg-sage-50 text-sage-700'}`}>
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={`block text-[15px] ${n.read ? 'text-ink-soft' : 'font-semibold text-ink'}`}>{n.title}</span>
                          <span className="mt-0.5 block text-sm text-ink-muted">{n.body}</span>
                          <span className="mt-1 block text-xs text-ink-muted">{relativeTime(n.at)}</span>
                        </span>
                        {!n.read &&
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-sage-600" aria-label="Unread" />
                    }
                      </button>
                    </li>);

            })}
              </ul>
            </section>
        )}
        </div>
      }
      <p className="mt-6 text-sm text-ink-muted">
        We only notify you about meaningful changes.{' '}
        <Link to="/settings?section=notifications" className="font-medium text-sage-700 hover:text-sage-800">
          Manage notifications
        </Link>
      </p>
    </div>);

}