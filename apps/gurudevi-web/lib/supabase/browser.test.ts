import { afterEach, describe, expect, it, vi } from 'vitest';

const { createBrowserClient, registerTokenResolver } = vi.hoisted(() => ({
  createBrowserClient: vi.fn(),
  registerTokenResolver: vi.fn(),
}));
vi.mock('@supabase/ssr', () => ({ createBrowserClient }));
vi.mock('@repo/core/api/clientRuntime', () => ({ registerTokenResolver }));

import { secureApiFetch } from '@repo/core/api/transportSecurity';
import { createBrowserSupabaseClient } from './browser';

describe('browser Supabase transport', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetAllMocks();
  });

  it('registers a resolver that reads the current browser session instead of capturing a login', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://auth.example.test');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'public-key');
    const session = vi
      .fn()
      .mockResolvedValueOnce({ data: { session: { access_token: 'token-a' } }, error: null })
      .mockResolvedValueOnce({ data: { session: { access_token: 'token-b' } }, error: null });
    createBrowserClient.mockReturnValue({ auth: { getSession: session } });
    createBrowserSupabaseClient();
    const resolver = registerTokenResolver.mock.calls[0]?.[0];
    expect(typeof resolver).toBe('function');
    await expect(resolver()).resolves.toBe('token-a');
    await expect(resolver()).resolves.toBe('token-b');
  });

  it('injects the shared guarded fetch into Supabase Auth requests', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://auth.example.test');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'public-key');

    createBrowserSupabaseClient();

    expect(createBrowserClient).toHaveBeenCalledWith('https://auth.example.test', 'public-key', {
      global: { fetch: secureApiFetch },
    });
  });
});
