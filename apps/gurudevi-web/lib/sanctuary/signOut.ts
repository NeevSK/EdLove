import { assertSecureApiUrl, secureApiFetch } from '@repo/core/api/transportSecurity';
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

export class SignOutIncompleteError extends Error {
  constructor(
    readonly localCleanupComplete: boolean,
    readonly remoteRevocationConfirmed: boolean,
  ) {
    super(
      localCleanupComplete
        ? 'Signed out on this device. Sign-out on other devices could not be confirmed. Sign in again to review your sessions.'
        : 'Sign-out could not be completed on this device. Please try again before leaving it.',
    );
    this.name = 'SignOutIncompleteError';
  }
}

/** Local cleanup must proceed even when remote revocation is unavailable. */
export async function executeSovereignSignOut(redirectTo = '/'): Promise<void> {
  const origin = apiOrigin();
  const supabase = createBrowserSupabaseClient();
  let token: string | undefined;
  let sessionRead = false;
  let remoteRevocationConfirmed = false;
  let cookiesCleared = false;
  let localSessionCleared = false;
  let transientStorageCleared = true;

  if (supabase) {
    try {
      const { data, error } = await supabase.auth.getSession();
      token = data.session?.access_token;
      sessionRead = !error;
    } catch {
      sessionRead = false;
    }
  }

  // 1. Invalidate server-side session on sanctuary-api
  if (origin && token) {
    try {
      const response = await secureApiFetch(`${origin}/api/auth/sign-out`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      });
      const receipt: unknown = response.ok ? await response.json() : null;
      remoteRevocationConfirmed =
        response.ok &&
        typeof receipt === 'object' &&
        receipt !== null &&
        'ok' in receipt &&
        receipt.ok === true;
      if (!response.ok && response.body) await response.body.cancel();
    } catch {
      remoteRevocationConfirmed = false;
    }
  }
  const remoteRevocationRequired = !sessionRead || Boolean(token);

  // 2. Clear local Next.js HTTP-only session cookies
  try {
    const response = await fetch('/auth/signout', {
      method: 'POST',
      credentials: 'same-origin',
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(5000),
    });
    cookiesCleared = response.ok;
    if (response.body) await response.body.cancel();
  } catch {
    cookiesCleared = false;
  }

  // 3. Clear Supabase local client session if present
  if (supabase) {
    try {
      await supabase.auth.signOut({ scope: 'local' });
      const current = await supabase.auth.getSession();
      localSessionCleared = !current.error && !current.data.session;
    } catch {
      localSessionCleared = false;
    }
  }

  // Transient browser storage must not survive a user-initiated sign-out.
  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage?.clear();
    } catch {
      transientStorageCleared = false;
    }
    const localCleanupComplete = cookiesCleared && localSessionCleared && transientStorageCleared;
    if (!localCleanupComplete || (remoteRevocationRequired && !remoteRevocationConfirmed)) {
      throw new SignOutIncompleteError(localCleanupComplete, remoteRevocationConfirmed);
    }
    window.location.replace(redirectTo);
  }
}

export async function sanctuarySignOut(redirectTo = '/'): Promise<void> {
  return executeSovereignSignOut(redirectTo);
}
