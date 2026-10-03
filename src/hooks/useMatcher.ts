import { useMemo } from 'react';
import { useProfile } from '../contexts/AuthContext';
import { useActivity } from '../contexts/ActivityContext';
import { createMatcher, type Matcher } from '../utils/ml/recommender';

/** Serving-time matcher for the signed-in candidate; re-derives when profile or feedback changes. */
export function useMatcher(): Matcher {
  const profile = useProfile();
  const { interactions } = useActivity();
  return useMemo(() => createMatcher(profile, interactions), [profile, interactions]);
}