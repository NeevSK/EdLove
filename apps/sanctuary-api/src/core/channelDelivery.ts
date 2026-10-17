import crypto from 'node:crypto';
import {
  type ChannelDeliveryIntent,
  ChannelDeliveryIntentSchema,
  type ChannelEndpointKind,
  type ChannelResourceScope,
  type ExternalChannelProvider,
} from '@repo/core/logic/omnichannel/channelAuthority';
import { queryDatabaseRows } from '@repo/database/client';

type QueryRows = <T>(query: string, parameters: readonly unknown[]) => Promise<T[]>;

export type QueueChannelDeliveryRequest = Readonly<{
  accountId: string | null;
  provider: ExternalChannelProvider;
  channelIdentityId: string | null;
  endpointKind: ChannelEndpointKind;
  operationId: string | null;
  capability: string;
  delegationAgentKey: string | null;
  resourceScope: ChannelResourceScope;
  idempotencyKey: string;
  payloadRef: string;
  expiresAt: string | null;
}>;

type DeliveryRow = {
  id: string;
  account_id: string | null;
  provider: ExternalChannelProvider;
  channel_identity_id: string | null;
  endpoint_kind: ChannelEndpointKind;
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
 * Records a dispatchable intent after a domain command commits. The caller gets
 * no delivery claim: a future dispatcher owns accepted/delivered transitions.
 */
export async function queueChannelDelivery(
  request: QueueChannelDeliveryRequest,
  queryRows: QueryRows = queryDatabaseRows,
): Promise<ChannelDeliveryIntent> {
  const rows = await queryRows<DeliveryRow>(
    `insert into public.channel_delivery_intents
      (id, account_id, provider, channel_identity_id, endpoint_kind, operation_id,
       capability, delegation_agent_key, resource_scope, idempotency_key, payload_ref, status, expires_at)
     values ($1::uuid, $2::uuid, $3, $4::uuid, $5, $6::uuid, $7, $8, $9::jsonb, $10::uuid, $11, 'pending', $12::timestamptz)
     on conflict (provider, idempotency_key) do update set idempotency_key = excluded.idempotency_key
     returning id, account_id, provider, channel_identity_id, endpoint_kind, operation_id,
       capability, delegation_agent_key, resource_scope, idempotency_key, payload_ref, status, expires_at, created_at, updated_at`,
    [
      crypto.randomUUID(),
      request.accountId,
      request.provider,
      request.channelIdentityId,
      request.endpointKind,
      request.operationId,
      request.capability,
      request.delegationAgentKey,
      JSON.stringify(request.resourceScope),
      request.idempotencyKey,
      request.payloadRef,
      request.expiresAt,
    ],
  );
  const delivery = rows[0];
  if (!delivery) throw new Error('Channel delivery intent persistence returned no record.');
  return mapDelivery(delivery);
}
