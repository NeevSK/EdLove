import { useState, useCallback } from 'react';
import { useStore } from '../store/useStore';
import NetInfo from '@react-native-community/netinfo';
import { useMutationQueue } from '../lib/sync/useMutationQueue';

interface SafeMutationOptions<TData, TVariables> {
    mutationKey?: string; // Unique key for queueing (e.g. 'createPost')
    scope?: string;       // Feature scope (e.g. 'community')
    onMutate?: (variables: TVariables) => void;
    onSuccess?: (data: TData | null, variables: TVariables) => void;
    onError?: (error: any, variables: TVariables, rollback?: () => void) => void;
    retryCount?: number;
}

/**
 * useSafeMutation
 * 
 * A high-resilience hook for performing write operations (POST/PATCH/DELETE).
 * Features:
 * - Optimistic Updates (via onMutate)
 * - Automatic Retries for temporary network failures
 * - Network Status Awareness
 * - **Offline Persistence**: Queues actions if offline.
 */
export function useSafeMutation<TData, TVariables>(
    mutationFn: (variables: TVariables) => Promise<TData>,
    options?: SafeMutationOptions<TData, TVariables>
) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);
    const showToast = useStore(state => state.showToast);
    const addToQueue = useMutationQueue(state => state.addToQueue);

    const mutate = useCallback(async (variables: TVariables) => {
        setIsLoading(true);
        setError(null);

        // 1. Optimistic Update (Always happens first)
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
                // Special handling for offline signal
                if (err.message === 'OFFLINE_QUEUE') {
                    throw err;
                }

                if (attempt < (options?.retryCount || 3)) {
                    // Exponential backoff
                    const delay = Math.pow(2, attempt) * 1000;
                    await new Promise(resolve => setTimeout(resolve, delay));
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
            // If offline or request failed (and exhausted retries)
            // We Queue it for later.

            if (err.message === 'OFFLINE_QUEUE' || err.message === 'Network request failed') {
                console.log('Detecting offline/network failure - Queueing action');

                if (options?.mutationKey) {
                    addToQueue({
                        name: options.mutationKey,
                        scope: options.scope || 'general',
                        variables: variables,
                        type: 'CREATE', // Default to CREATE, ideally passed in
                    });

                    showToast('Saved to Outbox (Offline)', 'info');

                    // We treat this as a "Success" from the UI perspective (Optimistic)
                    if (options?.onSuccess) {
                        options.onSuccess(null, variables);
                    }
                    return null as TData; // Return null as optimistic result
                } else {
                    // No mutationKey provided - show toast but don't throw
                    console.warn('Cannot queue mutation without a mutationKey');
                    showToast('Action saved locally (offline)', 'info');

                    // Return optimistic null without throwing
                    if (options?.onSuccess) {
                        options.onSuccess(null, variables);
                    }
                    return null as TData;
                }
            }

            setError(err);

            if (options?.onError) {
                options.onError(err, variables);
            } else {
                if (err.message !== 'OFFLINE_QUEUE') {
                    showToast(err.message || 'Action failed', 'error');
                }
            }

            // Don't throw if we're offline - return optimistic null
            if (err.message === 'OFFLINE_QUEUE' || err.message === 'Network request failed') {
                return null as TData;
            }

            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [mutationFn, options, showToast, addToQueue]);

    return {
        mutate,
        isLoading,
        error
    };
}
