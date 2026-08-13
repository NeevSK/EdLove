import { describe, expect, it } from 'vitest';
import { app } from '../core/app.js';

describe('Sanctuary API health contract', () => {
  it('returns liveness without requiring external dependencies', async () => {
    const response = await app.request('/health/live');

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      status: 'ok',
      service: 'sanctuary-api',
    });
  });

  it('fails readiness when database configuration is unavailable', async () => {
    const previous = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;

    try {
      const response = await app.request('/health/ready');

      expect(response.status).toBe(503);
      await expect(response.json()).resolves.toEqual({
        status: 'not_ready',
        reason: 'database_configuration_missing',
      });
    } finally {
      if (previous === undefined) delete process.env.DATABASE_URL;
      else process.env.DATABASE_URL = previous;
    }
  });
});
