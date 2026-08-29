/**
 * Storage Eviction Background Task
 *
 * Runs the storage eviction scheduler (retention prune + SQLite compaction + MMKV trim)
 * on a periodic background interval using expo-background-task.
 *
 * Task name: 'gurudevi-storage-eviction'
 * Minimum interval: 60 minutes (runs at most once per hour in background)
 * Also runs on app foreground via BootstrapSideEffects
 */

import { coreRuntime } from '@repo/core/logic';
import { BackgroundTaskResult } from '@repo/core/types/runtime';

export const STORAGE_EVICTION_TASK = 'gurudevi-storage-eviction';

export async function runStorageEvictionTask(): Promise<BackgroundTaskResult> {
  try {
    console.log('[StorageEvictionTask] Starting background eviction job ...');

    // Import and run the scheduler
    const { runStorageEvictionScheduler } = await import('@/storage/retention-scheduler');
    await runStorageEvictionScheduler();

    console.log('[StorageEvictionTask] Background eviction job completed');
    return BackgroundTaskResult.NewData;
  } catch (error) {
    console.error('[StorageEvictionTask] Background eviction job failed:', error);
    return BackgroundTaskResult.Failed;
  }
}

export async function registerStorageEvictionTask(): Promise<void> {
  try {
    const status = await coreRuntime.backgroundTask.getStatusAsync();

    if (status === 'restricted' || status === 'denied') {
      console.warn(
        '[StorageEvictionTask] OS has restricted background tasks. Scheduler will run on foreground only.',
      );
      return;
    }

    const isRegistered = await coreRuntime.backgroundTask.isTaskRegisteredAsync(
      STORAGE_EVICTION_TASK,
    );
    if (!isRegistered) {
      await coreRuntime.backgroundTask.registerTaskAsync(STORAGE_EVICTION_TASK, {
        minimumInterval: 60, // Run at most once per hour in background
        stopOnTerminate: false,
        startOnBoot: true,
      });
      console.log('✅ [StorageEvictionTask] Task registered.');
    }
  } catch (err) {
    console.error('❌ [StorageEvictionTask] Registration failed:', err);
  }
}

export async function unregisterStorageEvictionTask(): Promise<void> {
  try {
    await coreRuntime.backgroundTask.unregisterTaskAsync(STORAGE_EVICTION_TASK);
  } catch {
    // Silently ignore if not registered
  }
}

export async function triggerStorageEvictionForTesting(): Promise<void> {
  if (!__DEV__) return;
  await coreRuntime.backgroundTask.triggerTaskWorkerForTestingAsync?.(STORAGE_EVICTION_TASK);
}