import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

const { createServerClient, getClaims } = vi.hoisted(() => ({
  createServerClient: vi.fn(),
  getClaims: vi.fn(),
}));
vi.mock('@supabase/ssr', () => ({ createServerClient }));

import { secureApiFetch } from '@repo/core/api/transportSecurity';
import { refreshSupabaseSession } from './proxy';

describe('Supabase proxy transport', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetAllMocks();
  });

  it('injects guarded fetch without changing cookie refresh behavior', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://auth.example.test');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'public-key');
    getClaims.mockResolvedValue({ data: { claims: { sub: 'subject-1' } }, error: null });
    createServerClient.mockReturnValue({ auth: { getClaims } });

    const response = await refreshSupabaseSession(
      new NextRequest('https://sanctuary.gurudevi.app/self'),
    );

    expect(createServerClient.mock.calls[0]?.[2]).toMatchObject({
      global: { fetch: secureApiFetch },
    });
    expect(getClaims).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
  });
});
