import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

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
    const response = await POST(new NextRequest('https://gurudevi.app/auth/signout', { method: 'POST' }));

    expect(mocks.signOut).toHaveBeenCalledWith({ scope: 'local' });
    expect(response.status).toBe(204);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });

  it('fails closed when Supabase cannot end the session', async () => {
    mocks.signOut.mockResolvedValue({ error: new Error('unavailable') });

    const response = await POST(new NextRequest('https://gurudevi.app/auth/signout', { method: 'POST' }));

    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });
});
