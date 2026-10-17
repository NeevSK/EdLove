import { SovereignError } from '@repo/core/types/Errors';
import { canUseZenStackDb, queryDatabaseRows } from '@repo/database/client';
import { z } from 'zod';

const accountRows = z.array(z.strictObject({ user_id: z.uuid() })).max(1);

/** Provider subjects are credentials, not application account identifiers. */
export async function resolveAuthenticatedAccount(
  subject: unknown,
  databaseUrl?: string,
  provider: string = 'supabase',
) {
  const parsedSubject = z.string().min(1).safeParse(subject);
  if (!parsedSubject.success) throw SovereignError.authenticationRequired();
  if (!canUseZenStackDb(databaseUrl)) {
    throw SovereignError.unavailable('IDENTITY_RESOLUTION_UNAVAILABLE');
  }
  let rows: unknown;
  try {
    const isDefaultProvider = provider === 'supabase';
    const query = isDefaultProvider
      ? `SELECT account.id AS user_id
       FROM public.auth_identities AS identity
       JOIN public.users AS account ON account.id = identity.user_id
       WHERE identity.provider = 'supabase' AND identity.provider_user_id = $1
         AND account.deleted_at IS NULL
       LIMIT 2`
      : `SELECT account.id AS user_id
       FROM public.auth_identities AS identity
       JOIN public.users AS account ON account.id = identity.user_id
       WHERE identity.provider = $2 AND identity.provider_user_id = $1
         AND account.deleted_at IS NULL
       LIMIT 2`;
    const params = isDefaultProvider ? [parsedSubject.data] : [parsedSubject.data, provider];
    rows = await queryDatabaseRows<unknown>(query, params, databaseUrl);
  } catch {
    throw SovereignError.unavailable('IDENTITY_RESOLUTION_UNAVAILABLE');
  }
  const parsedRows = accountRows.safeParse(rows);
  if (!parsedRows.success) throw SovereignError.unavailable('IDENTITY_RESOLUTION_UNAVAILABLE');
  const account = parsedRows.data[0];
  if (!account) throw SovereignError.authenticationRequired();
  return { id: account.user_id };
}
