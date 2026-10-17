import type {
  ChannelDeliveryIntent,
  ExternalChannelProvider,
} from '@repo/core/logic/omnichannel/channelAuthority';

type Environment = (key: string) => string | undefined;

/**
 * Credential-free outbound boundary. Concrete adapters are installed at
 * composition time; this registry never creates one or reaches a provider.
 */
export type ChannelDeliveryProvider = Readonly<{
  send: (intent: ChannelDeliveryIntent) => Promise<Readonly<{ providerMessageId: string | null }>>;
}>;

export type ChannelDeliveryProviderRegistry = Readonly<{
  get: (provider: ExternalChannelProvider) => ChannelDeliveryProvider | undefined;
}>;

export type CreateChannelDeliveryProviderRegistryOptions = Readonly<{
  getEnv: Environment;
  providers: Readonly<Partial<Record<'whatsapp' | 'telegram', ChannelDeliveryProvider>>>;
}>;

const providerFlagKeys = {
  whatsapp: 'WHATSAPP_OUTBOUND_ENABLED',
  telegram: 'TELEGRAM_OUTBOUND_ENABLED',
} as const;

function isExactlyEnabled(getEnv: Environment, key: string): boolean {
  return getEnv(key) === 'true';
}

export function createChannelDeliveryProviderRegistry(
  options: CreateChannelDeliveryProviderRegistryOptions,
): ChannelDeliveryProviderRegistry {
  return {
    get(provider) {
      if (!isExactlyEnabled(options.getEnv, 'CHANNEL_OUTBOUND_ENABLED')) return undefined;
      if (provider !== 'whatsapp' && provider !== 'telegram') return undefined;
      if (!isExactlyEnabled(options.getEnv, providerFlagKeys[provider])) return undefined;
      return options.providers[provider];
    },
  };
}
