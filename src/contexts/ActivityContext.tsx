import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { toast } from 'sonner';
import type { ActivityState, AppNotification, Application, InteractionType, JobAlert } from '../types/activity';
import type { Job } from '../types/job';
import { usePersistentState } from '../hooks/usePersistentState';
import { useAuth } from './AuthContext';
import { track as trackRequest } from '../utils/api';

export type AlertInput = Omit<JobAlert, 'id' | 'created_at' | 'active'>;

interface ActivityContextValue extends ActivityState {
  savedIds: string[];
  appliedIds: string[];
  unreadCount: number;
  isSaved: (jobId: string) => boolean;
  applicationFor: (jobId: string) => Application | undefined;
  track: (type: InteractionType, jobId?: string, query?: string) => void;
  toggleSave: (job: Job) => void;
  removeSaved: (jobId: string) => void;
  apply: (job: Job) => void;
  dismiss: (job: Job) => void;
  toggleCompare: (jobId: string) => void;
  removeCompare: (jobId: string) => void;
  clearCompare: () => void;
  addAlert: (input: AlertInput) => void;
  updateAlert: (id: string, patch: Partial<JobAlert>) => void;
  deleteAlert: (id: string) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  recordSearch: (query: string, results: number) => void;
  clearSearchHistory: () => void;
}

const ActivityContext = createContext<ActivityContextValue | null>(null);
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export function ActivityProvider({ userId, seed, children }: {userId: string;seed: () => ActivityState;children: ReactNode;}) {
  const [state, setState] = usePersistentState<ActivityState>(`ijp.activity.v1.${userId}`, seed);
  const { profile } = useAuth();
  const timers = useRef<number[]>([]);
  const notifyApplications = profile?.notifications.applications ?? true;

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const pushInteraction = useCallback(
    (type: InteractionType, jobId?: string, query?: string) =>
    setState((s) => ({ ...s, interactions: [...s.interactions, { type, job_id: jobId, query, at: Date.now() }].slice(-300) })),
    [setState]
  );

  const track = useCallback(
    (type: InteractionType, jobId?: string, query?: string) => {
      trackRequest('POST /feedback');
      pushInteraction(type, jobId, query);
    },
    [pushInteraction]
  );

  const removeSaved = useCallback((jobId: string) => setState((s) => ({ ...s, saved: s.saved.filter((x) => x.job_id !== jobId) })), [setState]);

  const toggleSave = useCallback(
    (job: Job) => {
      const already = state.saved.some((s) => s.job_id === job.job_id);
      if (already) {
        removeSaved(job.job_id);
        toast('Removed from saved jobs', {
          description: job.job_title,
          action: { label: 'Undo', onClick: () => setState((s) => ({ ...s, saved: [{ job_id: job.job_id, saved_at: Date.now() }, ...s.saved] })) }
        });
        return;
      }
      trackRequest('POST /saved-jobs');
      setState((s) => ({ ...s, saved: [{ job_id: job.job_id, saved_at: Date.now() }, ...s.saved] }));
      pushInteraction('save', job.job_id);
      toast.success('Job saved', { description: `${job.job_title} · ${job.company}` });
    },
    [state.saved, removeSaved, setState, pushInteraction]
  );

  const apply = useCallback(
    (job: Job) => {
      if (state.applications.some((a) => a.job_id === job.job_id)) return;
      const id = uid('app');
      const now = Date.now();
      trackRequest('POST /applications');
      const notice: AppNotification = { id: uid('n'), kind: 'application', title: 'Application sent', body: `Your application for ${job.job_title} at ${job.company} was submitted.`, at: now, read: false, link: '/applications' };
      setState((s) => ({
        ...s,
        applications: [{ id, job_id: job.job_id, applied_at: now, status: 'Applied', history: [{ status: 'Applied', at: now }] }, ...s.applications],
        notifications: notifyApplications ? [notice, ...s.notifications] : s.notifications
      }));
      pushInteraction('apply', job.job_id);
      toast.success('Application sent', { description: `${job.company} will see your profile and resume.` });

      const t = window.setTimeout(() => {
        setState((s) => ({
          ...s,
          applications: s.applications.map((a) =>
          a.id === id && a.status === 'Applied' ? { ...a, status: 'Under Review', history: [...a.history, { status: 'Under Review', at: Date.now() }] } : a
          ),
          notifications: notifyApplications ?
          [{ id: uid('n'), kind: 'application', title: 'Your application status changed', body: `${job.company} is now reviewing your ${job.job_title} application.`, at: Date.now(), read: false, link: '/applications' }, ...s.notifications] :
          s.notifications
        }));
        if (notifyApplications) toast('Application update', { description: `${job.company} is reviewing your application.` });
      }, 25_000);
      timers.current.push(t);
    },
    [state.applications, setState, pushInteraction, notifyApplications]
  );

  const dismiss = useCallback(
    (job: Job) => {
      const at = Date.now();
      trackRequest('POST /feedback');
      setState((s) => ({ ...s, interactions: [...s.interactions, { type: 'dismiss', job_id: job.job_id, at }] }));
      toast('We’ll show fewer jobs like this', {
        description: job.job_title,
        action: { label: 'Undo', onClick: () => setState((s) => ({ ...s, interactions: s.interactions.filter((i) => !(i.type === 'dismiss' && i.at === at)) })) }
      });
    },
    [setState]
  );

  const toggleCompare = useCallback(
    (jobId: string) => {
      if (state.compare.includes(jobId)) {
        setState((s) => ({ ...s, compare: s.compare.filter((c) => c !== jobId) }));
        return;
      }
      if (state.compare.length >= 3) {
        toast.error('You can compare up to 3 jobs', { description: 'Remove one to add another.' });
        return;
      }
      setState((s) => ({ ...s, compare: [...s.compare, jobId] }));
    },
    [state.compare, setState]
  );

  const value = useMemo<ActivityContextValue>(
    () => ({
      ...state,
      savedIds: state.saved.map((s) => s.job_id),
      appliedIds: state.applications.map((a) => a.job_id),
      unreadCount: state.notifications.filter((n) => !n.read).length,
      isSaved: (jobId) => state.saved.some((s) => s.job_id === jobId),
      applicationFor: (jobId) => state.applications.find((a) => a.job_id === jobId),
      track,
      toggleSave,
      removeSaved,
      apply,
      dismiss,
      toggleCompare,
      removeCompare: (jobId) => setState((s) => ({ ...s, compare: s.compare.filter((c) => c !== jobId) })),
      clearCompare: () => setState((s) => ({ ...s, compare: [] })),
      addAlert: (input) => {
        trackRequest('POST /alerts');
        setState((s) => ({ ...s, alerts: [{ ...input, id: uid('alert'), created_at: Date.now(), active: true }, ...s.alerts] }));
        toast.success('Your alert is active.', { description: `${input.name} · ${input.frequency.toLowerCase()} updates` });
      },
      updateAlert: (id, patch) => setState((s) => ({ ...s, alerts: s.alerts.map((a) => a.id === id ? { ...a, ...patch } : a) })),
      deleteAlert: (id) => setState((s) => ({ ...s, alerts: s.alerts.filter((a) => a.id !== id) })),
      markRead: (id) => setState((s) => ({ ...s, notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n) })),
      markAllRead: () => setState((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
      recordSearch: (query, results) => {
        const q = query.trim();
        if (!q) return;
        setState((s) => ({
          ...s,
          searchHistory: [{ query: q, at: Date.now(), results }, ...s.searchHistory.filter((h) => h.query.toLowerCase() !== q.toLowerCase())].slice(0, 20),
          interactions: [...s.interactions, { type: 'search' as const, query: q, at: Date.now() }].slice(-300)
        }));
      },
      clearSearchHistory: () => setState((s) => ({ ...s, searchHistory: [] }))
    }),
    [state, track, toggleSave, removeSaved, apply, dismiss, toggleCompare, setState]
  );

  return <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>;
}

export function useActivity(): ActivityContextValue {
  const ctx = useContext(ActivityContext);
  if (!ctx) throw new Error('useActivity must be used within ActivityProvider');
  return ctx;
}