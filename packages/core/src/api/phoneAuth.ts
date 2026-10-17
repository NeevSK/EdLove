import type {
  AuthSession,
  AuthUser,
  PhoneOtpRequest,
  PhoneOtpVerification,
} from '@repo/core/logic/ports/auth.port';
import { APIError } from '@repo/core/types/API';
import type { SupabaseClient } from '@supabase/supabase-js';

type PhoneAuthClient = Pick<SupabaseClient['auth'], 'signInWithOtp' | 'verifyOtp'>;

export async function requestPhoneOtp(
  auth: PhoneAuthClient,
  params: PhoneOtpRequest,
): Promise<void> {
  validatePhone(params.phone);

  let result: Awaited<ReturnType<PhoneAuthClient['signInWithOtp']>>;
  try {
    result = await auth.signInWithOtp({
      phone: params.phone,
      options: {
        channel: 'sms',
        shouldCreateUser: params.shouldCreateUser ?? false,
        ...(params.captchaToken ? { captchaToken: params.captchaToken } : {}),
      },
    });
  } catch {
    throw phoneAuthError('AUTH_PHONE_OTP_REQUEST_FAILED');
  }
  if (result.error) throw phoneAuthError('AUTH_PHONE_OTP_REQUEST_FAILED');
}

export async function verifyPhoneOtp(
  auth: PhoneAuthClient,
  params: PhoneOtpVerification,
): Promise<{ user: AuthUser; session: AuthSession }> {
  validatePhone(params.phone);
  if (!/^\d{6,10}$/.test(params.token)) {
    throw phoneAuthError('AUTH_PHONE_OTP_INVALID_TOKEN');
  }

  let result: Awaited<ReturnType<PhoneAuthClient['verifyOtp']>>;
  try {
    result = await auth.verifyOtp({
      phone: params.phone,
      token: params.token,
      type: 'sms',
    });
  } catch {
    throw phoneAuthError('AUTH_PHONE_OTP_VERIFICATION_FAILED');
  }
  if (result.error || !result.data.session || !result.data.user) {
    throw phoneAuthError('AUTH_PHONE_OTP_VERIFICATION_FAILED');
  }
  return { user: result.data.user, session: result.data.session };
}

function validatePhone(phone: string): void {
  if (!/^\+[1-9]\d{1,14}$/.test(phone)) {
    throw phoneAuthError('AUTH_PHONE_INVALID');
  }
}

function phoneAuthError(code: string): APIError {
  return new APIError(
    'Phone sign-in could not be completed. Check the details and try again.',
    code,
  );
}
