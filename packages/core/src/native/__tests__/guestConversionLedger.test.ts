import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const values = new Map<string, string>();
  return {
    values,
    clearAllGuestData: vi.fn(),
    getItem: vi.fn(async (key: string) => values.get(key) ?? null),
    removeItem: vi.fn(async (key: string) => {
      values.delete(key);
    }),
    setItem: vi.fn(async (key: string, value: string) => {
      values.set(key, value);
    }),
  };
});

vi.mock('@repo/core/lib/storageWrapper', () => ({
  SafeZustandStorage: {
    getItem: mocks.getItem,
    removeItem: mocks.removeItem,
    setItem: mocks.setItem,
  },
}));
vi.mock('@repo/core/native/guestDataManager', () => ({
  GuestDataManager: { clearAllGuestData: mocks.clearAllGuestData },
}));

import {
  assertAnonymousGuestSource,
  authorizeExistingAccountTransfer,
  beginGuestConversion,
  beginLocalGuestConversion,
  bindGuestConversionTarget,
  clearExistingAccountTransferAuthorization,
  clearGuestConversionRecord,
  discardGuestConversion,
  readGuestConversionRecord,
} from '../guestConversionLedger';

describe('guest conversion ledger', () => {
  beforeEach(() => {
    mocks.values.clear();
    mocks.clearAllGuestData.mockReset().mockResolvedValue(undefined);
    mocks.getItem.mockClear();
    mocks.removeItem.mockClear();
    mocks.setItem.mockClear();
  });

  it('creates a versioned record with a stable conversion ID and no target yet', async () => {
    const source = { id: 'anon-subject-1', is_anonymous: true } as const;
    const first = await beginGuestConversion(source);
    const second = await beginGuestConversion(source);

    expect(first).toMatchObject({
      version: 1,
      conversionId: 'guest-conversion:v1:anon-subject-1',
      sourceGuestId: source.id,
      status: 'pending',
    });
    expect(first.targetUserId).toBeUndefined();
    expect(second).toEqual(first);
    expect(mocks.setItem).toHaveBeenCalledTimes(1);
  });

  it('rejects a source that is not the exact anonymous subject', () => {
    expect(() =>
      assertAnonymousGuestSource({ id: 'different-subject', is_anonymous: true }, 'anon-subject-1'),
    ).toThrow(/active anonymous auth subject/);
    expect(() =>
      assertAnonymousGuestSource({ id: 'anon-subject-1', is_anonymous: false }, 'anon-subject-1'),
    ).toThrow(/active anonymous auth subject/);
  });

  it('labels same-subject credential linking and different-subject account transfer distinctly', async () => {
    await beginGuestConversion({ id: 'anon-subject-2', is_anonymous: true });

    const bound = await bindGuestConversionTarget('anon-subject-2', {
      id: 'anon-subject-2',
      is_anonymous: false,
    });
    expect(bound).toMatchObject({
      targetUserId: 'anon-subject-2',
      targetKind: 'identity-linked',
    });
    await expect(
      bindGuestConversionTarget('other-source', { id: 'account-1', is_anonymous: false }),
    ).rejects.toThrow(/No pending conversion/);
    await expect(
      bindGuestConversionTarget('anon-subject-2', {
        id: 'account-1',
        is_anonymous: false,
      }),
    ).rejects.toThrow(/already bound/);
  });

  it('rejects an anonymous-source account transfer until that guest explicitly starts sign-in', async () => {
    await beginGuestConversion({ id: 'anon-subject-2', is_anonymous: true });

    await expect(
      bindGuestConversionTarget('anon-subject-2', {
        id: 'account-1',
        is_anonymous: false,
      }),
    ).rejects.toThrow(/explicit sign-in action/);
  });

  it('labels an explicitly authorized target different from the guest source as an existing-account transfer', async () => {
    await beginGuestConversion({ id: 'anon-subject-2', is_anonymous: true });
    await authorizeExistingAccountTransfer('anon-subject-2');

    await expect(
      bindGuestConversionTarget('anon-subject-2', {
        id: 'account-1',
        is_anonymous: false,
      }),
    ).resolves.toMatchObject({
      targetUserId: 'account-1',
      targetKind: 'existing-account',
    });
    await expect(
      bindGuestConversionTarget('anon-subject-2', {
        id: 'account-2',
        is_anonymous: false,
      }),
    ).rejects.toThrow(/already bound/);
  });

  it('requires a fresh explicit action after an existing-account authorization expires', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-24T12:00:00.000Z'));
    try {
      await beginGuestConversion({ id: 'anon-subject-expiry', is_anonymous: true });
      await authorizeExistingAccountTransfer('anon-subject-expiry');

      vi.advanceTimersByTime(60 * 60 * 1000 + 1);
      await expect(
        bindGuestConversionTarget('anon-subject-expiry', {
          id: 'account-1',
          is_anonymous: false,
        }),
      ).rejects.toThrow(/explicit sign-in action/);
    } finally {
      vi.useRealTimers();
    }
  });

  it('clears an interrupted existing-account authorization before a later account bind', async () => {
    await beginGuestConversion({ id: 'anon-subject-3', is_anonymous: true });
    await authorizeExistingAccountTransfer('anon-subject-3');
    await clearExistingAccountTransferAuthorization('anon-subject-3');

    await expect(
      bindGuestConversionTarget('anon-subject-3', {
        id: 'account-1',
        is_anonymous: false,
      }),
    ).rejects.toThrow(/explicit sign-in action/);
  });

  it('requires an explicit sign-in action before a device-local guest targets an account', async () => {
    const source = 'local-9ac0f584-4299-4b23-ae2c-5846be605c26';
    await expect(beginLocalGuestConversion('not-a-local-guest')).rejects.toThrow(/device-local/);

    await expect(beginLocalGuestConversion(source)).resolves.toMatchObject({
      sourceGuestId: source,
      sourceKind: 'local-device',
    });
    await expect(
      bindGuestConversionTarget(source, { id: 'account-1', is_anonymous: false }),
    ).rejects.toThrow(/explicit sign-in action/);
    await authorizeExistingAccountTransfer(source);
    await expect(
      bindGuestConversionTarget(source, { id: 'account-1', is_anonymous: false }),
    ).resolves.toMatchObject({ targetKind: 'existing-account' });
  });

  it('does not replace a pending conversion from another source subject', async () => {
    await beginGuestConversion({ id: 'anon-subject-a', is_anonymous: true });

    await expect(
      beginGuestConversion({ id: 'anon-subject-b', is_anonymous: true }),
    ).rejects.toThrow(/different guest conversion is already pending/);
  });

  it('removes malformed or unsupported records instead of selecting an unsafe source', async () => {
    mocks.values.set(
      'auth:guest-conversion-ledger',
      JSON.stringify({ version: 2, sourceGuestId: 'source', conversionId: 'wrong' }),
    );

    await expect(readGuestConversionRecord()).resolves.toBeNull();
    expect(mocks.removeItem).toHaveBeenCalledWith('auth:guest-conversion-ledger');
  });

  it('clears the record explicitly and discards data before clearing its record', async () => {
    await beginGuestConversion({ id: 'anon-subject-3', is_anonymous: true });
    await discardGuestConversion();
    expect(mocks.clearAllGuestData).toHaveBeenCalledTimes(1);
    expect(mocks.values.has('auth:guest-conversion-ledger')).toBe(false);

    await beginGuestConversion({ id: 'anon-subject-4', is_anonymous: true });
    await clearGuestConversionRecord();
    expect(mocks.values.has('auth:guest-conversion-ledger')).toBe(false);
  });

  it('retains the record when guest data cleanup fails during discard', async () => {
    await beginGuestConversion({ id: 'anon-subject-5', is_anonymous: true });
    mocks.clearAllGuestData.mockRejectedValueOnce(new Error('storage unavailable'));

    await expect(discardGuestConversion()).rejects.toThrow('storage unavailable');
    expect(mocks.values.has('auth:guest-conversion-ledger')).toBe(true);
  });
});
