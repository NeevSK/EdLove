import { type DeviceAccountProfile, deviceAccounts } from '@repo/core/accounts/deviceAccounts';
import type { ActiveCitizen } from '@repo/core/api/identity';
import {
  getSessionIdentityMode,
  isResolvedAuthSubjectCurrent,
} from '@repo/core/logic/auth/identityState';
import type { AuthSession } from '@repo/core/logic/ports/auth.port';

/**
 * A device account becomes durable only when the authenticated Supabase
 * session and resolved Gurudevi identity were produced by the same scoped
 * auth-resolution operation. Their IDs are intentionally not compared: a
 * mapped account ID can differ from its Supabase auth subject.
 */
export function getVerifiedDeviceAccountProfile(
  session: AuthSession | null,
  identity: ActiveCitizen | null,
  resolvedAuthSubjectId: string | null,
): DeviceAccountProfile | null {
  if (
    !session?.user ||
    getSessionIdentityMode(session) !== 'authenticated' ||
    !identity ||
    !isResolvedAuthSubjectCurrent(resolvedAuthSubjectId, session.user.id)
  ) {
    return null;
  }

  return {
    id: identity.id,
    email: identity.email,
    display_name: identity.display_name,
    avatar_url: null,
    capacity: identity.activeBond?.capacity ?? null,
    school_id: identity.schoolId ?? null,
  };
}

/**
 * Captures a verified account once per session token. Failed captures stay
 * eligible for a later auth refresh instead of losing a valid session.
 */
export async function captureAuthenticatedDeviceAccount({
  capturedSessionKeys,
  capturingSessionKeys,
  identity,
  resolvedAuthSubjectId,
  session,
}: {
  capturedSessionKeys: Set<string>;
  capturingSessionKeys: Set<string>;
  identity: ActiveCitizen;
  resolvedAuthSubjectId: string | null;
  session: AuthSession | null;
}): Promise<void> {
  const profile = getVerifiedDeviceAccountProfile(session, identity, resolvedAuthSubjectId);
  const captureKey = session ? `${session.user.id}:${session.access_token}` : null;

  if (
    !profile ||
    !captureKey ||
    capturedSessionKeys.has(captureKey) ||
    capturingSessionKeys.has(captureKey)
  ) {
    return;
  }

  capturingSessionKeys.add(captureKey);
  try {
    await deviceAccounts.captureCurrentAccount(session, profile);
    capturedSessionKeys.add(captureKey);
  } catch (error) {
    console.warn('[auth] Device account capture deferred:', error);
  } finally {
    capturingSessionKeys.delete(captureKey);
  }
}
