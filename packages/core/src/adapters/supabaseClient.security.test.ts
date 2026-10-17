import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type SupabaseClientOptions = {
  global: {
    fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  };
};

const createClientMock = vi.hoisted(() =>
  vi.fn((_url: string, _key: string, _options: SupabaseClientOptions) => ({})),
);

vi.mock('@repo/core/lib/authStorage', () => ({ supabaseAuthStorage: {} }));
vi.mock('@supabase/supabase-js', () => ({ createClient: createClientMock }));

describe('Supabase API transport security', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('EXPO_PUBLIC_SUPABASE_URL', 'https://project.example.test');
    vi.stubEnv('SUPABASE_URL', '');
    vi.stubEnv('EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'test-publishable-key');
    vi.stubEnv('SUPABASE_ANON_KEY', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('rejects an insecure configured URL before creating the auth client', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('EXPO_PUBLIC_SUPABASE_URL', 'http://supabase.example.test');

    await expect(import('./supabaseClient')).rejects.toThrow(/HTTPS/);
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it('fails closed on missing production credentials instead of using a mock project', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('EXPO_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY', '');

    await expect(import('./supabaseClient')).rejects.toThrow(/Missing Supabase credentials/);
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it('uses the shared redirect-safe fetch for Supabase requests', async () => {
    await import('./supabaseClient');
    const options = createClientMock.mock.calls[0]?.[2];
    expect(options).toBeDefined();
    const networkFetch = vi.fn(
      async (_input: RequestInfo | URL, _init?: RequestInit) => new Response('{}'),
    );
    vi.stubGlobal('fetch', networkFetch);

    await options?.global.fetch('https://project.example.test/rest/v1/items', {
      redirect: 'follow',
    });

    expect(networkFetch.mock.calls[0]?.[1]?.redirect).toBe('error');
  });
});
