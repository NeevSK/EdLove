/**
 * Background Sync Task — Expo SDK 55 / May 2026
 *
 * Uses `expo-background-task` (which replaced the deprecated `expo-background-fetch`).
 * Backed by WorkManager (Android) and BGTaskScheduler (iOS) for true OS-level scheduling.
 *
 * Architecture role:
 *  - "Sovereign Heartbeat" that drains the Mutation Queue even when the app is
 *    minimised or killed.
 *  - Emits events to the SovereignBus so the foreground UI can react when the
 *    app is next opened.
 */
import * as TaskManager from 'expo-task-manager';
import * as BackgroundTask from 'expo-background-task';
import { useMutationQueue } from '@repo/core/logic';
import { MUTATION_REGISTRY, sovereignBus } from '@repo/core/sync';

export const BACKGROUND_SYNC_TASK = 'GURUDEVI_BACKGROUND_SYNC';

// ─── Task Definition ──────────────────────────────────────────────────────────
// Must be defined at the module top-level (not inside a function or component).

TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  const { queue, removeFromQueue, setSyncing } = useMutationQueue.getState();

  // Nothing to do
  if (queue.length === 0) {
    return BackgroundTask.BackgroundTaskResult.NoData;
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
        // Unknown mutation — will be caught by foreground SyncManager for DLQ routing
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
    ? BackgroundTask.BackgroundTaskResult.NewData
    : BackgroundTask.BackgroundTaskResult.NoData;
});

// ─── Registration ─────────────────────────────────────────────────────────────

export async function registerBackgroundSync(): Promise<void> {
  try {
    const status = await BackgroundTask.getStatusAsync();

    if (
      status === BackgroundTask.BackgroundTaskStatus.Restricted ||
      status === BackgroundTask.BackgroundTaskStatus.Denied
    ) {
      console.warn('[BackgroundSync] OS has restricted background tasks. Falling back to foreground-only sync.');
      return;
    }

    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
    if (!isRegistered) {
      await BackgroundTask.registerTaskAsync(BACKGROUND_SYNC_TASK, {
        minimumInterval: 15, // minutes — OS may defer; this is a suggestion
        stopOnTerminate: false, // Android: keep alive after app close
        startOnBoot: true,     // Android: restart after reboot
      });
      console.log('✅ [BackgroundSync] Task registered.');
    }
  } catch (err) {
    console.error('❌ [BackgroundSync] Registration failed:', err);
  }
}

export async function unregisterBackgroundSync(): Promise<void> {
  try {
    await BackgroundTask.unregisterTaskAsync(BACKGROUND_SYNC_TASK);
  } catch {
    // Silently ignore if not registered
  }
}

/**
 * Development only: manually trigger the task to test without waiting for OS.
 * Call this from a dev menu or __DEV__ block.
 */
export async function triggerBackgroundSyncForTesting(): Promise<void> {
  if (!__DEV__) return;
  await BackgroundTask.triggerTaskWorkerForTestingAsync(BACKGROUND_SYNC_TASK);
}
