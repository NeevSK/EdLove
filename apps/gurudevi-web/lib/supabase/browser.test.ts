import { afterEach, describe, expect, it, vi } from 'vitest';

const { createBrowserClient } = vi.hoisted(() => ({ createBrowserClient: vi.fn() }));
vi.mock('@supabase/ssr', () => ({ createBrowserClient }));

import { secureApiFetch } from '@repo/core/api/transportSecurity';
import { createBrowserSupabaseClient } from './browser';

describe('browser Supabase transport', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetAllMocks();
  });

  it('injects the shared guarded fetch into Supabase Auth requests', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://auth.example.test');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'public-key');

    createBrowserSupabaseClient();

    expect(createBrowserClient).toHaveBeenCalledWith(
      'https://auth.example.test',
      'public-key',
      { global: { fetch: secureApiFetch } },
    );
  });
});
