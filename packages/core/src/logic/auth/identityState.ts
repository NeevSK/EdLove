export type IdentityMode = 'unauthenticated' | 'anonymous' | 'authenticated' | 'sandbox' | 'demo';

/**
 * An inactive identity is established only by the server lifecycle contract.
 * A profile lookup failure must stay unknown rather than redirecting to recovery.
 */
export type IdentityAvailability = 'unknown' | 'active' | 'inactive';

type SessionLike =
  | {
      user?: {
        email?: string | null;
        is_anonymous?: boolean | null;
        user_metadata?: Record<string, unknown> | null;
        app_metadata?: Record<string, unknown> | null;
      } | null;
    }
  | null
  | undefined;

export function getSessionIdentityMode(session: SessionLike): IdentityMode {
  const user = session?.user;
  if (!user) return 'unauthenticated';

  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const appMetadata = (user.app_metadata ?? {}) as Record<string, unknown>;
  const experienceMode = metadata.experience_mode ?? appMetadata.experience_mode;

  if (experienceMode === 'sandbox') return 'sandbox';
  if (experienceMode === 'demo') return 'demo';
  if (user.is_anonymous) return 'anonymous';
  return 'authenticated';
}

export function isAnonymousSession(session: SessionLike): boolean {
  return getSessionIdentityMode(session) === 'anonymous';
}

export function isSandboxSession(session: SessionLike): boolean {
  return getSessionIdentityMode(session) === 'sandbox';
}

export function isDemoSession(session: SessionLike): boolean {
  return getSessionIdentityMode(session) === 'demo';
}

export function isAnonymousIdentity(
  value:
    | {
        email?: string | null;
        is_anonymous?: boolean | null;
        identity_state?: string | null;
      }
    | null
    | undefined,
): boolean {
  if (!value) return true;
  if (value.identity_state === 'anonymous') return true;
  if (value.is_anonymous === true) return true;
  return false;
}

/** Soft-deactivated profiles remain in storage but must not enter the app shell. */
export function isActiveIdentityProfile(
  value: { deleted_at?: string | null } | null | undefined,
): boolean {
  return value !== null && value !== undefined && value.deleted_at == null;
}
