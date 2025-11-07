'use client';

import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';

export default function DashboardPage() {
  const { status, profile, user, isProfileLoading } = useAuth();

  if (status === 'loading') {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
        Checking authentication status...
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-3xl font-semibold text-white">Welcome to cto.new</h1>
        <p className="max-w-md text-sm text-slate-400">
          Sign in to access your personalized dashboard and manage your profile details.
        </p>
        <Link
          href="/auth"
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-foreground"
        >
          Go to authentication
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-slate-950/40">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-2 text-sm text-slate-400">
          You are authenticated with Supabase. Use the profile tab to update your information.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-lg font-semibold text-white">Account</h2>
          <dl className="mt-4 space-y-3 text-sm text-slate-300">
            <div className="flex justify-between">
              <dt>Email</dt>
              <dd className="font-medium text-white">{user?.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Display name</dt>
              <dd className="font-medium text-white">
                {isProfileLoading ? 'Loading…' : profile?.display_name ?? 'Not set'}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-lg font-semibold text-white">Next steps</h2>
          <p className="mt-2 text-sm text-slate-400">
            Keep your profile information up to date. You can edit your display name or upload a new
            avatar at any time.
          </p>
          <Link
            href="/profile"
            className="mt-4 inline-flex items-center justify-center rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-foreground"
          >
            Manage profile
          </Link>
        </div>
      </section>
    </div>
  );
}
