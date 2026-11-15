import {
  type AuthoritativeAuthorizedEntryFacts,
  type AuthorizedEntryResult,
  mapAuthorizedEntry,
} from '@repo/core/web-authorized-entry';
import { assertSecureApiUrl } from '@repo/core/api/transportSecurity';
import type { ServerSupabaseClient } from '../supabase/server';
import {
  ACTIVE_BOND_COOKIE,
  chooseActiveScope,
  personalCapacity,
  readV1Entry,
  type V1Entry,
} from './v1Entry';

export type AuthorizedEntry = AuthorizedEntryResult | Readonly<{ kind: 'signed-out' }>;

function apiOrigin(): string | null {
  const value = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!value) return null;
  assertSecureApiUrl(value);
  return value.replace(/\/+$/, '');
}

function unavailable(message: string): AuthorizedEntryResult {
  return { kind: 'unavailable', reason: 'profile-unavailable', message };
}

async function selectedBondFromCookies(): Promise<string | undefined> {
  const { cookies } = await import('next/headers');
  return (await cookies()).get(ACTIVE_BOND_COOKIE)?.value;
}

function authoritativeFacts(
  entry: V1Entry,
  subject: string,
  selectedBondId: string | undefined,
): AuthoritativeAuthorizedEntryFacts {
  const active = chooseActiveScope(entry.scopes, selectedBondId);
  const primary = personalCapacity(entry.scopes) ?? active?.capacity ?? null;
  return {
    kind: 'active',
    accountId: entry.accountId,
    authSubjectId: subject,
    displayName: entry.displayName,
    onboardingCompleted: entry.onboardingCompleted,
    activeCapacity: active?.capacity ?? null,
    primaryCapacity: primary,
    primaryScopeRole: primary,
    activeScope: active && {
      bondId: active.bondId,
      entityId: active.entityId,
      entityType: active.entityType,
      roles: [active.capacity],
      citizenship: active.citizenship,
    },
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
  selectedBond: () => Promise<string | undefined> = selectedBondFromCookies,
): Promise<AuthorizedEntry> {
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const subject = claimsData?.claims?.sub;
  if (claimsError) return unavailable('We could not verify your secure session. Please try again.');
  if (typeof subject !== 'string' || !subject) return { kind: 'signed-out' };

  let origin: string | null;
  try {
    origin = apiOrigin();
  } catch {
    return unavailable('Sanctuary services are not configured securely. Please try again later.');
  }
  if (!origin) return unavailable('Sanctuary services are not configured in this browser.');

  // getSession is intentionally used only after cryptographic claim verification
  // and only to forward the API's required bearer credential.
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  const session = sessionData.session;
  if (sessionError || !session?.access_token || session.user.id !== subject) {
    return unavailable('We could not refresh your secure session. Please try again.');
  }

  try {
    const entry = await readV1Entry(origin, session.access_token, fetcher);

    const [currentClaims, currentSession] = await Promise.all([
      supabase.auth.getClaims(),
      supabase.auth.getSession(),
    ]);
    if (
      currentClaims.error ||
      currentClaims.data?.claims?.sub !== subject ||
      currentSession.error ||
      currentSession.data.session?.user.id !== subject
    ) {
      return unavailable(
        'Your secure session changed while entry was being verified. Please try again.',
      );
    }

    return mapAuthorizedEntry(authoritativeFacts(entry, subject, await selectedBond()));
  } catch {
    return unavailable('We could not reach the authoritative sanctuary service. Please try again.');
  }
}
