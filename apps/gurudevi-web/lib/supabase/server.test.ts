import { afterEach, describe, expect, it, vi } from 'vitest';

const { createServerClient, cookies } = vi.hoisted(() => ({
  createServerClient: vi.fn(),
  cookies: vi.fn(),
}));
vi.mock('@supabase/ssr', () => ({ createServerClient }));
vi.mock('next/headers', () => ({ cookies }));

import { secureApiFetch } from '@repo/core/api/transportSecurity';
import { createServerSupabaseClient } from './server';

describe('server Supabase transport', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetAllMocks();
  });

  it('injects the shared guarded fetch and preserves cookie adapters', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://auth.example.test');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'public-key');
    const cookieStore = { getAll: vi.fn(() => []), set: vi.fn() };
    cookies.mockResolvedValue(cookieStore);

    await createServerSupabaseClient();

    const options = createServerClient.mock.calls[0]?.[2];
    expect(options).toMatchObject({ global: { fetch: secureApiFetch } });
    expect(options?.cookies.getAll()).toEqual([]);
    expect(options?.cookies.setAll([])).toBeUndefined();
  });
});
