'use client';

import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';
import { ProfileEditor } from '@/components/profile/profile-editor';

export default function ProfilePage() {
  const { status } = useAuth();

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
        <h1 className="text-2xl font-semibold text-white">Authentication required</h1>
        <p className="max-w-md text-sm text-slate-400">
          You must be signed in to update your profile details.
        </p>
        <Link
          href="/auth"
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-foreground"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ProfileEditor />
    </div>
  );
}
