import {
  type AuthoritativeAuthorizedEntryFacts,
  type AuthorizedEntryResult,
  mapAuthorizedEntry,
} from '@repo/core/web-authorized-entry';
import { assertSecureApiUrl } from '@repo/core/api/transportSecurity';
import type { ServerSupabaseClient } from '../supabase/server';

export type AuthorizedEntry = AuthorizedEntryResult | Readonly<{ kind: 'signed-out' }>;

type IdentityPayload = Readonly<{
  display_name?: unknown;
  id?: unknown;
  name?: unknown;
  onboarding_completed?: unknown;
  scopeBootstrap?: unknown;
}>;

type ScopeBootstrapPayload = Readonly<{
  userId?: unknown;
  primaryCapacity?: unknown;
  selection?: unknown;
  activeScope?: unknown;
}>;

type ActiveScopePayload = Readonly<{
  bondId?: unknown;
  entityId?: unknown;
  entityType?: unknown;
  roles?: unknown;
}>;

type BrowserActiveScope = Readonly<{
  bondId: string;
  entityId: string;
  entityType: string;
  roles: readonly string[];
}>;

function isIdentityPayload(value: unknown): value is IdentityPayload {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function apiOrigin(): string | null {
  const value = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!value) return null;
  assertSecureApiUrl(value);
  return value.replace(/\/+$/, '');
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

function activeScope(payload: IdentityPayload): BrowserActiveScope | null {
  const bootstrap = payload.scopeBootstrap;
  if (!bootstrap || typeof bootstrap !== 'object' || Array.isArray(bootstrap)) return null;
  const candidate = bootstrap as ScopeBootstrapPayload;
  if (candidate.selection !== 'selected') return null;
  const scope = candidate.activeScope;
  if (!scope || typeof scope !== 'object' || Array.isArray(scope)) return null;
  const active = scope as ActiveScopePayload;
  if (
    typeof active.bondId !== 'string' ||
    typeof active.entityId !== 'string' ||
    typeof active.entityType !== 'string' ||
    !Array.isArray(active.roles) ||
    active.roles.length === 0 ||
    active.roles.some((role) => typeof role !== 'string' || !role.trim())
  ) {
    return null;
  }
  return {
    bondId: active.bondId,
    entityId: active.entityId,
    entityType: active.entityType,
    roles: active.roles,
  };
}

function primaryScopeRole(payload: IdentityPayload): string | null {
  const bootstrap = payload.scopeBootstrap;
  if (!bootstrap || typeof bootstrap !== 'object' || Array.isArray(bootstrap)) return null;
  const capacity = (bootstrap as ScopeBootstrapPayload).primaryCapacity;
  return typeof capacity === 'string' && capacity.trim() ? capacity : null;
}

function authoritativeFacts(
  payload: IdentityPayload,
  subject: string,
): AuthoritativeAuthorizedEntryFacts {
  if (typeof payload.onboarding_completed !== 'boolean') {
    return {
      kind: 'unavailable',
      message: 'The authoritative sanctuary response was incomplete.',
    };
  }

  return {
    kind: 'active',
    accountId: typeof payload.id === 'string' ? payload.id : '',
    authSubjectId: subject,
    displayName: displayName(payload),
    onboardingCompleted: payload.onboarding_completed,
    activeCapacity: primaryScopeRole(payload),
    primaryScopeRole: primaryScopeRole(payload),
    activeScope: activeScope(payload),
  };
}

function hasCanonicalAccountConsistency(payload: IdentityPayload): boolean {
  if (typeof payload.id !== 'string') return false;
  const bootstrap = payload.scopeBootstrap;
  if (!bootstrap || typeof bootstrap !== 'object' || Array.isArray(bootstrap)) return true;
  return (bootstrap as ScopeBootstrapPayload).userId === payload.id;
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
    const response = await fetcher(`${origin}/api/identity/resolveIdentity`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
      method: 'GET',
      cache: 'no-store',
      redirect: 'error',
    });

    if (!response.ok)
      return unavailable('The authoritative sanctuary service is unavailable. Please try again.');

    const payload: unknown = await response.json();
    if (!isIdentityPayload(payload))
      return unavailable('The authoritative sanctuary service returned an invalid response.');

    if (!hasCanonicalAccountConsistency(payload)) {
      return {
        kind: 'unavailable',
        reason: 'invalid-authoritative-entry',
        message: 'The authoritative sanctuary response contained inconsistent account identity.',
      };
    }

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

    return mapAuthorizedEntry(authoritativeFacts(payload, subject));
  } catch {
    return unavailable('We could not reach the authoritative sanctuary service. Please try again.');
  }
}
