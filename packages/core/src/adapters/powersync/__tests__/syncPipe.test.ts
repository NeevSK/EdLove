import type { CrudEntry, CrudTransaction } from '@powersync/common';
import {
  ConflictError,
  ForbiddenError,
  NetworkError,
  UnauthorizedError,
} from '@repo/core/effect/Errors';
import { edloveUuidV8ProfileV1AccountVector } from '@repo/core/logic/schemas/edloveUuidV8ProfileV1Vectors';
import { describe, expect, it, vi } from 'vitest';
import {
  type UploadRoute,
  createMutationUploader,
  createSyncAuthenticator,
  createSyncConnection,
} from '../syncPipe';

const ACCOUNT = edloveUuidV8ProfileV1AccountVector.uuid;
const ENDPOINT = 'https://sync.example.com';
const NOW = 1_800_000_000_000;

function grant(overrides: Record<string, unknown> = {}) {
  return {
    accountId: ACCOUNT,
    endpoint: ENDPOINT,
    token: 'signed-grant',
    expiresAt: NOW / 1000 + 300,
    ...overrides,
  };
}

function authenticator(fetchGrant: () => Promise<unknown>, isAllowed = () => true) {
  return createSyncAuthenticator({
    accountId: ACCOUNT,
    endpoint: ENDPOINT,
    fetchGrant,
    isAllowed,
    now: () => NOW,
  });
}

/** A synthetic table: the pipe is proved without admitting any product data. */
function entry(clientId: number, op: CrudEntry['op'] = 'PUT'): CrudEntry {
  return { clientId, id: `row-${clientId}`, op, table: 'pipe_probe', opData: { n: clientId } } as CrudEntry;
}

/** An upload queue with PowerSync's semantics: the head stays until `complete()`. */
function queue(transactions: CrudEntry[][]) {
  const pending = [...transactions];
  const completed: number[][] = [];
  const database = {
    getClientId: vi.fn(async () => 'install-1'),
    getNextCrudTransaction: vi.fn(async (): Promise<CrudTransaction | null> => {
      const head = pending[0];
      if (!head) return null;
      return {
        crud: head,
        complete: async () => {
          completed.push(head.map((e) => e.clientId));
          pending.shift();
        },
      } as unknown as CrudTransaction;
    }),
  };
  return { database, completed, pending };
}

function uploader(route: UploadRoute, onRejected = vi.fn(), isAllowed = () => true) {
  return {
    onRejected,
    upload: createMutationUploader({
      accountId: ACCOUNT,
      routes: { pipe_probe: route },
      isAllowed,
      onRejected,
    }),
  };
}

type Upload = ReturnType<typeof createMutationUploader>;
const run = (upload: Upload, database: ReturnType<typeof queue>['database'], abort?: AbortSignal) =>
  upload({ database: database as never, abort });

describe('sync pipe / G1 boundary, substituted API and PowerSync queue', () => {
  describe('authenticator', () => {
    it('returns the signed token from a valid grant', async () => {
      await expect(authenticator(async () => grant()).resolveCredentials({})).resolves.toBe(
        'signed-grant',
      );
    });

    it.each([
      ['malformed', { token: '' }, 'SYNC_GRANT_INVALID'],
      ['expired', { expiresAt: NOW / 1000 - 1 }, 'SYNC_GRANT_EXPIRY'],
      ['too long-lived', { expiresAt: NOW / 1000 + 3600 }, 'SYNC_GRANT_EXPIRY'],
      ['for another service', { endpoint: 'https://other.example.com' }, 'SYNC_GRANT_ENDPOINT'],
    ])('refuses a %s grant', async (_name, overrides, code) => {
      await expect(
        authenticator(async () => grant(overrides)).resolveCredentials({}),
      ).rejects.toMatchObject({ _tag: 'UnavailableError', code });
    });

    it('refuses a grant for another account', async () => {
      const other = '01234567-89ab-8101-8000-010203040507';
      await expect(
        authenticator(async () => grant({ accountId: other })).resolveCredentials({}),
      ).rejects.toMatchObject({ _tag: 'UnauthorizedError' });
    });

    it('asks for nothing once admission is closed', async () => {
      const fetchGrant = vi.fn(async () => grant());
      await expect(authenticator(fetchGrant, () => false).resolveCredentials({})).rejects.toMatchObject({
        code: 'SYNC_ADMISSION_CLOSED',
      });
      expect(fetchGrant).not.toHaveBeenCalled();
    });

    it('re-checks admission after the grant arrives (account switched mid-request)', async () => {
      let allowed = true;
      const fetchGrant = async () => {
        allowed = false;
        return grant();
      };
      await expect(authenticator(fetchGrant, () => allowed).resolveCredentials({})).rejects.toMatchObject({
        code: 'SYNC_ADMISSION_CLOSED',
      });
    });
  });

  describe('uploader', () => {
    it('sends every change in order with an installation-scoped key, then completes', async () => {
      const q = queue([[entry(1), entry(2)], [entry(3, 'DELETE')]]);
      const route = vi.fn<UploadRoute>(async () => undefined);
      await run(uploader(route).upload, q.database);
      expect(route.mock.calls.map(([e, c]) => [e.clientId, c.idempotencyKey])).toEqual([
        [1, 'powersync:install-1:1'],
        [2, 'powersync:install-1:2'],
        [3, 'powersync:install-1:3'],
      ]);
      expect(q.completed).toEqual([[1, 2], [3]]);
    });

    it('keeps a change queued on a transient failure, and resends it with the same key', async () => {
      const q = queue([[entry(1)]]);
      const route = vi
        .fn<UploadRoute>()
        .mockRejectedValueOnce(new NetworkError({ cause: new Error('offline') }))
        .mockResolvedValue(undefined);
      const { upload } = uploader(route);
      await expect(run(upload, q.database)).rejects.toMatchObject({ _tag: 'NetworkError' });
      expect(q.pending).toHaveLength(1);
      await run(upload, q.database);
      expect(route.mock.calls.map(([, c]) => c.idempotencyKey)).toEqual([
        'powersync:install-1:1',
        'powersync:install-1:1',
      ]);
      expect(q.completed).toEqual([[1]]);
    });

    it('waits for sign-in instead of dropping a change', async () => {
      const q = queue([[entry(1)]]);
      const { upload, onRejected } = uploader(async () => {
        throw new UnauthorizedError({});
      });
      await expect(run(upload, q.database)).rejects.toMatchObject({ _tag: 'UnauthorizedError' });
      expect(q.pending).toHaveLength(1);
      expect(onRejected).not.toHaveBeenCalled();
    });

    it('drops a refused change, reports it, and carries on with the rest', async () => {
      const q = queue([[entry(1), entry(2)]]);
      const route = vi
        .fn<UploadRoute>()
        .mockRejectedValueOnce(new ForbiddenError({}))
        .mockResolvedValue(undefined);
      const { upload, onRejected } = uploader(route);
      await run(upload, q.database);
      expect(onRejected).toHaveBeenCalledWith(
        expect.objectContaining({ table: 'pipe_probe', rowId: 'row-1', reason: 'forbidden' }),
      );
      expect(q.completed).toEqual([[1, 2]]);
    });

    it('lets the server win a conflict by default', async () => {
      const q = queue([[entry(1)]]);
      const { upload, onRejected } = uploader(async () => {
        throw new ConflictError({});
      });
      await run(upload, q.database);
      expect(onRejected).toHaveBeenCalledWith(expect.objectContaining({ reason: 'conflict' }));
    });

    it('rejects a repeating defect after the policy limit, so it cannot block the queue', async () => {
      const q = queue([[entry(1)], [entry(2)]]);
      const route = vi.fn<UploadRoute>(async (e) => {
        if (e.clientId === 1) throw new Error('bug');
      });
      const { upload, onRejected } = uploader(route);
      for (let attempt = 1; attempt < 5; attempt++)
        await expect(run(upload, q.database)).rejects.toThrow('bug');
      await run(upload, q.database);
      expect(onRejected).toHaveBeenCalledWith(expect.objectContaining({ reason: 'defect' }));
      expect(q.completed).toEqual([[1], [2]]);
    });

    it('holds the queue on a table with no route, instead of losing the change', async () => {
      const q = queue([[{ ...entry(1), table: 'unrouted' } as CrudEntry]]);
      const { upload } = uploader(vi.fn());
      await expect(run(upload, q.database)).rejects.toMatchObject({
        code: 'SYNC_ROUTE_NOT_ADMITTED',
      });
      expect(q.pending).toHaveLength(1);
    });

    it('stops without sending once admission closes or the SDK aborts', async () => {
      const route = vi.fn<UploadRoute>();
      const closed = queue([[entry(1)]]);
      await run(uploader(route, vi.fn(), () => false).upload, closed.database);
      const aborted = queue([[entry(1)]]);
      await run(uploader(route).upload, aborted.database, AbortSignal.abort());
      expect(route).not.toHaveBeenCalled();
      expect(closed.pending).toHaveLength(1);
      expect(aborted.pending).toHaveLength(1);
    });
  });

  it('builds one connection for database.connect()', () => {
    const connection = createSyncConnection({
      accountId: ACCOUNT,
      endpoint: ENDPOINT,
      fetchGrant: async () => grant(),
      routes: {},
      isAllowed: () => true,
      onRejected: vi.fn(),
    });
    expect(connection.powerSyncEndpoint).toBe(ENDPOINT);
    expect(typeof connection.authenticator.resolveCredentials).toBe('function');
    expect(typeof connection.upload).toBe('function');
  });
});
