import { secureApiFetch } from '@repo/core/api/transportSecurity';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  exchangeCodeForSession: vi.fn(),
  createServerClient: vi.fn(),
}));

vi.mock('@supabase/ssr', () => ({ createServerClient: mocks.createServerClient }));

import { GET } from './route';

describe('GET /auth/complete', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'publishable-key';
    mocks.exchangeCodeForSession.mockResolvedValue({ error: null });
    mocks.createServerClient.mockReturnValue({
      auth: { exchangeCodeForSession: mocks.exchangeCodeForSession },
    });
  });

  it('exchanges only a code callback on the server and redirects without caching', async () => {
    const response = await GET(
      new NextRequest(
        'https://sanctuary.gurudevi.app/auth/complete?code=one-time-code&next=%2Fself',
      ),
    );

    expect(mocks.exchangeCodeForSession).toHaveBeenCalledWith('one-time-code');
    expect(mocks.createServerClient.mock.calls[0]?.[2]).toMatchObject({
      global: { fetch: secureApiFetch },
    });
    expect(response.headers.get('location')).toBe('https://sanctuary.gurudevi.app/self');
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });

  it('preserves a validated post-recovery destination through the reset page', async () => {
    const response = await GET(
      new NextRequest(
        'https://sanctuary.gurudevi.app/auth/complete?code=recovery-code&next=%2Freset-password&returnTo=%2Fprofile',
      ),
    );
    expect(response.headers.get('location')).toBe(
      'https://sanctuary.gurudevi.app/reset-password?returnTo=%2Fprofile',
    );
    const external = await GET(
      new NextRequest(
        'https://sanctuary.gurudevi.app/auth/complete?code=recovery-code&next=%2Freset-password&returnTo=https%3A%2F%2Fattacker.example',
      ),
    );
    expect(external.headers.get('location')).toBe(
      'https://sanctuary.gurudevi.app/reset-password?returnTo=%2Fself',
    );
  });
  it('rejects malformed callbacks without calling Supabase', async () => {
    const response = await GET(
      new NextRequest('https://sanctuary.gurudevi.app/auth/complete?access_token=exposed-token'),
    );

    expect(mocks.exchangeCodeForSession).not.toHaveBeenCalled();
    expect(response.headers.get('location')).toContain('/sign-in?returnTo=%2Fself&auth=retry');
  });

  it('returns a neutral retry route when the server exchange fails', async () => {
    mocks.exchangeCodeForSession.mockResolvedValue({ error: new Error('expired') });

    const response = await GET(
      new NextRequest(
        'https://sanctuary.gurudevi.app/auth/complete?code=expired-code&returnTo=%2Fworkspace',
      ),
    );

    expect(response.headers.get('location')).toContain('/sign-in?returnTo=%2Fworkspace&auth=retry');
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });
});
