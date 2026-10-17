import type { ChannelDeliveryIntent } from '@repo/core/logic/omnichannel/channelAuthority';
import { queryDatabaseRows } from '@repo/database/client';

type QueryRows = <T>(query: string, parameters: readonly unknown[]) => Promise<T[]>;

type AuthorizationRow = { authorized: boolean };

export type ChannelDeliveryAuthorization = Readonly<{
  authorize: (intent: ChannelDeliveryIntent) => Promise<boolean>;
}>;

/**
 * Revalidates mutable authority immediately before outbound send. No canonical
 * account or linked identity means denial, never an anonymous fallback.
 */
export async function authorizeChannelDelivery(
  intent: ChannelDeliveryIntent,
  queryRows: QueryRows = queryDatabaseRows,
): Promise<boolean> {
  if (!intent.accountId || !intent.channelIdentityId) return false;

  const rows = await queryRows<AuthorizationRow>(
    `select exists (
       select 1
         from public.channel_identities as identity
        where identity.id = $1::uuid
          and identity.account_id = $2::uuid
          and identity.state = 'linked'
          and identity.revoked_at is null
          and exists (
            select 1 from public.channel_consent_grants as consent
             where consent.account_id = identity.account_id
               and consent.channel_identity_id = identity.id
               and consent.status = 'active'
               and consent.revoked_at is null
               and (consent.expires_at is null or consent.expires_at > now())
               and $3 = any(consent.capabilities)
               and consent.resource_scope @> $4::jsonb
          )
          and ($5::text is null or exists (
            select 1 from public.channel_delegations as delegation
             where delegation.account_id = identity.account_id
               and delegation.agent_key = $5
               and delegation.status = 'active'
               and delegation.revoked_at is null
               and (delegation.expires_at is null or delegation.expires_at > now())
               and $3 = any(delegation.capabilities)
               and delegation.resource_scope @> $4::jsonb
          ))
     ) as authorized`,
    [
      intent.channelIdentityId,
      intent.accountId,
      intent.capability,
      JSON.stringify(intent.resourceScope),
      intent.delegationAgentKey,
    ],
  );
  return rows[0]?.authorized === true;
}
