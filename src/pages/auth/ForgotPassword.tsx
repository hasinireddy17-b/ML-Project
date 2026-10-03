import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MailCheckIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { TextField } from '../../components/ui/TextField';
import { Button, buttonStyles } from '../../components/ui/Button';

export function ForgotPassword() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Enter a valid email address.');
      return;
    }
    setError('');
    setLoading(true);
    await requestPasswordReset(email);
    setLoading(false);
    setSent(true);
  };

  if (sent) {
    return (
      <AuthLayout title="Check your email">
        <div className="rounded-lg border border-line bg-surface p-5">
          <MailCheckIcon className="h-6 w-6 text-sage-700" aria-hidden="true" />
          <p className="mt-3 text-[15px] text-ink-soft">
            If an account exists for <span className="font-medium text-ink">{email}</span>, we’ve sent a link to reset your password. It expires in 30 minutes.
          </p>
        </div>
        <Link to={`/reset-password?email=${encodeURIComponent(email)}`} className={buttonStyles('primary', 'lg', 'mt-6 w-full')}>
          Open reset link
        </Link>
        <Link to="/login" className="mt-4 block text-center text-sm font-medium text-sage-700 hover:text-sage-800">
          Back to log in
        </Link>
      </AuthLayout>);

  }

  return (
    <AuthLayout title="Reset your password" subtitle="Enter the email you signed up with and we’ll send you a reset link.">
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <TextField label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={error} />
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Send reset link
        </Button>
      </form>
      <Link to="/login" className="mt-6 block text-center text-sm font-medium text-sage-700 hover:text-sage-800">
        Back to log in
      </Link>
    </AuthLayout>);

}