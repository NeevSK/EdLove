import { createRouterClient, ORPCError } from '@orpc/server';
import { Client, type PoolClient } from 'pg';
import { describe, expect, it, vi } from 'vitest';
import { asAccount, router } from '../../core/router';
import {
  type AccountConnection,
  cancelAccountDeletion,
  readAccountDeletion,
  requestAccountDeletion,
} from '../accountDeletion';
import type { AuthenticatedIdentity } from '../security';

const identity: AuthenticatedIdentity = {
  accountId: '01234567-89ab-8101-8000-010203040506',
  subject: '123e4567-e89b-4123-8123-426614174000',
  sessionId: '123e4567-e89b-4123-8123-426614174001',
  expiresAt: Math.floor(Date.now() / 1000) + 3600,
};
const requestId = '123e4567-e89b-4123-8123-426614174009';
const requestedAt = new Date('2026-11-13T10:00:00.000Z');

/** A connection that answers every statement with `rows`, keeping the statements it was sent. */
function connection(rows: unknown[]) {
  const statements: string[] = [];
  const db: AccountConnection = {
    query: async (sql) => {
      statements.push(sql);
      return { rows };
    },
  };
  return { db, statements };
}

describe('account deletion (G1 boundary / Vitest; database substituted)', () => {
  it('reads no request as null', async () => {
    const { db, statements } = connection([]);
    await expect(readAccountDeletion(db)).resolves.toBeNull();
    expect(statements).toEqual(['select * from public.get_account_deletion_request_status()']);
  });

  it('returns the request the database function decided, with ISO times', async () => {
    const { db, statements } = connection([
      {
        status: 'pending_verification',
        request_id: requestId,
        requested_at: requestedAt,
        reason: 'fresh_authentication_required',
      },
    ]);
    await expect(requestAccountDeletion(db)).resolves.toEqual({
      status: 'pending_verification',
      requestId,
      requestedAt: '2026-11-13T10:00:00.000Z',
      scheduledFor: null,
      reason: 'fresh_authentication_required',
    });
    expect(statements).toEqual(['select * from public.request_account_deletion()']);
  });

  it('cancels through the cancel function', async () => {
    const { db, statements } = connection([
      {
        status: 'cancelled',
        request_id: requestId,
        requested_at: requestedAt,
        reason: 'cancelled_by_user',
      },
    ]);
    await expect(cancelAccountDeletion(db)).resolves.toMatchObject({ status: 'cancelled' });
    expect(statements).toEqual(['select * from public.cancel_account_deletion_request()']);
  });

  it('treats a row it does not recognise as unavailable', async () => {
    const { db } = connection([
      { status: 'erased', request_id: null, requested_at: null, reason: null },
    ]);
    await expect(readAccountDeletion(db)).rejects.toMatchObject({ code: 'SERVICE_UNAVAILABLE' });
  });
});

describe('asAccount (G1 boundary / Vitest; account transaction substituted)', () => {
  const db: PoolClient = Object.assign(new Client(), { release: vi.fn() });

  it('runs the work as the verified identity', async () => {
    const seen: AuthenticatedIdentity[] = [];
    async function withAccountData<T>(
      who: AuthenticatedIdentity,
      _: AbortSignal,
      work: (db: PoolClient) => Promise<T>,
    ) {
      seen.push(who);
      return work(db);
    }
    await expect(
      asAccount({ identity, platform: { withAccountData } }, undefined, async () => 'done'),
    ).resolves.toBe('done');
    expect(seen).toEqual([identity]);
  });

  it('reports a database failure as unavailable, without its detail', async () => {
    const withAccountData = async () => {
      throw new Error('relation does not exist: private detail');
    };
    const error = await asAccount(
      { identity, platform: { withAccountData } },
      undefined,
      async () => 'never',
    ).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(ORPCError);
    expect(error).toMatchObject({ code: 'SERVICE_UNAVAILABLE' });
    expect(String(error)).not.toContain('private detail');
  });

  it('keeps an API error as it is', async () => {
    const withAccountData = async () => {
      throw new ORPCError('UNAUTHORIZED');
    };
    await expect(
      asAccount({ identity, platform: { withAccountData } }, undefined, async () => 'never'),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });
});

describe('identity.deletion procedures (G1 / in-process oRPC router)', () => {
  it('refuse a caller with no verified identity', async () => {
    const api = createRouterClient(router, { context: { requestId: 'test' } });
    await expect(api.identity.deletion.status()).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    await expect(api.identity.deletion.request()).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });
});
