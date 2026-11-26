import { ORPCError } from '@orpc/server';
import type { AccountDeletion } from '@repo/core/api/v1/contract';
import { z } from 'zod';

/**
 * The account's deletion request. The database functions are the authority: they resolve the
 * account from the verified claims `withAccountData` sets, take the lock, and decide the status.
 * Requesting never erases anything; a privileged worker acts later, after policy review.
 */
/** What these reads need of a connection: a PoolClient inside `withAccountData`. */
export interface AccountConnection {
  query(sql: string): Promise<{ rows: unknown[] }>;
}

const row = z.object({
  status: z.enum(['pending_verification', 'scheduled', 'cancelled', 'completed', 'blocked']),
  request_id: z.string().nullable(),
  requested_at: z.date().nullable(),
  scheduled_for: z.date().nullable().optional(),
  reason: z.string().nullable(),
});

function toDeletion(value: unknown): AccountDeletion {
  const parsed = row.safeParse(value);
  if (!parsed.success) throw new ORPCError('SERVICE_UNAVAILABLE');
  const { status, request_id, requested_at, scheduled_for, reason } = parsed.data;
  return {
    status,
    requestId: request_id,
    requestedAt: requested_at?.toISOString() ?? null,
    scheduledFor: scheduled_for?.toISOString() ?? null,
    reason: reason ?? '',
  };
}

export async function readAccountDeletion(db: AccountConnection): Promise<AccountDeletion | null> {
  const result = await db.query('select * from public.get_account_deletion_request_status()');
  return result.rows[0] === undefined ? null : toDeletion(result.rows[0]);
}

export async function requestAccountDeletion(db: AccountConnection): Promise<AccountDeletion> {
  const result = await db.query('select * from public.request_account_deletion()');
  return toDeletion(result.rows[0]);
}

export async function cancelAccountDeletion(db: AccountConnection): Promise<AccountDeletion> {
  const result = await db.query('select * from public.cancel_account_deletion_request()');
  return toDeletion(result.rows[0]);
}
