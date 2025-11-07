'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';

const MODES = [
  { key: 'sign-in', label: 'Sign in' },
  { key: 'sign-up', label: 'Create account' },
  { key: 'reset', label: 'Reset password' }
] as const;

type Mode = (typeof MODES)[number]['key'];

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/';
  const [mode, setMode] = useState<Mode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { status, signIn, signUp, resetPassword, authError, isAuthenticating } = useAuth();

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace(redirect);
    }
  }, [redirect, router, status]);

  useEffect(() => {
    if (authError) {
      setFormError(authError);
    }
  }, [authError]);

  useEffect(() => {
    setFormError(null);
    setSuccessMessage(null);
    setPassword('');
  }, [mode]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    try {
      if (mode === 'sign-in') {
        await signIn({ email, password });
        setSuccessMessage('Signed in successfully. Redirecting…');
        router.replace(redirect);
      } else if (mode === 'sign-up') {
        await signUp({ email, password, displayName });
        setSuccessMessage('Account created. Please check your inbox to confirm your email.');
      } else if (mode === 'reset') {
        await resetPassword(email);
        setSuccessMessage('Password reset email sent. Please check your inbox.');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      setFormError(message);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-xl shadow-slate-950/40">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-white">Welcome back</h1>
          <Link href="/" className="text-xs text-slate-400 hover:text-white">
            ← Back home
          </Link>
        </div>

        <p className="mt-2 text-sm text-slate-400">
          {mode === 'sign-in' && 'Sign in with your Supabase credentials to continue.'}
          {mode === 'sign-up' && 'Create a new account to access the dashboard.'}
          {mode === 'reset' && 'Enter your email to receive a password reset link.'}
        </p>

        <div className="mt-6 grid grid-cols-3 gap-2 rounded-lg bg-slate-800/60 p-1">
          {MODES.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setMode(item.key)}
              className={`rounded-md py-2 text-xs font-semibold transition-colors ${
                mode === item.key ? 'bg-brand text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-brand focus:outline-none"
            />
          </div>

          {(mode === 'sign-in' || mode === 'sign-up') && (
            <div className="space-y-2">
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-brand focus:outline-none"
              />
            </div>
          )}

          {mode === 'sign-up' && (
            <div className="space-y-2">
              <label
                htmlFor="displayName"
                className="block text-xs font-semibold uppercase tracking-wide text-slate-400"
              >
                Display name (optional)
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                className="w-full rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-brand focus:outline-none"
              />
            </div>
          )}

          {formError && <p className="text-sm text-red-400">{formError}</p>}
          {successMessage && <p className="text-sm text-emerald-400">{successMessage}</p>}

          <button
            type="submit"
            className="w-full rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-foreground"
            disabled={isAuthenticating}
          >
            {mode === 'sign-in' && (isAuthenticating ? 'Signing in…' : 'Sign in')}
            {mode === 'sign-up' && (isAuthenticating ? 'Creating account…' : 'Create account')}
            {mode === 'reset' && (isAuthenticating ? 'Sending reset…' : 'Send reset email')}
          </button>
        </form>

        {mode !== 'sign-in' && (
          <p className="mt-6 text-center text-xs text-slate-500">
            Have an account?{' '}
            <button
              type="button"
              onClick={() => setMode('sign-in')}
              className="font-semibold text-white hover:underline"
            >
              Sign in
            </button>
          </p>
        )}

        {mode === 'sign-in' && (
          <p className="mt-6 text-center text-xs text-slate-500">
            Forgot your password?{' '}
            <button
              type="button"
              onClick={() => setMode('reset')}
              className="font-semibold text-white hover:underline"
            >
              Reset it
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
