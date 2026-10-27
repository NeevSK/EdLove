import { useAuth } from '@repo/core';
import { startEventsReceiver } from '@repo/core/api/eventsReceiver';
import { setupHermesMemoryShield } from '@repo/core/efficiency';
import { disposeAccountBoundaryQueries } from '@repo/core/lib/clientStateFoundation';
import { coreRuntime } from '@repo/core/logic/runtimeRegistry';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { AppState } from 'react-native';

const nativeEventsLifecycle = {
  subscribe({ onSleep, onWake }: { onSleep: () => void; onWake: () => void }) {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') onWake();
      else onSleep();
    });
    return () => subscription.remove();
  },
};

/**
 * 1. Removes account-bound Query data without destroying MutationCache commands.
 * 2. Maintains an active real-time SSE event stream for live cache invalidation
 *    respecting Convivial Sleep on mobile backgrounding.
 * 3. Activates The 2GB Android Device Shield (Hermes Memory Reclamation Engine)
 *    to proactively evict inactive queries and compact Hades heap on background/idle.
 */
export function AuthQueryCacheBoundary() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const subjectId = session?.user.id ?? null;

  useEffect(
    () =>
      useAuthStore.subscribe((state, previous) => {
        const outgoingAccountId = previous.user?.id ?? null;
        if (outgoingAccountId === (state.user?.id ?? null)) return;
        void disposeAccountBoundaryQueries(queryClient, outgoingAccountId).catch((error) => {
          console.error('[Query cache] Account-bound query disposal failed:', error);
        });
      }),
    [queryClient],
  );

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
      lifecycle: nativeEventsLifecycle,
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
