import { type Capacity, CapacitySchema } from '@repo/core/logic/schemas/capacity.schema';
import { GuestDataManager } from '@repo/core/native/guestDataManager';
import {
  clearLocalGuestIdentity,
  getLocalGuestIdentity,
  type LocalGuestBond,
  updateLocalGuestIdentity,
} from '@repo/core/native/guestIdentity';
import { clearGuestLeaseData } from '@repo/core/native/guestLease';
import { setGuestScope } from '@repo/core/native/guestScope';
import { clearLocalGuestSession, isLocalGuestSessionId } from '@repo/core/native/localGuestSession';
import { APIError } from '@repo/core/types/API';

function createBondId(): string {
  const randomUUID = globalThis.crypto?.randomUUID;
  if (typeof randomUUID !== 'function') {
    throw new Error('Cannot create a local guest bond: crypto.randomUUID is unavailable.');
  }
  return `local-bond-${randomUUID.call(globalThis.crypto)}`;
}

function assertLocalGuestSubject(localGuestId: string): void {
  if (!isLocalGuestSessionId(localGuestId)) {
    throw new APIError('Invalid device-local guest session', 'LOCAL_GUEST_SESSION_INVALID');
  }
}

/** Creates a bond in the device-local guest namespace. No remote request is made. */
export async function createLocalGuestInitialBond(
  localGuestId: string,
  orientation: Capacity,
  context: { displayName?: unknown },
): Promise<void> {
  assertLocalGuestSubject(localGuestId);
  if (!CapacitySchema.safeParse(orientation).success) {
    throw new APIError('Select a valid primary capacity', 'ONBOARDING_CAPACITY_INVALID');
  }

  setGuestScope(localGuestId);
  const bond: LocalGuestBond = {
    id: createBondId(),
    user_id: localGuestId,
    entity_id: `personal-${localGuestId}`,
    entity_type: 'PERSONAL_CLASSROOM',
    capacity: orientation,
    status: 'active',
  };
  await updateLocalGuestIdentity(localGuestId, {
    display_name: typeof context.displayName === 'string' ? context.displayName : '',
    availableBonds: [bond],
    activeBond: bond,
  });
}

/** Marks local onboarding complete only after its local bond is present. */
export async function completeLocalGuestOnboarding(localGuestId: string): Promise<void> {
  assertLocalGuestSubject(localGuestId);
  setGuestScope(localGuestId);
  const local = await getLocalGuestIdentity(localGuestId);
  if (!local.activeBond || !local.activeBond.capacity) {
    throw new APIError(
      'Select a primary capacity before completing onboarding',
      'ONBOARDING_CAPACITY_REQUIRED',
    );
  }
  await updateLocalGuestIdentity(localGuestId, { onboarding_completed: true });
}

/** Explicitly abandons the device-local principal and its scoped guest data. */
export async function discardLocalGuestOnboarding(localGuestId: string): Promise<void> {
  assertLocalGuestSubject(localGuestId);
  setGuestScope(localGuestId);
  await GuestDataManager.clearAllGuestData();
  await clearGuestLeaseData(localGuestId);
  await clearLocalGuestIdentity(localGuestId);
  await clearLocalGuestSession();
}
