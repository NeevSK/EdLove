import './setup';
import { describe, expect, it } from 'vitest';
import { app } from '../core/app';

describe('channel ingress route registration', () => {
  it('exposes both v2 provider paths but fails closed without production secrets', async () => {
    const [whatsapp, telegram] = await Promise.all([
      app.request('/webhooks/whatsapp-v2', { method: 'POST', body: '{}' }),
      app.request('/webhooks/telegram-v2', { method: 'POST', body: '{}' }),
    ]);

    expect(whatsapp.status).toBe(503);
    expect(telegram.status).toBe(503);
  });
});
