import { Effect } from 'effect';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SupabasePowerSyncConnector } from '../SupabasePowerSyncConnector';

const state = vi.hoisted(() => ({
  account: 'account-a',
  sessionUser: 'account-a',
  token: 'token-a',
  getSession: vi.fn(),
  emit: vi.fn(),
  mockUploadBatch: vi.fn(),
}));

vi.mock('@repo/core/adapters/supabaseClient', () => ({
  supabaseClient: { auth: { getSession: state.getSession } },
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

vi.mock('@repo/core/lib/accountScope', () => ({ getActiveAccountId: () => state.account }));
vi.mock('@repo/core/lib/sync/eventBus', () => ({ sovereignBus: { emit: state.emit } }));
vi.mock('@repo/core/lib/sync/idempotency', () => ({
  getConsistentIdempotencyKey: async () => 'stable-key',
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
    state.account = state.sessionUser = 'account-a';
    state.token = 'token-a';
    state.getSession.mockReset();
    state.emit.mockReset();
    state.mockUploadBatch.mockReset();
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

  it('uses native RPC envelope and account credentials before acknowledging', async () => {
    state.mockUploadBatch.mockResolvedValueOnce({ success: true, processedCount: 1 });
    const { db, complete } = database();
    await new SupabasePowerSyncConnector('account-a').uploadData(db);
    expect(state.mockUploadBatch).toHaveBeenCalledWith(
      {
        body: {
          crud: [{ id: 'row-a', op: 'PUT', table: 'notes', opData: { text: 'draft' } }],
          idempotencyKey: 'stable-key',
        },
      },
      {
        expectedAccountId: 'account-a',
      },
    );
    expect(complete).toHaveBeenCalledTimes(1);
  });

  it('retains queue on upload error', async () => {
    const err = new Error('Server error');
    (err as any).status = 500;
    state.mockUploadBatch.mockRejectedValueOnce(err);
    const { db, complete } = database();
    await expect(new SupabasePowerSyncConnector('account-a').uploadData(db)).rejects.toBeDefined();
    expect(complete).not.toHaveBeenCalled();
  });

  it.each([400, 401, 403, 409])('does not locally retry client error %i', async (status) => {
    const err = new Error(`Client error ${status}`);
    (err as any).status = status;
    state.mockUploadBatch.mockRejectedValueOnce(err);
    const { db, complete } = database();
    await expect(new SupabasePowerSyncConnector('account-a').uploadData(db)).rejects.toBeDefined();
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
    await new SupabasePowerSyncConnector('account-a').uploadData(db);
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
    await expect(new SupabasePowerSyncConnector('account-a').uploadData(db)).rejects.toBeDefined();
    expect(state.mockUploadBatch).toHaveBeenCalledTimes(3);
    expect(complete).not.toHaveBeenCalled();
  });

  it('retains a committed batch when local acknowledgement storage fails', async () => {
    state.mockUploadBatch.mockResolvedValueOnce({ success: true, processedCount: 1 });
    const { db, complete } = database();
    complete.mockRejectedValue(new Error('local storage unavailable'));
    await expect(new SupabasePowerSyncConnector('account-a').uploadData(db)).rejects.toBeDefined();
    expect(state.mockUploadBatch).toHaveBeenCalledTimes(1);
    expect(complete).toHaveBeenCalledTimes(1);
    expect(state.emit).not.toHaveBeenCalledWith('powersync:sync_complete', expect.anything());
  });

  it('rejects a session belonging to another account without sending data', async () => {
    state.sessionUser = 'account-b';
    const { db, complete } = database();
    await expect(new SupabasePowerSyncConnector('account-a').uploadData(db)).rejects.toBeDefined();
    expect(state.mockUploadBatch).not.toHaveBeenCalled();
    expect(complete).not.toHaveBeenCalled();
  });

  it('emits unavailable account_switched when account changes before upload', async () => {
    state.account = 'account-b';
    const { db, complete } = database();
    await expect(new SupabasePowerSyncConnector('account-a').uploadData(db)).rejects.toBeDefined();
    expect(complete).not.toHaveBeenCalled();
    expect(state.emit).toHaveBeenCalledWith('powersync:unavailable', {
      reason: 'account_switched',
    });
  });

  it('retains queue if account switches while a successful upload is in flight', async () => {
    state.mockUploadBatch.mockImplementation(async () => {
      state.account = 'account-b';
      return { success: true, processedCount: 1 };
    });
    const { db, complete } = database();
    await expect(new SupabasePowerSyncConnector('account-a').uploadData(db)).rejects.toBeDefined();
    expect(complete).not.toHaveBeenCalled();
    expect(state.emit).toHaveBeenCalledWith('powersync:unavailable', {
      reason: 'account_switched',
    });
  });
});
