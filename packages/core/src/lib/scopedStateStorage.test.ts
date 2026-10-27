import { setActiveAccountId } from '@repo/core/lib/accountScope';
import { setGuestScope } from '@repo/core/native/guestScope';
import { storage } from '@repo/core/lib/storage';
import { createScopedStateStorage } from '@repo/core/lib/scopedStateStorage';
import { migrateLegacyDismissalsForCurrentOwner, useUIStore } from '@repo/core/store/useUIStore';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@repo/core/lib/storage', () => ({
  storage: {
    getStringAsync: vi.fn(),
    setAsync: vi.fn(),
    deleteAsync: vi.fn(),
  },
}));

describe('createScopedStateStorage', () => {
  beforeEach(() => {
    setActiveAccountId(null);
    setGuestScope('guest-a');
    vi.resetAllMocks();
  });

  it('partitions anonymous and account records by their canonical owner', async () => {
    const stateStorage = createScopedStateStorage();
    vi.mocked(storage.setAsync).mockResolvedValue(undefined);

    await stateStorage.setItem('ui', 'guest-value');
    setActiveAccountId('account-a');
    await stateStorage.setItem('ui', 'account-value');

    expect(storage.setAsync).toHaveBeenNthCalledWith(1, 'guest:guest-a:ui', 'guest-value');
    expect(storage.setAsync).toHaveBeenNthCalledWith(2, 'gurudevi:account-a:ui', 'account-value');
  });

  it('does not return a deferred read after ownership changes', async () => {
    setActiveAccountId('account-a');
    let finishRead!: (value: string | undefined) => void;
    vi.mocked(storage.getStringAsync).mockImplementation(
      () => new Promise((resolve) => { finishRead = resolve; }),
    );
    const read = createScopedStateStorage().getItem('tasks');

    setActiveAccountId('account-b');
    finishRead('{"state":{"tabsByDomain":{"self":[]}}}');

    await expect(read).resolves.toBeNull();
    expect(storage.getStringAsync).toHaveBeenCalledWith('gurudevi:account-a:tasks');
  });

  it('rejects a deferred read after an owner changes away and back', async () => {
    setActiveAccountId('account-a');
    let finishRead!: (value: string | undefined) => void;
    vi.mocked(storage.getStringAsync).mockImplementation(
      () => new Promise((resolve) => { finishRead = resolve; }),
    );
    const read = createScopedStateStorage().getItem('tasks');

    setActiveAccountId('account-b');
    setActiveAccountId('account-a');
    finishRead('{"state":{"tabsByDomain":{"self":[]}}}');

    await expect(read).resolves.toBeNull();
  });

  it('keeps guest leases isolated from one another', async () => {
    const stateStorage = createScopedStateStorage();
    vi.mocked(storage.setAsync).mockResolvedValue(undefined);

    await stateStorage.setItem('tasks', 'first');
    setGuestScope('guest-b');
    await stateStorage.setItem('tasks', 'second');

    expect(storage.setAsync).toHaveBeenNthCalledWith(1, 'guest:guest-a:tasks', 'first');
    expect(storage.setAsync).toHaveBeenNthCalledWith(2, 'guest:guest-b:tasks', 'second');
  });

  it('migrates legacy dismissals only when the persisted Auth identity proves ownership', async () => {
    setActiveAccountId('account-a');
    useUIStore.setState({ dismissedSampleIds: [] });
    vi.mocked(storage.getStringAsync).mockResolvedValue(
      JSON.stringify({ state: { user: { id: 'account-a' }, dismissedSampleIds: ['sample-c1'] } }),
    );

    await migrateLegacyDismissalsForCurrentOwner();

    expect(useUIStore.getState().dismissedSampleIds).toEqual(['sample-c1']);
    expect(storage.getStringAsync).toHaveBeenCalledWith('gurudevi-auth-storage');
  });

  it('leaves unowned legacy dismissals unassigned', async () => {
    setActiveAccountId('account-b');
    useUIStore.setState({ dismissedSampleIds: [] });
    vi.mocked(storage.getStringAsync).mockResolvedValue(
      JSON.stringify({ state: { user: { id: 'account-a' }, dismissedSampleIds: ['sample-c1'] } }),
    );

    await migrateLegacyDismissalsForCurrentOwner();

    expect(useUIStore.getState().dismissedSampleIds).toEqual([]);
  });
});
