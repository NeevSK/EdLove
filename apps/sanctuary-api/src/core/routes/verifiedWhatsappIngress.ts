import crypto from 'node:crypto';
import type { ChannelInboundEnvelope } from '@repo/core/logic/omnichannel/channelAuthority';
import { Hono } from 'hono';
import { type ChannelIngressAcceptance, persistChannelIngress } from '../channelIngress';
import { confirmProviderChannelLink, type ProviderLinkConfirmation } from '../channelLinking';
import { verifyMetaSignature } from './whatsappWebhook';

const MAX_WEBHOOK_BYTES = 256 * 1024;

type Environment = (key: string) => string | undefined;
type IngressPersistence = (envelope: ChannelInboundEnvelope) => Promise<ChannelIngressAcceptance>;
type LinkConfirmation = (confirmation: ProviderLinkConfirmation) => Promise<boolean>;

type WhatsappMessage = {
  from: string;
  id: string;
  type: string;
  text?: { body?: string };
};

type WhatsappWebhookBody = {
  object: 'whatsapp_business_account';
  entry: Array<{ changes: Array<{ value: { messages?: WhatsappMessage[] } }> }>;
};

export interface VerifiedWhatsappIngressOptions {
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

function parseWebhookBody(value: unknown): WhatsappWebhookBody | null {
  if (!value || typeof value !== 'object') return null;
  const payload = value as { object?: unknown; entry?: unknown };
  if (payload.object !== 'whatsapp_business_account' || !Array.isArray(payload.entry)) return null;
  if (
    !payload.entry.every(
      (entry) =>
        entry &&
        typeof entry === 'object' &&
        Array.isArray((entry as { changes?: unknown }).changes),
    )
  ) {
    return null;
  }
  return payload as WhatsappWebhookBody;
}

function payloadKind(type: string): ChannelInboundEnvelope['payloadKind'] {
  if (type === 'audio' || type === 'image' || type === 'document' || type === 'interactive') {
    return type;
  }
  return type === 'text' ? 'text' : 'status';
}

function messagesFrom(payload: WhatsappWebhookBody): WhatsappMessage[] {
  return payload.entry.flatMap((entry) =>
    entry.changes.flatMap((change) =>
      (change.value.messages ?? []).filter(
        (message): message is WhatsappMessage =>
          typeof message?.id === 'string' &&
          typeof message.from === 'string' &&
          typeof message.type === 'string',
      ),
    ),
  );
}

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function subjectKey(sender: string, identityHashSecret: string): string {
  return crypto.createHmac('sha256', identityHashSecret).update(sender).digest('hex');
}

function linkTokenFromMessage(message: WhatsappMessage): string | null {
  const body = message.text?.body?.trim();
  const result = body?.match(/^\/link\s+([A-Za-z0-9_-]{43})$/);
  return result?.[1] ?? null;
}

/**
 * Additive fail-closed ingress. It persists only verified provider references
 * and fingerprints; it never dispatches, links an account, or writes a domain record.
 */
export function createVerifiedWhatsappIngressRoutes(options: VerifiedWhatsappIngressOptions) {
  const routes = new Hono();
  const persist = options.persist ?? persistChannelIngress;
  const confirmLink = options.confirmLink ?? confirmProviderChannelLink;
  const now = options.now ?? (() => new Date());
  const correlationId = options.correlationId ?? crypto.randomUUID;

  routes.get('/webhooks/whatsapp-v2', (c) => {
    const verifyToken = options.getEnv('WHATSAPP_VERIFY_TOKEN');
    if (!verifyToken) return c.text('Service Unavailable', 503);
    if (
      c.req.query('hub.mode') !== 'subscribe' ||
      !equalSecrets(c.req.query('hub.verify_token'), verifyToken) ||
      !c.req.query('hub.challenge')
    ) {
      return c.text('Forbidden', 403);
    }
    return c.text(c.req.query('hub.challenge')!, 200);
  });

  routes.post('/webhooks/whatsapp-v2', async (c) => {
    const appSecret = options.getEnv('WHATSAPP_APP_SECRET');
    const identityHashSecret = options.getEnv('WHATSAPP_IDENTITY_HASH_SECRET');
    if (!appSecret || !identityHashSecret) return c.text('Service Unavailable', 503);

    const declaredLength = Number(c.req.header('content-length'));
    if (Number.isFinite(declaredLength) && declaredLength > MAX_WEBHOOK_BYTES) {
      return c.text('Payload Too Large', 413);
    }
    const rawBody = await c.req.text();
    if (Buffer.byteLength(rawBody, 'utf8') > MAX_WEBHOOK_BYTES)
      return c.text('Payload Too Large', 413);
    if (!verifyMetaSignature(rawBody, c.req.header('x-hub-signature-256'), appSecret)) {
      return c.text('Unauthorized', 401);
    }

    let decoded: unknown;
    try {
      decoded = JSON.parse(rawBody);
    } catch {
      return c.text('Bad Request', 400);
    }
    const payload = parseWebhookBody(decoded);
    if (!payload) return c.text('Bad Request', 400);

    try {
      const receivedAt = now().toISOString();
      for (const message of messagesFrom(payload)) {
        const externalSubjectKey = subjectKey(message.from, identityHashSecret);
        await persist({
          provider: 'whatsapp',
          providerEventId: message.id,
          replayKey: sha256(`whatsapp:${message.id}`),
          externalSubjectKey,
          endpointKind: 'not_applicable',
          payloadKind: payloadKind(message.type),
          verificationRef: 'meta_hmac_sha256_v1',
          payloadFingerprint: sha256(JSON.stringify(message)),
          receivedAt,
          correlationId: correlationId(),
        });
        const linkToken = linkTokenFromMessage(message);
        if (linkToken) await confirmLink({ provider: 'whatsapp', externalSubjectKey, linkToken });
      }
    } catch {
      return c.text('Service Unavailable', 503);
    }

    return c.json({ status: 'accepted' }, 200);
  });

  return routes;
}
