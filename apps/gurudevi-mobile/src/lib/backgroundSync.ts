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

import { coreRuntime, useMutationQueue } from '@repo/core/logic';
import { MUTATION_REGISTRY, sovereignBus } from '@repo/core/sync';
import { BackgroundTaskResult, BackgroundTaskStatus } from '@repo/core/types';

export const BACKGROUND_SYNC_TASK = 'GURUDEVI_BACKGROUND_SYNC';

// Configuration
const SYNC_CONFIG = {
  maxBatchSize: 10,
  maxRetries: 3,
  baseBackoffMs: 1000,
  maxBackoffMs: 30000,
  jitterFactor: 0.3,
  deadLetterMaxSize: 100,
} as const;

// ─── Dead Letter Queue Storage ────────────────────────────────────────────────

const DEAD_LETTER_KEY = 'gurudevi:dead-letter-queue';

async function getDeadLetterQueue(): Promise<any[]> {
  try {
    const stored = await coreRuntime.storage.getItem(DEAD_LETTER_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

async function saveDeadLetterQueue(queue: any[]): Promise<void> {
  await coreRuntime.storage.setItem(DEAD_LETTER_KEY, JSON.stringify(queue));
}

async function addToDeadLetterQueue(item: any): Promise<void> {
  const queue = await getDeadLetterQueue();
  const newQueue = [item, ...queue].slice(0, SYNC_CONFIG.deadLetterMaxSize);
  await saveDeadLetterQueue(newQueue);
}

export async function getDeadLetterQueueItems(): Promise<any[]> {
  return getDeadLetterQueue();
}

export async function retryDeadLetterItem(id: string): Promise<boolean> {
  const queue = await getDeadLetterQueue();
  const index = queue.findIndex((item) => item.id === id);
  if (index === -1) return false;

  const item = queue[index];
  queue.splice(index, 1);
  await saveDeadLetterQueue(queue);

  // Re-add to mutation queue for retry
  const { addToQueue } = useMutationQueue.getState();
  await addToQueue({
    type: item.type,
    scope: item.scope,
    name: item.name,
    variables: item.variables,
  });
  return true;
}

export async function clearDeadLetterQueue(): Promise<void> {
  await coreRuntime.storage.removeItem(DEAD_LETTER_KEY);
}

// ─── Exponential Backoff with Jitter ──────────────────────────────────────────

function calculateBackoff(retryCount: number): number {
  const base = SYNC_CONFIG.baseBackoffMs * Math.pow(2, retryCount);
  const jitter = base * SYNC_CONFIG.jitterFactor * Math.random();
  return Math.min(base + jitter, SYNC_CONFIG.maxBackoffMs);
}

// ─── Task Definition ──────────────────────────────────────────────────────────

coreRuntime.backgroundTask.defineTask(BACKGROUND_SYNC_TASK, async () => {
  const { queue, removeFromQueue, setSyncing, updateMutation } = useMutationQueue.getState();

  if (queue.length === 0) {
    return BackgroundTaskResult.NoData;
  }

  console.log(`[BackgroundSync] Pulse: draining ${queue.length} items`);
  setSyncing(true);

  // Filter items ready for retry (backoff expired)
  const now = Date.now();
  const readyItems = queue
    .filter((item) => !item.backoffUntil || now >= item.backoffUntil)
    .slice(0, SYNC_CONFIG.maxBatchSize);

  let drained = 0;
  let failed = 0;

  for (const item of readyItems) {
    try {
      const mutationFn = MUTATION_REGISTRY[item.name];
      if (!mutationFn) continue;

      await mutationFn(item.variables);
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
        await addToDeadLetterQueue({
          ...item,
          retryCount,
          lastError: String(error),
          failedAt: Date.now(),
        });
        removeFromQueue(item.id);
      } else {
        // Schedule retry with exponential backoff
        const backoffMs = calculateBackoff(retryCount);
        updateMutation(item.id, {
          retryCount,
          backoffUntil: Date.now() + backoffMs,
        });
      }
    }
  }

  setSyncing(false);

  // Emit sync status for UI
  sovereignBus.emit('background:pulse', {
    itemsDrained: drained,
    itemsFailed: failed,
    queueLength: useMutationQueue.getState().queue.length,
    deadLetterLength: (await getDeadLetterQueue()).length,
  });

  return drained > 0 || failed > 0 ? BackgroundTaskResult.NewData : BackgroundTaskResult.NoData;
});

// ─── Registration ─────────────────────────────────────────────────────────────

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
  const { queue, removeFromQueue, setSyncing, updateMutation } = useMutationQueue.getState();

  if (queue.length === 0) return { drained: 0, failed: 0 };

  setSyncing(true);

  const now = Date.now();
  const readyItems = queue
    .filter((item) => !item.backoffUntil || Date.now() >= item.backoffUntil)
    .slice(0, SYNC_CONFIG.maxBatchSize);

  let drained = 0;
  let failed = 0;

  for (const item of readyItems) {
    try {
      const mutationFn = MUTATION_REGISTRY[item.name];
      if (!mutationFn) continue;

      await mutationFn(item.variables);
      removeFromQueue(item.id);
      drained++;
    } catch (error) {
      failed++;
      const retryCount = (item.retryCount || 0) + 1;

      if (retryCount >= SYNC_CONFIG.maxRetries) {
        await addToDeadLetterQueue({
          ...item,
          retryCount,
          lastError: String(error),
          failedAt: Date.now(),
        });
        removeFromQueue(item.id);
      } else {
        const backoffMs = calculateBackoff(retryCount);
        updateMutation(item.id, {
          retryCount,
          backoffUntil: Date.now() + backoffMs,
        });
      }
    }
  }

  setSyncing(false);

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
  const deadLetter = await getDeadLetterQueue();
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
