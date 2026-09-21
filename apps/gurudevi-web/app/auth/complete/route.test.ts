import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

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
      new NextRequest('https://gurudevi.app/auth/complete?code=one-time-code&next=%2Fself'),
    );

    expect(mocks.exchangeCodeForSession).toHaveBeenCalledWith('one-time-code');
    expect(response.headers.get('location')).toBe('https://gurudevi.app/self');
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });

  it('rejects malformed callbacks without calling Supabase', async () => {
    const response = await GET(
      new NextRequest('https://gurudevi.app/auth/complete?access_token=exposed-token'),
    );

    expect(mocks.exchangeCodeForSession).not.toHaveBeenCalled();
    expect(response.headers.get('location')).toContain('/sign-in?returnTo=%2Fself&auth=retry');
  });

  it('returns a neutral retry route when the server exchange fails', async () => {
    mocks.exchangeCodeForSession.mockResolvedValue({ error: new Error('expired') });

    const response = await GET(
      new NextRequest('https://gurudevi.app/auth/complete?code=expired-code&returnTo=%2Fworkspace'),
    );

    expect(response.headers.get('location')).toContain('/sign-in?returnTo=%2Fworkspace&auth=retry');
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });
});
