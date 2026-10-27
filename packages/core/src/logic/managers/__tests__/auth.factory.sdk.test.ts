import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { QueuedMutation } from '../../../lib/sync/types';
import type { IIdentityPort } from '../../ports/identity.port';

const sdk = vi.hoisted(() => ({ client: null as SupabaseClient | null }));
vi.mock('@repo/core/adapters/supabaseClient', () => ({
  get supabaseClient() {
    if (!sdk.client) throw new Error('SDK fixture has not initialized');
    return sdk.client;
  },
}));
vi.mock('@repo/core/api/deviceTrust', () => ({ deviceTrustAPI: { logAuditEvent: vi.fn() } }));
vi.mock('../identity.factory', () => ({
  identity: {
    identifyActiveCitizen: vi.fn().mockResolvedValue(null),
    resolveInternalId: vi.fn(),
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    getBonds: vi.fn(),
    hasCapacity: vi.fn(),
    getActivePerspective: vi.fn(),
    switchPerspective: vi.fn(),
    linkIdentity: vi.fn(),
    createInitialBond: vi.fn(),
    completeOnboarding: vi.fn(),
    completeProfile: vi.fn(),
    blockUser: vi.fn(),
    unblockUser: vi.fn(),
  } satisfies IIdentityPort,
}));

function sessionFixture(id: string) {
  const user = {
    id,
    aud: 'authenticated',
    email: `${id}@example.invalid`,
    app_metadata: {},
    user_metadata: {},
    created_at: '2026-10-26T00:00:00Z',
  };
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const token = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: id, aud: 'authenticated', role: 'authenticated', exp: Math.floor(Date.now() / 1000) + 3600 })}.${Buffer.from('synthetic-signature').toString('base64url')}`;
  return {
    user,
    access_token: token,
    refresh_token: `synthetic-refresh-${id}`,
    token_type: 'bearer',
    expires_in: 3600,
  };
}

afterEach(async () => {
  await sdk.client?.auth.stopAutoRefresh();
  sdk.client = null;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('G2 SDK logout ordering / actual Supabase 2.117.2, simulated HTTP and memory storage', () => {
  it.each([
    { status: 200, removalFails: false },
    { status: 503, removalFails: false },
    { status: 200, removalFails: true },
  ])(
    'preserves incoming login after logout HTTP $status and removal failure $removalFails',
    async ({ status, removalFails }) => {
      const accountA = sessionFixture('f0560000-0000-4000-8000-000000000001');
      const accountB = sessionFixture('f0560000-0000-4000-8000-000000000002');
      const { MemoryStorageAdapter } = await import('../../../adapters/MemoryStorageAdapter');
      const { storage } = await import('../../../lib/storage');
      const { supabaseAuthStorage } = await import('../../../lib/authStorage');
      const deviceStorage = new MemoryStorageAdapter();
      storage.registerAdapter(deviceStorage);
      const pendingLogout = Promise.withResolvers<Response>();
      const requests: string[] = [];
      let revokedOutgoingCredential = false;
      sdk.client = createClient('https://project.example.invalid', 'synthetic-publishable', {
        auth: {
          autoRefreshToken: false,
          detectSessionInUrl: false,
          persistSession: true,
          storageKey: 'sdk-order-fixture',
          storage: supabaseAuthStorage,
        },
        global: {
          fetch: async (input, init) => {
            const request = new Request(input, init);
            const path = new URL(request.url).pathname;
            if (path.endsWith('/user')) return Response.json(accountA.user);
            if (path.endsWith('/logout')) {
              requests.push('logout');
              revokedOutgoingCredential =
                request.headers.get('authorization') === `Bearer ${accountA.access_token}`;
              return pendingLogout.promise;
            }
            if (path.endsWith('/token')) {
              requests.push('login');
              return Response.json(accountB);
            }
            throw new Error('Unexpected SDK fixture request');
          },
        },
      });
      const { error } = await sdk.client.auth.setSession(accountA);
      expect(error).toBeNull();
      deviceStorage.set('gurudevi-device-accounts', 'retained-registry-fixture');
      deviceStorage.set('remembered-account-b', 'retained-credential-fixture');
      const wipe = vi.spyOn(deviceStorage, 'clearAll');
      vi.stubGlobal('window', {});
      const { injectNativePowerSyncDB } = await import('../../../adapters/powersync/database');
      const close = vi.fn().mockResolvedValue(undefined);
      injectNativePowerSyncDB({ close }, {});
      const { auth } = await import('../auth.factory');
      const { useMutationQueue } = await import('../../../lib/sync/useMutationQueue');
      const command: QueuedMutation = {
        id: 'outgoing-command',
        idempotencyKey: 'outgoing-command-key',
        type: 'CUSTOM',
        scope: 'self',
        name: 'fixture',
        variables: {},
        timestamp: Date.now(),
        retryCount: 0,
        userId: '123e4567-e89b-8101-8100-426614174000',
        commandState: 'auth_paused',
      };
      useMutationQueue.setState({ queue: [command], deadLetterQueue: [], isSyncing: true });
      const outgoing = auth.signOut({ scope: 'local' });
      const logoutResult =
        status === 200 && !removalFails
          ? expect(outgoing).resolves.toBeUndefined()
          : expect(outgoing).rejects.toBeInstanceOf(AggregateError);
      await vi.waitFor(() => expect(requests).toEqual(['logout']));
      expect(deviceStorage.contains('supabase-auth-sdk-order-fixture')).toBe(true);
      expect(revokedOutgoingCredential).toBe(true);
      expect(close).toHaveBeenCalledOnce();
      const incoming = auth.signIn('incoming@example.invalid', 'synthetic-password');
      await Promise.resolve();
      expect(requests).toEqual(['logout']);
      if (removalFails) {
        vi.spyOn(deviceStorage, 'delete').mockImplementationOnce(() => {
          throw new Error('private credential fixture detail');
        });
      }
      pendingLogout.resolve(
        new Response(status === 200 ? '' : JSON.stringify({ msg: 'simulated unavailable' }), {
          status,
        }),
      );
      await logoutResult;
      await incoming;
      expect(requests).toEqual(['logout', 'login']);
      expect((await sdk.client.auth.getSession()).data.session?.user.id).toBe(accountB.user.id);
      expect(deviceStorage.getString('gurudevi-device-accounts')).toBe('retained-registry-fixture');
      expect(deviceStorage.getString('remembered-account-b')).toBe('retained-credential-fixture');
      expect(wipe).not.toHaveBeenCalled();
      expect(useMutationQueue.getState().queue).toEqual([command]);
      expect(useMutationQueue.getState().isSyncing).toBe(false);
    },
  );
});
