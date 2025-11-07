'use client';

import { ReactNode } from 'react';
import { Navigation } from './navigation';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-col h-screen">
      <main className="flex-1 overflow-auto pb-nav">{children}</main>
      <Navigation />
    </div>
  );
}
