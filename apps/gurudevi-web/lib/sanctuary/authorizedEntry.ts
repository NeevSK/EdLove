import {
  type AuthoritativeAuthorizedEntryFacts,
  type AuthorizedEntryResult,
  mapAuthorizedEntry,
} from '@repo/core/web-authorized-entry';
import type { ServerSupabaseClient } from '../supabase/server';

export type AuthorizedEntry = AuthorizedEntryResult | Readonly<{ kind: 'signed-out' }>;

type IdentityPayload = Readonly<{
  activeBond?: unknown;
  display_name?: unknown;
  id?: unknown;
  name?: unknown;
  onboarding_completed?: unknown;
}>;

type ActiveBondPayload = Readonly<{ capacity?: unknown }>;

function isIdentityPayload(value: unknown): value is IdentityPayload {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function apiOrigin(): string | null {
  const value = process.env.NEXT_PUBLIC_API_URL?.trim();
  return value ? value.replace(/\/+$/, '') : null;
}

function unavailable(message: string): AuthorizedEntryResult {
  return { kind: 'unavailable', reason: 'profile-unavailable', message };
}

function displayName(payload: IdentityPayload): string | null {
  if (typeof payload.display_name === 'string' && payload.display_name.trim())
    return payload.display_name;
  if (typeof payload.name === 'string' && payload.name.trim()) return payload.name;
  return null;
}

function activeCapacity(payload: IdentityPayload): string | null {
  const bond = payload.activeBond;
  if (!bond || typeof bond !== 'object' || Array.isArray(bond)) return null;
  const capacity = (bond as ActiveBondPayload).capacity;
  return typeof capacity === 'string' && capacity.trim() ? capacity : null;
}

function authoritativeFacts(
  payload: IdentityPayload,
  subject: string,
): AuthoritativeAuthorizedEntryFacts {
  if (payload.id !== subject || typeof payload.onboarding_completed !== 'boolean') {
    return {
      kind: 'unavailable',
      message:
        'The authoritative sanctuary response was incomplete or belonged to another account.',
    };
  }

  return {
    kind: 'active',
    authSubjectId: subject,
    displayName: displayName(payload),
    onboardingCompleted: payload.onboarding_completed,
    activeCapacity: activeCapacity(payload),
  };
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
  if (claimsError) return unavailable('We could not verify your secure session. Please try again.');
  if (typeof subject !== 'string' || !subject) return { kind: 'signed-out' };

  const origin = apiOrigin();
  if (!origin) return unavailable('Sanctuary access is not configured in this environment.');

  // getSession is intentionally used only after cryptographic claim verification
  // and only to forward the API's required bearer credential.
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  const session = sessionData.session;
  if (sessionError || !session?.access_token || session.user.id !== subject) {
    return unavailable('We could not refresh your secure session. Please try again.');
  }

  try {
    const response = await fetcher(`${origin}/api/identity/resolveIdentity`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
      method: 'GET',
      cache: 'no-store',
    });

    if (!response.ok)
      return unavailable('The authoritative sanctuary service is unavailable. Please try again.');

    const payload: unknown = await response.json();
    if (!isIdentityPayload(payload))
      return unavailable('The authoritative sanctuary service returned an invalid response.');
    return mapAuthorizedEntry(authoritativeFacts(payload, subject));
  } catch {
    return unavailable('We could not reach the authoritative sanctuary service. Please try again.');
  }
}
