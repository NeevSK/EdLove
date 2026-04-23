import NetInfo from '@react-native-community/netinfo';
import { useCallback, useState } from 'react';
import { v7 as uuidv7 } from 'uuid';
import { generateIdempotencyKey } from '../lib/sync/idempotency';
import { useMutationAuditLog } from '../lib/sync/MutationAuditLog';
import { useMutationQueue } from '../lib/sync/useMutationQueue';
import { useStore } from '../store/useStore';

interface SafeMutationOptions<TData, TVariables> {
  mutationKey?: string; // Unique key for queueing (e.g. 'createPost')
  scope?: string; // Feature scope (e.g. 'community')
  onMutate?: (variables: TVariables) => void;
  onSuccess?: (data: TData | null, variables: TVariables) => void;
  onError?: (error: unknown, variables: TVariables, rollback?: () => void) => void;
  retryCount?: number;
  mutationType?: 'CREATE' | 'UPDATE' | 'DELETE' | 'CUSTOM';
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

      // 1. Optimistic Update
      if (options?.onMutate) {
        options.onMutate(variables);
      }

      const executeRequest = async (attempt: number): Promise<TData> => {
        try {
          // Check connectivity
          const state = await NetInfo.fetch();
          if (!state.isConnected) {
            throw new Error('OFFLINE_QUEUE');
          }

          return await mutationFn(variables);
        } catch (err: unknown) {
          if (err instanceof Error && err.message === 'OFFLINE_QUEUE') throw err;

          if (attempt < (options?.retryCount || 3)) {
            const delay = 2 ** attempt * 1000;
            await new Promise((resolve) => setTimeout(resolve, delay));
            return executeRequest(attempt + 1);
          }
          throw err;
        }
      };

      try {
        const result = await executeRequest(0);

        if (options?.onSuccess) {
          options.onSuccess(result, variables);
        }

        return result;
      } catch (err: unknown) {
        // Queue for later if network issue or offline signal
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (errorMessage === 'OFFLINE_QUEUE' || errorMessage === 'Network request failed') {
          if (options?.mutationKey) {
            const mutationId = uuidv7(); // Upgraded to v7 for better DB locality
            const scope = options.scope || 'general';
            const name = options.mutationKey;

            // Fetch studentId from store for better salting
            const studentId = useStore.getState().user?.id;
            const idempotencyKey = await generateIdempotencyKey(scope, name, variables, studentId);

            // 1. Audit Entry (Temporal Birth)
            logAudit({
              id: mutationId,
              idempotencyKey,
              scope,
              name,
              status: 'queued',
              attempts: 0,
              queuedAt: Date.now(),
            });

            // 2. Queue for Persistence
            await addToQueue({
              name,
              scope,
              variables,
              type: options.mutationType || 'CREATE',
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
