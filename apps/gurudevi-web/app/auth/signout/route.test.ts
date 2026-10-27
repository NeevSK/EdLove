import { secureApiFetch } from '@repo/core/api/transportSecurity';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ signOut: vi.fn(), createServerClient: vi.fn() }));

vi.mock('@supabase/ssr', () => ({ createServerClient: mocks.createServerClient }));

import { POST } from './route';

describe('POST /auth/signout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'publishable-key';
    mocks.signOut.mockResolvedValue({ error: null });
    mocks.createServerClient.mockReturnValue({ auth: { signOut: mocks.signOut } });
  });

  it('ends the server cookie session without caching the response', async () => {
    const response = await POST(
      new NextRequest('https://sanctuary.gurudevi.app/auth/signout', { method: 'POST' }),
    );

    expect(mocks.signOut).toHaveBeenCalledWith({ scope: 'local' });
    expect(mocks.createServerClient.mock.calls[0]?.[2]).toMatchObject({
      global: { fetch: secureApiFetch },
    });
    expect(response.status).toBe(204);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });

  it('fails closed when Supabase cannot end the session', async () => {
    mocks.signOut.mockResolvedValue({ error: new Error('unavailable') });

    const response = await POST(
      new NextRequest('https://sanctuary.gurudevi.app/auth/signout', { method: 'POST' }),
    );

    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });
  it('preserves cookie clearing even when remote logout reports failure', async () => {
    mocks.signOut.mockImplementation(async () => {
      mocks.createServerClient.mock.calls[0]?.[2].cookies.setAll([
        { name: 'sb-fixture-auth-token', value: '', options: { path: '/', maxAge: 0 } },
        { name: 'sb-fixture-auth-token.1', value: '', options: { path: '/', maxAge: 0 } },
      ]);
      return { error: new Error('Remote outage after local removal') };
    });
    const response = await POST(
      new NextRequest('https://sanctuary.gurudevi.app/auth/signout', { method: 'POST' }),
    );
    expect(response.status).toBe(503);
    expect(response.headers.get('set-cookie')).toContain('sb-fixture-auth-token=');
    expect(response.headers.get('set-cookie')).toContain('sb-fixture-auth-token.1=');
    expect(response.headers.get('set-cookie')).toContain('Max-Age=0');
  });
  it('does not claim cleanup without provider configuration', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = '';
    const response = await POST(
      new NextRequest('https://sanctuary.gurudevi.app/auth/signout', { method: 'POST' }),
    );
    expect(response.status).toBe(503);
    expect(mocks.createServerClient).not.toHaveBeenCalled();
  });
});
