import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedLayout } from './components/layout/ProtectedLayout';
import { AppShell } from './components/layout/AppShell';
import { AdminLayout } from './components/layout/AdminLayout';
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { Onboarding } from './pages/Onboarding';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { JobDetails } from './pages/JobDetails';
import { Compare } from './pages/Compare';
import { SavedJobs } from './pages/SavedJobs';
import { Applications } from './pages/Applications';
import { Alerts } from './pages/Alerts';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { Notifications } from './pages/Notifications';
import { Insights } from './pages/Insights';
import { NotFound } from './pages/NotFound';
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminDataset } from './pages/admin/AdminDataset';
import { AdminModels } from './pages/admin/AdminModels';
import { AdminExperiments } from './pages/admin/AdminExperiments';
import { AdminClustering } from './pages/admin/AdminClustering';
import { AdminMonitoring } from './pages/admin/AdminMonitoring';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/onboarding" element={<Onboarding />} />

          <Route element={<ProtectedLayout />}>
            <Route element={<AppShell />}>
              <Route index element={<Home />} />
              <Route path="search" element={<Search />} />
              <Route path="jobs/:id" element={<JobDetails />} />
              <Route path="compare" element={<Compare />} />
              <Route path="saved" element={<SavedJobs />} />
              <Route path="applications" element={<Applications />} />
              <Route path="alerts" element={<Alerts />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="insights" element={<Insights />} />
            </Route>
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<AdminOverview />} />
              <Route path="dataset" element={<AdminDataset />} />
              <Route path="models" element={<AdminModels />} />
              <Route path="experiments" element={<AdminExperiments />} />
              <Route path="clustering" element={<AdminClustering />} />
              <Route path="monitoring" element={<AdminMonitoring />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster
          position="top-center"
          toastOptions={{
            style: { background: '#FFFDF9', border: '1px solid #E7DFD3', color: '#2A241F', fontFamily: 'Inter, system-ui, sans-serif' }
          }} />
        
      </AuthProvider>
    </BrowserRouter>);

}