import { useAuth } from '@repo/core';
import { startEventsReceiver } from '@repo/core/api/eventsReceiver';
import { setupHermesMemoryShield } from '@repo/core/efficiency';
import { coreRuntime } from '@repo/core/logic/runtimeRegistry';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

/**
 * 1. Clears account-bound query data whenever the authenticated subject changes.
 * 2. Maintains an active real-time SSE event stream for live cache invalidation
 *    respecting Convivial Sleep on mobile backgrounding.
 * 3. Activates The 2GB Android Device Shield (Hermes Memory Reclamation Engine)
 *    to proactively evict inactive queries and compact Hades heap on background/idle.
 */
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

  // Activate 2GB Android Device Shield & Hermes Memory Reclamation
  useEffect(() => {
    let totalMemory: number | null = null;
    try {
      totalMemory = coreRuntime.device.getTotalMemory?.() ?? null;
    } catch {
      totalMemory = null;
    }

    const cleanup = setupHermesMemoryShield({
      queryClient,
      totalMemoryBytes: totalMemory,
      onReclaim: (result) => {
        if (__DEV__) {
          console.log(
            `[Device Shield] Reclaimed ${result.reclaimedBytes}B from Hermes heap (${result.evictedQueriesCount} inactive queries evicted). Reason: ${result.reason}`,
          );
        }
      },
    });

    return cleanup;
  }, [queryClient]);


  useEffect(() => {
    if (!subjectId || !session?.access_token) return;

    const cleanup = startEventsReceiver({
      queryClient,
      getAuthToken: () => session.access_token,
      onError: (err) => {
        if (__DEV__) {
          console.warn('[SSE] Event stream warning:', err.message);
        }
      },
    });

    return cleanup;
  }, [queryClient, subjectId, session?.access_token]);

  return null;
}

