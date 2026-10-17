import {
  type ChannelDeliveryIntent,
  ChannelDeliveryIntentSchema,
  type ExternalChannelProvider,
} from '@repo/core/logic/omnichannel/channelAuthority';
import { queryDatabaseRows } from '@repo/database/client';
import type { ChannelDeliveryAuthorization } from './channelDeliveryAuthorization';
import type {
  ChannelDeliveryProvider,
  ChannelDeliveryProviderRegistry,
} from './channelDeliveryProviderRegistry';

export type { ChannelDeliveryProvider } from './channelDeliveryProviderRegistry';

type QueryRows = <T>(query: string, parameters: readonly unknown[]) => Promise<T[]>;

type DeliveryRow = {
  id: string;
  account_id: string | null;
  provider: ExternalChannelProvider;
  channel_identity_id: string | null;
  endpoint_kind: ChannelDeliveryIntent['endpointKind'];
  operation_id: string | null;
  capability: string;
  delegation_agent_key: string | null;
  resource_scope: unknown;
  idempotency_key: string;
  payload_ref: string;
  status: ChannelDeliveryIntent['status'];
  expires_at: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

export type DispatchChannelDeliveryRequest = Readonly<{
  intentId: string;
  now: Date;
  leaseSeconds: number;
}>;

export type DispatchChannelDeliveryResult =
  | Readonly<{ status: 'not_claimed' }>
  | Readonly<{ status: 'accepted'; intent: ChannelDeliveryIntent }>
  | Readonly<{ status: 'unknown'; intentId: string }>
  | Readonly<{ status: 'denied'; intentId: string }>
  | Readonly<{ status: 'authorization_unavailable'; intentId: string }>
  | Readonly<{ status: 'provider_disabled'; intentId: string }>;

function mapDelivery(row: DeliveryRow): ChannelDeliveryIntent {
  return ChannelDeliveryIntentSchema.parse({
    id: row.id,
    accountId: row.account_id,
    provider: row.provider,
    channelIdentityId: row.channel_identity_id,
    endpointKind: row.endpoint_kind,
    operationId: row.operation_id,
    capability: row.capability,
    delegationAgentKey: row.delegation_agent_key,
    resourceScope: row.resource_scope,
    idempotencyKey: row.idempotency_key,
    payloadRef: row.payload_ref,
    status: row.status,
    expiresAt: row.expires_at ? new Date(row.expires_at).toISOString() : null,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  });
}

/**
 * Leases one already-queued intent. Providers are injected so this boundary has
 * no credentials or payload access. An adapter error becomes `unknown`: a
 * retry could duplicate a message whose provider outcome was lost in transit.
 */
export async function dispatchChannelDelivery(
  request: DispatchChannelDeliveryRequest,
  providers: ChannelDeliveryProviderRegistry,
  authorization: ChannelDeliveryAuthorization,
  queryRows: QueryRows = queryDatabaseRows,
): Promise<DispatchChannelDeliveryResult> {
  if (
    !Number.isInteger(request.leaseSeconds) ||
    request.leaseSeconds < 1 ||
    request.leaseSeconds > 300
  ) {
    throw new Error('Channel delivery lease must be an integer between 1 and 300 seconds.');
  }

  const now = request.now.toISOString();
  const claimedRows = await queryRows<DeliveryRow>(
    `update public.channel_delivery_intents
        set status = 'processing', attempts = attempts + 1,
            locked_until = $2::timestamptz + make_interval(secs => $3::integer)
      where id = $1::uuid
        and status = 'pending'
        and (expires_at is null or expires_at > $2::timestamptz)
      returning id, account_id, provider, channel_identity_id, endpoint_kind, operation_id,
                capability, delegation_agent_key, resource_scope, idempotency_key, payload_ref, status,
                expires_at, created_at, updated_at`,
    [request.intentId, now, request.leaseSeconds],
  );
  const claimed = claimedRows[0];
  if (!claimed) return { status: 'not_claimed' };

  const intent = mapDelivery(claimed);
  let allowed: boolean;
  try {
    allowed = await authorization.authorize(intent);
  } catch {
    await queryRows(
      `update public.channel_delivery_intents
          set status = 'failed', locked_until = null, last_error_code = 'DELIVERY_AUTHORIZATION_UNAVAILABLE'
        where id = $1::uuid and status = 'processing'`,
      [intent.id],
    );
    return { status: 'authorization_unavailable', intentId: intent.id };
  }
  if (!allowed) {
    await queryRows(
      `update public.channel_delivery_intents
          set status = 'failed', locked_until = null, last_error_code = 'DELIVERY_AUTHORIZATION_DENIED'
        where id = $1::uuid and status = 'processing'`,
      [intent.id],
    );
    return { status: 'denied', intentId: intent.id };
  }

  const provider = providers.get(intent.provider);
  if (!provider) {
    await queryRows(
      `update public.channel_delivery_intents
          set status = 'failed', locked_until = null, last_error_code = 'OUTBOUND_PROVIDER_DISABLED'
        where id = $1::uuid and status = 'processing'`,
      [intent.id],
    );
    return { status: 'provider_disabled', intentId: intent.id };
  }
  try {
    const receipt = await provider.send(intent);
    const acceptedRows = await queryRows<DeliveryRow>(
      `update public.channel_delivery_intents
          set status = 'accepted', accepted_at = $2::timestamptz, locked_until = null,
              provider_message_id = $3
        where id = $1::uuid and status = 'processing'
        returning id, account_id, provider, channel_identity_id, endpoint_kind, operation_id,
                  capability, delegation_agent_key, resource_scope, idempotency_key, payload_ref, status,
                  expires_at, created_at, updated_at`,
      [intent.id, now, receipt.providerMessageId],
    );
    const accepted = acceptedRows[0];
    if (!accepted) throw new Error('Channel delivery acceptance persistence returned no record.');
    return { status: 'accepted', intent: mapDelivery(accepted) };
  } catch {
    await queryRows(
      `update public.channel_delivery_intents
          set status = 'unknown', locked_until = null, last_error_code = 'PROVIDER_OUTCOME_UNKNOWN'
        where id = $1::uuid and status = 'processing'`,
      [intent.id],
    );
    return { status: 'unknown', intentId: intent.id };
  }
}
