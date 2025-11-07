"use client";

import type { ReactNode } from 'react';
import { AuthProvider } from './auth-provider';

export const Providers = ({ children }: { children: ReactNode }) => {
  return <AuthProvider>{children}</AuthProvider>;
};
