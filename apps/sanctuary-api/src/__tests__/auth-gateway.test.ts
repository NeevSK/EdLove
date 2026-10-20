import { describe, expect, it } from 'vitest';
import { app } from '../core/app';

describe('Sovereign Auth Gateway Routes', () => {
  it('validates sign-in payloads strictly with 400 on malformed input', async () => {
    const res = await app.request('/api/auth/sign-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email', password: '123' }),
    });

    expect(res.status).toBe(400);
    expect(res.headers.get('cache-control')).toContain('no-store');
  });

  it('handles sign-in gracefully in test environment', async () => {
    const res = await app.request('/api/auth/sign-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'teacher@ananda.edu.lk', password: 'password123' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.session).toBeDefined();
    expect(body.session.access_token).toBeDefined();
    expect(res.headers.get('cache-control')).toContain('no-store');
  });

  it('validates OTP magic link request payload', async () => {
    const res = await app.request('/api/auth/otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@visakha.edu.lk' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  it('handles token refresh in test mode', async () => {
    const res = await app.request('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: 'valid-refresh-token' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.session.access_token).toBe('test-refreshed-token');
  });

  it('handles sign-out cleanly', async () => {
    const res = await app.request('/api/auth/sign-out', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer 123e4567-e89b-12d3-a456-426614174000',
      },
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });
});
