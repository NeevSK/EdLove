import React, { useCallback, useEffect } from 'react';
import { useStore } from '../../../store/useStore';
import { classifyError } from '../errorClassifier';
import { useMutationAuditLog } from '../MutationAuditLog';
import { MUTATION_REGISTRY } from '../registry';
import { useMutationQueue } from '../useMutationQueue';

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
  const isOnline = useStore((state) => state.isOnline);
  const { queue, removeFromQueue, updateMutation, moveToDeadLetter, setSyncing, isSyncing } =
    useMutationQueue();
  const { updateEntry } = useMutationAuditLog();
  const showToast = useStore((state) => state.showToast);

  const MAX_RETRIES = 5; // Increased for better robustness

  const processQueue = useCallback(async () => {
    setSyncing(true);
    if (__DEV__) {
      console.log(`[ResonantSync] Analyzing outbox: ${queue.length} items pending.`);
    }

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
        const errorType = classifyError(error);
        const retryCount = (item.retryCount || 0) + 1;

        if (errorType === 'PERMANENT' || retryCount >= MAX_RETRIES) {
          // Terminal State: Permanent Failure or Max Retries
          const exitReason =
            errorType === 'PERMANENT' ? 'PERMANENT_FAILURE' : 'MAX_RETRIES_EXCEEDED';
          if (__DEV__) {
            console.error(`[SyncManager] Terminal: ${item.name}  reason=${exitReason}`, error);
          }

          moveToDeadLetter(item.id, error.message);
          updateEntry(item.id, 'dead_letter', error.message);

          showToast(`Action required: ${item.name} failed permanentely`, 'error');
        } else {
          // Transient failure - retry with exponential backoff
          const backoffMs = Math.min(2 ** retryCount * 1000, 30000);
          const backoffUntil = Date.now() + backoffMs;

          if (__DEV__) {
            console.log(`[SyncManager] Backoff: ${item.name} retrying in ${backoffMs}ms`);
          }
          updateMutation(item.id, {
            retryCount,
            backoffUntil,
            lastError: error.message,
          });
          updateEntry(item.id, 'retrying', error.message);
        }
      }
    }

    setSyncing(false);

    if (processedCount > 0) {
      showToast(`Synced ${processedCount} pending actions`, 'success');
    }
  }, [
    queue,
    removeFromQueue,
    updateMutation,
    moveToDeadLetter,
    setSyncing,
    updateEntry,
    showToast,
  ]);

  useEffect(() => {
    if (isOnline && queue.length > 0 && !isSyncing) {
      processQueue();
    }
  }, [isOnline, queue.length, isSyncing, processQueue]);

  return null;
}
