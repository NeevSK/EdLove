import { describe, expect, it, vi } from 'vitest';
import { authorizeChannelDelivery } from '../core/channelDeliveryAuthorization';

const intent = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  accountId: '123e4567-e89b-12d3-a456-426614174001',
  provider: 'telegram' as const,
  channelIdentityId: '123e4567-e89b-12d3-a456-426614174002',
  endpointKind: 'private' as const,
  operationId: null,
  capability: 'channel.delivery',
  delegationAgentKey: 'sanctuary-assistant',
  resourceScope: { schoolId: '123e4567-e89b-12d3-a456-426614174004' },
  idempotencyKey: '123e4567-e89b-12d3-a456-426614174003',
  payloadRef: 'channel-payload:opaque-reference',
  status: 'processing' as const,
  expiresAt: null,
  createdAt: '2026-10-15T00:00:00.000Z',
  updatedAt: '2026-10-15T00:00:00.000Z',
};

describe('channel delivery authorization', () => {
  it('requires active linked identity, matching consent, and matching delegation capability', async () => {
    const query = vi.fn().mockResolvedValue([{ authorized: true }]);

    await expect(authorizeChannelDelivery(intent, query)).resolves.toBe(true);
    expect(query.mock.calls[0]?.[0]).toContain("identity.state = 'linked'");
    expect(query.mock.calls[0]?.[0]).toContain("consent.status = 'active'");
    expect(query.mock.calls[0]?.[0]).toContain("delegation.status = 'active'");
    expect(query.mock.calls[0]?.[0]).toContain('consent.resource_scope @> $4::jsonb');
    expect(query.mock.calls[0]?.[0]).toContain('delegation.resource_scope @> $4::jsonb');
    expect(query.mock.calls[0]?.[0]).toContain('delegation.agent_key = $5');
    expect(query.mock.calls[0]?.[0]).toContain(
      '(consent.expires_at is null or consent.expires_at > now())',
    );
    expect(query.mock.calls[0]?.[0]).toContain(
      '(delegation.expires_at is null or delegation.expires_at > now())',
    );
    expect(query.mock.calls[0]?.[0]).toContain('$3 = any(consent.capabilities)');
    expect(query.mock.calls[0]?.[0]).toContain('$3 = any(delegation.capabilities)');
    expect(query.mock.calls[0]?.[1]).toEqual([
      intent.channelIdentityId,
      intent.accountId,
      intent.capability,
      JSON.stringify(intent.resourceScope),
      intent.delegationAgentKey,
    ]);
  });

  it('denies missing canonical account or channel identity without querying the database', async () => {
    const query = vi.fn();

    await expect(authorizeChannelDelivery({ ...intent, accountId: null }, query)).resolves.toBe(
      false,
    );
    await expect(
      authorizeChannelDelivery({ ...intent, channelIdentityId: null }, query),
    ).resolves.toBe(false);
    expect(query).not.toHaveBeenCalled();
  });

  it('fails closed when the authority store cannot be read', async () => {
    const query = vi.fn().mockRejectedValue(new Error('authority store unavailable'));

    await expect(authorizeChannelDelivery(intent, query)).rejects.toThrow(
      'authority store unavailable',
    );
    expect(query).toHaveBeenCalledOnce();
  });
});
