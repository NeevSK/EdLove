import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ getUser: vi.fn(), rpc: vi.fn(), createServerClient: vi.fn() }));

vi.mock('@supabase/ssr', () => ({ createServerClient: mocks.createServerClient }));

import { DELETE, GET, POST } from './route';

describe('account deletion route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'publishable-key';
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
    mocks.rpc.mockResolvedValue({
      data: {
        status: 'pending_verification',
        request_id: 'request-1',
        requested_at: '2026-09-21T00:00:00Z',
        reason: 'account_deletion_requested',
      },
      error: null,
    });
    mocks.createServerClient.mockReturnValue({ auth: { getUser: mocks.getUser }, rpc: mocks.rpc });
  });

  it('reads deletion status only for an authenticated server session', async () => {
    const response = await GET(new NextRequest('https://sanctuary.gurudevi.app/auth/deletion'));

    expect(mocks.rpc).toHaveBeenCalledWith('get_account_deletion_request_status');
    expect(await response.json()).toMatchObject({ status: 'pending_verification' });
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });

  it('submits and cancels the server-authoritative request through the existing RPCs', async () => {
    await POST(new NextRequest('https://sanctuary.gurudevi.app/auth/deletion', { method: 'POST' }));
    await DELETE(
      new NextRequest('https://sanctuary.gurudevi.app/auth/deletion', { method: 'DELETE' }),
    );

    expect(mocks.rpc).toHaveBeenNthCalledWith(1, 'request_account_deletion');
    expect(mocks.rpc).toHaveBeenNthCalledWith(2, 'cancel_account_deletion_request');
  });

  it('does not expose deletion operations without an authenticated session', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });

    const response = await POST(
      new NextRequest('https://sanctuary.gurudevi.app/auth/deletion', { method: 'POST' }),
    );

    expect(response.status).toBe(401);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
});
