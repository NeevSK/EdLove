import { afterEach, describe, expect, it, vi } from 'vitest';
import { supabaseConfig } from './config';

describe('Supabase transport configuration', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('rejects a public HTTP auth origin without falling back to another URL', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://auth.example.test');
    vi.stubEnv('EXPO_PUBLIC_SUPABASE_URL', 'https://fallback.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'public-key');

    expect(supabaseConfig()).toBeNull();
  });
});
