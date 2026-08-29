import { useCallback, useEffect } from 'react';
import { useConflictStore } from '@repo/core/store/useConflictStore';
import { useStore } from '@repo/core/store/useStore';
import { classifyError } from '@repo/core/lib/sync/errorClassifier';
import { sovereignBus } from '@repo/core/lib/sync/eventBus';
import { useMutationAuditLog } from '@repo/core/lib/sync/MutationAuditLog';
import { MUTATION_REGISTRY } from '@repo/core/lib/sync/registry';
import type { QueuedMutation, QueuedMutationDispatchResult } from '@repo/core/lib/sync/types';
import { useMutationQueue } from '@repo/core/lib/sync/useMutationQueue';
import { leaveBreadcrumb } from '@repo/core/monitoring/breadcrumbs';

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
interface SyncManagerProps {
  dispatchQueuedMutation?: (
    mutation: QueuedMutation,
  ) => Promise<QueuedMutationDispatchResult> | QueuedMutationDispatchResult;
}

export default function SyncManager({ dispatchQueuedMutation }: SyncManagerProps = {}) {
  const isOnline = useStore((state) => state.isOnline);
  const { queue, removeFromQueue, updateMutation, moveToDeadLetter, setSyncing, isSyncing } =
    useMutationQueue();
  const { updateEntry } = useMutationAuditLog();
  const { addConflict, activeConflicts } = useConflictStore();
  const showToast = useStore((state) => state.showToast);

  const MAX_RETRIES = 5; // Increased for better robustness

  const processQueue = useCallback(async () => {
    setSyncing(true);
    sovereignBus.emit('sync:started', { queueLength: queue.length });
    leaveBreadcrumb('sync', `Sync started: ${queue.length} items`, 'info');
    if (__DEV__) {
      console.log(`[ResonantSync] Analyzing outbox: ${queue.length} items pending.`);
    }

    const currentQueue = [...queue];
    let processedCount = 0;
    let failedCount = 0;

    for (const item of currentQueue) {
      // Respect Conflict Locking: Don't retry if a conflict is already active for this mutation
      if (activeConflicts.some((c) => c.id === item.id)) {
        continue;
      }

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

        if (dispatchQueuedMutation) {
          const dispatchResult = await dispatchQueuedMutation(item);
          if (dispatchResult === 'dispatched') {
            removeFromQueue(item.id);
            updateEntry(item.id, 'dispatched');
            processedCount++;
            continue;
          }
        }

        updateEntry(item.id, 'syncing');
        await mutationFn(item.variables);

        // Success! (Resonance achieved)
        removeFromQueue(item.id);
        updateEntry(item.id, 'success');
        leaveBreadcrumb('sync', `Mutation succeeded: ${item.name}`, 'info', { mutationId: item.id });
        sovereignBus.emit('sync:item_succeeded', {
          mutationId: item.id,
          name: item.name,
          scope: item.scope,
        });
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
          leaveBreadcrumb('sync', `Mutation terminal: ${item.name} (${exitReason})`, 'error', { mutationId: item.id, error: error.message });

          moveToDeadLetter(item.id, error.message);
          updateEntry(item.id, 'dead_letter', error.message);
          sovereignBus.emit('sync:item_moved_to_dlq', {
            mutationId: item.id,
            name: item.name,
            reason: exitReason,
          });
          failedCount++;
          showToast(`Action required: ${item.name} failed permanentely`, 'error');
        } else if (errorType === 'CONFLICT') {
          // Resonance Fork: Data Conflict detected
          // Note: addConflict now emits 'conflict:detected' on the SovereignBus internally
          addConflict({
            id: item.id,
            scope: item.scope,
            name: item.name,
            localData: item.variables,
            remoteData: error.remoteState || null,
            timestamp: Date.now(),
          });
          leaveBreadcrumb('sync', `Conflict detected: ${item.name}`, 'warning', { mutationId: item.id });
          failedCount++;
          showToast(`Conflict detected in ${item.name}`, 'info');
          updateEntry(item.id, 'terminal_abort', 'Data Conflict Detected');
        } else {
          // Transient failure - retry with exponential backoff
          const backoffMs = Math.min(2 ** retryCount * 1000, 30000);
          const backoffUntil = Date.now() + backoffMs;

          if (__DEV__) {
            console.log(`[SyncManager] Backoff: ${item.name} retrying in ${backoffMs}ms`);
          }
          leaveBreadcrumb('sync', `Mutation retry: ${item.name} (attempt ${retryCount})`, 'info', { mutationId: item.id });
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
    leaveBreadcrumb('sync', `Sync completed: ${processedCount} processed, ${failedCount} failed`, 'info');
    sovereignBus.emit('sync:completed', { processedCount, failedCount });

    if (processedCount > 0) {
      showToast(`Synced ${processedCount} pending actions`, 'success');
    }
  }, [
    queue,
    removeFromQueue,
    updateMutation,
    moveToDeadLetter,
    setSyncing,
    dispatchQueuedMutation,
    updateEntry,
    showToast, // Resonance Fork: Data Conflict detected
    // Note: addConflict now emits 'conflict:detected' on the SovereignBus internally
    addConflict,
    activeConflicts,
  ]);

  useEffect(() => {
    if (isOnline && queue.length > 0 && !isSyncing) {
      processQueue().catch((e) => {
        console.error('SyncManager: Failed to process sync queue', e);
      });
    }
  }, [isOnline, queue.length, isSyncing, processQueue]);

  return null;
}
