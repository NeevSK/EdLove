import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { afterEach, expect, it, vi } from 'vitest';
import type { SupabaseAuthAdapter } from '../../adapters/supabase/auth.adapter';
import type { ICrypto } from '../../logic/interfaces/crypto.port';

const fixture = vi.hoisted(() => {
  let client: SupabaseClient | undefined;
  let adapter: SupabaseAuthAdapter | undefined;
  return {
    install(sdk: SupabaseClient, auth: SupabaseAuthAdapter) {
      client = sdk;
      adapter = auth;
    },
    client() {
      if (!client) throw new Error('SDK fixture not installed');
      return client;
    },
    adapter() {
      if (!adapter) throw new Error('Auth adapter fixture not installed');
      return adapter;
    },
    identify: vi.fn(),
  };
});
vi.mock('@repo/core/adapters/supabaseClient', () => ({
  get supabaseClient() {
    return fixture.client();
  },
}));
vi.mock('@repo/core/api/auth', () => ({
  authAPI: {
    getAuthSession: () => fixture.adapter().getSession(),
    setSession: (access: string, refresh: string) => fixture.adapter().setSession(access, refresh),
    signOut: (options: { scope: 'local' }) => fixture.adapter().signOut(options),
  },
}));
vi.mock('@repo/core/api/identity', () => ({
  identityAPI: { identifyActiveCitizen: fixture.identify },
}));
vi.mock('@repo/core/api/deviceTrust', () => ({
  deviceTrustAPI: {
    syncCurrentAccountDevice: vi.fn().mockResolvedValue(null),
    touchCurrentDevice: vi.fn().mockResolvedValue(null),
    logAuditEvent: vi.fn().mockResolvedValue(undefined),
    upsertCurrentSecuritySession: vi.fn().mockResolvedValue(undefined),
  },
}));
vi.mock('@repo/core/store/resetScopedStores', () => ({
  resetScopedStores: vi.fn(),
  rehydrateScopedStores: vi.fn(),
}));
vi.mock('@repo/core/adapters/powersync/database', () => ({
  disconnectPowerSync: vi.fn(),
  clearPowerSyncAccount: vi.fn(),
}));

function credential(subject: string, revision = 'initial') {
  const user = {
    id: subject,
    aud: 'authenticated',
    app_metadata: {},
    user_metadata: {},
    created_at: '2026-10-26T00:00:00Z',
  };
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
  return {
    user,
    access_token: `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: subject, jti: revision, exp: Math.floor(Date.now() / 1000) + 3600 })}.${Buffer.from('synthetic-signature').toString('base64url')}`,
    refresh_token: `refresh-${subject}-${revision}`,
    token_type: 'bearer',
    expires_in: 3600,
  };
}

afterEach(async () => {
  await fixture.client().auth.stopAutoRefresh();
  vi.restoreAllMocks();
});

it('G2 / actual Supabase 2.117.2 and callback adapter preserve a switch with queued capture; HTTP/storage/identity/native substituted', async () => {
  const first = credential('f0560000-0000-4000-8000-000000000001');
  const second = credential('f0560000-0000-4000-8000-000000000002');
  const issued = new Map([
    [first.user.id, first],
    [second.user.id, second],
  ]);
  const usedRefreshTokens: string[] = [];
  const canonicalA = '123e4567-e89b-8101-8100-426614174001';
  const canonicalB = '123e4567-e89b-8101-8100-426614174002';
  const { storage } = await import('../../lib/storage');
  const { MemoryStorageAdapter } = await import('../../adapters/MemoryStorageAdapter');
  const { supabaseAuthStorage } = await import('../../lib/authStorage');
  const { cryptoManager } = await import('../../logic/managers/CryptoManager');
  storage.registerAdapter(new MemoryStorageAdapter());
  const secure = new Map<string, string>();
  cryptoManager.registerAdapter({
    getItemAsync: async (key) => secure.get(key) ?? null,
    setItemAsync: async (key, value) => {
      secure.set(key, value);
    },
    deleteItemAsync: async (key) => {
      secure.delete(key);
    },
    digestStringAsync: async () => {
      throw new Error('Hashing outside this fixture');
    },
    getRandomBytes: () => {
      throw new Error('Randomness outside this fixture');
    },
  } satisfies ICrypto);
  const fetchAuth: typeof fetch = async (input, init) => {
    const request = new Request(input, init);
    const path = new URL(request.url).pathname;
    if (path.endsWith('/token')) {
      const body: unknown = await request.json();
      if (
        typeof body !== 'object' ||
        body === null ||
        !('refresh_token' in body) ||
        typeof body.refresh_token !== 'string'
      )
        throw new Error('Unexpected refresh fixture body');
      const existing = [...issued.values()].find(
        (value) => value.refresh_token === body.refresh_token,
      );
      if (!existing)
        return Response.json({ message: 'Refresh fixture token already rotated' }, { status: 400 });
      usedRefreshTokens.push(existing.refresh_token);
      const rotated = credential(existing.user.id, `rotation-${usedRefreshTokens.length}`);
      issued.set(existing.user.id, rotated);
      return Response.json(rotated);
    }
    if (!path.endsWith('/user')) throw new Error('Unexpected SDK fixture HTTP request');
    const token = request.headers.get('Authorization');
    const current = [...issued.values()].find((value) => token === `Bearer ${value.access_token}`);
    return current
      ? Response.json(current.user)
      : Response.json({ message: 'Unknown fixture credential' }, { status: 401 });
  };
  const client = createClient('https://project.example.invalid', 'synthetic-publishable', {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: true,
      storage: supabaseAuthStorage,
      storageKey: 'device-switch-sdk',
    },
    global: { fetch: fetchAuth },
  });
  const { SupabaseAuthAdapter: Adapter } = await import('../../adapters/supabase/auth.adapter');
  const adapter = new Adapter();
  fixture.install(client, adapter);
  expect((await client.auth.setSession(first)).error).toBeNull();
  const { deviceAccounts } = await import('../deviceAccounts');
  const { setStoredSessionForAccount, getStoredSessionForAccount } = await import(
    '../../lib/supabaseAuthStorage'
  );
  const { getActiveAccountId, setActiveAccountId } = await import('../../lib/accountScope');
  setActiveAccountId(null);
  fixture.identify.mockImplementation(async () => ({
    id: (await adapter.getSession())?.user.id === first.user.id ? canonicalA : canonicalB,
  }));
  await deviceAccounts.captureCurrentAccount(first);
  await setStoredSessionForAccount(canonicalB, second);
  const captures: Array<ReturnType<typeof deviceAccounts.captureCurrentAccount>> = [];
  const retentions: Array<ReturnType<typeof deviceAccounts.retainRefreshedSession>> = [];
  const { data } = adapter.onAuthStateChange((event, session) => {
    if (event === 'TOKEN_REFRESHED') {
      const retention = deviceAccounts.retainRefreshedSession(session);
      retentions.push(retention);
      return retention.then(() => undefined);
    }
    if (event !== 'SIGNED_IN' || session?.user.id !== second.user.id) return;
    const capture = deviceAccounts.captureCurrentAccount(session);
    captures.push(capture);
    return capture.then(() => undefined);
  });
  try {
    const refreshed = await client.auth.refreshSession();
    expect(refreshed.error).toBeNull();
    await Promise.all(retentions);
    expect(refreshed.data.session?.refresh_token).not.toBe(first.refresh_token);
    const rotated = await getStoredSessionForAccount(canonicalA);
    expect(rotated?.refresh_token).toBe(refreshed.data.session?.refresh_token);
    await deviceAccounts.switchTo(canonicalB);
    expect(captures).toHaveLength(1);
    await Promise.all(captures);
    expect(getActiveAccountId()).toBe(canonicalB);
    expect((await deviceAccounts.list()).map((account) => account.accountId).sort()).toEqual([
      canonicalA,
      canonicalB,
    ]);
    expect((await client.auth.getSession()).data.session?.user.id).toBe(second.user.id);
    await expect(deviceAccounts.captureCurrentAccount(first)).rejects.toMatchObject({
      code: 'AUTH_SESSION_CHANGED',
    });
    expect((await getStoredSessionForAccount(canonicalB))?.access_token).toBe(second.access_token);
    expect((await client.auth.getSession()).data.session?.user.id).toBe(second.user.id);
    const later = Date.now() + 3_601_000;
    const clock = vi.spyOn(Date, 'now').mockReturnValue(later);
    await deviceAccounts.switchTo(canonicalA);
    await Promise.all(retentions);
    expect(usedRefreshTokens).toEqual([first.refresh_token, rotated?.refresh_token]);
    expect((await client.auth.getSession()).data.session?.user.id).toBe(first.user.id);
    const remembered = await getStoredSessionForAccount(canonicalA);
    expect(remembered?.refresh_token).not.toBe(rotated?.refresh_token);
    if (!remembered?.access_token || !remembered.refresh_token)
      throw new Error('Missing remembered fixture credentials');
    clock.mockReturnValue(later + 3_601_000);
    const restored = createClient('https://project.example.invalid', 'synthetic-publishable', {
      auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
      global: { fetch: fetchAuth },
    });
    try {
      const result = await restored.auth.setSession({
        access_token: remembered.access_token,
        refresh_token: remembered.refresh_token,
      });
      expect(result.error).toBeNull();
      expect(result.data.session?.user.id).toBe(first.user.id);
      expect(usedRefreshTokens).toEqual([
        first.refresh_token,
        rotated?.refresh_token,
        remembered.refresh_token,
      ]);
    } finally {
      await restored.auth.stopAutoRefresh();
    }
  } finally {
    data.subscription.unsubscribe();
    setActiveAccountId(null);
  }
});
