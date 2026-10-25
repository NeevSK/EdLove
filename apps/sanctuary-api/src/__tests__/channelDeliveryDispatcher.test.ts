import { describe, expect, it, vi } from 'vitest';
import { dispatchChannelDelivery } from '../core/channelDeliveryDispatcher';
import type { ChannelDeliveryProviderRegistry } from '../core/channelDeliveryProviderRegistry';

const intentId = '123e4567-e89b-8101-8000-426614174000';
const row = {
  id: intentId,
  account_id: '123e4567-e89b-12d3-a456-426614174001',
  provider: 'telegram' as const,
  channel_identity_id: '123e4567-e89b-8101-8000-426614174002',
  endpoint_kind: 'private' as const,
  operation_id: null,
  capability: 'channel.delivery',
  delegation_agent_key: null,
  resource_scope: {},
  idempotency_key: '123e4567-e89b-12d3-a456-426614174003',
  payload_ref: 'channel-payload:opaque-reference',
  status: 'processing' as const,
  expires_at: null,
  created_at: new Date('2026-10-15T00:00:00.000Z'),
  updated_at: new Date('2026-10-15T00:00:00.000Z'),
};

const request = { intentId, now: new Date('2026-10-15T01:00:00.000Z'), leaseSeconds: 30 };
const authorization = { authorize: vi.fn().mockResolvedValue(true) };

function registryFor(provider: {
  send: ReturnType<typeof vi.fn>;
}): ChannelDeliveryProviderRegistry {
  return { get: vi.fn().mockReturnValue(provider) };
}

describe('channel delivery dispatcher', () => {
  it('leases a pending intent once and records an accepted provider receipt', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce([row])
      .mockResolvedValueOnce([{ ...row, status: 'accepted' }]);
    const provider = {
      send: vi.fn().mockResolvedValue({ providerMessageId: 'provider-receipt-1' }),
    };

    await expect(
      dispatchChannelDelivery(request, registryFor(provider), authorization, query),
    ).resolves.toMatchObject({
      status: 'accepted',
      intent: { status: 'accepted' },
    });
    expect(provider.send).toHaveBeenCalledOnce();
    expect(query.mock.calls[0]?.[0]).toContain("status = 'processing'");
    expect(query.mock.calls[1]?.[0]).toContain("status = 'accepted'");
  });

  it('does not invoke a provider when another worker already owns the intent', async () => {
    const query = vi.fn().mockResolvedValue([]);
    const provider = { send: vi.fn() };

    await expect(
      dispatchChannelDelivery(request, registryFor(provider), authorization, query),
    ).resolves.toEqual({
      status: 'not_claimed',
    });
    expect(provider.send).not.toHaveBeenCalled();
  });

  it('records an indeterminate outcome after an adapter failure and does not retry', async () => {
    const query = vi.fn().mockResolvedValueOnce([row]).mockResolvedValueOnce([]);
    const provider = { send: vi.fn().mockRejectedValue(new Error('network timeout')) };

    await expect(
      dispatchChannelDelivery(request, registryFor(provider), authorization, query),
    ).resolves.toEqual({
      status: 'unknown',
      intentId,
    });
    expect(query.mock.calls[1]?.[0]).toContain("status = 'unknown'");
    expect(query.mock.calls[1]?.[1]).toEqual([intentId]);
  });

  it('rejects an unsafe lease duration before it can claim an intent', async () => {
    await expect(
      dispatchChannelDelivery(
        { ...request, leaseSeconds: 0 },
        registryFor({ send: vi.fn() }),
        authorization,
        vi.fn(),
      ),
    ).rejects.toThrow('between 1 and 300 seconds');
  });

  it('fails a denied authorization before a provider invocation', async () => {
    const query = vi.fn().mockResolvedValueOnce([row]).mockResolvedValueOnce([]);
    const provider = { send: vi.fn() };
    const registry = registryFor(provider);
    const denied = { authorize: vi.fn().mockResolvedValue(false) };

    await expect(dispatchChannelDelivery(request, registry, denied, query)).resolves.toEqual({
      status: 'denied',
      intentId,
    });
    expect(provider.send).not.toHaveBeenCalled();
    expect(registry.get).not.toHaveBeenCalled();
    expect(query.mock.calls[1]?.[0]).toContain("status = 'failed'");
  });

  it('fails closed when authority cannot be read', async () => {
    const query = vi.fn().mockResolvedValueOnce([row]).mockResolvedValueOnce([]);
    const provider = { send: vi.fn() };
    const registry = registryFor(provider);
    const unavailable = { authorize: vi.fn().mockRejectedValue(new Error('database unavailable')) };

    await expect(dispatchChannelDelivery(request, registry, unavailable, query)).resolves.toEqual({
      status: 'authorization_unavailable',
      intentId,
    });
    expect(provider.send).not.toHaveBeenCalled();
    expect(registry.get).not.toHaveBeenCalled();
    expect(query.mock.calls[1]?.[0]).toContain("status = 'failed'");
  });

  it('fails with provider_disabled when feature flags expose no adapter and never sends', async () => {
    const query = vi.fn().mockResolvedValueOnce([row]).mockResolvedValueOnce([]);
    const provider = { send: vi.fn() };
    const registry: ChannelDeliveryProviderRegistry = {
      get: vi.fn().mockReturnValue(undefined),
    };

    await expect(dispatchChannelDelivery(request, registry, authorization, query)).resolves.toEqual(
      {
        status: 'provider_disabled',
        intentId,
      },
    );
    expect(registry.get).toHaveBeenCalledWith('telegram');
    expect(provider.send).not.toHaveBeenCalled();
    expect(query.mock.calls[1]?.[0]).toContain("status = 'failed'");
    expect(query.mock.calls[1]?.[0]).toContain('OUTBOUND_PROVIDER_DISABLED');
  });
});
