import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
import { setGuestScope } from '@repo/core/native/guestScope';
import { isLocalGuestSessionId, LOCAL_GUEST_ID_PREFIX } from '@repo/core/types/localGuest';

const LOCAL_GUEST_SESSION_KEY = 'gurudevi:local-guest-session';
const LOCAL_GUEST_SESSION_VERSION = 1;

export interface LocalGuestSession {
  version: 1;
  id: string;
}

export class LocalGuestSessionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LocalGuestSessionError';
  }
}

function parseLocalGuestSession(raw: string): LocalGuestSession | null {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  if (
    record.version !== LOCAL_GUEST_SESSION_VERSION ||
    typeof record.id !== 'string' ||
    Object.keys(record).length !== 2 ||
    !isLocalGuestSessionId(record.id)
  ) {
    return null;
  }

  return { version: LOCAL_GUEST_SESSION_VERSION, id: record.id };
}

function createOpaqueId(): string {
  const randomUUID = globalThis.crypto?.randomUUID;
  if (typeof randomUUID !== 'function') {
    throw new LocalGuestSessionError(
      'Cannot create a local guest session: crypto.randomUUID is unavailable.',
    );
  }
  return `${LOCAL_GUEST_ID_PREFIX}${randomUUID.call(globalThis.crypto)}`;
}

/** Reads guest ownership without changing the active storage scope. */
export async function readLocalGuestSession(): Promise<LocalGuestSession | null> {
  const raw = await SafeZustandStorage.getItem(LOCAL_GUEST_SESSION_KEY);
  return raw === null ? null : parseLocalGuestSession(raw);
}

/** Restores the persisted device-local guest session and activates its data scope. */
export async function restoreLocalGuestSession(): Promise<LocalGuestSession | null> {
  const raw = await SafeZustandStorage.getItem(LOCAL_GUEST_SESSION_KEY);
  const session = raw === null ? null : parseLocalGuestSession(raw);
  if (raw !== null && session === null) {
    await SafeZustandStorage.removeItem(LOCAL_GUEST_SESSION_KEY);
  }
  setGuestScope(session?.id ?? null);
  return session;
}

/** Returns the existing device-local guest session or creates and persists one. */
export async function getOrCreateLocalGuestSession(): Promise<LocalGuestSession> {
  const existing = await restoreLocalGuestSession();
  if (existing) return existing;

  const session: LocalGuestSession = {
    version: LOCAL_GUEST_SESSION_VERSION,
    id: createOpaqueId(),
  };
  await SafeZustandStorage.setItem(LOCAL_GUEST_SESSION_KEY, JSON.stringify(session));
  setGuestScope(session.id);
  return session;
}

/** Removes the persisted local guest session and resets its data namespace. */
export async function clearLocalGuestSession(): Promise<void> {
  await SafeZustandStorage.removeItem(LOCAL_GUEST_SESSION_KEY);
  setGuestScope(null);
}
