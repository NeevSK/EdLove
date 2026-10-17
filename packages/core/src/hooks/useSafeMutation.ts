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

export type MutationStatus = 'idle' | 'pending' | 'success' | 'error';

export interface SafeMutationOptions<TData, TVariables, TContext = unknown> {
  /** Unique key for outbox tracking, idempotency hashing, and deduplication (e.g. 'createPost') */
  mutationKey: string;
  /** Bounded feature scope (e.g. 'community', 'classroom', 'self') */
  scope: string;
  /** Explicit mutation action type */
  mutationType: 'CREATE' | 'UPDATE' | 'DELETE' | 'CUSTOM' | 'PATCH';
  /** Called before mutation runs. Returns optional rollback context passed to onError and onSettled */
  onMutate?: (variables: TVariables) => Promise<TContext | void> | TContext | void;
  /** Called on successful online execution or offline queueing */
  onSuccess?: (
    data: TData | null,
    variables: TVariables,
    context?: TContext,
  ) => Promise<unknown> | unknown;
  /** Called on network / server execution failure */
  onError?: (
    error: unknown,
    variables: TVariables,
    context?: TContext,
  ) => Promise<unknown> | unknown;
  /** Called when mutation settles (either success or error) */
  onSettled?: (
    data: TData | null | undefined,
    error: unknown | null,
    variables: TVariables,
    context?: TContext,
  ) => Promise<unknown> | unknown;
  retryCount?: number;
  originalVariables?: TVariables; // For Delta-Resonance diffing
}

export interface SafeMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData | null>;
  mutateAsync: (variables: TVariables) => Promise<TData | null>;
  status: MutationStatus;
  isPending: boolean;
  isLoading: boolean; // Backwards compatible alias for isPending
  isSuccess: boolean;
  isError: boolean;
  isIdle: boolean;
  data: TData | null;
  error: Error | null;
  reset: () => void;
}

/**
 * Fast synchronous 32-bit hash for instant (< 0.01ms) UI in-flight tap debouncing.
 * Avoids microtask latency before executing onMutate / network dispatch.
 */
function fastSyncKey(scope: string, name: string, vars: unknown, userId?: string): string {
  const varsStr = typeof vars === 'object' && vars !== null ? JSON.stringify(vars) : String(vars);
  const raw = `${scope}:${name}:${userId || ''}:${varsStr}`;
  let hash = 2166136261;
  for (let i = 0; i < raw.length; i++) {
    hash ^= raw.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

interface MutationState<TData> {
  status: MutationStatus;
  data: TData | null;
  error: Error | null;
}

/**
 * useSafeMutation
 *
 * A high-resilience hook for performing write operations (POST/PATCH/DELETE).
 * Upgraded with:
 * - Ultra-low latency Sync Fast-Hash Tap Debouncing (< 0.01ms)
 * - Single-Tuple Atomic State Transition (zero cascading re-renders)
 * - TanStack-grade Ergonomics (status, isPending, isSuccess, isError, mutateAsync, reset)
 * - Optimistic Rollback Context (TContext across onMutate, onError, onSuccess, onSettled)
 * - Resonant Audit Logging (Temporal memory)
 * - Deterministic Idempotency Keys (Spatial dedup for outbox)
 * - Account-isolated Multi-Tenant Outbox Routing
 * - Effect-TS v4 future-ready error boundaries
 * - 100% Platform Agnostic & Hexagonal (zero web/mobile host leaks)
 */
export function useSafeMutation<TData, TVariables, TContext = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: SafeMutationOptions<TData, TVariables, TContext>,
): SafeMutationResult<TData, TVariables> {
  const [state, setState] = useState<MutationState<TData>>({
    status: 'idle',
    data: null,
    error: null,
  });

  const inFlightKeysRef = useRef<Set<string>>(new Set());
  const showToast = useAuthStore((s) => s.showToast);
  const addToQueue = useMutationQueue((s) => s.addToQueue);
  const logAudit = useMutationAuditLog((s) => s.logEntry);

  const reset = useCallback(() => {
    setState({
      status: 'idle',
      data: null,
      error: null,
    });
  }, []);

  const mutateAsync = useCallback(
    async (variables: TVariables): Promise<TData | null> => {
      const { scope, mutationKey: name, mutationType } = options;
      const studentId = useAuthStore.getState().user?.id;

      // 1. Instant Synchronous Fast-Hash for in-flight UI tap deduplication (< 0.01ms)
      const inFlightKey = fastSyncKey(scope, name, variables, studentId);
      if (inFlightKeysRef.current.has(inFlightKey)) {
        if (__DEV__) {
          console.log(`[useSafeMutation] In-flight tap suppressed: ${name}`);
        }
        return null;
      }
      inFlightKeysRef.current.add(inFlightKey);

      // 2. Atomic pending state update
      setState({
        status: 'pending',
        data: null,
        error: null,
      });

      let context: TContext | undefined;
      if (options?.onMutate) {
        try {
          const result = await options.onMutate(variables);
          if (result !== undefined) {
            context = result as TContext;
          }
        } catch (mutateErr) {
          console.warn('[useSafeMutation] onMutate hook threw an error:', mutateErr);
        }
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

        setState({
          status: 'success',
          data: result,
          error: null,
        });

        if (options?.onSuccess) {
          await options.onSuccess(result, variables, context);
        }
        if (options?.onSettled) {
          await options.onSettled(result, null, variables, context);
        }

        return result;
      } catch (err: unknown) {
        const isOffline =
          err instanceof OfflineMutationError ||
          (err &&
            typeof err === 'object' &&
            '_tag' in err &&
            (err as { _tag: string })._tag === 'OfflineMutationError') ||
          (err &&
            typeof err === 'object' &&
            'cause' in err &&
            (err as any).cause?._tag === 'OfflineMutationError') ||
          (err &&
            typeof err === 'object' &&
            'cause' in err &&
            (err as any).cause?.name === 'OfflineMutationError') ||
          (err &&
            typeof err === 'object' &&
            'details' in err &&
            (err as any).details?.devDetails?._tag === 'OfflineMutationError') ||
          (err &&
            typeof err === 'object' &&
            'details' in err &&
            (err as any).details?.devDetails?.name === 'OfflineMutationError') ||
          (err instanceof Error &&
            (err.message === 'Network request failed' ||
              err.message === 'Offline mutation failed' ||
              err.name === 'OfflineMutationError'));

        if (isOffline) {
          const mutationId = uuidv7();
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
          let finalType = mutationType;

          if (options.originalVariables && (finalType === 'UPDATE' || finalType === 'PATCH')) {
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

          setState({
            status: 'success',
            data: null,
            error: null,
          });

          if (options.onSuccess) {
            await options.onSuccess(null, variables, context);
          }
          if (options.onSettled) {
            await options.onSettled(null, null, variables, context);
          }
          return null;
        }

        const errorMessage = err instanceof Error ? err.message : String(err);
        const resolvedError = err instanceof Error ? err : new Error(errorMessage);

        setState({
          status: 'error',
          data: null,
          error: resolvedError,
        });

        if (options?.onError) {
          await options.onError(err, variables, context);
        } else {
          showToast(errorMessage || 'Action failed', 'error');
        }

        if (options?.onSettled) {
          await options.onSettled(undefined, err, variables, context);
        }

        throw err;
      } finally {
        inFlightKeysRef.current.delete(inFlightKey);
      }
    },
    [mutationFn, options, showToast, addToQueue, logAudit],
  );

  const mutate = useCallback(
    async (variables: TVariables): Promise<TData | null> => {
      try {
        return await mutateAsync(variables);
      } catch {
        // mutate does not re-throw on error, relying on onError / isError states
        return null;
      }
    },
    [mutateAsync],
  );

  const isPending = state.status === 'pending';
  const isSuccess = state.status === 'success';
  const isError = state.status === 'error';
  const isIdle = state.status === 'idle';

  return {
    mutate,
    mutateAsync,
    status: state.status,
    isPending,
    isLoading: isPending,
    isSuccess,
    isError,
    isIdle,
    data: state.data,
    error: state.error,
    reset,
  };
}
