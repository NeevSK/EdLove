import crypto from 'node:crypto';
import type { ExternalChannelProvider } from '@repo/core/logic/omnichannel/channelAuthority';
import { queryDatabaseRows } from '@repo/database/client';

type QueryRows = <T>(query: string, parameters: readonly unknown[]) => Promise<T[]>;
type LinkRow = { identity_id: string };

export type ProviderLinkConfirmation = Readonly<{
  provider: ExternalChannelProvider;
  externalSubjectKey: string;
  linkToken: string;
}>;

function hashLinkToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Atomically consumes a one-time ceremony and binds only the already verified
 * provider identity. A false result is intentionally non-enumerating.
 */
export async function confirmProviderChannelLink(
  confirmation: ProviderLinkConfirmation,
  queryRows: QueryRows = queryDatabaseRows,
): Promise<boolean> {
  const rows = await queryRows<LinkRow>(
    `with consumed_attempt as (
       update public.channel_link_attempts as attempt
          set state = 'confirmed', consumed_at = now(),
              channel_identity_id = identity.id
         from public.channel_identities as identity
        where attempt.provider = $1
          and attempt.nonce_hash = $2
          and attempt.state = 'pending'
          and attempt.expires_at > now()
          and identity.provider = $1
          and identity.external_subject_key = $3
          and identity.account_id is null
          and identity.state = 'verified'
        returning attempt.account_id, identity.id as identity_id
     ), linked_identity as (
       update public.channel_identities as identity
          set account_id = consumed_attempt.account_id,
              state = 'linked', confirmed_at = now()
         from consumed_attempt
        where identity.id = consumed_attempt.identity_id
          and identity.account_id is null
          and identity.state = 'verified'
        returning identity.id
     )
     select id as identity_id from linked_identity`,
    [confirmation.provider, hashLinkToken(confirmation.linkToken), confirmation.externalSubjectKey],
  );
  return rows.length === 1;
}
