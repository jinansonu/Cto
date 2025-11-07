"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';

const NAV_LINKS: Array<{ href: string; label: string; requiresAuth?: boolean }> = [
  { href: '/', label: 'Dashboard', requiresAuth: true },
  { href: '/profile', label: 'Profile', requiresAuth: true }
];

export const AppHeader = () => {
  const { status, user, signOut, isAuthenticating } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <header className="border-b border-slate-800">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold text-white">
          cto.new
        </Link>

        <nav className="flex items-center gap-6">
          {NAV_LINKS.map((link) => {
            if (link.requiresAuth && status !== 'authenticated') {
              return null;
            }

            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors ${
                  isActive ? 'text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4 text-sm text-slate-300">
          {status === 'authenticated' && user ? (
            <>
              <span className="hidden font-medium sm:inline">{user.email}</span>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-md border border-slate-700 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
                disabled={isAuthenticating}
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/auth"
              className="rounded-md border border-slate-700 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
