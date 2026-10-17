import { classifyAuthCallback } from '@repo/core/logic/auth/authCallbackPolicy';
import { secureApiFetch } from '@repo/core/api/transportSecurity';
import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { supabaseConfig } from '../../../lib/supabase/config';
import { safeReturnPath } from '../../(sanctuary)/auth/routeSafety';

function signInRedirect(request: NextRequest, returnTo: string): NextResponse {
  const url = new URL('/sign-in', request.url);
  url.searchParams.set('returnTo', returnTo);
  url.searchParams.set('auth', 'retry');
  const response = NextResponse.redirect(url);
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const callback = classifyAuthCallback(request.url);
  const returnTo = safeReturnPath(request.nextUrl.searchParams.get('returnTo'));
  const next = safeReturnPath(request.nextUrl.searchParams.get('next'));
  if (callback.kind !== 'code') return signInRedirect(request, returnTo);

  const config = supabaseConfig();
  if (!config) return signInRedirect(request, returnTo);

  const destination = new URL(next, request.url);
  const response = NextResponse.redirect(destination);
  response.headers.set('Cache-Control', 'private, no-store');
  const supabase = createServerClient(config.url, config.publishableKey, {
    global: { fetch: secureApiFetch },
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(callback.code);
  return error ? signInRedirect(request, returnTo) : response;
}
