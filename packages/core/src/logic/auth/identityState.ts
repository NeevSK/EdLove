export type IdentityMode = 'unauthenticated' | 'anonymous' | 'authenticated' | 'sandbox' | 'demo';

/**
 * An inactive identity is established only by the server lifecycle contract.
 * A profile lookup failure must stay unknown rather than redirecting to recovery.
 */
export type IdentityAvailability = 'unknown' | 'active' | 'inactive';

/**
 * An auth-state event observed after a bootstrap lookup begins is newer than
 * that lookup's eventual result and must remain authoritative.
 */
export function isCurrentAuthBootstrapGeneration(
  bootstrapGeneration: number,
  currentGeneration: number,
): boolean {
  return bootstrapGeneration === currentGeneration;
}

/** A later profile resolution owns the identity store; earlier results are stale. */
export function isCurrentIdentityResolutionGeneration(
  resolutionGeneration: number,
  currentGeneration: number,
): boolean {
  return resolutionGeneration === currentGeneration;
}

/** Auth-subject matching is separate from a public account/profile identifier. */
export function isResolvedAuthSubjectCurrent(
  resolvedAuthSubjectId: string | null,
  sessionAuthSubjectId: string | undefined,
): boolean {
  return Boolean(resolvedAuthSubjectId && resolvedAuthSubjectId === sessionAuthSubjectId);
}

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

/** Third-class and anonymous identities are usable local-first identities. */
export function isLocalOnlyIdentity(
  value:
    | {
        citizenship?: string | null;
        email?: string | null;
        is_anonymous?: boolean | null;
        identity_state?: string | null;
      }
    | null
    | undefined,
): boolean {
  return (
    isAnonymousIdentity(value) ||
    value?.citizenship === 'THIRD_CLASS' ||
    value?.citizenship === 'WANDERER'
  );
}

/** Soft-deactivated profiles remain in storage but must not enter the app shell. */
export function isActiveIdentityProfile(
  value: { deleted_at?: string | null } | null | undefined,
): boolean {
  return value !== null && value !== undefined && value.deleted_at == null;
}

/**
 * Derives a recommended friendly display name from auth user metadata or email.
 * Replaces cumbersome manual typing for OAuth or verified email logins.
 */
export function suggestDisplayName(
  user?: {
    email?: string | null;
    user_metadata?: Record<string, unknown> | null;
  } | null,
): string {
  if (!user) return '';

  const metadata = user.user_metadata ?? {};
  const metaName =
    (metadata.full_name as string | undefined) ||
    (metadata.name as string | undefined) ||
    (metadata.display_name as string | undefined);

  if (metaName && typeof metaName === 'string') {
    const trimmed = metaName.trim();
    if (trimmed.length >= 2 && trimmed.toLowerCase() !== 'guest user') {
      return trimmed;
    }
  }

  if (user.email && typeof user.email === 'string') {
    const [localPart] = user.email.split('@');
    if (localPart) {
      const formatted = localPart
        .replace(/[._+\-]+/g, ' ')
        .trim()
        .replace(/\b\w/g, (c) => c.toUpperCase());
      if (formatted.length >= 2 && !/^\d+$/.test(formatted)) {
        return formatted;
      }
    }
  }

  return '';
}
