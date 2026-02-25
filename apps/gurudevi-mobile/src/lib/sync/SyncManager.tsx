
import React, { useEffect } from 'react';
import { useStore, useMutationQueue, useMutationAuditLog, MUTATION_REGISTRY } from '@repo/core';

/**
 * SyncManager
 * 
 * Headless component that orchestrates the "Outbox" replay.
 * Upgraded with:
 * - Exponential Backoff (Temporal pacing)
 * - Error Classification (Resonant Outcomes)
 * - Dead Letter Queue (Reparative recovery)
 * - Audit Log synchronization
 */
export default function SyncManager() {
    const isOnline = useStore(state => state.isOnline);
    const { queue, removeFromQueue, updateMutation, moveToDeadLetter, setSyncing, isSyncing } = useMutationQueue();
    const { updateEntry } = useMutationAuditLog();
    const showToast = useStore(state => state.showToast);

    const MAX_RETRIES = 5; // Increased for better robustness

    useEffect(() => {
        if (isOnline && queue.length > 0 && !isSyncing) {
            processQueue();
        }
    }, [isOnline, queue.length, isSyncing]);

    /**
     * Resonant Error Classifier
     */
    const getErrorType = (error: any): 'TRANSIENT' | 'PERMANENT' => {
        const msg = error.message?.toLowerCase() || '';
        const code = error.code;

        // Permanent: Won't fix itself on retry (Auth, Schema, Logic)
        if (
            code === '23505' || // Unique violation
            code === '42501' || // Insufficient privilege
            code === '42P01' || // Relation doesn't exist
            msg.includes('invalid jwt') ||
            msg.includes('permission denied')
        ) {
            return 'PERMANENT';
        }

        // Transient: Network, timeout, rate limit, server 5xx
        return 'TRANSIENT';
    };

    const processQueue = async () => {
        setSyncing(true);
        console.log(`[ResonantSync] Analyzing outbox: ${queue.length} items pending.`);

        const currentQueue = [...queue];
        let processedCount = 0;

        for (const item of currentQueue) {
            // Respect Temporal Pacing (Backoff)
            if (item.backoffUntil && Date.now() < item.backoffUntil) {
                continue;
            }

            try {
                const mutationFn = MUTATION_REGISTRY[item.name];

                if (!mutationFn) {
                    console.warn(`[SyncManager] Unknown mutation: ${item.name}. Moving to DLQ.`);
                    moveToDeadLetter(item.id, 'UNKNOWN_MUTATION');
                    updateEntry(item.id, 'dead_letter', 'Unknown mutation registry key');
                    continue;
                }

                updateEntry(item.id, 'syncing');
                await mutationFn(item.variables);

                // Success! (Resonance achieved)
                removeFromQueue(item.id);
                updateEntry(item.id, 'success');
                processedCount++;

            } catch (error: any) {
                const errorType = getErrorType(error);
                const retryCount = (item.retryCount || 0) + 1;

                if (errorType === 'PERMANENT' || retryCount >= MAX_RETRIES) {
                    // Fail to DLQ (Reparative state)
                    console.error(`[SyncManager] Terminating: ${item.name}`, error);
                    moveToDeadLetter(item.id, error.message);
                    updateEntry(item.id, 'dead_letter', error.message);

                    showToast(`Sync failed: ${item.name} needs review`, 'error');
                } else {
                    // Transient failure - retry with exponential backoff
                    const backoffMs = Math.min(Math.pow(2, retryCount) * 1000, 30000);
                    const backoffUntil = Date.now() + backoffMs;

                    console.log(`[SyncManager] Backoff: ${item.name} retrying in ${backoffMs}ms`);
                    updateMutation(item.id, {
                        retryCount,
                        backoffUntil,
                        lastError: error.message
                    });
                    updateEntry(item.id, 'retrying', error.message);
                }
            }
        }

        setSyncing(false);

        if (processedCount > 0) {
            showToast(`Synced ${processedCount} pending actions`, 'success');
        }
    };

    return null;
}
