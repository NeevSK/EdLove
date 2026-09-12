import type { ServerSupabaseClient } from '../supabase/server';

export type AuthorizedEntry =
  | Readonly<{ kind: 'ready'; displayName: string | null }>
  | Readonly<{ kind: 'onboarding-required' }>
  | Readonly<{ kind: 'signed-out' }>
  | Readonly<{ kind: 'unavailable' }>;

type IdentityPayload = Readonly<{ display_name?: unknown; name?: unknown }>;

function isIdentityPayload(value: unknown): value is IdentityPayload {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function apiOrigin(): string | null {
  const value = process.env.NEXT_PUBLIC_API_URL?.trim();
  return value ? value.replace(/\/+$/, '') : null;
}

function displayName(payload: IdentityPayload): string | null {
  if (typeof payload.display_name === 'string' && payload.display_name.trim()) return payload.display_name;
  if (typeof payload.name === 'string' && payload.name.trim()) return payload.name;
  return null;
}

/**
 * Retrieves entry facts from Sanctuary only after Supabase has verified the
 * browser claims. The session token is transport credentials, never the
 * authorization decision; Sanctuary verifies that bearer token again.
 */
export async function resolveAuthorizedEntry(
  supabase: ServerSupabaseClient,
  fetcher: typeof fetch = fetch,
): Promise<AuthorizedEntry> {
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const subject = claimsData?.claims?.sub;
  if (claimsError) return { kind: 'unavailable' };
  if (typeof subject !== 'string' || !subject) return { kind: 'signed-out' };

  const origin = apiOrigin();
  if (!origin) return { kind: 'unavailable' };

  // getSession is intentionally used only after cryptographic claim verification
  // and only to forward the API's required bearer credential.
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  const session = sessionData.session;
  if (sessionError || !session?.access_token || session.user.id !== subject) {
    return { kind: 'unavailable' };
  }

  try {
    const response = await fetcher(`${origin}/api/identity/resolveIdentity`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
      method: 'GET',
      cache: 'no-store',
    });

    // The API context reports this exact status when an authenticated person
    // lacks an active bond. It is the only onboarding conclusion made here.
    if (response.status === 403) return { kind: 'onboarding-required' };
    if (!response.ok) return { kind: 'unavailable' };

    const payload: unknown = await response.json();
    if (!isIdentityPayload(payload)) return { kind: 'unavailable' };
    return { kind: 'ready', displayName: displayName(payload) };
  } catch {
    return { kind: 'unavailable' };
  }
}
