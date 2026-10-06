import {
  type AuthoritativeAuthorizedEntryFacts,
  type AuthorizedEntryResult,
  mapAuthorizedEntry,
} from '@repo/core/web-authorized-entry';
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
    activeCapacity: primaryScopeRole(payload),
    primaryScopeRole: primaryScopeRole(payload),
    activeScope: activeScope(payload),
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
  // If sanctuary API is not configured, treat as signed-out to show sign-in prompt
  // instead of "unavailable" which blocks access entirely.
  if (!origin) return { kind: 'signed-out' };

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
