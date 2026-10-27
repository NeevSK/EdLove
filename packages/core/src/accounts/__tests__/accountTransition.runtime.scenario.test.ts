import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  disconnectPowerSync,
  getActivePowerSyncDB,
  injectNativePowerSyncDB,
} from '../../adapters/powersync/database';
import { SingleActivePowerSyncRuntime } from '../../adapters/powersync/singleActivePowerSyncRuntime';
import { useMutationQueue } from '../../lib/sync/useMutationQueue';
import { accountTransition } from '../accountTransition';

vi.mock('@repo/core/api/highways', () => ({ assertPowerSyncBootstrapReady: vi.fn() }));
vi.mock('@repo/core/logic/runtimeRegistry', () => ({
  coreRuntime: { isRegistered: () => true },
}));
vi.mock('@powersync/drizzle-driver', () => ({ wrapPowerSyncWithDrizzle: vi.fn() }));
vi.mock('@repo/core/adapters/powersync/schema', () => ({ AppSchema: {} }));
vi.mock('@repo/core/adapters/powersync/secureDrizzleProxy', () => ({
  createSecureDrizzleProxy: (database: object) => database,
}));

function accountFiles() {
  const files = new Map<string, string[]>();
  const open = (accountId: string) => ({
    close: vi.fn(async () => undefined),
    disconnectAndClear: vi.fn(async () => {
      files.set(accountId, []);
    }),
    pending: () => files.get(accountId) ?? [],
  });
  const runtime = new SingleActivePowerSyncRuntime<ReturnType<typeof open>>();
  const activate = (accountId: string) =>
    runtime.activate(accountId, async () => {
      const database = open(accountId);
      injectNativePowerSyncDB(
        database,
        {},
        {
          isActive: () => runtime.isActive(accountId, database),
          release: (clear) => runtime.deactivateIfCurrent(database, clear),
        },
      );
      return database;
    });
  return { files, activate, runtime };
}

beforeEach(() => {
  useMutationQueue.setState({ queue: [], deadLetterQueue: [], isSyncing: false });
});
afterEach(() => disconnectPowerSync());

describe('G2 account transition / real runtime and registry, substituted account files and storage', () => {
  it('preserves A offline CRUD through A-to-B-to-A, then clears it only on explicit discard', async () => {
    const local = accountFiles();
    local.files.set('account-a', ['a-unsent-write']);
    local.files.set('account-b', ['b-unsent-write']);
    const firstA = await local.activate('account-a');
    await accountTransition.transition({
      outgoingPrincipalId: 'account-a',
      incomingPrincipalId: 'account-b',
      disposition: 'preserve-and-quarantine',
      clearReplicatedData: false,
    });
    expect(firstA.close).toHaveBeenCalledWith({ disconnect: true });
    expect(firstA.disconnectAndClear).not.toHaveBeenCalled();
    expect(getActivePowerSyncDB()).toBeNull();

    const accountB = await local.activate('account-b');
    expect(accountB.pending()).toEqual(['b-unsent-write']);
    expect(local.runtime.isActive('account-a', firstA)).toBe(false);
    await accountTransition.transition({
      outgoingPrincipalId: 'account-b',
      incomingPrincipalId: 'account-a',
      disposition: 'preserve-and-quarantine',
      clearReplicatedData: false,
    });
    const restoredA = await local.activate('account-a');
    expect(restoredA).not.toBe(firstA);
    expect(restoredA.pending()).toEqual(['a-unsent-write']);
    expect(accountB.disconnectAndClear).not.toHaveBeenCalled();
    await accountTransition.transition({
      outgoingPrincipalId: 'account-a',
      incomingPrincipalId: null,
      disposition: 'discard',
      clearReplicatedData: true,
    });
    expect(restoredA.disconnectAndClear).toHaveBeenCalledOnce();
    expect(restoredA.close).toHaveBeenCalledWith({ disconnect: true });
    expect(local.files.get('account-a')).toEqual([]);
    expect(local.files.get('account-b')).toEqual(['b-unsent-write']);
  });

  it('retains a failed closing handle for retry and never clears the outgoing work', async () => {
    const local = accountFiles();
    local.files.set('account-a', ['a-unsent-write']);
    const accountA = await local.activate('account-a');
    accountA.close.mockRejectedValueOnce(new Error('database busy'));
    const request = {
      outgoingPrincipalId: 'account-a',
      incomingPrincipalId: 'account-b',
      disposition: 'preserve-and-quarantine',
      clearReplicatedData: false,
    } as const;
    await expect(accountTransition.transition(request)).rejects.toThrow('database busy');
    expect(getActivePowerSyncDB()).toBeNull();
    expect(local.runtime.activeAccountId).toBe('account-a');
    await accountTransition.transition(request);
    expect(accountA.close).toHaveBeenCalledTimes(2);
    expect(accountA.disconnectAndClear).not.toHaveBeenCalled();
    expect(local.files.get('account-a')).toEqual(['a-unsent-write']);
    const accountB = await local.activate('account-b');
    expect(local.runtime.isActive('account-b', accountB)).toBe(true);
  });
});
