import crypto from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import { createVerifiedWhatsappIngressRoutes } from '../core/routes/verifiedWhatsappIngress';

const secrets = {
  WHATSAPP_VERIFY_TOKEN: 'verify-token',
  WHATSAPP_APP_SECRET: 'app-secret',
  WHATSAPP_IDENTITY_HASH_SECRET: 'identity-hash-secret',
};

const getEnv = (key: string) => secrets[key as keyof typeof secrets];

function signedBody(body: string) {
  return `sha256=${crypto.createHmac('sha256', secrets.WHATSAPP_APP_SECRET).update(body).digest('hex')}`;
}

function requestBody() {
  return JSON.stringify({
    object: 'whatsapp_business_account',
    entry: [
      {
        changes: [
          {
            value: {
              messages: [
                {
                  from: '94771234567',
                  id: 'wamid.example',
                  type: 'text',
                  text: { body: 'private' },
                },
              ],
            },
          },
        ],
      },
    ],
  });
}

describe('verified WhatsApp ingress adapter', () => {
  it('persists a verified minimal envelope and never passes message content or raw sender data', async () => {
    const persist = vi.fn().mockResolvedValue('accepted');
    const routes = createVerifiedWhatsappIngressRoutes({
      getEnv,
      persist,
      now: () => new Date('2026-10-15T00:00:00.000Z'),
      correlationId: () => '123e4567-e89b-12d3-a456-426614174000',
    });
    const body = requestBody();

    const response = await routes.request('/webhooks/whatsapp-v2', {
      method: 'POST',
      headers: { 'x-hub-signature-256': signedBody(body) },
      body,
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'accepted' });
    expect(persist).toHaveBeenCalledWith(
      expect.objectContaining({
        providerEventId: 'wamid.example',
        externalSubjectKey: expect.stringMatching(/^[a-f0-9]{64}$/),
        payloadFingerprint: expect.stringMatching(/^[a-f0-9]{64}$/),
      }),
    );
    expect(JSON.stringify(persist.mock.calls)).not.toContain('94771234567');
    expect(JSON.stringify(persist.mock.calls)).not.toContain('private');
  });

  it.each([
    ['missing provider signature', {}, 401],
    ['oversized body', { 'content-length': '262145' }, 413],
  ])('rejects %s before persistence', async (_label, headers, expectedStatus) => {
    const persist = vi.fn();
    const routes = createVerifiedWhatsappIngressRoutes({ getEnv, persist });
    const body = requestBody();
    const response = await routes.request('/webhooks/whatsapp-v2', {
      method: 'POST',
      headers,
      body,
    });
    expect(response.status).toBe(expectedStatus);
    expect(persist).not.toHaveBeenCalled();
  });

  it('fails closed when durable acceptance is unavailable', async () => {
    const routes = createVerifiedWhatsappIngressRoutes({
      getEnv,
      persist: vi.fn().mockRejectedValue(new Error('database unavailable')),
    });
    const body = requestBody();
    const response = await routes.request('/webhooks/whatsapp-v2', {
      method: 'POST',
      headers: { 'x-hub-signature-256': signedBody(body) },
      body,
    });
    expect(response.status).toBe(503);
  });

  it('passes only a verified identity fingerprint and strict link token to the ceremony confirmer', async () => {
    const persist = vi.fn().mockResolvedValue('accepted');
    const confirmLink = vi.fn().mockResolvedValue(false);
    const routes = createVerifiedWhatsappIngressRoutes({ getEnv, persist, confirmLink });
    const linkToken = 'a'.repeat(43);
    const body = requestBody().replace('private', `/link ${linkToken}`);

    await routes.request('/webhooks/whatsapp-v2', {
      method: 'POST',
      headers: { 'x-hub-signature-256': signedBody(body) },
      body,
    });

    expect(confirmLink).toHaveBeenCalledWith({
      provider: 'whatsapp',
      externalSubjectKey: expect.stringMatching(/^[a-f0-9]{64}$/),
      linkToken,
    });
  });

  it('requires configured handshake and identity secrets', async () => {
    const missingIdentitySecret = createVerifiedWhatsappIngressRoutes({
      getEnv: (key) => (key === 'WHATSAPP_IDENTITY_HASH_SECRET' ? undefined : getEnv(key)),
    });
    const body = requestBody();
    await expect(
      missingIdentitySecret.request('/webhooks/whatsapp-v2', {
        method: 'POST',
        headers: { 'x-hub-signature-256': signedBody(body) },
        body,
      }),
    ).resolves.toMatchObject({ status: 503 });
    expect(
      missingIdentitySecret.request(
        '/webhooks/whatsapp-v2?hub.mode=subscribe&hub.verify_token=verify-token&hub.challenge=ok',
      ),
    ).toMatchObject({ status: 200 });
  });
});
