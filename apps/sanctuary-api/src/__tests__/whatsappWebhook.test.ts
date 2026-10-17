// apps/sanctuary-api/src/__tests__/whatsappWebhook.test.ts
// Integration and Unit Tests for WhatsApp Business Platform Webhook

import crypto from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import {
  createWhatsappWebhookRoutes,
  handleInboundMessage,
  verifyMetaSignature,
} from '../core/routes/whatsappWebhook';

describe('WhatsApp Webhook Gateway', () => {
  const mockEnv: Record<string, string> = {
    WHATSAPP_VERIFY_TOKEN: 'test_verify_token_123',
    WHATSAPP_APP_SECRET: 'test_app_secret_456',
    WHATSAPP_PHONE_NUMBER_ID: '100200300400',
    WHATSAPP_ACCESS_TOKEN: 'test_access_token_xyz',
  };

  const getEnv = (key: string) => mockEnv[key];

  describe('1. GET /webhooks/whatsapp (Meta Verification Handshake)', () => {
    it('returns the challenge string with 200 OK when tokens match', async () => {
      const app = createWhatsappWebhookRoutes({ getEnv });
      const res = await app.request(
        '/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=test_verify_token_123&hub.challenge=test_challenge_abc',
      );

      expect(res.status).toBe(200);
      expect(await res.text()).toBe('test_challenge_abc');
    });

    it('returns 403 Forbidden when verify token does not match', async () => {
      const app = createWhatsappWebhookRoutes({ getEnv });
      const res = await app.request(
        '/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=wrong_token&hub.challenge=test_challenge_abc',
      );

      expect(res.status).toBe(403);
      expect(await res.text()).toBe('Forbidden');
    });

    it('returns 403 Forbidden when hub.mode is not subscribe', async () => {
      const app = createWhatsappWebhookRoutes({ getEnv });
      const res = await app.request(
        '/webhooks/whatsapp?hub.mode=publish&hub.verify_token=test_verify_token_123&hub.challenge=test_challenge_abc',
      );

      expect(res.status).toBe(403);
    });
  });

  describe('2. HMAC-SHA256 Signature Verification', () => {
    it('verifies legitimate signature generated with app secret', () => {
      const payload = JSON.stringify({ test: 'data' });
      const secret = 'my_secret';
      const hash = crypto.createHmac('sha256', secret).update(payload).digest('hex');
      const header = `sha256=${hash}`;

      expect(verifyMetaSignature(payload, header, secret)).toBe(true);
    });

    it('rejects tampered payload', () => {
      const payload = JSON.stringify({ test: 'data' });
      const tampered = JSON.stringify({ test: 'tampered' });
      const secret = 'my_secret';
      const hash = crypto.createHmac('sha256', secret).update(payload).digest('hex');
      const header = `sha256=${hash}`;

      expect(verifyMetaSignature(tampered, header, secret)).toBe(false);
    });

    it('rejects missing or malformed signature header', () => {
      expect(verifyMetaSignature('data', undefined, 'secret')).toBe(false);
      expect(verifyMetaSignature('data', 'invalid_header', 'secret')).toBe(false);
    });
  });

  describe('3. POST /webhooks/whatsapp Event Processing', () => {
    it('rejects POST with 401 Unauthorized if HMAC signature fails', async () => {
      const app = createWhatsappWebhookRoutes({ getEnv });
      const body = JSON.stringify({ object: 'whatsapp_business_account', entry: [] });

      const res = await app.request('/webhooks/whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-hub-signature-256': 'sha256=invalid_hex_string',
        },
        body,
      });

      expect(res.status).toBe(401);
    });

    it('accepts valid POST event and returns 200 OK status immediately', async () => {
      const app = createWhatsappWebhookRoutes({ getEnv });
      const body = JSON.stringify({
        object: 'whatsapp_business_account',
        entry: [
          {
            id: 'WABA_123',
            changes: [
              {
                field: 'messages',
                value: {
                  messaging_product: 'whatsapp',
                  metadata: {
                    display_phone_number: '+94770000000',
                    phone_number_id: '100200300400',
                  },
                  messages: [
                    {
                      from: '94771234567',
                      id: 'wamid.test_001',
                      timestamp: '1728637200',
                      type: 'text',
                      text: { body: 'Dharmapala' },
                    },
                  ],
                },
              },
            ],
          },
        ],
      });

      const hash = crypto
        .createHmac('sha256', mockEnv.WHATSAPP_APP_SECRET!)
        .update(body)
        .digest('hex');

      const res = await app.request('/webhooks/whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-hub-signature-256': `sha256=${hash}`,
        },
        body,
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json).toEqual({ status: 'ok' });
    });
  });

  describe('4. Inbound Message Handlers (Civic & Operational)', () => {
    it('handles school ground truth text query and returns C-ARI card', async () => {
      const mockSchoolBot = {
        resolveSchool: vi.fn().mockResolvedValue({
          censusNo: '01002',
          name: 'Dharmapala Vidyalaya Pannipitiya',
          category: 'National',
          type: '1AB',
          province: 'Western',
          district: 'Colombo',
          totalStudents: 4890,
          totalTeachers: 291,
          officialStr: 16.8,
          realClassroomDensity: 48,
          ratioTheaterDelta: 31.2,
          cariScore: 55.9,
          attunementProbability: 2.1,
          shadowTuitionMonthlyEst: 38000,
          sdsFundingShare: 44.0,
          thermodynamicRiskLevel: 'LOW',
        }),
        formatForWhatsApp: vi.fn().mockReturnValue('MOCK_WHATSAPP_CARD_CONTENT'),
      };

      const result = await handleInboundMessage(
        {
          from: '94771234567',
          id: 'wamid.msg_text_01',
          timestamp: '1728637200',
          type: 'text',
          text: { body: 'Dharmapala' },
        },
        {
          schoolBot: mockSchoolBot as any,
          voiceParser: {} as any,
          client: null,
        },
      );

      expect(result.handled).toBe(true);
      expect(result.replyText).toBe('MOCK_WHATSAPP_CARD_CONTENT');
      expect(mockSchoolBot.resolveSchool).toHaveBeenCalledWith('Dharmapala');
    });

    it('handles voice note memo and generates confirmation buttons', async () => {
      const mockVoiceParser = {
        parseTranscript: vi.fn().mockResolvedValue({
          subject: 'Mathematics',
          grade: 'Grade 9',
          topicTaught: 'Quadratic Factorization',
          presentCount: 36,
          absentCount: 4,
          confidenceScore: 0.95,
          needsClarification: false,
        }),
      };

      const result = await handleInboundMessage(
        {
          from: '94771234567',
          id: 'wamid.msg_audio_01',
          timestamp: '1728637200',
          type: 'audio',
          audio: {
            id: 'media_audio_123',
            mime_type: 'audio/ogg; codecs=opus',
            voice: true,
          },
        },
        {
          schoolBot: { resolveSchool: vi.fn().mockResolvedValue(null) } as any,
          voiceParser: mockVoiceParser as any,
          client: null,
        },
      );

      expect(result.handled).toBe(true);
      expect(result.replyText).toContain('පාඩම් සටහන තහවුරු කිරීම');
      expect(result.replyText).toContain('*Mathematics* (Grade 9)');
      expect(result.replyText).toContain('36');
    });

    it('handles interactive button click to confirm lesson record', async () => {
      const result = await handleInboundMessage(
        {
          from: '94771234567',
          id: 'wamid.btn_reply_01',
          timestamp: '1728637200',
          type: 'interactive',
          interactive: {
            type: 'button_reply',
            button_reply: {
              id: 'btn_confirm_lesson',
              title: 'Confirm',
            },
          },
        },
        {
          schoolBot: {} as any,
          voiceParser: {} as any,
          client: null,
        },
      );

      expect(result.handled).toBe(true);
      expect(result.replyText).toContain('සාර්ථකව Gurudevi පද්ධතියේ සටහන් විය');
    });
  });
});
