import { DeltaResonance } from '@repo/core/lib/sync/delta';
import { generateIdempotencyKey } from '@repo/core/lib/sync/idempotency';
import { useMutationAuditLog } from '@repo/core/lib/sync/MutationAuditLog';
import { useMutationQueue } from '@repo/core/lib/sync/useMutationQueue';
import { networkManager } from '@repo/core/logic/managers/NetworkManager';
import { useStore } from '@repo/core/store/useStore';
import { executeMutation$, OfflineMutationError } from '@repo/core/utils/mutation';
import { Effect } from 'effect';
import { useCallback, useState } from 'react';
import { v7 as uuidv7 } from 'uuid';

interface SafeMutationOptions<TData, TVariables> {
  mutationKey?: string; // Unique key for queueing (e.g. 'createPost')
  scope?: string; // Feature scope (e.g. 'community')
  onMutate?: (variables: TVariables) => void;
  onSuccess?: (data: TData | null, variables: TVariables) => void;
  onError?: (error: unknown, variables: TVariables, rollback?: () => void) => void;
  retryCount?: number;
  mutationType?: 'CREATE' | 'UPDATE' | 'DELETE' | 'CUSTOM' | 'PATCH';
  originalVariables?: TVariables; // For Delta-Resonance diffing
}

/**
 * useSafeMutation
 *
 * A high-resilience hook for performing write operations (POST/PATCH/DELETE).
 * Upgraded with:
 * - Resonant Audit Logging (Temporal memory)
 * - Deterministic Idempotency Keys (Spatial dedup)
 */
export function useSafeMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: SafeMutationOptions<TData, TVariables>,
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const showToast = useStore((state) => state.showToast);
  const addToQueue = useMutationQueue((state) => state.addToQueue);
  const logAudit = useMutationAuditLog((state) => state.logEntry);

  const mutate = useCallback(
    async (variables: TVariables) => {
      setIsLoading(true);
      setError(null);

      if (options?.onMutate) {
        options.onMutate(variables);
      }

      try {
        const result = await Effect.runPromise(
          executeMutation$({
            isConnected: () => networkManager.isConnected(),
            mutation: () => mutationFn(variables),
            retryCount: options?.retryCount,
          }),
        );

        if (options?.onSuccess) {
          options.onSuccess(result, variables);
        }

        return result;
      } catch (err: unknown) {
        const isOffline =
          err instanceof OfflineMutationError ||
          (err instanceof Error && err.message === 'Network request failed');

        if (isOffline) {
          if (options?.mutationKey) {
            const mutationId = uuidv7();
            const scope = options.scope || 'general';
            const name = options.mutationKey;

            const studentId = useStore.getState().user?.id;
            const idempotencyKey = await generateIdempotencyKey(scope, name, variables, studentId);

            logAudit({
              id: mutationId,
              idempotencyKey,
              scope,
              name,
              status: 'queued',
              attempts: 0,
              queuedAt: Date.now(),
            });

            let finalVariables = variables;
            let finalType = options.mutationType || 'CREATE';

            if (options?.originalVariables && (finalType === 'UPDATE' || finalType === 'PATCH')) {
              const patch = DeltaResonance.diff(options.originalVariables, variables);
              if (patch.length > 0) {
                finalVariables = patch as any;
                finalType = 'PATCH';
              }
            }

            await addToQueue({
              name,
              scope,
              variables: finalVariables,
              type: finalType,
            });

            showToast('Saved to Outbox (Offline)', 'info');

            if (options?.onSuccess) {
              options.onSuccess(null, variables);
            }
            return null as TData;
          } else {
            console.warn('[SyncResonance] Cannot queue without mutationKey');
            showToast('Action failed (Offline)', 'error');
          }
        }

        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(err instanceof Error ? err : new Error(errorMessage));
        if (options?.onError) options.onError(err, variables);
        else showToast(errorMessage || 'Action failed', 'error');

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [mutationFn, options, showToast, addToQueue, logAudit],
  );

  return {
    mutate,
    isLoading,
    error,
  };
}
