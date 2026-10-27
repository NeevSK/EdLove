import type { PowerSyncBackendConnector } from '@powersync/common';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { connectPowerSyncRuntime } from '../connectionLifecycle';

const emit = vi.hoisted(() => vi.fn());
vi.mock('@repo/core/lib/sync/eventBus', () => ({ sovereignBus: { emit } }));
const connector: PowerSyncBackendConnector = { fetchCredentials: vi.fn(), uploadData: vi.fn() };
const controllers: AbortController[] = [];
const owner = () => {
  const controller = new AbortController();
  controllers.push(controller);
  return controller;
};
function database() {
  const unregister = vi.fn();
  type Status = Parameters<
    Parameters<
      Parameters<typeof connectPowerSyncRuntime>[0]['registerListener']
    >[0]['statusChanged']
  >[0];
  let statusChanged: ((status: Status) => void) | undefined;
  return {
    unregister,
    status: (status: Status) => statusChanged?.(status),
    connect: vi.fn().mockResolvedValue(undefined),
    waitForFirstSync: vi
      .fn<(_: AbortSignal | undefined) => Promise<void>>()
      .mockResolvedValue(undefined),
    registerListener: vi.fn((listener: { statusChanged?: (status: Status) => void }) => {
      statusChanged = listener.statusChanged;
      return unregister;
    }),
  };
}
afterEach(() => {
  for (const controller of controllers.splice(0)) controller.abort();
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe('PowerSync connection lifecycle / substituted SDK, typed signal and status contracts', () => {
  it('waits for first sync and keeps status observation until its owner aborts', async () => {
    const db = database();
    const controller = owner();
    await connectPowerSyncRuntime(db, connector, 'account-a', controller.signal);
    expect(db.connect).toHaveBeenCalledWith(connector);
    expect(db.waitForFirstSync).toHaveBeenCalledTimes(1);
    const status = {
      connected: true,
      connecting: false,
      downloading: false,
      uploading: true,
      hasSynced: true,
      downloadError: undefined,
      uploadError: undefined,
    };
    db.status(status);
    expect(emit).toHaveBeenCalledWith('powersync:status', {
      accountId: 'account-a',
      connected: true,
      connecting: false,
      downloading: false,
      uploading: true,
      hasSynced: true,
      error: null,
    });
    expect(emit).toHaveBeenCalledWith('powersync:first_sync_complete', { accountId: 'account-a' });
    expect(db.unregister).not.toHaveBeenCalled();
    controller.abort();
    expect(db.unregister).toHaveBeenCalledOnce();
    emit.mockClear();
    db.status(status);
    expect(emit).not.toHaveBeenCalled();
  });
  it('reports unavailable and rethrows when first sync fails', async () => {
    const db = database();
    db.waitForFirstSync.mockRejectedValue(new Error('auth failed'));
    await expect(
      connectPowerSyncRuntime(db, connector, 'account-b', owner().signal),
    ).rejects.toThrow('auth failed');
    expect(emit).toHaveBeenCalledWith('powersync:unavailable', { reason: 'service_down' });
  });
  it('cancels a pending first sync, detaches status and emits no false completion or outage', async () => {
    const db = database();
    const controller = owner();
    db.waitForFirstSync.mockImplementation(
      (signal) =>
        new Promise((resolve) =>
          signal?.addEventListener('abort', () => resolve(), { once: true }),
        ),
    );
    const pending = connectPowerSyncRuntime(db, connector, 'account-a', controller.signal);
    await vi.waitFor(() => expect(db.waitForFirstSync).toHaveBeenCalledOnce());
    controller.abort();
    await pending;
    expect(db.unregister).toHaveBeenCalledOnce();
    expect(emit).not.toHaveBeenCalled();
  });
  it('does not connect an already disposed owner', async () => {
    const db = database();
    const controller = owner();
    controller.abort();
    await connectPowerSyncRuntime(db, connector, 'account-a', controller.signal);
    expect(db.connect).not.toHaveBeenCalled();
    expect(db.registerListener).not.toHaveBeenCalled();
  });
  it('cleans the SDK wait on timeout and retains status observation until disposal', async () => {
    vi.useFakeTimers();
    const db = database();
    const controller = owner();
    db.waitForFirstSync.mockImplementation(
      (signal) =>
        new Promise((resolve) =>
          signal?.addEventListener('abort', () => resolve(), { once: true }),
        ),
    );
    const pending = connectPowerSyncRuntime(db, connector, 'account-a', controller.signal);
    const rejected = expect(pending).rejects.toThrow('first sync timed out');
    await vi.advanceTimersByTimeAsync(30_000);
    await rejected;
    expect(db.unregister).not.toHaveBeenCalled();
    controller.abort();
    expect(db.unregister).toHaveBeenCalledOnce();
  });
});
