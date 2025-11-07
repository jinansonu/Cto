import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers/providers';
import { AppHeader } from '@/components/layout/app-header';

export const metadata: Metadata = {
  title: 'cto.new App',
  description: 'A Supabase-powered auth experience in Next.js'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <AppHeader />
            <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
