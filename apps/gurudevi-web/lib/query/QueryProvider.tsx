'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { AuthQueryCacheBoundary } from './AuthQueryCacheBoundary';
import { getQueryClient } from './getQueryClient';

/**
 * Root QueryProvider for gurudevi-web:
 * - Uses isomorphic getQueryClient() to prevent server singleton leakage
 * - Mounts AuthQueryCacheBoundary to isolate multi-account data
 */
export function QueryProvider({ children }: Readonly<{ children: ReactNode }>) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthQueryCacheBoundary />
      {children}
    </QueryClientProvider>
  );
}
