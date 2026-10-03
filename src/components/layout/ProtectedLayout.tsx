import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ActivityProvider } from '../../contexts/ActivityContext';
import { DEMO_ACCOUNT_ID, createDemoActivity, createEmptyActivity } from '../../data/demoAccount';

/** Gate for signed-in, onboarded users. Provides per-user activity state to everything below. */
export function ProtectedLayout() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  if (!user.onboarded) return <Navigate to="/onboarding" replace />;

  return (
    <ActivityProvider key={user.id} userId={user.id} seed={user.id === DEMO_ACCOUNT_ID ? createDemoActivity : createEmptyActivity}>
      <Outlet />
    </ActivityProvider>);

}