import { beforeEach, describe, expect, it, vi } from 'vitest';

const defineTask = vi.fn();

vi.mock('expo-task-manager', () => ({ defineTask }));
vi.mock('expo-background-task', () => ({
  BackgroundTaskResult: { Failed: 'failed' },
}));

describe('background sync worker entry', () => {
  beforeEach(() => {
    vi.resetModules();
    defineTask.mockClear();
    delete (globalThis as Record<string, unknown>).__gurudeviBackgroundSyncTaskDefined;
  });

  it('defines the task when the entrypoint is evaluated, before React mounts', async () => {
    const { BACKGROUND_SYNC_TASK } = await import('@/lib/backgroundSyncTask');

    expect(BACKGROUND_SYNC_TASK).toBe('GURUDEVI_BACKGROUND_SYNC');
    expect(defineTask).toHaveBeenCalledTimes(1);
    expect(defineTask).toHaveBeenCalledWith(BACKGROUND_SYNC_TASK, expect.any(Function));
  });

  it('does not define the task twice in the same JavaScript runtime', async () => {
    await import('@/lib/backgroundSyncTask');
    await import('@/lib/backgroundSyncTask');

    expect(defineTask).toHaveBeenCalledTimes(1);
  });
});
