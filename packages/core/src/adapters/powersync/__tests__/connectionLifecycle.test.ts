import { describe, expect, it, vi } from 'vitest';
import { connectPowerSyncRuntime } from '../connectionLifecycle';

const connector = { fetchCredentials: vi.fn(), uploadData: vi.fn() } as any;

describe('PowerSync connection lifecycle', () => {
  it('waits for first sync and preserves status listeners', async () => {
    const statusChanged = vi.fn();
    const unregister = vi.fn();
    const db = {
      connect: vi.fn().mockResolvedValue(undefined),
      waitForFirstSync: vi.fn().mockResolvedValue(undefined),
      registerListener: vi.fn(({ statusChanged: callback }) => {
        statusChanged.mockImplementation(callback);
        return unregister;
      }),
    };

    await connectPowerSyncRuntime(db as any, connector, 'account-a');
    statusChanged({ connected: true, hasSynced: true });

    expect(db.connect).toHaveBeenCalledWith(connector);
    expect(db.waitForFirstSync).toHaveBeenCalledTimes(1);
    expect(unregister).not.toHaveBeenCalled();
  });

  it('reports unavailable and rethrows when first sync fails', async () => {
    const db = {
      connect: vi.fn().mockResolvedValue(undefined),
      waitForFirstSync: vi.fn().mockRejectedValue(new Error('auth failed')),
    };

    await expect(connectPowerSyncRuntime(db as any, connector, 'account-b')).rejects.toThrow(
      'auth failed',
    );
  });
});
