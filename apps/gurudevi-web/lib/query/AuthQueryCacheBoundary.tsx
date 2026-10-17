'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useAuth } from '../../app/(sanctuary)/auth/AuthProvider';

/**
 * Clears account-bound and tenant-bound query data whenever the authenticated user ID changes,
 * preventing cross-tenant or cross-session cache leaks in browser memory.
 */
export function AuthQueryCacheBoundary() {
  const queryClient = useQueryClient();
  const previousSubjectId = useRef<string | null | undefined>(undefined);

  let subjectId: string | null = null;
  try {
    const auth = useAuth();
    subjectId = auth.state.session?.user.id ?? null;
  } catch {
    // If rendered outside AuthProvider context, boundary acts safely as no-op
    subjectId = null;
  }

  useEffect(() => {
    if (previousSubjectId.current !== undefined && previousSubjectId.current !== subjectId) {
      queryClient.clear();
    }
    previousSubjectId.current = subjectId;
  }, [queryClient, subjectId]);

  return null;
}
