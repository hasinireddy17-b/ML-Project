import { format, formatDistanceToNowStrict } from 'date-fns';

const trimNumber = (n: number) => Number.isInteger(n) ? String(n) : n.toFixed(1);

export function formatSalary(min: number, max: number): string {
  return `₹${trimNumber(min)}L – ₹${trimNumber(max)}L`;
}

export function formatExperience(min: number, max: number): string {
  if (max === 0) return 'No experience needed';
  if (min === max) return `${min} yr${min === 1 ? '' : 's'}`;
  return `${min}–${max} years`;
}

export function formatPosted(days: number): string {
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
}

export function formatDate(ts: number): string {
  return format(ts, 'd MMM yyyy');
}

export function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return 'Just now';
  return `${formatDistanceToNowStrict(ts)} ago`;
}

export function greeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function initials(name: string): string {
  return (
    name.
    trim().
    split(/\s+/).
    slice(0, 2).
    map((p) => p[0]?.toUpperCase() ?? '').
    join('') || '·');

}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? '';
}

export function pct(v: number, digits = 0): string {
  return `${(v * 100).toFixed(digits)}%`;
}