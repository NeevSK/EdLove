import { describe, expect, it, vi } from 'vitest';
import {
  type ManagedPowerSyncDatabase,
  SingleActivePowerSyncRuntime,
} from '../singleActivePowerSyncRuntime';

describe('SingleActivePowerSyncRuntime', () => {
  it('closes the previous account before activating the next account', async () => {
    const runtime = new SingleActivePowerSyncRuntime<ManagedPowerSyncDatabase>();
    const first = { close: vi.fn().mockResolvedValue(undefined) } as ManagedPowerSyncDatabase;
    const second = { close: vi.fn().mockResolvedValue(undefined) } as ManagedPowerSyncDatabase;

    await runtime.activate('account-a', async () => first);
    await runtime.activate('account-b', async () => second);

    expect(first.close).toHaveBeenCalledWith({ disconnect: true });
    expect(runtime.activeAccountId).toBe('account-b');
  });

  it('serializes overlapping cleanup and activation', async () => {
    const runtime = new SingleActivePowerSyncRuntime<ManagedPowerSyncDatabase>();
    let releaseClose!: () => void;
    const closeFinished = new Promise<void>((resolve) => {
      releaseClose = resolve;
    });
    const first = { close: vi.fn(() => closeFinished) } as ManagedPowerSyncDatabase;
    const second = { close: vi.fn().mockResolvedValue(undefined) } as ManagedPowerSyncDatabase;
    const createSecond = vi.fn(async () => second);

    await runtime.activate('account-a', async () => first);
    const deactivation = runtime.deactivate();
    const activation = runtime.activate('account-b', createSecond);

    expect(createSecond).not.toHaveBeenCalled();
    releaseClose();
    await deactivation;
    await activation;

    expect(createSecond).toHaveBeenCalledTimes(1);
    expect(runtime.activeAccountId).toBe('account-b');
  });

  it('clears only when explicitly requested', async () => {
    const runtime = new SingleActivePowerSyncRuntime<ManagedPowerSyncDatabase>();
    const database = {
      close: vi.fn().mockResolvedValue(undefined),
      disconnectAndClear: vi.fn().mockResolvedValue(undefined),
    } as ManagedPowerSyncDatabase;

    await runtime.activate('account-a', async () => database);
    await runtime.deactivate(true);

    expect(database.disconnectAndClear).toHaveBeenCalledTimes(1);
    expect(database.close).not.toHaveBeenCalled();
  });
});
