import { describe, expect, it, vi } from 'vitest';
import { queueChannelDelivery } from '../core/channelDelivery';

const id = '123e4567-e89b-12d3-a456-426614174000';
const request = {
  accountId: id,
  provider: 'whatsapp' as const,
  channelIdentityId: '123e4567-e89b-12d3-a456-426614174001',
  endpointKind: 'private' as const,
  operationId: null,
  capability: 'channel.delivery',
  delegationAgentKey: null,
  resourceScope: {},
  idempotencyKey: '123e4567-e89b-12d3-a456-426614174002',
  payloadRef: 'channel-payload:opaque-reference',
  expiresAt: null,
};

describe('durable channel delivery intents', () => {
  it('queues a pending intent without claiming provider delivery', async () => {
    const query = vi.fn().mockResolvedValue([
      {
        id,
        account_id: id,
        provider: 'whatsapp',
        channel_identity_id: request.channelIdentityId,
        endpoint_kind: 'private',
        operation_id: null,
        capability: request.capability,
        delegation_agent_key: null,
        resource_scope: request.resourceScope,
        idempotency_key: request.idempotencyKey,
        payload_ref: request.payloadRef,
        status: 'pending',
        expires_at: null,
        created_at: new Date('2026-10-15T00:00:00.000Z'),
        updated_at: new Date('2026-10-15T00:00:00.000Z'),
      },
    ]);

    await expect(queueChannelDelivery(request, query)).resolves.toMatchObject({
      status: 'pending',
      idempotencyKey: request.idempotencyKey,
    });
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('on conflict (provider, idempotency_key)'),
      expect.arrayContaining([
        request.capability,
        request.delegationAgentKey,
        JSON.stringify(request.resourceScope),
        request.idempotencyKey,
        request.payloadRef,
      ]),
    );
  });

  it('does not treat a missing persistence result as a sent message', async () => {
    await expect(queueChannelDelivery(request, vi.fn().mockResolvedValue([]))).rejects.toThrow(
      'persistence returned no record',
    );
  });
});
