import { describe, expect, it, vi } from 'vitest';
import { createVerifiedTelegramIngressRoutes } from '../core/routes/verifiedTelegramIngress';

const secrets = {
  TELEGRAM_WEBHOOK_SECRET: 'telegram-webhook-secret',
  TELEGRAM_IDENTITY_HASH_SECRET: 'telegram-identity-hash-secret',
};
const getEnv = (key: string) => secrets[key as keyof typeof secrets];

function update(chatType = 'private') {
  return JSON.stringify({
    update_id: 42,
    message: {
      message_id: 7,
      from: { id: 101 },
      chat: { id: 101, type: chatType },
      text: 'private input',
    },
  });
}

describe('verified Telegram ingress adapter', () => {
  it('requires Telegram’s configured secret header before durable acceptance', async () => {
    const persist = vi.fn();
    const routes = createVerifiedTelegramIngressRoutes({ getEnv, persist });

    const response = await routes.request('/webhooks/telegram-v2', {
      method: 'POST',
      body: update(),
    });

    expect(response.status).toBe(401);
    expect(persist).not.toHaveBeenCalled();
  });

  it('persists a minimal private envelope without raw actor or text', async () => {
    const persist = vi.fn().mockResolvedValue('accepted');
    const routes = createVerifiedTelegramIngressRoutes({
      getEnv,
      persist,
      now: () => new Date('2026-10-15T00:00:00.000Z'),
      correlationId: () => '123e4567-e89b-12d3-a456-426614174000',
    });
    const body = update();

    const response = await routes.request('/webhooks/telegram-v2', {
      method: 'POST',
      headers: { 'x-telegram-bot-api-secret-token': secrets.TELEGRAM_WEBHOOK_SECRET },
      body,
    });

    expect(response.status).toBe(200);
    expect(persist).toHaveBeenCalledWith(
      expect.objectContaining({
        providerEventId: '42',
        endpointKind: 'private',
        externalSubjectKey: expect.stringMatching(/^[a-f0-9]{64}$/),
      }),
    );
    expect(JSON.stringify(persist.mock.calls)).not.toContain('101');
    expect(JSON.stringify(persist.mock.calls)).not.toContain('private input');
  });

  it('preserves a group boundary in the ingress envelope', async () => {
    const persist = vi.fn().mockResolvedValue('accepted');
    const routes = createVerifiedTelegramIngressRoutes({ getEnv, persist });
    const body = update('supergroup');

    await routes.request('/webhooks/telegram-v2', {
      method: 'POST',
      headers: { 'x-telegram-bot-api-secret-token': secrets.TELEGRAM_WEBHOOK_SECRET },
      body,
    });

    expect(persist).toHaveBeenCalledWith(expect.objectContaining({ endpointKind: 'group' }));
  });

  it('returns a retryable failure when durable acceptance fails', async () => {
    const routes = createVerifiedTelegramIngressRoutes({
      getEnv,
      persist: vi.fn().mockRejectedValue(new Error('database unavailable')),
    });
    const response = await routes.request('/webhooks/telegram-v2', {
      method: 'POST',
      headers: { 'x-telegram-bot-api-secret-token': secrets.TELEGRAM_WEBHOOK_SECRET },
      body: update(),
    });
    expect(response.status).toBe(503);
  });

  it('confirms only a strict private link command after ingress is verified', async () => {
    const persist = vi.fn().mockResolvedValue('accepted');
    const confirmLink = vi.fn().mockResolvedValue(false);
    const routes = createVerifiedTelegramIngressRoutes({ getEnv, persist, confirmLink });
    const linkToken = 'a'.repeat(43);
    const body = update().replace('private input', `/link ${linkToken}`);

    await routes.request('/webhooks/telegram-v2', {
      method: 'POST',
      headers: { 'x-telegram-bot-api-secret-token': secrets.TELEGRAM_WEBHOOK_SECRET },
      body,
    });

    expect(confirmLink).toHaveBeenCalledWith({
      provider: 'telegram',
      externalSubjectKey: expect.stringMatching(/^[a-f0-9]{64}$/),
      linkToken,
    });
  });

  it('never confirms a link command from a group endpoint', async () => {
    const persist = vi.fn().mockResolvedValue('accepted');
    const confirmLink = vi.fn().mockResolvedValue(true);
    const routes = createVerifiedTelegramIngressRoutes({ getEnv, persist, confirmLink });
    const body = update('supergroup').replace('private input', `/link ${'a'.repeat(43)}`);

    const response = await routes.request('/webhooks/telegram-v2', {
      method: 'POST',
      headers: { 'x-telegram-bot-api-secret-token': secrets.TELEGRAM_WEBHOOK_SECRET },
      body,
    });

    expect(response.status).toBe(200);
    expect(confirmLink).not.toHaveBeenCalled();
  });
});
