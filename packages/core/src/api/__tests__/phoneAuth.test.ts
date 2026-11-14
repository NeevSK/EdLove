import { AuthError, type Session, type SupabaseClient, type User } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';
import { requestPhoneOtp, verifyPhoneOtp } from '../phoneAuth';

function createAuth() {
  return {
    signInWithOtp: vi.fn<SupabaseClient['auth']['signInWithOtp']>(),
    verifyOtp: vi.fn<SupabaseClient['auth']['verifyOtp']>(),
  } satisfies Pick<SupabaseClient['auth'], 'signInWithOtp' | 'verifyOtp'>;
}

describe('phone OTP boundary', () => {
  it('requests SMS with account creation disabled by default', async () => {
    const auth = createAuth();
    auth.signInWithOtp.mockResolvedValue({ data: { user: null, session: null }, error: null });

    await expect(requestPhoneOtp(auth, { phone: '+94771234567' })).resolves.toBeUndefined();

    expect(auth.signInWithOtp).toHaveBeenCalledWith({
      phone: '+94771234567',
      options: { channel: 'sms', shouldCreateUser: false },
    });
  });

  it('forwards explicit signup intent and CAPTCHA proof', async () => {
    const auth = createAuth();
    auth.signInWithOtp.mockResolvedValue({ data: { user: null, session: null }, error: null });

    await requestPhoneOtp(auth, {
      phone: '+94771234567',
      shouldCreateUser: true,
      captchaToken: 'captcha-proof',
    });

    expect(auth.signInWithOtp).toHaveBeenCalledWith({
      phone: '+94771234567',
      options: { channel: 'sms', shouldCreateUser: true, captchaToken: 'captcha-proof' },
    });
  });

  it('rejects malformed phones before calling Auth', async () => {
    const auth = createAuth();

    await expect(requestPhoneOtp(auth, { phone: '0771234567' })).rejects.toMatchObject({
      code: 'AUTH_PHONE_INVALID',
    });
    expect(auth.signInWithOtp).not.toHaveBeenCalled();
  });

  it('sanitizes returned provider errors and thrown network failures', async () => {
    const auth = createAuth();
    const sensitiveError = new AuthError(
      'provider includes +94771234567 and secret',
      400,
      'denied',
    );
    auth.signInWithOtp.mockResolvedValue({
      data: { user: null, session: null },
      error: sensitiveError,
    });

    await expect(requestPhoneOtp(auth, { phone: '+94771234567' })).rejects.toMatchObject({
      code: 'AUTH_PHONE_OTP_REQUEST_FAILED',
      cause: undefined,
    });

    auth.signInWithOtp.mockRejectedValue(sensitiveError);
    const thrown = await requestPhoneOtp(auth, { phone: '+94771234567' }).catch(
      (error: unknown) => error,
    );
    expect(thrown).toMatchObject({ code: 'AUTH_PHONE_OTP_REQUEST_FAILED', cause: undefined });
    expect(thrown).toMatchObject({
      message: 'Phone sign-in could not be completed. Check the details and try again.',
    });
  });

  it('returns only a verified user and session', async () => {
    const auth = createAuth();
    const user = {
      id: 'provider-user',
      phone: '+94771234567',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: '2026-10-15T00:00:00.000Z',
    } satisfies User;
    const session = {
      access_token: 'access',
      refresh_token: 'refresh',
      expires_in: 3600,
      token_type: 'bearer',
      user,
    } satisfies Session;
    auth.verifyOtp.mockResolvedValue({ data: { user, session }, error: null });

    await expect(verifyPhoneOtp(auth, { phone: '+94771234567', token: '123456' })).resolves.toEqual(
      {
        user,
        session,
      },
    );
    expect(auth.verifyOtp).toHaveBeenCalledWith({
      phone: '+94771234567',
      token: '123456',
      type: 'sms',
    });
  });

  it('rejects missing sessions and invalid token shape', async () => {
    const auth = createAuth();
    auth.verifyOtp.mockResolvedValue({ data: { user: null, session: null }, error: null });

    await expect(
      verifyPhoneOtp(auth, { phone: '+94771234567', token: '123456' }),
    ).rejects.toMatchObject({
      code: 'AUTH_PHONE_OTP_VERIFICATION_FAILED',
      cause: undefined,
    });
    await expect(
      verifyPhoneOtp(auth, { phone: '+94771234567', token: '12345' }),
    ).rejects.toMatchObject({
      code: 'AUTH_PHONE_OTP_INVALID_TOKEN',
    });
    expect(auth.verifyOtp).toHaveBeenCalledTimes(1);
  });
});
