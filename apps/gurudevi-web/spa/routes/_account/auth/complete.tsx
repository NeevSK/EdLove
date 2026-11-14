import { classifyAuthCallback } from '@repo/core/logic/auth/authCallbackPolicy';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { z } from 'zod';
import { safeReturnPath } from '../../../../app/(sanctuary)/auth/routeSafety';
import { createBrowserSupabaseClient } from '../../../../lib/supabase/browser';

/**
 * Where an email link lands: the one-time code becomes a session in this browser, then the person
 * continues to where the link meant to take them. Any failure sends them to sign in again.
 */
export const Route = createFileRoute('/_account/auth/complete')({
  validateSearch: z.object({
    code: z.string().optional(),
    error: z.string().optional(),
    next: z.string().optional(),
    returnTo: z.string().optional(),
  }),
  beforeLoad: async ({ search, location }) => {
    const returnTo = safeReturnPath(search.returnTo ?? null);
    const next = safeReturnPath(search.next ?? null);
    const retry = redirect({ to: '/sign-in', search: { returnTo, auth: 'retry' }, replace: true });

    const callback = classifyAuthCallback(
      new URL(location.href, window.location.origin).toString(),
    );
    const supabase = createBrowserSupabaseClient();
    if (callback.kind !== 'code' || !supabase) throw retry;

    const { error } = await supabase.auth.exchangeCodeForSession(callback.code);
    if (error) throw retry;

    const destination = new URL(next, window.location.origin);
    if (destination.pathname === '/reset-password')
      destination.searchParams.set('returnTo', returnTo);
    throw redirect({ href: `${destination.pathname}${destination.search}`, replace: true });
  },
});
