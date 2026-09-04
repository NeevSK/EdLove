import { describe, expect, expectTypeOf, it } from 'vitest';
import { createSovereignClient, SOVEREIGN_API_URL, SOVEREIGN_ORPC_URL } from '../base';

describe('Sovereign API transport URLs', { tags: ['pure', 'fast'] }, () => {
  it('keeps Hono at the API origin and targets ORPC at its mounted prefix', async ({ annotate }) => {
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
});
