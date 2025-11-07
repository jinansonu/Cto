import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import { MainLayout } from '@/components/layout/main-layout';
import './globals.css';

export const metadata: Metadata = {
  title: 'CTO App',
  description: 'An intelligent AI assistant application',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <MainLayout>{children}</MainLayout>
        </Providers>
      </body>
    </html>
  );
}
