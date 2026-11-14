import { describe, expect, it, vi } from 'vitest';
import {
  type ManagedPowerSyncDatabase,
  SingleActivePowerSyncRuntime,
} from '../singleActivePowerSyncRuntime';

describe('SingleActivePowerSyncRuntime', () => {
  it('orders remote operations before close and refuses stale handle operations', async () => {
    const runtime = new SingleActivePowerSyncRuntime<ManagedPowerSyncDatabase>();
    const first = { close: vi.fn().mockResolvedValue(undefined) };
    const second = { close: vi.fn().mockResolvedValue(undefined) };
    await runtime.activate('account-a', async () => first);
    let finish!: () => void;
    const operation = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    const running = runtime.runIfActive('account-a', first, new AbortController(), operation);
    await vi.waitFor(() => expect(operation).toHaveBeenCalledOnce());
    const replacement = runtime.activate('account-b', async () => second);
    const obsolete = vi.fn().mockResolvedValue(undefined);
    const late = runtime.runIfActive('account-a', first, new AbortController(), obsolete);
    expect(first.close).not.toHaveBeenCalled();
    finish();
    await running;
    await replacement;
    await late;
    expect(first.close).toHaveBeenCalledOnce();
    expect(obsolete).not.toHaveBeenCalled();
    expect(runtime.isActive('account-b', second)).toBe(true);
  });
  it('aborts a remote first-sync owner when account lifecycle requests release directly', async () => {
    const runtime = new SingleActivePowerSyncRuntime<ManagedPowerSyncDatabase>();
    const database = { close: vi.fn().mockResolvedValue(undefined) };
    await runtime.activate('account-a', async () => database);
    const controller = new AbortController();
    const operation = vi.fn(
      () =>
        new Promise<void>((resolve) =>
          controller.signal.addEventListener('abort', () => resolve(), { once: true }),
        ),
    );
    const pending = runtime.runIfActive('account-a', database, controller, operation);
    await vi.waitFor(() => expect(operation).toHaveBeenCalledOnce());
    const released = runtime.deactivateIfCurrent(database);
    expect(controller.signal.aborted).toBe(true);
    expect(runtime.isActive('account-a', database)).toBe(false);
    await pending;
    await released;
    expect(database.close).toHaveBeenCalledOnce();
  });
  it('does not execute a disposed remote lease against a still-active local database', async () => {
    const runtime = new SingleActivePowerSyncRuntime<ManagedPowerSyncDatabase>();
    const database = { close: vi.fn().mockResolvedValue(undefined) };
    await runtime.activate('account-a', async () => database);
    const controller = new AbortController();
    controller.abort();
    const operation = vi.fn().mockResolvedValue(undefined);
    await runtime.runIfActive('account-a', database, controller, operation);
    expect(operation).not.toHaveBeenCalled();
    expect(runtime.isActive('account-a', database)).toBe(true);
  });
  it('does not let delayed targeted cleanup close a replacement database', async () => {
    const runtime = new SingleActivePowerSyncRuntime<ManagedPowerSyncDatabase>();
    const first = { close: vi.fn().mockResolvedValue(undefined) };
    const second = { close: vi.fn().mockResolvedValue(undefined) };
    await runtime.activate('account-a', async () => first);
    const replacement = runtime.activate('account-b', async () => second);
    const delayedCleanup = runtime.deactivateIfCurrent(first, true);
    await Promise.all([replacement, delayedCleanup]);
    expect(first.close).toHaveBeenCalledOnce();
    expect(second.close).not.toHaveBeenCalled();
    expect(runtime.isActive('account-b', second)).toBe(true);
  });

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
    expect(database.close).toHaveBeenCalledWith({ disconnect: true });
    expect(vi.mocked(database.disconnectAndClear!).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(database.close!).mock.invocationCallOrder[0]!,
    );
    expect(runtime.activeAccountId).toBeNull();
  });

  it('retains failed ownership and blocks a replacement until close succeeds', async () => {
    const runtime = new SingleActivePowerSyncRuntime<ManagedPowerSyncDatabase>();
    const first = { close: vi.fn().mockRejectedValue(new Error('close failed')) };
    const second = { close: vi.fn().mockResolvedValue(undefined) };
    const createSecond = vi.fn(async () => second);
    await runtime.activate('account-a', async () => first);
    await expect(runtime.deactivate()).rejects.toThrow('close failed');
    expect(runtime.activeAccountId).toBe('account-a');
    expect(runtime.isActive('account-a', first)).toBe(false);
    await expect(runtime.activate('account-b', createSecond)).rejects.toThrow('close failed');
    expect(createSecond).not.toHaveBeenCalled();
    first.close.mockResolvedValue(undefined);
    await runtime.activate('account-b', createSecond);
    expect(createSecond).toHaveBeenCalledOnce();
    expect(runtime.isActive('account-b', second)).toBe(true);
  });

  it('does not return a partially released handle to the same account', async () => {
    const runtime = new SingleActivePowerSyncRuntime<ManagedPowerSyncDatabase>();
    const first = {
      close: vi.fn().mockRejectedValueOnce(new Error('partial close')).mockResolvedValue(undefined),
    };
    const replacement = { close: vi.fn().mockResolvedValue(undefined) };
    await runtime.activate('account-a', async () => first);
    await expect(runtime.deactivate()).rejects.toThrow('partial close');
    expect(await runtime.activate('account-a', async () => replacement)).toBe(replacement);
    expect(first.close).toHaveBeenCalledTimes(2);
  });

  it('retries an explicitly requested clear before allowing an account switch', async () => {
    const runtime = new SingleActivePowerSyncRuntime<ManagedPowerSyncDatabase>();
    const first = {
      disconnectAndClear: vi
        .fn()
        .mockRejectedValueOnce(new Error('clear failed'))
        .mockResolvedValue(undefined),
      close: vi.fn().mockResolvedValue(undefined),
    };
    const second = { close: vi.fn().mockResolvedValue(undefined) };
    await runtime.activate('account-a', async () => first);
    await expect(runtime.deactivate(true)).rejects.toThrow('clear failed');
    expect(first.close).not.toHaveBeenCalled();
    await runtime.activate('account-b', async () => second);
    expect(first.disconnectAndClear).toHaveBeenCalledTimes(2);
    expect(first.close).toHaveBeenCalledOnce();
    expect(runtime.isActive('account-b', second)).toBe(true);
  });

  it('retries handle closure without repeating a successful destructive clear', async () => {
    const runtime = new SingleActivePowerSyncRuntime<ManagedPowerSyncDatabase>();
    const first = {
      disconnectAndClear: vi.fn().mockResolvedValue(undefined),
      close: vi.fn().mockRejectedValueOnce(new Error('handle busy')).mockResolvedValue(undefined),
    };
    await runtime.activate('account-a', async () => first);
    await expect(runtime.deactivate(true)).rejects.toThrow('handle busy');
    await runtime.deactivate();
    expect(first.disconnectAndClear).toHaveBeenCalledOnce();
    expect(first.close).toHaveBeenCalledTimes(2);
    expect(runtime.activeAccountId).toBeNull();
  });

  it('fails loudly instead of forgetting a database without release methods', async () => {
    const runtime = new SingleActivePowerSyncRuntime<ManagedPowerSyncDatabase>();
    await runtime.activate('account-a', async () => ({}));
    await expect(runtime.deactivate()).rejects.toThrow('cannot release');
    expect(runtime.activeAccountId).toBe('account-a');
  });

  it('fails loudly instead of ignoring an explicit unsupported clear', async () => {
    const runtime = new SingleActivePowerSyncRuntime<ManagedPowerSyncDatabase>();
    const database = { close: vi.fn().mockResolvedValue(undefined) };
    await runtime.activate('account-a', async () => database);
    await expect(runtime.deactivate(true)).rejects.toThrow('cannot clear');
    expect(database.close).not.toHaveBeenCalled();
    expect(runtime.activeAccountId).toBe('account-a');
  });

  it('rejects stale account and handle identity when checking context ownership', async () => {
    const runtime = new SingleActivePowerSyncRuntime<ManagedPowerSyncDatabase>();
    const first = { close: vi.fn().mockResolvedValue(undefined) };
    const second = { close: vi.fn().mockResolvedValue(undefined) };
    await runtime.activate('account-a', async () => first);
    expect(runtime.isActive('account-a', second)).toBe(false);
    expect(runtime.isActive('account-b', first)).toBe(false);
    expect(await runtime.activate('account-a', async () => second)).toBe(first);
    await runtime.activate('account-b', async () => second);
    expect(runtime.isActive('account-a', first)).toBe(false);
  });
});
