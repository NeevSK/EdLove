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
      authSubjectId: string;
      displayName: string;
      activeCapacity: string;
    }>
  | Readonly<{
      kind: 'onboarding-required';
      reason: 'missing-display-name' | 'missing-active-capacity' | 'onboarding-incomplete';
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
      authSubjectId: string;
      displayName: string | null;
      onboardingCompleted: boolean;
      activeCapacity: string | null;
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

  if (!present(facts.authSubjectId)) {
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
  if (!present(facts.activeCapacity)) {
    return { kind: 'onboarding-required', reason: 'missing-active-capacity' };
  }

  return {
    kind: 'ready',
    authSubjectId: facts.authSubjectId,
    displayName: facts.displayName,
    activeCapacity: facts.activeCapacity,
  };
}
