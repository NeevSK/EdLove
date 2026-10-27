import { isEdloveAccountId } from './logic/utils/edloveUuidV8';

/**
 * Browser-authorized entry contract.
 *
 * A browser adapter owns the authenticated server call and returns this
 * deliberately small snapshot. It must not expose a database schema or let
 * the browser choose an account subject, profile, or role.
 */
export type AuthorizedEntryResult =
  | Readonly<{
      kind: 'ready';
      accountId: string;
      authSubjectId: string;
      displayName: string;
      /** Compatibility label derived from the server-selected scope, never a profile fallback. */
      activeCapacity: string;
      primaryScopeRole: string;
      activeScope: Readonly<{
        bondId: string;
        entityId: string;
        entityType: string;
        roles: readonly string[];
      }>;
    }>
  | Readonly<{
      kind: 'onboarding-required';
      reason: 'missing-display-name' | 'missing-active-scope' | 'onboarding-incomplete';
    }>
  | Readonly<{ kind: 'inactive'; message: string }>
  | Readonly<{
      kind: 'unavailable';
      reason: 'profile-unavailable' | 'invalid-authoritative-entry';
      message: string;
    }>;

/** Raw facts received from the authoritative server adapter, before route policy mapping. */
export type AuthoritativeAuthorizedEntryFacts =
  | Readonly<{
      kind: 'active';
      accountId: string;
      authSubjectId: string;
      displayName: string | null;
      onboardingCompleted: boolean;
      /** Compatibility label derived from the selected scope by the server adapter. */
      activeCapacity: string | null;
      primaryScopeRole: string | null;
      activeScope: Readonly<{
        bondId: string;
        entityId: string;
        entityType: string;
        roles: readonly string[];
      }> | null;
    }>
  | Readonly<{ kind: 'inactive'; message: string }>
  | Readonly<{ kind: 'unavailable'; message: string }>;

/**
 * The browser-facing adapter boundary. Implementations authenticate through
 * the browser auth runtime, then call a server endpoint that owns profile,
 * lifecycle, and role resolution.
 */
export interface BrowserAuthorizedEntryPort {
  resolveAuthorizedEntry(): Promise<AuthorizedEntryResult>;
  completeOnboarding(): Promise<AuthorizedEntryResult>;
}

function present(value: string | null): value is string {
  return Boolean(value?.trim());
}

/**
 * Converts an authoritative response into a route-safe result. A malformed
 * response is unavailable, never silently upgraded into an authorized route.
 */
export function mapAuthorizedEntry(
  facts: AuthoritativeAuthorizedEntryFacts,
): AuthorizedEntryResult {
  if (facts.kind === 'inactive') return facts;
  if (facts.kind === 'unavailable') {
    return { kind: 'unavailable', reason: 'profile-unavailable', message: facts.message };
  }

  if (!present(facts.authSubjectId) || !isEdloveAccountId(facts.accountId)) {
    return {
      kind: 'unavailable',
      reason: 'invalid-authoritative-entry',
      message: 'The authorized entry response did not identify the signed-in account.',
    };
  }
  if (!present(facts.displayName)) {
    return { kind: 'onboarding-required', reason: 'missing-display-name' };
  }
  if (!facts.onboardingCompleted) {
    return { kind: 'onboarding-required', reason: 'onboarding-incomplete' };
  }
  if (
    !present(facts.activeCapacity) ||
    !present(facts.primaryScopeRole) ||
    !facts.activeScope ||
    facts.activeScope.roles.length === 0
  ) {
    return { kind: 'onboarding-required', reason: 'missing-active-scope' };
  }

  return {
    kind: 'ready',
    accountId: facts.accountId,
    authSubjectId: facts.authSubjectId,
    displayName: facts.displayName,
    activeCapacity: facts.activeCapacity,
    primaryScopeRole: facts.primaryScopeRole,
    activeScope: facts.activeScope,
  };
}
