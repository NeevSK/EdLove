import { useAuth } from '@repo/core';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

/** Clears account-bound query data whenever the authenticated subject changes. */
export function AuthQueryCacheBoundary() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const previousSubjectId = useRef<string | null | undefined>(undefined);
  const subjectId = session?.user.id ?? null;

  useEffect(() => {
    if (previousSubjectId.current !== undefined && previousSubjectId.current !== subjectId) {
      queryClient.clear();
    }
    previousSubjectId.current = subjectId;
  }, [queryClient, subjectId]);

  return null;
}
