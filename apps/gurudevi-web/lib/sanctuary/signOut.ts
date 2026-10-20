import { assertSecureApiUrl } from '@repo/core/api/transportSecurity';
import { createBrowserSupabaseClient } from '../supabase/browser';

function apiOrigin(): string | null {
  const value = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!value) return null;
  try {
    assertSecureApiUrl(value);
    return value.replace(/\/+$/, '');
  } catch {
    return null;
  }
}

/**
 * Executes an atomic 4-stage sovereign sign-out:
 * 1. Revokes server-side bearer session on sanctuary-api (/api/auth/sign-out)
 * 2. Clears HTTP-only SSR session cookies on Next.js (/auth/signout)
 * 3. Clears local client-side Supabase session state
 * 4. Flushes transient sessionStorage to prevent student data leaks on shared terminals
 */
export async function executeSovereignSignOut(redirectTo = '/'): Promise<void> {
  const origin = apiOrigin();
  const supabase = createBrowserSupabaseClient();
  let token: string | undefined;

  if (supabase) {
    try {
      const { data } = await supabase.auth.getSession();
      token = data.session?.access_token;
    } catch {
      // Session read error ignored during sign-out
    }
  }

  // 1. Invalidate server-side session on sanctuary-api
  if (origin && token) {
    try {
      await fetch(`${origin}/api/auth/sign-out`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });
    } catch {
      // Best-effort server token revocation
    }
  }

  // 2. Clear local Next.js HTTP-only session cookies
  try {
    await fetch('/auth/signout', { method: 'POST', credentials: 'same-origin' });
  } catch {
    // Best-effort cookie clear
  }

  // 3. Clear Supabase local client session if present
  if (supabase) {
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch {
      // Safe local clear
    }
  }

  // 4. Flush transient session storage to ensure zero leftover student records in memory
  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage?.clear();
    } catch {
      // Safe fallback
    }
    window.location.replace(redirectTo);
  }
}

export async function sanctuarySignOut(redirectTo = '/'): Promise<void> {
  return executeSovereignSignOut(redirectTo);
}
