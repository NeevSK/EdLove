/**
 * Background Sync Task — Sovereignty Refactor
 *
 * Architecture capacity:
 *  - "Sovereign Heartbeat" that drains the Mutation Queue even when the app is
 *    minimised or killed.
 *  - Emits events to the SovereignBus so the foreground UI can react when the
 *    app is next opened.
 *
 * Uses coreRuntime.backgroundTask (Hexagonal Port) instead of direct expo-background-task.
 */
import { useMutationQueue, coreRuntime } from '@repo/core/logic';
import { MUTATION_REGISTRY, sovereignBus } from '@repo/core/sync';
import { BackgroundTaskResult, BackgroundTaskStatus } from '@repo/core/types';

export const BACKGROUND_SYNC_TASK = 'GURUDEVI_BACKGROUND_SYNC';

// ─── Task Definition ──────────────────────────────────────────────────────────

coreRuntime.backgroundTask.defineTask(BACKGROUND_SYNC_TASK, async () => {
  const { queue, removeFromQueue, setSyncing } = useMutationQueue.getState();

  // Nothing to do
  if (queue.length === 0) {
    return BackgroundTaskResult.NoData;
  }

  console.log(`[BackgroundSync] Pulse: draining ${queue.length} items`);
  setSyncing(true);

  // Batch to max 10 items to stay within OS time limits (~30s)
  const batch = queue
    .filter((item) => !item.backoffUntil || Date.now() >= item.backoffUntil)
    .slice(0, 10);

  let drained = 0;

  for (const item of batch) {
    try {
      const mutationFn = MUTATION_REGISTRY[item.name];
      if (!mutationFn) {
        continue;
      }
      await mutationFn(item.variables);
      removeFromQueue(item.id);
      drained++;
    } catch {
      // Transient failures are retried on next pulse or by foreground SyncManager
    }
  }

  setSyncing(false);

  // Notify the bus so the foreground UI can update when the app is re-opened
  sovereignBus.emit('background:pulse', { itemsDrained: drained });

  return drained > 0
    ? BackgroundTaskResult.NewData
    : BackgroundTaskResult.NoData;
});

// ─── Registration ─────────────────────────────────────────────────────────────

export async function registerBackgroundSync(): Promise<void> {
  try {
    const status = await coreRuntime.backgroundTask.getStatusAsync();

    if (
      status === BackgroundTaskStatus.Restricted ||
      status === BackgroundTaskStatus.Denied
    ) {
      console.warn('[BackgroundSync] OS has restricted background tasks. Falling back to foreground-only sync.');
      return;
    }

    const isRegistered = await coreRuntime.backgroundTask.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
    if (!isRegistered) {
      await coreRuntime.backgroundTask.registerTaskAsync(BACKGROUND_SYNC_TASK, {
        minimumInterval: 15, // minutes
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

/**
 * Development only: manually trigger the task to test without waiting for OS.
 */
export async function triggerBackgroundSyncForTesting(): Promise<void> {
  if (!__DEV__) return;
  await coreRuntime.backgroundTask.triggerTaskWorkerForTestingAsync?.(BACKGROUND_SYNC_TASK);
}
