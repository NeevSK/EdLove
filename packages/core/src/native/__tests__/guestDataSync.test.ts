import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const values = new Map<string, string>();
  return {
    values,
    clearAllGuestData: vi.fn(),
    getDataSummary: vi.fn(),
    getItem: vi.fn(async (key: string) => values.get(key) ?? null),
    removeItem: vi.fn(async (key: string) => {
      values.delete(key);
    }),
    setItem: vi.fn(async (key: string, value: string) => {
      values.set(key, value);
    }),
  };
});

vi.mock('@repo/core/api/auth', () => ({ authAPI: { isAnonymous: vi.fn() } }));
vi.mock('@repo/core/api/orpcClient', () => ({ orpcClient: { sync: { uploadBatch: vi.fn() } } }));
vi.mock('@repo/core/lib/storageWrapper', () => ({
  SafeZustandStorage: {
    getItem: mocks.getItem,
    removeItem: mocks.removeItem,
    setItem: mocks.setItem,
  },
}));
vi.mock('@repo/core/native/guestDataManager', () => ({
  GuestDataManager: {
    clearAllGuestData: mocks.clearAllGuestData,
    getDataSummary: mocks.getDataSummary,
  },
}));

import { GuestDataSync } from '@repo/core/native/guestDataSync';

describe('GuestDataSync conversion handoff', () => {
  beforeEach(async () => {
    mocks.values.clear();
    mocks.clearAllGuestData.mockReset().mockResolvedValue(undefined);
    mocks.getDataSummary.mockReset().mockResolvedValue({
      timetablePeriods: 0,
      moodLogs: 0,
      journalEntries: 0,
      students: 0,
    });
    mocks.getItem.mockClear();
    mocks.removeItem.mockClear();
    mocks.setItem.mockClear();
    await GuestDataSync.clearPendingGuestSession();
  });

  it('persists an opaque guest source id before leaving for external authentication', async () => {
    await GuestDataSync.rememberGuestSession('guest-source-1');

    expect(mocks.setItem).toHaveBeenCalledWith('auth:pending-guest-conversion', 'guest-source-1');
  });

  it('restores a durable pending handoff after a cold callback', async () => {
    mocks.values.set('auth:pending-guest-conversion', 'guest-source-2');

    await expect(GuestDataSync.restorePendingGuestSession()).resolves.toBe('guest-source-2');
  });

  it('removes guest data and the durable handoff only after an explicit discard', async () => {
    await GuestDataSync.rememberGuestSession('guest-source-3');

    await GuestDataSync.discardPendingGuestData();

    expect(mocks.clearAllGuestData).toHaveBeenCalledTimes(1);
    expect(mocks.values.has('auth:pending-guest-conversion')).toBe(false);
  });

  it('drops malformed persisted handoffs rather than selecting an arbitrary storage scope', async () => {
    mocks.values.set('auth:pending-guest-conversion', ' guest-source-4');

    await expect(GuestDataSync.restorePendingGuestSession()).resolves.toBeNull();
    expect(mocks.removeItem).toHaveBeenCalledWith('auth:pending-guest-conversion');
  });
});
