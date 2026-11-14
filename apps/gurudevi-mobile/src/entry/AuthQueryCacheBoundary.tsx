import { setupHermesMemoryShield } from '@repo/core/efficiency';
import { disposeAccountBoundaryQueries } from '@repo/core/lib/clientStateFoundation';
import { coreRuntime } from '@repo/core/logic/runtimeRegistry';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

/**
 * 1. Removes account-bound Query data without destroying MutationCache commands.
 * 2. Activates The 2GB Android Device Shield (Hermes Memory Reclamation Engine)
 *    to proactively evict inactive queries and compact Hades heap on background/idle.
 */
export function AuthQueryCacheBoundary() {
  const queryClient = useQueryClient();

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

  return null;
}
