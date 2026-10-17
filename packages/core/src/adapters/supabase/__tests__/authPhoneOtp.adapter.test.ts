import { beforeEach, describe, expect, it, vi } from 'vitest';

const authMocks = vi.hoisted(() => ({
  signInWithOtp: vi.fn(),
  verifyOtp: vi.fn(),
}));

vi.mock('@repo/core/adapters/supabaseClient', () => ({
  supabaseClient: { auth: authMocks },
}));

import { SupabaseAuthAdapter } from '../auth.adapter';

describe('SupabaseAuthAdapter phone OTP forwarding', () => {
  beforeEach(() => vi.clearAllMocks());

  it('forwards request and SMS verification to the shared boundary', async () => {
    const adapter = new SupabaseAuthAdapter();
    authMocks.signInWithOtp.mockResolvedValue({ data: { user: null, session: null }, error: null });
    const user = {
      id: 'provider-subject',
      phone: '+94771234567',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: '2026-10-15T00:00:00.000Z',
    };
    const session = {
      access_token: 'access',
      refresh_token: 'refresh',
      expires_in: 3600,
      token_type: 'bearer',
      user,
    };
    authMocks.verifyOtp.mockResolvedValue({ data: { user, session }, error: null });

    await expect(adapter.signInWithPhoneOtp({ phone: '+94771234567' })).resolves.toBeUndefined();
    await expect(
      adapter.verifyPhoneOtp({ phone: '+94771234567', token: '123456' }),
    ).resolves.toEqual({ user, session });
    expect(authMocks.signInWithOtp).toHaveBeenCalledWith({
      phone: '+94771234567',
      options: { channel: 'sms', shouldCreateUser: false },
    });
    expect(authMocks.verifyOtp).toHaveBeenCalledWith({
      phone: '+94771234567',
      token: '123456',
      type: 'sms',
    });
  });
});
