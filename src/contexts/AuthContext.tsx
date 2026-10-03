import React, { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from 'react';
import type { Account, SessionUser, UserProfile } from '../types/user';
import { DEMO_ACCOUNT_ID, demoAccount } from '../data/demoAccount';
import { usePersistentState } from '../hooks/usePersistentState';
import { createEmptyProfile } from '../utils/profile';
import { track } from '../utils/api';

interface AuthContextValue {
  user: SessionUser | null;
  profile: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  loginDemo: () => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (email: string, password: string) => Promise<void>;
  updateProfile: (patch: Partial<UserProfile>) => void;
  completeOnboarding: (profile: UserProfile) => void;
  updateAccountDetails: (patch: {name?: string;email?: string;}) => void;
  changePassword: (current: string, next: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function AuthProvider({ children }: {children: ReactNode;}) {
  const [accounts, setAccounts] = usePersistentState<Account[]>('ijp.accounts.v1', () => [demoAccount]);
  const [sessionId, setSessionId] = usePersistentState<string | null>('ijp.session.v1', null);

  useEffect(() => {
    if (!accounts.some((a) => a.id === DEMO_ACCOUNT_ID)) setAccounts((list) => [demoAccount, ...list]);
  }, [accounts, setAccounts]);

  const account = accounts.find((a) => a.id === sessionId) ?? null;

  const user = useMemo<SessionUser | null>(
    () => account ? { id: account.id, name: account.name, email: account.email, role: account.role, onboarded: account.onboarded, createdAt: account.createdAt } : null,
    [account]
  );

  const mutateCurrent = useCallback(
    (fn: (a: Account) => Account) => setAccounts((list) => list.map((a) => a.id === sessionId ? fn(a) : a)),
    [sessionId, setAccounts]
  );

  const findByEmail = useCallback((email: string) => accounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase()), [accounts]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile: account?.profile ?? null,
      login: async (email, password) => {
        await wait(550);
        const acc = findByEmail(email);
        if (!acc || acc.password !== password) throw new Error('That email and password don’t match our records.');
        setSessionId(acc.id);
      },
      loginDemo: async () => {
        await wait(400);
        setSessionId(DEMO_ACCOUNT_ID);
      },
      signup: async (name, email, password) => {
        await wait(650);
        if (findByEmail(email)) throw new Error('An account with this email already exists. Try logging in instead.');
        const id = `acct-${Date.now().toString(36)}`;
        const acc: Account = {
          id,
          name: name.trim(),
          email: email.trim(),
          password,
          role: 'candidate',
          onboarded: false,
          createdAt: Date.now(),
          profile: createEmptyProfile(name.trim(), email.trim())
        };
        setAccounts((list) => [...list, acc]);
        setSessionId(id);
      },
      logout: () => setSessionId(null),
      requestPasswordReset: async () => {
        await wait(700);
      },
      resetPassword: async (email, password) => {
        await wait(600);
        const acc = findByEmail(email);
        if (!acc) throw new Error('We couldn’t find an account with that email.');
        setAccounts((list) => list.map((a) => a.id === acc.id ? { ...a, password } : a));
      },
      updateProfile: (patch) => {
        track('PUT /profile');
        mutateCurrent((a) => ({ ...a, name: patch.name ?? a.name, profile: { ...a.profile, ...patch } }));
      },
      completeOnboarding: (profile) => {
        track('PUT /profile');
        mutateCurrent((a) => ({ ...a, name: profile.name, onboarded: true, profile }));
      },
      updateAccountDetails: (patch) =>
      mutateCurrent((a) => ({
        ...a,
        name: patch.name ?? a.name,
        email: patch.email ?? a.email,
        profile: { ...a.profile, name: patch.name ?? a.profile.name, email: patch.email ?? a.profile.email }
      })),
      changePassword: async (current, next) => {
        await wait(600);
        if (!account || account.password !== current) throw new Error('Your current password is incorrect.');
        mutateCurrent((a) => ({ ...a, password: next }));
      }
    }),
    [user, account, findByEmail, setSessionId, setAccounts, mutateCurrent]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

/** For screens behind authentication, where a profile is guaranteed. */
export function useProfile(): UserProfile {
  const { profile } = useAuth();
  if (!profile) throw new Error('useProfile requires a signed-in user');
  return profile;
}