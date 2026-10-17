import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import { createSovereignClient, SOVEREIGN_API_URL, SOVEREIGN_ORPC_URL } from '../base';

describe('Sovereign API transport URLs', { tags: ['pure', 'fast'] }, () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('keeps Hono at the API origin and targets ORPC at its mounted prefix', async ({
    annotate,
  }) => {
    const origin = SOVEREIGN_API_URL.replace(/\/+$/, '');
    const calculatedOrpcUrl = origin.endsWith('/api') ? origin : `${origin}/api`;

    await annotate('Sovereign Transport Resolution', 'metadata', {
      contentType: 'application/json',
      body: JSON.stringify({ origin, calculatedOrpcUrl }),
    });

    expect(SOVEREIGN_ORPC_URL).toBe(calculatedOrpcUrl);
  });

  it('enforces strict static contracts using expectTypeOf (T16 capability)', () => {
    // Statically asserts type signatures without loose runtime any fallbacks
    expectTypeOf(SOVEREIGN_API_URL).toBeString();
    expectTypeOf(SOVEREIGN_ORPC_URL).toBeString();
    expectTypeOf(createSovereignClient).toBeFunction();
    expectTypeOf(createSovereignClient).parameter(0).toBeString();
  });

  it('does not default to localhost in production and fails when a client is used unconfigured', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('EXPO_PUBLIC_API_URL', '');
    vi.stubEnv('NEXT_PUBLIC_API_URL', '');
    vi.resetModules();

    const productionBase = await import('../base');
    expect(productionBase.SOVEREIGN_API_PUBLIC_URL).toBe('');
    expect(productionBase.SOVEREIGN_API_URL).toBe('');
    expect(productionBase.SOVEREIGN_ORPC_URL).toBe('');

    const client = productionBase.createSovereignClient('');
    await expect(client.unconfigured.$get()).rejects.toThrow();
  });
});
