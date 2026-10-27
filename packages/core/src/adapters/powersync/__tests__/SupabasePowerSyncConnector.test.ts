import { Effect } from 'effect';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SupabasePowerSyncConnector } from '../SupabasePowerSyncConnector';

const accountA = '123e4567-e89b-8101-8100-426614174000';
const accountB = '123e4567-e89b-8101-8100-426614174001';

const state = vi.hoisted(() => ({
  account: 'initial-account',
  sessionUser: 'initial-subject',
  token: 'token-a',
  getSession: vi.fn(),
  getClaims: vi.fn(),
  emit: vi.fn(),
  mockUploadBatch: vi.fn(),
  credentials: vi.fn(),
  getKey: vi.fn(),
}));

vi.mock('@repo/core/adapters/supabaseClient', () => ({
  supabaseClient: { auth: { getSession: state.getSession, getClaims: state.getClaims } },
}));

vi.mock('@repo/core/api/base', () => ({
  SOVEREIGN_API_URL: 'https://api.example.test',
  SOVEREIGN_ORPC_URL: 'https://api.example.test/rpc',
  createSovereignClient: () => ({
    api: {
      powersync: {
        upload: {
          $post: vi.fn(),
        },
      },
    },
  }),
}));

vi.mock('@repo/core/api/orpcClient', () => ({
  orpcClient: {
    sync: {
      uploadBatch: (...args: unknown[]) => state.mockUploadBatch(...args),
    },
  },
}));

vi.mock('@repo/core/api/clientRuntime', () => ({
  authenticatedSovereignFetch: state.credentials,
}));

function grant(overrides: Record<string, unknown> = {}) {
  return {
    accountId: accountA,
    endpoint: 'https://sync.example.test',
    token: 'owned-sync-token',
    expiresAt: Math.floor(Date.now() / 1000) + 300,
    ...overrides,
  };
}

vi.mock('@repo/core/lib/accountScope', () => ({ getActiveAccountId: () => state.account }));
vi.mock('@repo/core/lib/sync/eventBus', () => ({ sovereignBus: { emit: state.emit } }));
vi.mock('@repo/core/lib/sync/idempotency', () => ({
  getConsistentIdempotencyKey: (...args: unknown[]) => state.getKey(...args),
}));
vi.mock('@repo/core/effect/Runtime', () => ({
  normalizeError: (error: unknown) => (error instanceof Error ? error : new Error(String(error))),
  runToPromise: (effect: Effect.Effect<unknown, Error>) => Effect.runPromise(effect),
  reportBestEffort: vi.fn(),
  runForkBestEffort: vi.fn(),
}));

function database() {
  const complete = vi.fn().mockResolvedValue(undefined);
  const db = {
    getCrudBatch: vi.fn().mockResolvedValue({
      crud: [{ id: 'row-a', op: 'PUT', table: 'notes', opData: { text: 'draft' } }],
      complete,
    }),
  } as unknown as import('@powersync/common').CommonPowerSyncDatabase;
  return { db, complete };
}

describe('account-bound PowerSync uploads', () => {
  beforeEach(() => {
    state.credentials.mockReset().mockImplementation(async () => Response.json(grant()));
    state.account = state.sessionUser = accountA;
    state.token = 'token-a';
    state.getSession.mockReset();
    state.getClaims.mockReset().mockImplementation(async () => ({
      data: {
        claims: {
          sub: state.sessionUser,
          canonical_account_id: state.sessionUser === 'subject-a' ? accountA : accountB,
        },
      },
      error: null,
    }));
    state.emit.mockReset();
    state.mockUploadBatch.mockReset();
    state.getKey.mockReset().mockResolvedValue('stable-key');
    state.sessionUser = 'subject-a';
    state.getSession.mockImplementation(async () => ({
      data: {
        session: {
          access_token: state.token,
          user: { id: state.sessionUser, is_anonymous: false },
        },
      },
      error: null,
    }));
  });
  afterEach(() => vi.unstubAllGlobals());

  it('rejects closed admission before requesting credentials or draining local SQL work', async () => {
    const service = new SupabasePowerSyncConnector(accountA, () => false);
    const { db, complete } = database();
    await expect(service.fetchCredentials()).rejects.toMatchObject({ status: 409 });
    await expect(service.uploadData(db)).rejects.toMatchObject({ status: 409 });
    expect(state.getSession).not.toHaveBeenCalled();
    expect(db.getCrudBatch).not.toHaveBeenCalled();
    expect(complete).not.toHaveBeenCalled();
  });
  it.each(['credentials', 'upload'])(
    'rechecks admission after session loading for %s',
    async (operation) => {
      let allowed = true;
      const loadSession = state.getSession.getMockImplementation()!;
      state.getSession.mockImplementationOnce(async () => {
        const result = await loadSession();
        allowed = false;
        return result;
      });
      const service = new SupabasePowerSyncConnector(accountA, () => allowed);
      const { db, complete } = database();
      await expect(
        operation === 'credentials' ? service.fetchCredentials() : service.uploadData(db),
      ).rejects.toBeDefined();
      expect(state.credentials).not.toHaveBeenCalled();
      expect(state.mockUploadBatch).not.toHaveBeenCalled();
      expect(complete).not.toHaveBeenCalled();
      if (operation === 'upload')
        expect(state.emit).toHaveBeenCalledWith('powersync:unavailable', { reason: 'disabled' });
    },
  );
  it('rejects a grant arriving after remote admission closes', async () => {
    let allowed = true;
    state.credentials.mockImplementationOnce(async () => {
      allowed = false;
      return Response.json(grant());
    });
    await expect(
      new SupabasePowerSyncConnector(accountA, () => allowed).fetchCredentials(),
    ).rejects.toThrow('admission closed');
  });
  it('rechecks admission after the idempotency hash before uploading SQL work', async () => {
    let allowed = true;
    state.getKey.mockImplementationOnce(async () => {
      allowed = false;
      return 'stable-key';
    });
    const { db, complete } = database();
    await expect(
      new SupabasePowerSyncConnector(accountA, () => allowed).uploadData(db),
    ).rejects.toBeDefined();
    expect(state.mockUploadBatch).not.toHaveBeenCalled();
    expect(complete).not.toHaveBeenCalled();
  });
  it('does not send a retry after sync admission closes during an upload failure', async () => {
    let allowed = true;
    state.mockUploadBatch.mockImplementationOnce(async () => {
      allowed = false;
      throw Object.assign(new Error('unavailable'), { status: 503 });
    });
    const { db, complete } = database();
    await expect(
      new SupabasePowerSyncConnector(accountA, () => allowed).uploadData(db),
    ).rejects.toBeDefined();
    expect(state.mockUploadBatch).toHaveBeenCalledOnce();
    expect(complete).not.toHaveBeenCalled();
  });
  it('acknowledges a completed upload for the same account even when rollout closes during its response', async () => {
    let allowed = true;
    state.mockUploadBatch.mockImplementationOnce(async () => {
      allowed = false;
      return { success: true, processedCount: 1 };
    });
    const { db, complete } = database();
    await new SupabasePowerSyncConnector(accountA, () => allowed).uploadData(db);
    expect(complete).toHaveBeenCalledOnce();
  });

  it('accepts decoupled credential and canonical account IDs from verified claims', async () => {
    const result = await new SupabasePowerSyncConnector(accountA, () => true).fetchCredentials();
    expect(result.token).toBe('owned-sync-token');
    expect(result.endpoint).toBe('https://sync.example.test');
    expect(result.expiresAt).toBeInstanceOf(Date);
    expect(state.getClaims).toHaveBeenCalledWith('token-a');
    expect(state.credentials).toHaveBeenCalledWith(
      'https://api.example.test/api/auth/sync-credentials',
      expect.objectContaining({
        method: 'POST',
        cache: 'no-store',
        headers: { Authorization: 'Bearer token-a' },
        signal: expect.any(AbortSignal),
      }),
      accountA,
    );
  });

  it.each(['revoked session', 'provider unavailable'])(
    'denies download credentials when live admission fails: %s',
    async (reason) => {
      state.credentials.mockRejectedValue(new Error(reason));
      await expect(
        new SupabasePowerSyncConnector(accountA, () => true).fetchCredentials(),
      ).rejects.toThrow(reason);
      expect(state.credentials).toHaveBeenCalledTimes(1);
      expect(state.mockUploadBatch).not.toHaveBeenCalled();
    },
  );

  it('denies download credentials for a mismatched server account', async () => {
    state.credentials.mockResolvedValue(Response.json(grant({ accountId: accountB })));
    await expect(
      new SupabasePowerSyncConnector(accountA, () => true).fetchCredentials(),
    ).rejects.toThrow('account changed');
  });

  it('denies stale admission after a switch during the server request', async () => {
    state.credentials.mockImplementation(async () => {
      state.account = accountB;
      return Response.json(grant());
    });
    await expect(
      new SupabasePowerSyncConnector(accountA, () => true).fetchCredentials(),
    ).rejects.toThrow('account changed');
  });

  it('denies stale admission after a switch during response body parsing', async () => {
    state.credentials.mockResolvedValue({
      ok: true,
      json: async () => {
        state.account = accountB;
        return grant();
      },
    });
    await expect(
      new SupabasePowerSyncConnector(accountA, () => true).fetchCredentials(),
    ).rejects.toThrow('account changed');
  });

  it.each([401, 403, 429, 503])(
    'denies credentials after server HTTP %s without a provider fallback',
    async (status) => {
      const response = Response.json({ error: 'private upstream details' }, { status });
      const cancel = vi.spyOn(response.body!, 'cancel');
      state.credentials.mockResolvedValue(response);
      await expect(
        new SupabasePowerSyncConnector(accountA, () => true).fetchCredentials(),
      ).rejects.toThrow(`PowerSync grant admission failed (${status})`);
      expect(cancel).toHaveBeenCalledOnce();
      expect(state.credentials).toHaveBeenCalledOnce();
      expect(state.mockUploadBatch).not.toHaveBeenCalled();
    },
  );

  it.each([
    () => ({ accountId: accountA }),
    () => grant({ extra: 'unexpected' }),
    () => grant({ expiresAt: 'invalid' }),
    () => grant({ accountId: 'subject-a' }),
  ])('denies malformed grant payloads', async (payload) => {
    state.credentials.mockResolvedValue(Response.json(payload()));
    await expect(
      new SupabasePowerSyncConnector(accountA, () => true).fetchCredentials(),
    ).rejects.toThrow('Invalid PowerSync grant response');
  });

  it('does not expose a malformed response body in its error', async () => {
    state.credentials.mockResolvedValue(
      new Response('private credential contents', { status: 200 }),
    );
    await expect(
      new SupabasePowerSyncConnector(accountA, () => true).fetchCredentials(),
    ).rejects.toThrow('Invalid PowerSync grant response');
  });

  it.each([-1, 0, 361])('denies invalid grant expiry offset %s', async (offset) => {
    state.credentials.mockResolvedValue(
      Response.json(grant({ expiresAt: Math.floor(Date.now() / 1000) + offset })),
    );
    await expect(
      new SupabasePowerSyncConnector(accountA, () => true).fetchCredentials(),
    ).rejects.toThrow('Invalid PowerSync grant expiry');
  });

  it('admits the supported forward server clock tolerance without altering expiry', async () => {
    const expiresAt = Math.floor(Date.now() / 1000) + 330;
    state.credentials.mockResolvedValue(Response.json(grant({ expiresAt })));
    const result = await new SupabasePowerSyncConnector(accountA, () => true).fetchCredentials();
    expect(result.expiresAt?.getTime()).toBe(expiresAt * 1000);
  });

  it('denies unsafe service endpoints', async () => {
    state.credentials.mockResolvedValue(
      Response.json(grant({ endpoint: 'http://remote.example.test' })),
    );
    await expect(
      new SupabasePowerSyncConnector(accountA, () => true).fetchCredentials(),
    ).rejects.toThrow('HTTPS');
  });

  it('rejects tokens without the canonical account claim', async () => {
    state.getClaims.mockResolvedValue({ data: { claims: { sub: 'subject-a' } }, error: null });
    await expect(
      new SupabasePowerSyncConnector(accountA, () => true).fetchCredentials(),
    ).rejects.toBeDefined();
  });

  it('rejects claim verification failures before upload', async () => {
    state.getClaims.mockResolvedValue({ data: null, error: new Error('invalid signature') });
    const { db, complete } = database();
    await expect(
      new SupabasePowerSyncConnector(accountA, () => true).uploadData(db),
    ).rejects.toBeDefined();
    expect(state.mockUploadBatch).not.toHaveBeenCalled();
    expect(complete).not.toHaveBeenCalled();
  });

  it('uses native RPC envelope and account credentials before acknowledging', async () => {
    state.mockUploadBatch.mockResolvedValueOnce({ success: true, processedCount: 1 });
    const { db, complete } = database();
    await new SupabasePowerSyncConnector(accountA, () => true).uploadData(db);
    expect(state.mockUploadBatch).toHaveBeenCalledWith(
      {
        body: {
          crud: [{ id: 'row-a', op: 'PUT', table: 'notes', opData: { text: 'draft' } }],
          idempotencyKey: 'stable-key',
        },
      },
      {
        expectedAccountId: accountA,
      },
    );
    expect(complete).toHaveBeenCalledTimes(1);
  });

  it('retains queue on upload error', async () => {
    const err = new Error('Server error');
    (err as any).status = 500;
    state.mockUploadBatch.mockRejectedValueOnce(err);
    const { db, complete } = database();
    await expect(
      new SupabasePowerSyncConnector(accountA, () => true).uploadData(db),
    ).rejects.toBeDefined();
    expect(complete).not.toHaveBeenCalled();
  });

  it.each([400, 401, 403, 409])('does not locally retry client error %i', async (status) => {
    const err = new Error(`Client error ${status}`);
    (err as any).status = status;
    state.mockUploadBatch.mockRejectedValueOnce(err);
    const { db, complete } = database();
    await expect(
      new SupabasePowerSyncConnector(accountA, () => true).uploadData(db),
    ).rejects.toBeDefined();
    expect(state.mockUploadBatch).toHaveBeenCalledTimes(1);
    expect(complete).not.toHaveBeenCalled();
  });

  it('retries transient 503 failure and succeeds on next attempt', async () => {
    const err503 = new Error('Service unavailable');
    (err503 as any).status = 503;
    state.mockUploadBatch
      .mockRejectedValueOnce(err503)
      .mockResolvedValueOnce({ success: true, processedCount: 1 });
    const { db, complete } = database();
    await new SupabasePowerSyncConnector(accountA, () => true).uploadData(db);
    expect(state.mockUploadBatch).toHaveBeenCalledTimes(2);
    expect(complete).toHaveBeenCalledTimes(1);
    expect(state.emit).toHaveBeenCalledWith('powersync:sync_complete', {
      tablesAffected: ['notes'],
    });
  });

  it('bounds local retries and retains the batch after persistent service failure', async () => {
    const err503 = new Error('Service unavailable');
    (err503 as any).status = 503;
    state.mockUploadBatch.mockRejectedValue(err503);
    const { db, complete } = database();
    await expect(
      new SupabasePowerSyncConnector(accountA, () => true).uploadData(db),
    ).rejects.toBeDefined();
    expect(state.mockUploadBatch).toHaveBeenCalledTimes(3);
    expect(complete).not.toHaveBeenCalled();
  });

  it('retains a committed batch when local acknowledgement storage fails', async () => {
    state.mockUploadBatch.mockResolvedValueOnce({ success: true, processedCount: 1 });
    const { db, complete } = database();
    complete.mockRejectedValue(new Error('local storage unavailable'));
    await expect(
      new SupabasePowerSyncConnector(accountA, () => true).uploadData(db),
    ).rejects.toBeDefined();
    expect(state.mockUploadBatch).toHaveBeenCalledTimes(1);
    expect(complete).toHaveBeenCalledTimes(1);
    expect(state.emit).not.toHaveBeenCalledWith('powersync:sync_complete', expect.anything());
  });

  it('rejects a session belonging to another account without sending data', async () => {
    state.sessionUser = accountB;
    const { db, complete } = database();
    await expect(
      new SupabasePowerSyncConnector(accountA, () => true).uploadData(db),
    ).rejects.toBeDefined();
    expect(state.mockUploadBatch).not.toHaveBeenCalled();
    expect(complete).not.toHaveBeenCalled();
  });

  it('emits unavailable account_switched when account changes before upload', async () => {
    state.account = accountB;
    const { db, complete } = database();
    await expect(
      new SupabasePowerSyncConnector(accountA, () => true).uploadData(db),
    ).rejects.toBeDefined();
    expect(complete).not.toHaveBeenCalled();
    expect(state.emit).toHaveBeenCalledWith('powersync:unavailable', {
      reason: 'account_switched',
    });
  });

  it('retains queue if account switches while a successful upload is in flight', async () => {
    state.mockUploadBatch.mockImplementation(async () => {
      state.account = accountB;
      return { success: true, processedCount: 1 };
    });
    const { db, complete } = database();
    await expect(
      new SupabasePowerSyncConnector(accountA, () => true).uploadData(db),
    ).rejects.toBeDefined();
    expect(complete).not.toHaveBeenCalled();
    expect(state.emit).toHaveBeenCalledWith('powersync:unavailable', {
      reason: 'account_switched',
    });
  });
});
