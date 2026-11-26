import { startEventsReceiver } from '@repo/core/api/eventsReceiver';
import { disposeAccountBoundaryQueries } from '@repo/core/lib/clientStateFoundation';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useOptionalAuth } from '../../app/(sanctuary)/auth/AuthProvider';

/**
 * Removes account-bound Query data whenever the authenticated user ID changes,
 * preserving MutationCache ownership for the command lifecycle while preventing
 * cross-tenant or cross-session cache leaks in browser memory,
 * and maintains an active real-time SSE stream for tab-aware cache invalidation.
 */
export function AuthQueryCacheBoundary() {
  const queryClient = useQueryClient();
  const previousSubjectId = useRef<string | null | undefined>(undefined);

  // Outside AuthProvider the boundary has no subject and acts as a no-op.
  const auth = useOptionalAuth();
  const subjectId = auth?.state.session?.user.id ?? null;
  const accessToken = auth?.state.session?.access_token ?? null;

  useEffect(() => {
    if (previousSubjectId.current !== undefined && previousSubjectId.current !== subjectId) {
      void disposeAccountBoundaryQueries(queryClient, previousSubjectId.current).catch((error) => {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[Query cache] Account-bound query disposal failed:', error);
        }
      });
    }
    previousSubjectId.current = subjectId;
  }, [queryClient, subjectId]);

  useEffect(() => {
    if (!subjectId || !accessToken) return;

    const cleanup = startEventsReceiver({
      queryClient,
      getAuthToken: () => accessToken,
      onError: (err) => {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[SSE] Web event stream warning:', err.message);
        }
      },
    });

    return cleanup;
  }, [queryClient, subjectId, accessToken]);

  return null;
}
