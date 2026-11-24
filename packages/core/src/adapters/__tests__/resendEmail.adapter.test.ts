import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { ResendEmailAdapter } from '../resendEmail.adapter';
import { APIError } from '@repo/core/types/API';

describe('ResendEmailAdapter', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('throws an error if no API key is provided', async () => {
    const adapter = new ResendEmailAdapter({ apiKey: '' });
    await expect(
      adapter.sendEmail({
        to: 'user@example.com',
        subject: 'Hello',
        text: 'World',
      }),
    ).rejects.toThrow(APIError);
  });

  it('sends an email and passes authorization and idempotency headers', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'email_123' }),
    });
    global.fetch = mockFetch;

    const adapter = new ResendEmailAdapter({
      apiKey: 're_test_123',
      defaultFrom: 'Gurudevi <notifications@mail.gurudevi.lk>',
    });

    const res = await adapter.sendEmail({
      to: 'user@example.com',
      subject: 'Welcome',
      html: '<p>Welcome!</p>',
      idempotencyKey: 'idemp_key_1',
    });

    expect(res).toEqual({
      id: 'email_123',
      from: 'Gurudevi <notifications@mail.gurudevi.lk>',
      to: ['user@example.com'],
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.resend.com/emails',
      expect.objectContaining({
        method: 'POST',
        headers: {
          Authorization: 'Bearer re_test_123',
          'Content-Type': 'application/json',
          'Idempotency-Key': 'idemp_key_1',
        },
      }),
    );
  });

  it('sends a school invite with proper payload and category tags', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'invite_456' }),
    });
    global.fetch = mockFetch;

    const adapter = new ResendEmailAdapter({ apiKey: 're_test_123' });
    const res = await adapter.sendSchoolInvite({
      to: 'teacher@school.lk',
      inviterName: 'Principal Silva',
      schoolName: 'Horizon High',
      role: 'Head Teacher',
      inviteUrl: 'https://sanctuary.gurudevi.app/invite/123',
    });

    expect(res.id).toBe('invite_456');
    const calledBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(calledBody.subject).toContain('Principal Silva invited you');
    expect(calledBody.to).toEqual(['teacher@school.lk']);
    expect(calledBody.tags).toEqual([{ name: 'category', value: 'school_invite' }]);
  });

  it('sends a security alert with security domain sender', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'sec_789' }),
    });
    global.fetch = mockFetch;

    const adapter = new ResendEmailAdapter({ apiKey: 're_test_123' });
    const res = await adapter.sendSecurityAlert({
      to: 'user@example.com',
      userName: 'Naveen',
      alertType: 'new_device',
      details: 'A sign-in was detected from Chrome on Windows in Colombo, LK.',
      actionUrl: 'https://sanctuary.gurudevi.app/security',
    });

    expect(res.id).toBe('sec_789');
    const calledBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(calledBody.from).toBe('Gurudevi Security <verify@auth.gurudevi.lk>');
    expect(calledBody.subject).toBe('New Device Sign-In Detected');
  });
});
