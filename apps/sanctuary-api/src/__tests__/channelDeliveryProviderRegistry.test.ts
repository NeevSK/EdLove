import { describe, expect, it, vi } from 'vitest';
import type { ChannelDeliveryProvider } from '../core/channelDeliveryDispatcher';
import { createChannelDeliveryProviderRegistry } from '../core/channelDeliveryProviderRegistry';

const whatsappProvider: ChannelDeliveryProvider = {
  send: vi.fn(),
};
const telegramProvider: ChannelDeliveryProvider = {
  send: vi.fn(),
};

function createRegistry(values: Record<string, string | undefined>) {
  const getEnv = vi.fn((key: string) => values[key]);
  const registry = createChannelDeliveryProviderRegistry({
    getEnv,
    providers: { whatsapp: whatsappProvider, telegram: telegramProvider },
  });
  return { getEnv, registry };
}

describe('channel delivery provider registry', () => {
  it('returns the injected adapter only when both global and provider flags are exactly true', () => {
    const { registry } = createRegistry({
      CHANNEL_OUTBOUND_ENABLED: 'true',
      WHATSAPP_OUTBOUND_ENABLED: 'true',
      TELEGRAM_OUTBOUND_ENABLED: 'false',
    });

    expect(registry.get('whatsapp')).toBe(whatsappProvider);
    expect(registry.get('telegram')).toBeUndefined();
  });

  it.each(['TRUE', '1', 'yes', ' true', 'true '])(
    'rejects non-exact global flag value %j',
    (globalFlag) => {
      const { registry } = createRegistry({
        CHANNEL_OUTBOUND_ENABLED: globalFlag,
        WHATSAPP_OUTBOUND_ENABLED: 'true',
      });

      expect(registry.get('whatsapp')).toBeUndefined();
    },
  );

  it('does not expose an adapter when the provider flag is missing or disabled', () => {
    expect(
      createRegistry({ CHANNEL_OUTBOUND_ENABLED: 'true' }).registry.get('whatsapp'),
    ).toBeUndefined();
    expect(
      createRegistry({
        CHANNEL_OUTBOUND_ENABLED: 'true',
        WHATSAPP_OUTBOUND_ENABLED: 'false',
      }).registry.get('whatsapp'),
    ).toBeUndefined();
  });

  it('does not call adapters while selecting a provider', () => {
    const { registry } = createRegistry({
      CHANNEL_OUTBOUND_ENABLED: 'true',
      WHATSAPP_OUTBOUND_ENABLED: 'true',
      TELEGRAM_OUTBOUND_ENABLED: 'true',
    });

    expect(whatsappProvider.send).not.toHaveBeenCalled();
    expect(telegramProvider.send).not.toHaveBeenCalled();
  });
});
