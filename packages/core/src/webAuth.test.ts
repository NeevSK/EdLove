import { afterEach, describe, expect, it, vi } from 'vitest';

const createClient = vi.hoisted(() => vi.fn());

vi.mock('@supabase/supabase-js', () => ({ createClient }));

import { createBrowserAuthRuntime } from './webAuth';

function createLocalStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

describe('createBrowserAuthRuntime', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it('registers persistent browser storage before creating the Supabase client', async () => {
    const localStorage = createLocalStorage();
    const client = { auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }) } };
    vi.stubGlobal('window', { localStorage });
    createClient.mockReturnValue(client);

    const runtime = createBrowserAuthRuntime({
      supabaseUrl: 'https://example.supabase.co',
      supabasePublishableKey: 'publishable-key',
    });
    const options = createClient.mock.calls[0]?.[2];

    await options.auth.storage.setItem('session', 'serialized-session');

    expect(localStorage.getItem('session')).toBe('serialized-session');
    expect(runtime.client).toBe(client);
    expect(options.auth).toMatchObject({
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    });
  });

  it('returns a signed-out bootstrap result without fabricating an identity', async () => {
    vi.stubGlobal('window', { localStorage: createLocalStorage() });
    createClient.mockReturnValue({
      auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }) },
    });

    const result = await createBrowserAuthRuntime({
      supabaseUrl: 'https://example.supabase.co',
      supabasePublishableKey: 'publishable-key',
    }).bootstrapIdentity();

    expect(result).toEqual({ status: 'signed-out', session: null, user: null });
  });

  it('converts a session read failure into an unavailable bootstrap result', async () => {
    vi.stubGlobal('window', { localStorage: createLocalStorage() });
    createClient.mockReturnValue({
      auth: { getSession: vi.fn().mockRejectedValue(new Error('storage unavailable')) },
    });

    const result = await createBrowserAuthRuntime({
      supabaseUrl: 'https://example.supabase.co',
      supabasePublishableKey: 'publishable-key',
    }).bootstrapIdentity();

    expect(result.status).toBe('unavailable');
    if (result.status === 'unavailable') expect(result.error.message).toBe('storage unavailable');
  });

  it('rejects server-side client creation before any Supabase client is created', () => {
    expect(() =>
      createBrowserAuthRuntime({
        supabaseUrl: 'https://example.supabase.co',
        supabasePublishableKey: 'publishable-key',
      }),
    ).toThrow('Browser auth runtime can only be created in a browser client boundary.');
    expect(createClient).not.toHaveBeenCalled();
  });
});
