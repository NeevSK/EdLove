import { writeFile } from 'node:fs/promises';
import { afterEach, describe, expect, it, vi } from 'vitest';
import './setup';
import '../core/app';

vi.mock('node:fs/promises', async (importOriginal) => {
  const original = await importOriginal<typeof import('node:fs/promises')>();
  return { ...original, writeFile: vi.fn().mockResolvedValue(undefined) };
});

async function loadApp(environment: string | undefined) {
  vi.resetModules();
  vi.stubEnv('NODE_ENV', environment);
  vi.stubEnv('SUPABASE_JWT_ISSUER', 'https://identity.example.test');
  vi.stubEnv('SUPABASE_JWT_AUDIENCE', 'authenticated');
  vi.stubEnv('SUPABASE_URL', 'https://identity.example.test');
  vi.stubEnv('SUPABASE_ANON_KEY', 'synthetic-provider-key');
  vi.stubEnv('EXPO_PUBLIC_SUPABASE_URL', 'https://identity.example.test');
  vi.stubEnv('RATE_LIMIT_STORE', 'postgres');
  vi.stubEnv('RATE_LIMIT_TRUSTED_PROXY_HEADER', 'x-forwarded-for');
  await import('./setup');
  return (await import('../core/app')).app;
}

describe('development diagnostics ingress', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it.each(['production', 'test', undefined])(
    'does not register diagnostics in %s',
    async (environment) => {
      const app = await loadApp(environment);
      const response = await app.request('https://sanctuary.test/dev/diagnostics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'synthetic-report' }),
      });
      expect(response.status).toBe(404);
      expect(writeFile).not.toHaveBeenCalled();
    },
  );

  it('preserves development ingestion and scratch-file output', async () => {
    const app = await loadApp('development');
    const report = { message: 'synthetic-development-report' };
    const response = await app.request('/dev/diagnostics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report),
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, received: true });
    expect(writeFile).toHaveBeenCalledWith(
      'c:/x/apps/gurudevi-mobile/scratch/latest_mobile_errors.json',
      JSON.stringify(report, null, 2),
      'utf-8',
    );
  });

  it('retains development malformed-body behavior without writing a report', async () => {
    const app = await loadApp('development');
    const response = await app.request('/dev/diagnostics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{',
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, received: false });
    expect(writeFile).not.toHaveBeenCalled();
  });
});
