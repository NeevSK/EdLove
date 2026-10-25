import { Hono } from 'hono';
import { createVerifiedWhatsappIngressRoutes, type VerifiedWhatsappIngressOptions } from '../core/routes/verifiedWhatsappIngress';
import { createVerifiedTelegramIngressRoutes, type VerifiedTelegramIngressOptions } from '../core/routes/verifiedTelegramIngress';
import { createPayhereWebhookRoutes } from '../core/routes/payhereWebhook';

export interface OmnichannelDoorOptions {
  getEnv: (key: string) => string | undefined;
  cryptoUtils?: {
    md5Hex: (str: string) => Promise<string>;
    sha256Hex: (str: string) => Promise<string>;
  };
  whatsappOptions?: Partial<VerifiedWhatsappIngressOptions>;
  telegramOptions?: Partial<VerifiedTelegramIngressOptions>;
}

/**
 * Omnichannel Webhook Door
 * 
 * Ingests stateless webhooks from external messaging channels (WhatsApp, Telegram)
 * and payment gateways (Payhere) with cryptographic signature validation.
 */
export function createOmnichannelDoor(options: OmnichannelDoorOptions) {
  const door = new Hono();

  const getEnv = options.getEnv;

  // WhatsApp Webhook Ingress
  door.route(
    '/',
    createVerifiedWhatsappIngressRoutes({
      getEnv,
      ...options.whatsappOptions,
    }),
  );

  // Telegram Webhook Ingress
  door.route(
    '/',
    createVerifiedTelegramIngressRoutes({
      getEnv,
      ...options.telegramOptions,
    }),
  );

  // Payhere Payment Webhook Ingress (if crypto utils are provided)
  if (options.cryptoUtils) {
    door.route(
      '/',
      createPayhereWebhookRoutes(options.cryptoUtils, getEnv),
    );
  }

  return door;
}
