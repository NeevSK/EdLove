import NetInfo from '@react-native-community/netinfo';
import { useCallback, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { generateIdempotencyKey } from '../lib/sync/idempotency';
import { useMutationAuditLog } from '../lib/sync/MutationAuditLog';
import { useMutationQueue } from '../lib/sync/useMutationQueue';
import { useStore } from '../store/useStore';

interface SafeMutationOptions<TData, TVariables> {
  mutationKey?: string; // Unique key for queueing (e.g. 'createPost')
  scope?: string; // Feature scope (e.g. 'community')
  onMutate?: (variables: TVariables) => void;
  onSuccess?: (data: TData | null, variables: TVariables) => void;
  onError?: (error: any, variables: TVariables, rollback?: () => void) => void;
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
  const [error, setError] = useState<any>(null);
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
        } catch (err: any) {
          if (err.message === 'OFFLINE_QUEUE') throw err;

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
      } catch (err: any) {
        // Queue for later if network issue or offline signal
        if (err.message === 'OFFLINE_QUEUE' || err.message === 'Network request failed') {
          if (options?.mutationKey) {
            const mutationId = uuidv4();
            const scope = options.scope || 'general';
            const name = options.mutationKey;

            const idempotencyKey = generateIdempotencyKey(scope, name, variables);

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
            addToQueue({
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

        setError(err);
        if (options?.onError) options.onError(err, variables);
        else showToast(err.message || 'Action failed', 'error');

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
