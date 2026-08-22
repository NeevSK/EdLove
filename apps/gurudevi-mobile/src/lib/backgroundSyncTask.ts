/**
 * Background-worker entry point.
 *
 * Expo can start the JavaScript bundle solely to run a task, without mounting
 * React or executing a component effect. Keep this module small, import it
 * from index.ts before expo-router/entry, and defer the application graph until
 * the worker is actually invoked.
 */
import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';

export const BACKGROUND_SYNC_TASK = 'GURUDEVI_BACKGROUND_SYNC';

const taskDefinitionKey = '__gurudeviBackgroundSyncTaskDefined';
const taskScope = globalThis as typeof globalThis & Record<string, boolean | undefined>;

// SDK 57's TaskManager typings do not expose an `isTaskDefined` query. Keep
// the guard on the JS global so Fast Refresh does not define the same task
// twice while a fresh foreground or worker runtime still defines it exactly once.
if (!taskScope[taskDefinitionKey]) {
  TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
    try {
      const [{ bootstrapPlatform }, { runBackgroundSyncTask }] = await Promise.all([
        import('@repo/core/native'),
        import('./backgroundSync'),
      ]);

      await bootstrapPlatform();
      return await runBackgroundSyncTask();
    } catch (error) {
      console.error('[BackgroundSync] Worker bootstrap failed:', error);
      return BackgroundTask.BackgroundTaskResult.Failed;
    }
  });
  taskScope[taskDefinitionKey] = true;
}
