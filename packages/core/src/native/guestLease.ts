import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';

export const GUEST_LEASE_DAYS = 15;
export const GUEST_LEASE_REMINDER_DAYS = [1, 3, 6, 10, 15] as const;

export type GuestLeaseReminderDay = (typeof GUEST_LEASE_REMINDER_DAYS)[number];

export interface GuestLease {
  startedAt: string;
  expiresAt: string;
  dismissedReminderDays: GuestLeaseReminderDay[];
}

export interface GuestLeaseStatus {
  lease: GuestLease;
  day: number;
  isExpired: boolean;
  reminderDay: GuestLeaseReminderDay | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const leaseKey = (userId: string) => `guest:${userId}:lease`;
const expiredKey = (userId: string) => `guest:${userId}:lease-expired`;
const dataKeysKey = (userId: string) => `guest:${userId}:lease-data-keys`;

function isLease(value: unknown): value is GuestLease {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<GuestLease>;
  return (
    typeof candidate.startedAt === 'string' &&
    typeof candidate.expiresAt === 'string' &&
    Array.isArray(candidate.dismissedReminderDays)
  );
}

function createLease(now: Date): GuestLease {
  return {
    startedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + GUEST_LEASE_DAYS * DAY_MS).toISOString(),
    dismissedReminderDays: [],
  };
}

export function getGuestLeaseStatus(lease: GuestLease, now = new Date()): GuestLeaseStatus {
  const startedAt = new Date(lease.startedAt).getTime();
  const expiresAt = new Date(lease.expiresAt).getTime();
  const isExpired = !Number.isFinite(expiresAt) || now.getTime() >= expiresAt;
  const day = Number.isFinite(startedAt)
    ? Math.min(GUEST_LEASE_DAYS, Math.max(1, Math.floor((now.getTime() - startedAt) / DAY_MS) + 1))
    : GUEST_LEASE_DAYS;
  const reminderDay = GUEST_LEASE_REMINDER_DAYS.includes(day as GuestLeaseReminderDay)
    ? (day as GuestLeaseReminderDay)
    : null;
  return {
    lease,
    day,
    isExpired,
    reminderDay: reminderDay && !lease.dismissedReminderDays.includes(reminderDay) ? reminderDay : null,
  };
}

export async function getOrCreateGuestLease(userId: string, now = new Date()): Promise<GuestLeaseStatus> {
  const expired = await SafeZustandStorage.getItem(expiredKey(userId));
  if (expired) {
    const lease = createLease(now);
    return { ...getGuestLeaseStatus(lease, now), isExpired: true, reminderDay: 15 };
  }

  const raw = await SafeZustandStorage.getItem(leaseKey(userId));
  let lease: GuestLease;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    lease = isLease(parsed) ? parsed : createLease(now);
  } catch {
    lease = createLease(now);
  }

  const status = getGuestLeaseStatus(lease, now);
  if (!raw) await SafeZustandStorage.setItem(leaseKey(userId), JSON.stringify(lease));
  if (status.isExpired) await SafeZustandStorage.setItem(expiredKey(userId), '1');
  return status;
}

export async function dismissGuestLeaseReminder(
  userId: string,
  reminderDay: GuestLeaseReminderDay,
): Promise<void> {
  const status = await getOrCreateGuestLease(userId);
  if (status.lease.dismissedReminderDays.includes(reminderDay)) return;
  const lease: GuestLease = {
    ...status.lease,
    dismissedReminderDays: [...status.lease.dismissedReminderDays, reminderDay],
  };
  await SafeZustandStorage.setItem(leaseKey(userId), JSON.stringify(lease));
}

export async function clearGuestLease(userId: string): Promise<void> {
  await Promise.all([
    SafeZustandStorage.removeItem(leaseKey(userId)),
    SafeZustandStorage.removeItem(expiredKey(userId)),
  ]);
}

/** Registers local keys so lease expiry can remove every opted-in guest store. */
export async function registerGuestLeaseDataKey(userId: string, storageKey: string): Promise<void> {
  const raw = await SafeZustandStorage.getItem(dataKeysKey(userId));
  let keys: string[] = [];
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    keys = Array.isArray(parsed) ? parsed.filter((key): key is string => typeof key === 'string') : [];
  } catch {
    keys = [];
  }
  if (keys.includes(storageKey)) return;
  await SafeZustandStorage.setItem(dataKeysKey(userId), JSON.stringify([...keys, storageKey]));
}

export async function clearGuestLeaseData(userId: string): Promise<void> {
  const raw = await SafeZustandStorage.getItem(dataKeysKey(userId));
  let keys: string[] = [];
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    keys = Array.isArray(parsed) ? parsed.filter((key): key is string => typeof key === 'string') : [];
  } catch {
    keys = [];
  }
  await Promise.all([...keys.map((key) => SafeZustandStorage.removeItem(key)), SafeZustandStorage.removeItem(dataKeysKey(userId))]);
}
