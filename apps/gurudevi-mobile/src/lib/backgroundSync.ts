/**
 * Enhanced Background Sync with Dead Letter Queue & Exponential Backoff
 *
 * Features:
 * - Exponential backoff with jitter
 * - Dead letter queue for permanently failed items
 * - Configurable retry limits
 * - Sync status events for UI
 * - Foreground sync coordination
 */

import { getActiveAccountId } from '@repo/core/lib/accountScope';
import { tryBeginReplay } from '@repo/core/lib/sync/replayAdmission';
import { isReplayPrincipalCurrent } from '@repo/core/lib/sync/replayIdentity';
import { isMutationReplayDeferred, planMutationReplay } from '@repo/core/lib/sync/replayPolicy';
import { coreRuntime, useMutationQueue } from '@repo/core/logic';
import { useTemporalStore } from '@repo/core/store/useTemporalStore';
import { MUTATION_REGISTRY, type QueuedMutation, sovereignBus } from '@repo/core/sync';
import { BackgroundTaskResult, BackgroundTaskStatus } from '@repo/core/types';
import { BACKGROUND_SYNC_TASK } from '@/lib/backgroundSyncTask';
import { admitBackgroundWork } from '@/runtime/backgroundAdmission';
import { dispatchQueuedMutationToSovereignBus } from '@/lib/inngestEvents';

export { BACKGROUND_SYNC_TASK } from '@/lib/backgroundSyncTask';

// Configuration
const SYNC_CONFIG = {
  maxBatchSize: 10,
  maxRetries: 3,
  baseBackoffMs: 1000,
  maxBackoffMs: 30000,
  jitterFactor: 0.3,
} as const;

// ─── Dead Letter Queue Storage ────────────────────────────────────────────────

const LEGACY_DEAD_LETTER_KEY = 'gurudevi:dead-letter-queue';
let legacyDeadLetterMigration: Promise<void> | undefined;

/** Background sync is the registry's deferrable `sync`; verger's admission decides. */
async function getBackgroundSyncDecision(): Promise<{ action: 'allow' | 'defer'; reason: string }> {
  try {
    const { admit, reason } = await admitBackgroundWork('sync');
    return { action: admit ? 'allow' : 'defer', reason };
  } catch (error) {
    console.warn('[BackgroundSync] device state unavailable', error);
    return { action: 'defer', reason: 'device_state_unavailable' };
  }
}

function isQueuedMutation(value: unknown): value is QueuedMutation {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<QueuedMutation>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.scope === 'string' &&
    typeof candidate.timestamp === 'number' &&
    typeof candidate.retryCount === 'number' &&
    typeof candidate.idempotencyKey === 'string'
  );
}

async function migrateLegacyDeadLetterQueue(): Promise<void> {
  if (!legacyDeadLetterMigration) {
    legacyDeadLetterMigration = (async () => {
      const stored = await coreRuntime.storage.getItem(LEGACY_DEAD_LETTER_KEY);
      if (!stored) return;

      try {
        const parsed: unknown = JSON.parse(stored);
        if (!Array.isArray(parsed)) return;
        const mutations = parsed.filter(isQueuedMutation);
        // The legacy queue was newest-first. Retain every record or leave the
        // source untouched for manual recovery; never silently drop malformed
        // historical entries while clearing the only copy.
        if (mutations.length !== parsed.length) return;
        useMutationQueue.getState().importDeadLetterMutations(mutations);
        await coreRuntime.storage.removeItem(LEGACY_DEAD_LETTER_KEY);
      } catch {
        // Preserve the source store if it cannot be safely parsed and imported.
      }
    })();
  }
  await legacyDeadLetterMigration;
}

export async function getDeadLetterQueueItems(): Promise<QueuedMutation[]> {
  await migrateLegacyDeadLetterQueue();
  return useMutationQueue.getState().deadLetterQueue;
}

export async function retryDeadLetterItem(id: string): Promise<boolean> {
  await migrateLegacyDeadLetterQueue();
  const queue = useMutationQueue.getState().deadLetterQueue;
  const index = queue.findIndex((item) => item.id === id);
  if (index === -1) return false;

  const item = queue[index];
  if (!item) return false;
  const activeUserId = getActiveAccountId();
  // Legacy/unbound DLQ entries require an explicit migration decision; never
  // attach them to whichever account happens to be active during recovery.
  if (!activeUserId || item.userId !== activeUserId) return false;

  return useMutationQueue.getState().restoreDeadLetterMutation(id);
}

export async function clearDeadLetterQueue(): Promise<void> {
  useMutationQueue.getState().clearDeadLetterQueue();
  await coreRuntime.storage.removeItem(LEGACY_DEAD_LETTER_KEY);
}

// ─── Exponential Backoff with Jitter ──────────────────────────────────────────

function calculateBackoff(retryCount: number): number {
  const base = SYNC_CONFIG.baseBackoffMs * Math.pow(2, retryCount);
  const jitter = base * SYNC_CONFIG.jitterFactor * Math.random();
  return Math.min(base + jitter, SYNC_CONFIG.maxBackoffMs);
}

// ─── Task Definition ──────────────────────────────────────────────────────────

export async function runBackgroundSyncTask() {
  const decision = await getBackgroundSyncDecision();
  if (decision.action === 'defer') {
    console.log(`[BackgroundSync] Deferred by verger: ${decision.reason}`);
    return BackgroundTaskResult.NoData;
  }

  const {
    queue,
    moveToDeadLetter,
    removeFromQueue,
    setSyncing,
    updateMutation,
    tryAcquireMutationLease,
  } = useMutationQueue.getState();
  const activeUserId = getActiveAccountId();

  if (!activeUserId || queue.length === 0) {
    return BackgroundTaskResult.NoData;
  }

  console.log(`[BackgroundSync] Pulse: draining ${queue.length} items`);
  setSyncing(true);
  let drained = 0;
  let failed = 0;

  try {
    // Filter items ready for retry (backoff expired)
    const now = Date.now();
    const readyItems = planMutationReplay(
      queue,
      activeUserId,
      useTemporalStore.getState().readPolicy,
      now,
    ).ready.slice(0, SYNC_CONFIG.maxBatchSize);

    for (const item of readyItems) {
      const principalId = item.userId;
      const admission = principalId ? tryBeginReplay(principalId) : null;
      if (!principalId || !admission) continue;
      try {
        if (!tryAcquireMutationLease(item.id, 15000)) {
          admission.release();
          continue;
        }
        if (!(await isReplayPrincipalCurrent(principalId))) {
          updateMutation(item.id, {
            commandState: 'auth_paused',
            lockLeaseExpiresAt: undefined,
          });
          continue;
        }
        const workflowResult = await dispatchQueuedMutationToSovereignBus(item);
        if (workflowResult === 'pending') {
          updateMutation(item.id, {
            commandState: 'retry_scheduled',
            backoffUntil: Date.now() + 5000,
            lastError: 'Workflow receipt pending',
            lastErrorCode: 'WORKFLOW_RECEIPT_PENDING',
            lockLeaseExpiresAt: undefined,
          });
          continue;
        }
        if (workflowResult === 'dispatched') {
          removeFromQueue(item.id);
          drained++;
          continue;
        }
        const mutationFn = MUTATION_REGISTRY[item.name];
        if (!mutationFn) {
          moveToDeadLetter(item.id, 'UNKNOWN_MUTATION');
          failed++;
          continue;
        }

        if (isMutationReplayDeferred(item)) {
          updateMutation(item.id, { commandState: 'queued', lockLeaseExpiresAt: undefined });
          continue;
        }
        await mutationFn(item.variables, {
          idempotencyKey: item.idempotencyKey,
          commandId: item.id,
          userId: item.userId,
        });
        removeFromQueue(item.id);
        drained++;
      } catch (error) {
        failed++;
        const retryCount = (item.retryCount || 0) + 1;

        if (retryCount >= SYNC_CONFIG.maxRetries) {
          // Move to dead letter queue
          console.warn(
            `[BackgroundSync] Item ${item.id} exceeded max retries, moving to dead letter queue`,
          );
          updateMutation(item.id, { retryCount });
          moveToDeadLetter(item.id, String(error));
        } else {
          // Schedule retry with exponential backoff
          const backoffMs = calculateBackoff(retryCount);
          updateMutation(item.id, {
            retryCount,
            backoffUntil: Date.now() + backoffMs,
            commandState: 'retry_scheduled',
            lastError: String(error),
            lockLeaseExpiresAt: undefined,
          });
        }
      } finally {
        admission.release();
      }
    }
  } finally {
    setSyncing(false);
  }

  // Emit sync status for UI
  sovereignBus.emit('background:pulse', {
    itemsDrained: drained,
    itemsFailed: failed,
    queueLength: useMutationQueue.getState().queue.length,
    deadLetterLength: (await getDeadLetterQueueItems()).length,
  });

  return drained > 0 || failed > 0 ? BackgroundTaskResult.NewData : BackgroundTaskResult.NoData;
}

export async function registerBackgroundSync(): Promise<void> {
  try {
    const status = await coreRuntime.backgroundTask.getStatusAsync();

    if (status === BackgroundTaskStatus.Restricted || status === BackgroundTaskStatus.Denied) {
      console.warn(
        '[BackgroundSync] OS has restricted background tasks. Falling back to foreground-only sync.',
      );
      return;
    }

    const isRegistered =
      await coreRuntime.backgroundTask.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
    if (!isRegistered) {
      await coreRuntime.backgroundTask.registerTaskAsync(BACKGROUND_SYNC_TASK, {
        minimumInterval: 15,
        stopOnTerminate: false,
        startOnBoot: true,
      });
      console.log('✅ [BackgroundSync] Task registered.');
    }
  } catch (err) {
    console.error('❌ [BackgroundSync] Registration failed:', err);
  }
}

export async function unregisterBackgroundSync(): Promise<void> {
  try {
    await coreRuntime.backgroundTask.unregisterTaskAsync(BACKGROUND_SYNC_TASK);
  } catch {
    // Silently ignore if not registered
  }
}

export async function triggerBackgroundSyncForTesting(): Promise<void> {
  if (!__DEV__) return;
  await coreRuntime.backgroundTask.triggerTaskWorkerForTestingAsync?.(BACKGROUND_SYNC_TASK);
}

// ─── Foreground Sync Coordination ─────────────────────────────────────────────

/**
 * Trigger an immediate foreground sync
 */
export async function triggerForegroundSync(): Promise<{ drained: number; failed: number }> {
  const {
    queue,
    moveToDeadLetter,
    removeFromQueue,
    setSyncing,
    updateMutation,
    tryAcquireMutationLease,
  } = useMutationQueue.getState();
  const activeUserId = getActiveAccountId();

  if (!activeUserId || queue.length === 0) return { drained: 0, failed: 0 };

  setSyncing(true);
  let drained = 0;
  let failed = 0;

  try {
    const now = Date.now();
    const readyItems = planMutationReplay(
      queue,
      activeUserId,
      useTemporalStore.getState().readPolicy,
      now,
    ).ready.slice(0, SYNC_CONFIG.maxBatchSize);

    for (const item of readyItems) {
      const principalId = item.userId;
      const admission = principalId ? tryBeginReplay(principalId) : null;
      if (!principalId || !admission) continue;
      try {
        if (!tryAcquireMutationLease(item.id, 15000)) {
          admission.release();
          continue;
        }
        if (!(await isReplayPrincipalCurrent(principalId))) {
          updateMutation(item.id, {
            commandState: 'auth_paused',
            lockLeaseExpiresAt: undefined,
          });
          continue;
        }
        const workflowResult = await dispatchQueuedMutationToSovereignBus(item);
        if (workflowResult === 'pending') {
          updateMutation(item.id, {
            commandState: 'retry_scheduled',
            backoffUntil: Date.now() + 5000,
            lastError: 'Workflow receipt pending',
            lastErrorCode: 'WORKFLOW_RECEIPT_PENDING',
            lockLeaseExpiresAt: undefined,
          });
          continue;
        }
        if (workflowResult === 'dispatched') {
          removeFromQueue(item.id);
          drained++;
          continue;
        }
        const mutationFn = MUTATION_REGISTRY[item.name];
        if (!mutationFn) {
          moveToDeadLetter(item.id, 'UNKNOWN_MUTATION');
          failed++;
          continue;
        }

        if (isMutationReplayDeferred(item)) {
          updateMutation(item.id, { commandState: 'queued', lockLeaseExpiresAt: undefined });
          continue;
        }
        await mutationFn(item.variables, {
          idempotencyKey: item.idempotencyKey,
          commandId: item.id,
          userId: item.userId,
        });
        removeFromQueue(item.id);
        drained++;
      } catch (error) {
        failed++;
        const retryCount = (item.retryCount || 0) + 1;

        if (retryCount >= SYNC_CONFIG.maxRetries) {
          updateMutation(item.id, { retryCount });
          moveToDeadLetter(item.id, String(error));
        } else {
          const backoffMs = calculateBackoff(retryCount);
          updateMutation(item.id, {
            retryCount,
            backoffUntil: Date.now() + backoffMs,
            commandState: 'retry_scheduled',
            lastError: String(error),
            lockLeaseExpiresAt: undefined,
          });
        }
      } finally {
        admission.release();
      }
    }
  } finally {
    setSyncing(false);
  }

  sovereignBus.emit('foreground:sync', {
    itemsDrained: drained,
    itemsFailed: failed,
    queueLength: useMutationQueue.getState().queue.length,
  });

  return { drained, failed };
}

// ─── Sync Status Helpers ──────────────────────────────────────────────────────

export async function getSyncStatus(): Promise<{
  queueLength: number;
  deadLetterLength: number;
  isSyncing: boolean;
}> {
  const state = useMutationQueue.getState();
  const deadLetter = await getDeadLetterQueueItems();
  return {
    queueLength: state.queue.length,
    deadLetterLength: deadLetter.length,
    isSyncing: state.isSyncing,
  };
}

export async function clearAllSyncData(): Promise<void> {
  await clearDeadLetterQueue();
  // Note: mutation queue is cleared separately if needed
}
