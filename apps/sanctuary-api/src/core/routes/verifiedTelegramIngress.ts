import crypto from 'node:crypto';
import type { ChannelInboundEnvelope } from '@repo/core/logic/omnichannel/channelAuthority';
import { Hono } from 'hono';
import { type ChannelIngressAcceptance, persistChannelIngress } from '../channelIngress';
import { confirmProviderChannelLink, type ProviderLinkConfirmation } from '../channelLinking';

const MAX_WEBHOOK_BYTES = 256 * 1024;

type Environment = (key: string) => string | undefined;
type IngressPersistence = (envelope: ChannelInboundEnvelope) => Promise<ChannelIngressAcceptance>;
type LinkConfirmation = (confirmation: ProviderLinkConfirmation) => Promise<boolean>;

type TelegramChat = { id: number; type: string };
type TelegramActor = { id: number };
type TelegramMessage = { message_id: number; from?: TelegramActor; chat: TelegramChat } & Record<
  string,
  unknown
>;
type TelegramCallback = { id: string; from: TelegramActor; message?: TelegramMessage };
type TelegramUpdate = {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallback;
};

export interface VerifiedTelegramIngressOptions {
  getEnv: Environment;
  persist?: IngressPersistence;
  confirmLink?: LinkConfirmation;
  now?: () => Date;
  correlationId?: () => string;
}

function equalSecrets(actual: string | undefined, expected: string | undefined): boolean {
  if (!actual || !expected) return false;
  const actualBytes = Buffer.from(actual);
  const expectedBytes = Buffer.from(expected);
  return (
    actualBytes.length === expectedBytes.length &&
    crypto.timingSafeEqual(actualBytes, expectedBytes)
  );
}

function parseUpdate(value: unknown): TelegramUpdate | null {
  if (!value || typeof value !== 'object') return null;
  const update = value as Partial<TelegramUpdate>;
  if (!Number.isSafeInteger(update.update_id) || update.update_id < 1) return null;
  if (update.message && isMessage(update.message)) return update as TelegramUpdate;
  if (update.callback_query && isCallback(update.callback_query)) return update as TelegramUpdate;
  return null;
}

function isMessage(value: unknown): value is TelegramMessage {
  if (!value || typeof value !== 'object') return false;
  const message = value as Partial<TelegramMessage>;
  return (
    Number.isSafeInteger(message.message_id) &&
    Boolean(message.chat) &&
    typeof message.chat?.id === 'number' &&
    typeof message.chat.type === 'string'
  );
}

function isCallback(value: unknown): value is TelegramCallback {
  if (!value || typeof value !== 'object') return false;
  const callback = value as Partial<TelegramCallback>;
  return (
    typeof callback.id === 'string' &&
    Boolean(callback.from) &&
    typeof callback.from?.id === 'number'
  );
}

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function subjectKey(actorId: number, identityHashSecret: string): string {
  return crypto.createHmac('sha256', identityHashSecret).update(String(actorId)).digest('hex');
}

function endpointKind(chatType: string | undefined): ChannelInboundEnvelope['endpointKind'] {
  if (chatType === 'private') return 'private';
  if (chatType === 'group' || chatType === 'supergroup') return 'group';
  return chatType === 'channel' ? 'channel' : 'not_applicable';
}

function payloadKind(message: TelegramMessage | undefined): ChannelInboundEnvelope['payloadKind'] {
  if (!message) return 'interactive';
  if ('audio' in message || 'voice' in message) return 'audio';
  if ('photo' in message) return 'image';
  if ('document' in message) return 'document';
  if ('video' in message) return 'video';
  return 'text' in message ? 'text' : 'status';
}

function updateActor(update: TelegramUpdate): TelegramActor | null {
  return update.message?.from ?? update.callback_query?.from ?? null;
}

function linkTokenFromMessage(message: TelegramMessage | undefined): string | null {
  const text = typeof message?.text === 'string' ? message.text.trim() : null;
  const result = text?.match(/^\/link\s+([A-Za-z0-9_-]{43})$/);
  return result?.[1] ?? null;
}

/**
 * Additive fail-closed Telegram ingress. It accepts only configured webhook
 * updates, records a minimal envelope, and performs no account or domain action.
 */
export function createVerifiedTelegramIngressRoutes(options: VerifiedTelegramIngressOptions) {
  const routes = new Hono();
  const persist = options.persist ?? persistChannelIngress;
  const confirmLink = options.confirmLink ?? confirmProviderChannelLink;
  const now = options.now ?? (() => new Date());
  const correlationId = options.correlationId ?? crypto.randomUUID;

  routes.post('/webhooks/telegram-v2', async (c) => {
    const webhookSecret = options.getEnv('TELEGRAM_WEBHOOK_SECRET');
    const identityHashSecret = options.getEnv('TELEGRAM_IDENTITY_HASH_SECRET');
    if (!webhookSecret || !identityHashSecret) return c.text('Service Unavailable', 503);
    if (!equalSecrets(c.req.header('x-telegram-bot-api-secret-token'), webhookSecret)) {
      return c.text('Unauthorized', 401);
    }

    const declaredLength = Number(c.req.header('content-length'));
    if (Number.isFinite(declaredLength) && declaredLength > MAX_WEBHOOK_BYTES) {
      return c.text('Payload Too Large', 413);
    }
    const rawBody = await c.req.text();
    if (Buffer.byteLength(rawBody, 'utf8') > MAX_WEBHOOK_BYTES)
      return c.text('Payload Too Large', 413);

    let decoded: unknown;
    try {
      decoded = JSON.parse(rawBody);
    } catch {
      return c.text('Bad Request', 400);
    }
    const update = parseUpdate(decoded);
    if (!update) return c.text('Bad Request', 400);
    const actor = updateActor(update);
    if (!actor) return c.text('Bad Request', 400);

    try {
      const message = update.message ?? update.callback_query?.message;
      const externalSubjectKey = subjectKey(actor.id, identityHashSecret);
      const endpoint = endpointKind(message?.chat.type);
      await persist({
        provider: 'telegram',
        providerEventId: String(update.update_id),
        replayKey: sha256(`telegram:${update.update_id}`),
        externalSubjectKey,
        endpointKind: endpoint,
        payloadKind: payloadKind(update.message),
        verificationRef: 'telegram_webhook_secret_v1',
        payloadFingerprint: sha256(rawBody),
        receivedAt: now().toISOString(),
        correlationId: correlationId(),
      });
      const linkToken = linkTokenFromMessage(update.message);
      if (linkToken && endpoint === 'private') {
        await confirmLink({ provider: 'telegram', externalSubjectKey, linkToken });
      }
    } catch {
      return c.text('Service Unavailable', 503);
    }

    return c.json({ status: 'accepted' }, 200);
  });

  return routes;
}
