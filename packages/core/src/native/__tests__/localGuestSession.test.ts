import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const values = new Map<string, string>();
  return {
    values,
    getItem: vi.fn(async (key: string) => values.get(key) ?? null),
    removeItem: vi.fn(async (key: string) => {
      values.delete(key);
    }),
    setItem: vi.fn(async (key: string, value: string) => {
      values.set(key, value);
    }),
    setGuestScope: vi.fn(),
  };
});

vi.mock('@repo/core/lib/storageWrapper', () => ({
  SafeZustandStorage: {
    getItem: mocks.getItem,
    removeItem: mocks.removeItem,
    setItem: mocks.setItem,
  },
}));
vi.mock('@repo/core/native/guestScope', () => ({ setGuestScope: mocks.setGuestScope }));

import {
  clearLocalGuestSession,
  getOrCreateLocalGuestSession,
  LocalGuestSessionError,
  restoreLocalGuestSession,
} from '@repo/core/native/localGuestSession';

const STORAGE_KEY = 'gurudevi:local-guest-session';
const UUID = '9ac0f584-4299-4b23-ae2c-5846be605c26';

describe('local guest session', () => {
  beforeEach(() => {
    mocks.values.clear();
    mocks.getItem.mockClear();
    mocks.removeItem.mockClear();
    mocks.setItem.mockClear();
    mocks.setGuestScope.mockClear();
  });

  it('creates and persists a versioned opaque device-local id without auth state', async () => {
    vi.stubGlobal('crypto', { randomUUID: vi.fn(() => UUID) });

    const session = await getOrCreateLocalGuestSession();

    expect(session).toEqual({ version: 1, id: `local-${UUID}` });
    expect(mocks.setItem).toHaveBeenCalledWith(STORAGE_KEY, JSON.stringify(session));
    expect(mocks.setGuestScope).toHaveBeenCalledWith(`local-${UUID}`);
    expect(session).not.toHaveProperty('access_token');
    expect(session).not.toHaveProperty('user');
  });

  it('restores a valid session and reactivates its storage scope', async () => {
    const persisted = { version: 1, id: `local-${UUID}` };
    mocks.values.set(STORAGE_KEY, JSON.stringify(persisted));

    await expect(restoreLocalGuestSession()).resolves.toEqual(persisted);
    expect(mocks.setGuestScope).toHaveBeenCalledWith(persisted.id);
  });

  it('reuses a valid session without generating or rewriting it', async () => {
    const persisted = { version: 1, id: `local-${UUID}` };
    mocks.values.set(STORAGE_KEY, JSON.stringify(persisted));
    vi.stubGlobal('crypto', {});

    await expect(getOrCreateLocalGuestSession()).resolves.toEqual(persisted);
    expect(mocks.setItem).not.toHaveBeenCalled();
  });

  it.each([
    '{broken',
    JSON.stringify({ version: 2, id: `local-${UUID}` }),
    JSON.stringify({ version: 1, id: 'local-not-an-uuid' }),
    JSON.stringify({ version: 1, id: `local-${UUID}`, access_token: 'secret' }),
  ])('rejects malformed or unsupported persisted session %s', async (raw) => {
    mocks.values.set(STORAGE_KEY, raw);

    await expect(restoreLocalGuestSession()).resolves.toBeNull();
    expect(mocks.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
    expect(mocks.setGuestScope).toHaveBeenCalledWith(null);
  });

  it('fails clearly when secure UUID generation is unavailable', async () => {
    vi.stubGlobal('crypto', {});

    await expect(getOrCreateLocalGuestSession()).rejects.toBeInstanceOf(LocalGuestSessionError);
    await expect(getOrCreateLocalGuestSession()).rejects.toThrow('crypto.randomUUID is unavailable');
    expect(mocks.setItem).not.toHaveBeenCalled();
  });

  it('clears persistence and resets guest scope', async () => {
    await clearLocalGuestSession();

    expect(mocks.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
    expect(mocks.setGuestScope).toHaveBeenCalledWith(null);
  });
});
