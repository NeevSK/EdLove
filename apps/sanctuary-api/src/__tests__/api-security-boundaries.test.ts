import { describe, expect, it } from 'vitest';
import { app } from '../core/app';

describe('Sanctuary API security boundaries', () => {
  it.each([
    ['/api/durable-agents/student-support', 'POST'],
    ['/api/durable-agents/teacher-summary', 'POST'],
    ['/api/durable-agents/runs', 'GET'],
  ])('rejects unauthenticated durable-agent access: %s', async (path, method) => {
    const response = await app.request(path, {
      method,
      body: method === 'POST' ? '{}' : undefined,
    });

    expect([401, 403]).toContain(response.status);
    const text = await response.text();
    expect(text).not.toMatch(/stack|sql|database|secret/i);
  });

  it('rejects malformed bearer credentials without exposing verification details', async () => {
    const response = await app.request('/api/durable-agents/runs', {
      headers: { Authorization: 'Bearer definitely-not-a-jwt' },
    });

    expect(response.status).toBe(401);
    const text = await response.text();
    expect(text).not.toMatch(/definitely-not-a-jwt|invalid token format|signature|stack/i);
  });

  it('keeps liveness independent from authentication and database availability', async () => {
    const response = await app.request('/health/live');

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ status: 'ok' });
  });
});
