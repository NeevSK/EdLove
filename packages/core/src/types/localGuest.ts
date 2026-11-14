/**
 * A device-local guest: someone using the mobile app before signing in. Their principal id is
 * minted on the device and is never an Auth subject, so nothing they create can reach the server.
 *
 * The rule (owner decision, 2026-11-11): a local guest may create, change and delete their own
 * personal Self data on the phone. None of it syncs to the database while they are a guest; it
 * moves to an account only through guest conversion (native/guestDataTransferPolicy.ts).
 */

export const LOCAL_GUEST_ID_PREFIX = 'local-';

/** Identifies a persisted device-local guest principal; it is never an Auth subject. */
export function isLocalGuestSessionId(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^local-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  );
}
