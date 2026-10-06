import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
import { CapacitySchema, type Capacity } from '@repo/core/logic/schemas/capacity.schema';

const GUEST_IDENTITY_PREFIX = 'gurudevi:guest-identity:';

export interface LocalGuestBond {
  id: string;
  user_id: string;
  entity_id: string;
  entity_type: 'PERSONAL_CLASSROOM';
  capacity: string;
  status: 'active';
}

export interface LocalGuestIdentity {
  id: string;
  email: null;
  display_name: string;
  availableBonds: LocalGuestBond[];
  activeBond: LocalGuestBond | null;
  onboarding_completed: boolean;
  citizenship: 'THIRD_CLASS';
}

export interface GuestClaimIdentity {
  displayName: string;
  capacity: Capacity | null;
}

function key(userId: string) {
  return `${GUEST_IDENTITY_PREFIX}${userId}`;
}

function initialIdentity(userId: string): LocalGuestIdentity {
  return {
    id: userId,
    email: null,
    display_name: '',
    availableBonds: [],
    activeBond: null,
    onboarding_completed: false,
    citizenship: 'THIRD_CLASS',
  };
}

export async function getLocalGuestIdentity(userId: string): Promise<LocalGuestIdentity> {
  const raw = await SafeZustandStorage.getItem(key(userId));
  if (!raw) return initialIdentity(userId);

  try {
    return { ...initialIdentity(userId), ...(JSON.parse(raw) as Partial<LocalGuestIdentity>) };
  } catch {
    return initialIdentity(userId);
  }
}

/** Extracts the claimable identity facts from the local guest record only. */
export function getGuestClaimIdentity(identity: LocalGuestIdentity): GuestClaimIdentity {
  return {
    displayName: identity.display_name.trim() || 'Sanctuary User',
    capacity: CapacitySchema.safeParse(identity.activeBond?.capacity).data ?? null,
  };
}

export async function updateLocalGuestIdentity(
  userId: string,
  updates: Partial<LocalGuestIdentity>,
): Promise<LocalGuestIdentity> {
  const next = { ...(await getLocalGuestIdentity(userId)), ...updates };
  await SafeZustandStorage.setItem(key(userId), JSON.stringify(next));
  return next;
}

export async function clearLocalGuestIdentity(userId: string): Promise<void> {
  await SafeZustandStorage.removeItem(key(userId));
}

/**
 * migrateGuestDataToAuthenticatedUser
 *
 * Automatically migrates offline guest data, custom preferences, and local bonds
 * to a newly authenticated citizen account upon sign-in.
 */
export async function migrateGuestDataToAuthenticatedUser(
  authenticatedUserId: string,
  guestUserId = 'guest',
): Promise<LocalGuestIdentity> {
  const guestData = await getLocalGuestIdentity(guestUserId);
  const targetData = await getLocalGuestIdentity(authenticatedUserId);

  const existingEntityIds = new Set(targetData.availableBonds.map((b) => b.entity_id || b.id));
  const newBonds = guestData.availableBonds
    .filter((b) => !existingEntityIds.has(b.entity_id || b.id))
    .map((b) => ({ ...b, user_id: authenticatedUserId }));

  const merged = await updateLocalGuestIdentity(authenticatedUserId, {
    display_name: targetData.display_name || guestData.display_name,
    onboarding_completed: targetData.onboarding_completed || guestData.onboarding_completed,
    availableBonds: [...targetData.availableBonds, ...newBonds],
    activeBond:
      targetData.activeBond ??
      (guestData.activeBond ? { ...guestData.activeBond, user_id: authenticatedUserId } : null),
  });

  await clearLocalGuestIdentity(guestUserId);
  return merged;
}
