import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircleIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { TextField } from '../../components/ui/TextField';
import { Button } from '../../components/ui/Button';
import { DEMO_EMAIL, DEMO_PASSWORD } from '../../data/demoAccount';

export function Login() {
  const { login, loginDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as {from?: string;} | null)?.from ?? '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{email?: string;password?: string;}>({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState<'form' | 'demo' | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Enter a valid email address.';
    if (!password) next.password = 'Enter your password.';
    setErrors(next);
    setFormError('');
    if (Object.keys(next).length) return;
    setLoading('form');
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong.');
      setLoading(null);
    }
  };

  const onDemo = async () => {
    setLoading('demo');
    await loginDemo();
    navigate(from, { replace: true });
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle={
      <>
          New here?{' '}
          <Link to="/signup" className="font-medium text-sage-700 hover:text-sage-800">
            Create an account
          </Link>
        </>
      }>
      
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {formError &&
        <div role="alert" className="flex items-start gap-2 rounded-md border border-rust-500/30 bg-rust-50 px-3 py-2.5 text-sm text-rust-600">
            <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {formError}
          </div>
        }
        <TextField label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} placeholder="you@example.com" />
        <div className="relative">
          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            trailing={
            <Link to="/forgot-password" className="text-sm font-medium text-sage-700 hover:text-sage-800">
                Forgot password?
              </Link>
            } />
          
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-[34px] rounded p-1.5 text-ink-muted hover:text-ink"
            aria-label={showPassword ? 'Hide password' : 'Show password'}>
            
            {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
          </button>
        </div>
        <Button type="submit" size="lg" className="w-full" loading={loading === 'form'}>
          Log in
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-ink-muted">
        <span className="h-px flex-1 bg-line" />
        or
        <span className="h-px flex-1 bg-line" />
      </div>
      <Button variant="secondary" size="lg" className="w-full" onClick={onDemo} loading={loading === 'demo'}>
        Explore with a demo profile
      </Button>
      <p className="mt-3 text-center text-xs text-ink-muted">
        Demo login: {DEMO_EMAIL} · {DEMO_PASSWORD}
      </p>
    </AuthLayout>);

}