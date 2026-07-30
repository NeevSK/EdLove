import { SafeZustandStorage } from '@repo/core/native/storageWrapper';

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
