export type IdentityMode = 'guest' | 'authenticated' | 'sandbox' | 'demo';

type SessionLike = {
  user?: {
    email?: string | null;
    is_anonymous?: boolean | null;
    user_metadata?: Record<string, unknown> | null;
    app_metadata?: Record<string, unknown> | null;
  } | null;
} | null | undefined;

export function getSessionIdentityMode(session: SessionLike): IdentityMode {
  const user = session?.user;
  if (!user) return 'guest';

  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const appMetadata = (user.app_metadata ?? {}) as Record<string, unknown>;
  const experienceMode = metadata.experience_mode ?? appMetadata.experience_mode;

  if (experienceMode === 'sandbox') return 'sandbox';
  if (experienceMode === 'demo') return 'demo';
  if (user.is_anonymous) return 'guest';
  return 'authenticated';
}

export function isAnonymousSession(session: SessionLike): boolean {
  return getSessionIdentityMode(session) === 'guest';
}

export function isSandboxSession(session: SessionLike): boolean {
  return getSessionIdentityMode(session) === 'sandbox';
}

export function isDemoSession(session: SessionLike): boolean {
  return getSessionIdentityMode(session) === 'demo';
}

export function isAnonymousIdentity(value: {
  email?: string | null;
  is_anonymous?: boolean | null;
  identity_state?: string | null;
} | null | undefined): boolean {
  if (!value) return true;
  if (value.identity_state === 'anonymous') return true;
  if (value.is_anonymous === true) return true;
  return false;
}
