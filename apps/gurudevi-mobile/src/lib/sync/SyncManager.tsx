
import React, { useEffect } from 'react';
import { useStore, useMutationQueue } from '@repo/core';
import { MUTATION_REGISTRY } from './registry';

/**
 * SyncManager
 * 
 * Headless component that orchestrates the "Outbox" replay.
 * - Watches `isOnline` state.
 * - When online + queue > 0, starts processing.
 * - Removes successful items.
 * - Retries failed items up to MAX_RETRIES.
 */
export default function SyncManager() {
    const isOnline = useStore(state => state.isOnline);
    const { queue, removeFromQueue, updateMutation, setSyncing, isSyncing } = useMutationQueue();
    const showToast = useStore(state => state.showToast);

    const MAX_RETRIES = 3;

    useEffect(() => {
        if (isOnline && queue.length > 0 && !isSyncing) {
            processQueue();
        }
    }, [isOnline, queue.length, isSyncing]);

    const processQueue = async () => {
        setSyncing(true);
        console.log(`[SyncManager] Starting sync for ${queue.length} items...`);

        // Copy queue to avoid mutation issues during iteration
        const currentQueue = [...queue];
        let processedCount = 0;
        let failureCount = 0;

        for (const item of currentQueue) {
            try {
                const mutationFn = MUTATION_REGISTRY[item.name];

                if (!mutationFn) {
                    console.warn(`[SyncManager] Unknown mutation type: ${item.name}. Removing.`);
                    removeFromQueue(item.id);
                    continue;
                }

                console.log(`[SyncManager] Replaying: ${item.name} (Attempt ${item.retryCount + 1})`);
                await mutationFn(item.variables);

                // Success!
                removeFromQueue(item.id);
                processedCount++;

            } catch (error: any) {
                console.error(`[SyncManager] Failed to replay ${item.name}`, error);

                // Check if we should retry or discard
                const newRetryCount = (item.retryCount || 0) + 1;

                if (newRetryCount >= MAX_RETRIES) {
                    // Give up
                    console.warn(`[SyncManager] Max retries reached for ${item.name}. Discarding.`);
                    removeFromQueue(item.id);
                    failureCount++;
                } else {
                    // Incremenet retry count and keep in queue
                    updateMutation(item.id, { retryCount: newRetryCount });
                }
            }
        }

        setSyncing(false);

        if (processedCount > 0) {
            showToast(`Synced ${processedCount} pending actions`, 'success');
        }

        if (failureCount > 0) {
            showToast(`${failureCount} actions failed to sync`, 'error');
        }
    };

    return null; // Headless
}
