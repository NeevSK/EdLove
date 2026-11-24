export type EmailOtpType =
  | 'signup'
  | 'invite'
  | 'magiclink'
  | 'recovery'
  | 'email_change'
  | 'email';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { z } from 'zod';
import { safeReturnPath } from '../../../../app/(sanctuary)/auth/routeSafety';
import { createBrowserSupabaseClient } from '../../../../lib/supabase/browser';

const VALID_OTP_TYPES: readonly EmailOtpType[] = [
  'signup',
  'invite',
  'magiclink',
  'recovery',
  'email_change',
  'email',
];

/**
 * Handles confirmation and OTP token-hash landing URLs from Supabase Auth emails.
 * Supports magic links, user signup confirmation, password recovery, and email changes.
 */
export const Route = createFileRoute('/_account/auth/confirm')({
  head: () => ({ meta: [{ title: 'Verifying your account' }] }),
  validateSearch: z.object({
    token_hash: z.string().optional(),
    type: z.string().optional(),
    next: z.string().optional(),
    returnTo: z.string().optional(),
    error: z.string().optional(),
    error_description: z.string().optional(),
  }),
  beforeLoad: async ({ search }) => {
    const returnTo = safeReturnPath(search.returnTo ?? null);
    const next = safeReturnPath(search.next ?? null);
    const retry = redirect({
      to: '/sign-in',
      search: { returnTo, auth: 'retry' },
      replace: true,
    });

    if (search.error || !search.token_hash || !search.type) {
      throw retry;
    }

    const otpType = search.type as EmailOtpType;
    if (!VALID_OTP_TYPES.includes(otpType)) {
      throw retry;
    }

    const supabase = createBrowserSupabaseClient();
    if (!supabase) throw retry;

    const { error } = await supabase.auth.verifyOtp({
      token_hash: search.token_hash,
      type: otpType,
    });

    if (error) throw retry;

    if (otpType === 'recovery') {
      throw redirect({
        to: '/reset-password',
        search: { returnTo },
        replace: true,
      });
    }

    const destination = new URL(next, window.location.origin);
    throw redirect({
      href: `${destination.pathname}${destination.search}`,
      replace: true,
    });
  },
});
