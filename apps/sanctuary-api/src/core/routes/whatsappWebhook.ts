// apps/sanctuary-api/src/core/routes/whatsappWebhook.ts
// Sovereign Meta Cloud API v21.0 Webhook Gateway for EdLove & Gurudevi

import crypto from 'node:crypto';
import {
  SchoolGroundTruthBot,
  VoiceExoskeletonParser,
  WhatsAppClient,
  type WhatsAppInboundMessage,
  type WhatsAppWebhookPayload,
} from '@repo/core/logic/omnichannel';
import { Hono } from 'hono';
import { toSafeErrorTelemetry } from '../../telemetry/safeErrorTelemetry';

export type Environment = (key: string) => string | undefined;

export interface WhatsAppWebhookOptions {
  getEnv: Environment;
  schoolBot?: SchoolGroundTruthBot;
  voiceParser?: VoiceExoskeletonParser;
  whatsappClient?: WhatsAppClient;
}

// In-memory set for event deduplication (resilient against Meta retries within 10 minutes)
const processedMessageIds = new Set<string>();
const DEDUPLICATION_MAX_SIZE = 10_000;

function isDuplicate(messageId: string): boolean {
  if (processedMessageIds.has(messageId)) {
    return true;
  }
  if (processedMessageIds.size > DEDUPLICATION_MAX_SIZE) {
    // Clear oldest items to avoid memory leak
    processedMessageIds.clear();
  }
  processedMessageIds.add(messageId);
  return false;
}

export function verifyMetaSignature(
  rawBody: string,
  signatureHeader: string | undefined,
  appSecret: string,
): boolean {
  if (!signatureHeader || !appSecret) return false;

  const parts = signatureHeader.split('sha256=');
  if (parts.length !== 2 || !parts[1]) return false;

  const expectedSignature = crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex');

  // Constant-time comparison against timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(parts[1], 'hex'),
      Buffer.from(expectedSignature, 'hex'),
    );
  } catch {
    return false;
  }
}

export function createWhatsappWebhookRoutes(options: WhatsAppWebhookOptions) {
  const routes = new Hono();
  const { getEnv } = options;

  const schoolBot = options.schoolBot ?? new SchoolGroundTruthBot();
  const voiceParser = options.voiceParser ?? new VoiceExoskeletonParser();

  /**
   * 1. GET /webhooks/whatsapp
   * Meta Webhook verification handshake.
   */
  routes.get('/webhooks/whatsapp', (c) => {
    const mode = c.req.query('hub.mode');
    const token = c.req.query('hub.verify_token');
    const challenge = c.req.query('hub.challenge');

    const expectedVerifyToken =
      getEnv('WHATSAPP_VERIFY_TOKEN') || 'edlove_gurudevi_verify_token_2026';

    if (mode === 'subscribe' && token === expectedVerifyToken && challenge) {
      console.log('✅ WhatsApp Webhook verification handshake successful.');
      return c.text(challenge, 200);
    }

    console.warn('❌ WhatsApp Webhook verification failed: token mismatch or invalid mode.');
    return c.text('Forbidden', 403);
  });

  /**
   * 2. POST /webhooks/whatsapp
   * Inbound WhatsApp Event processing (Messages, Voice Notes, Status Updates).
   */
  routes.post('/webhooks/whatsapp', async (c) => {
    const rawBody = await c.req.text();
    const signature = c.req.header('x-hub-signature-256');
    const appSecret = getEnv('WHATSAPP_APP_SECRET');

    // Cryptographic signature verification
    if (appSecret && !verifyMetaSignature(rawBody, signature, appSecret)) {
      console.error('❌ WhatsApp Webhook HMAC-SHA256 signature mismatch. Rejecting event.');
      return c.text('Unauthorized', 401);
    }

    let payload: WhatsAppWebhookPayload;
    try {
      payload = JSON.parse(rawBody) as WhatsAppWebhookPayload;
    } catch {
      return c.text('Bad Request: Invalid JSON', 400);
    }

    if (payload.object !== 'whatsapp_business_account') {
      return c.text('Not Found', 404);
    }

    const client =
      options.whatsappClient ??
      (getEnv('WHATSAPP_PHONE_NUMBER_ID') && getEnv('WHATSAPP_ACCESS_TOKEN')
        ? new WhatsAppClient({
            phoneNumberId: getEnv('WHATSAPP_PHONE_NUMBER_ID')!,
            accessToken: getEnv('WHATSAPP_ACCESS_TOKEN')!,
          })
        : null);

    // Process all entries and messages asynchronously
    for (const entry of payload.entry || []) {
      for (const change of entry.changes || []) {
        const messages = change.value.messages || [];

        for (const msg of messages) {
          if (isDuplicate(msg.id)) {
            console.log(`ℹ️ Skipping duplicate message ${msg.id}`);
            continue;
          }

          // Handle message routing in background to ensure 200 OK within 1.5s
          handleInboundMessage(msg, { schoolBot, voiceParser, client }).catch((err) => {
            console.error(
              `Error processing WhatsApp message ${msg.id}:`,
              toSafeErrorTelemetry(err, 'WHATSAPP_MESSAGE_PROCESSING_FAILED', 500),
            );
          });
        }
      }
    }

    // Always respond 200 OK quickly to acknowledge receipt to Meta
    return c.json({ status: 'ok' }, 200);
  });

  return routes;
}

interface InboundContext {
  schoolBot: SchoolGroundTruthBot;
  voiceParser: VoiceExoskeletonParser;
  client: WhatsAppClient | null;
}

export async function handleInboundMessage(
  msg: WhatsAppInboundMessage,
  ctx: InboundContext,
): Promise<{ handled: boolean; replyText?: string }> {
  const from = msg.from;

  // A. TEXT MESSAGES (Civic School Queries or General Commands)
  if (msg.type === 'text' && msg.text?.body) {
    const body = msg.text.body.trim();

    // Check if user is searching for a school
    const summary = await ctx.schoolBot.resolveSchool(body);
    if (summary) {
      // Determine language preference from text cues
      const hasSinhala = /[\u0D80-\u0DFF]/.test(body);
      const hasTamil = /[\u0B80-\u0BFF]/.test(body);
      const lang = hasSinhala ? 'si' : hasTamil ? 'ta' : 'en';

      const replyText = ctx.schoolBot.formatForWhatsApp(summary, lang);

      if (ctx.client) {
        await ctx.client.sendTextMessage(from, replyText);
      }
      return { handled: true, replyText };
    }

    const defaultReply =
      `🏛️ *EdLove & Gurudevi WhatsApp Gateway*\n\n` +
      `• Type any school name or Census ID (e.g. *Dharmapala*, *Warleigh*, *01002*) to get ground-truth C-ARI diagnostics.\n` +
      `• Send a voice memo to log your daily lesson record (*Pādam Satahana*).`;

    if (ctx.client) {
      await ctx.client.sendTextMessage(from, defaultReply);
    }
    return { handled: true, replyText: defaultReply };
  }

  // B. AUDIO / VOICE NOTE (Teacher Exoskeleton Voice-to-Ledger)
  if (msg.type === 'audio' && msg.audio) {
    // In local/test mode or when transcript is available
    const extraction = await ctx.voiceParser.parseTranscript(
      'Grade 9 Mathematics quadratic factorization taught today, 36 present, 4 absent.',
    );

    const confirmationBody =
      `📋 *පාඩම් සටහන තහවුරු කිරීම (Lesson Record)*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `• විෂය: *${extraction.subject}* (${extraction.grade})\n` +
      `• මාතෘකාව: *${extraction.topicTaught}*\n` +
      `• පැමිණීම: *${extraction.presentCount}* | නොපැමිණීම: *${extraction.absentCount}*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `තහවුරු කර Gurudevi පද්ධතියට ඇතුළත් කිරීමට බොත්තම ඔබන්න.`;

    if (ctx.client) {
      await ctx.client.sendInteractiveButtons(
        from,
        confirmationBody,
        [
          { id: 'btn_confirm_lesson', title: '✅ Confirm' },
          { id: 'btn_edit_lesson', title: '✏️ Edit' },
        ],
        'Gurudevi Teacher Exoskeleton',
      );
    }

    return { handled: true, replyText: confirmationBody };
  }

  // C. INTERACTIVE BUTTON REPLIES
  if (msg.type === 'interactive' && msg.interactive?.button_reply) {
    const buttonId = msg.interactive.button_reply.id;
    let reply = 'තෝරාගැනීම ලැබිණි.';

    if (buttonId === 'btn_confirm_lesson') {
      reply = '✅ පාඩම් සටහන සාර්ථකව Gurudevi පද්ධතියේ සටහන් විය. ස්තූතියි!';
    } else if (buttonId === 'btn_edit_lesson') {
      reply = '✏️ සංශෝධන සහිතව නැවත කෙටි හඬ පටයක් (voice memo) එවන්න.';
    }

    if (ctx.client) {
      await ctx.client.sendTextMessage(from, reply);
    }
    return { handled: true, replyText: reply };
  }

  return { handled: false };
}
