import { OfflineMutationError, runToPromise } from '@repo/core/effect';
import { DeltaResonance } from '@repo/core/lib/sync/delta';
import { generateIdempotencyKey } from '@repo/core/lib/sync/idempotency';
import { useMutationAuditLog } from '@repo/core/lib/sync/MutationAuditLog';
import { useMutationQueue } from '@repo/core/lib/sync/useMutationQueue';
import { networkManager } from '@repo/core/logic/managers/NetworkManager';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { executeMutation$ } from '@repo/core/utils/mutation';
import { useCallback, useRef, useState } from 'react';
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
 * - Account-isolated Multi-Tenant Outbox Routing
 * - In-Flight Tap Debouncing
 * - Effect-TS v4 future-ready error boundaries
 */
export function useSafeMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: SafeMutationOptions<TData, TVariables>,
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const inFlightKeysRef = useRef<Set<string>>(new Set());
  const showToast = useAuthStore((state) => state.showToast);
  const addToQueue = useMutationQueue((state) => state.addToQueue);
  const logAudit = useMutationAuditLog((state) => state.logEntry);

  const mutate = useCallback(
    async (variables: TVariables) => {
      const scope = options?.scope || 'general';
      const name = options?.mutationKey || 'mutation';
      const studentId = useAuthStore.getState().user?.id;
      const idempotencyKey = await generateIdempotencyKey(scope, name, variables, studentId);

      // In-flight Tap Debounce Protection: Prevent identical rapid taps from kicking off duplicate network calls
      if (inFlightKeysRef.current.has(idempotencyKey)) {
        if (__DEV__) {
          console.log(`[useSafeMutation] In-flight tap suppressed: ${name}`);
        }
        return null as TData;
      }
      inFlightKeysRef.current.add(idempotencyKey);

      setIsLoading(true);
      setError(null);

      if (options?.onMutate) {
        options.onMutate(variables);
      }

      try {
        const result = await runToPromise(
          executeMutation$({
            isConnected: () => networkManager.isConnected(),
            mutation: () => mutationFn(variables),
            retryCount: options?.retryCount,
          }),
          'SAFE_MUTATION_EXECUTION',
        );

        if (options?.onSuccess) {
          options.onSuccess(result, variables);
        }

        return result;
      } catch (err: unknown) {
        const isOffline =
          err instanceof OfflineMutationError ||
          (err && typeof err === 'object' && '_tag' in err && (err as { _tag: string })._tag === 'OfflineMutationError') ||
          (err && typeof err === 'object' && 'cause' in err && (err as any).cause?._tag === 'OfflineMutationError') ||
          (err && typeof err === 'object' && 'cause' in err && (err as any).cause?.name === 'OfflineMutationError') ||
          (err && typeof err === 'object' && 'details' in err && (err as any).details?.devDetails?._tag === 'OfflineMutationError') ||
          (err && typeof err === 'object' && 'details' in err && (err as any).details?.devDetails?.name === 'OfflineMutationError') ||
          (err instanceof Error && (err.message === 'Network request failed' || err.message === 'Offline mutation failed' || err.name === 'OfflineMutationError'));

        if (isOffline) {
          if (options?.mutationKey) {
            const mutationId = uuidv7();

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
              userId: studentId,
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
        inFlightKeysRef.current.delete(idempotencyKey);
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

