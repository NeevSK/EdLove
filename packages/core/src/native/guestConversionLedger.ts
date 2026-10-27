import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
import { GuestDataManager } from '@repo/core/native/guestDataManager';
import { isLocalGuestSessionId } from '@repo/core/native/localGuestSession';

const GUEST_CONVERSION_LEDGER_KEY = 'auth:guest-conversion-ledger';
const GUEST_CONVERSION_LEDGER_VERSION = 1;
const MAX_SUBJECT_ID_LENGTH = 256;
const EXISTING_ACCOUNT_TRANSFER_WINDOW_MILLISECONDS = 60 * 60 * 1000;

export interface AnonymousAuthSubject {
  id: string;
  is_anonymous: boolean;
}

export interface AuthenticatedAuthSubject {
  id: string;
  is_anonymous: false;
}

export interface GuestConversionRecord {
  version: 1;
  conversionId: string;
  sourceGuestId: string;
  sourceKind?: 'anonymous-auth' | 'local-device';
  allowExistingAccountTransfer?: boolean;
  existingAccountTransferExpiresAt?: string;
  targetUserId?: string;
  targetKind?: 'identity-linked' | 'existing-account';
  status: 'pending';
  createdAt: string;
}

function isValidSubjectId(value: unknown): value is string {
  if (
    typeof value !== 'string' ||
    value.length === 0 ||
    value.length > MAX_SUBJECT_ID_LENGTH ||
    value.trim() !== value
  ) {
    return false;
  }

  for (let index = 0; index < value.length; index += 1) {
    if (value.charCodeAt(index) < 32) return false;
  }
  return true;
}

/** Ensures the source is the exact anonymous auth subject being converted. */
export function assertAnonymousGuestSource(
  subject: AnonymousAuthSubject | null | undefined,
  expectedSourceGuestId: string,
): asserts subject is AnonymousAuthSubject {
  if (
    !subject ||
    subject.is_anonymous !== true ||
    !isValidSubjectId(subject.id) ||
    !isValidSubjectId(expectedSourceGuestId) ||
    subject.id !== expectedSourceGuestId
  ) {
    throw new Error('Guest conversion source must match the active anonymous auth subject.');
  }
}

function conversionIdFor(sourceGuestId: string): string {
  return `guest-conversion:v1:${encodeURIComponent(sourceGuestId)}`;
}

function isRecord(value: unknown): value is GuestConversionRecord {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<GuestConversionRecord>;
  return (
    candidate.version === GUEST_CONVERSION_LEDGER_VERSION &&
    isValidSubjectId(candidate.sourceGuestId) &&
    candidate.conversionId === conversionIdFor(candidate.sourceGuestId) &&
    (candidate.sourceKind === undefined ||
      candidate.sourceKind === 'anonymous-auth' ||
      candidate.sourceKind === 'local-device') &&
    (candidate.allowExistingAccountTransfer === undefined ||
      typeof candidate.allowExistingAccountTransfer === 'boolean') &&
    (candidate.existingAccountTransferExpiresAt === undefined ||
      (typeof candidate.existingAccountTransferExpiresAt === 'string' &&
        Number.isFinite(Date.parse(candidate.existingAccountTransferExpiresAt)))) &&
    (candidate.targetUserId === undefined
      ? candidate.targetKind === undefined
      : isValidSubjectId(candidate.targetUserId) &&
        (candidate.targetUserId === candidate.sourceGuestId
          ? candidate.targetKind === 'identity-linked'
          : candidate.targetKind === 'existing-account')) &&
    candidate.status === 'pending' &&
    typeof candidate.createdAt === 'string' &&
    Number.isFinite(Date.parse(candidate.createdAt))
  );
}

export async function readGuestConversionRecord(): Promise<GuestConversionRecord | null> {
  const raw = await SafeZustandStorage.getItem(GUEST_CONVERSION_LEDGER_KEY);
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (isRecord(parsed)) {
      return { ...parsed, sourceKind: parsed.sourceKind ?? 'anonymous-auth' };
    }
  } catch {
    // Malformed local state is discarded below; it cannot safely select a source identity.
  }

  await SafeZustandStorage.removeItem(GUEST_CONVERSION_LEDGER_KEY);
  return null;
}

export async function beginGuestConversion(
  sourceSubject: AnonymousAuthSubject,
): Promise<GuestConversionRecord> {
  assertAnonymousGuestSource(sourceSubject, sourceSubject.id);
  const existing = await readGuestConversionRecord();
  if (existing?.sourceGuestId === sourceSubject.id) return existing;
  if (existing) {
    throw new Error('A different guest conversion is already pending on this device.');
  }

  const record: GuestConversionRecord = {
    version: GUEST_CONVERSION_LEDGER_VERSION,
    conversionId: conversionIdFor(sourceSubject.id),
    sourceGuestId: sourceSubject.id,
    sourceKind: 'anonymous-auth',
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  await SafeZustandStorage.setItem(GUEST_CONVERSION_LEDGER_KEY, JSON.stringify(record));
  return record;
}

/** Starts an explicit conversion from a device-local guest principal. */
export async function beginLocalGuestConversion(
  sourceGuestId: string,
): Promise<GuestConversionRecord> {
  if (!isLocalGuestSessionId(sourceGuestId)) {
    throw new Error('Guest conversion source must be a valid device-local guest principal.');
  }

  const existing = await readGuestConversionRecord();
  if (existing?.sourceGuestId === sourceGuestId) return existing;
  if (existing) {
    throw new Error('A different guest conversion is already pending on this device.');
  }

  const record: GuestConversionRecord = {
    version: GUEST_CONVERSION_LEDGER_VERSION,
    conversionId: conversionIdFor(sourceGuestId),
    sourceGuestId,
    sourceKind: 'local-device',
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  await SafeZustandStorage.setItem(GUEST_CONVERSION_LEDGER_KEY, JSON.stringify(record));
  return record;
}

/** Records an intentional sign-in action that may land on an existing account. */
export async function authorizeExistingAccountTransfer(
  sourceGuestId: string,
): Promise<GuestConversionRecord> {
  const existing = await readGuestConversionRecord();
  if (!existing || existing.sourceGuestId !== sourceGuestId) {
    throw new Error('No pending conversion exists for this guest source.');
  }
  const record: GuestConversionRecord = {
    ...existing,
    allowExistingAccountTransfer: true,
    existingAccountTransferExpiresAt: new Date(
      Date.now() + EXISTING_ACCOUNT_TRANSFER_WINDOW_MILLISECONDS,
    ).toISOString(),
  };
  await SafeZustandStorage.setItem(GUEST_CONVERSION_LEDGER_KEY, JSON.stringify(record));
  return record;
}

/** Clears an unconsumed existing-account sign-in intent after an interrupted attempt. */
export async function clearExistingAccountTransferAuthorization(
  sourceGuestId: string,
): Promise<void> {
  const existing = await readGuestConversionRecord();
  if (
    !existing ||
    existing.sourceGuestId !== sourceGuestId ||
    !existing.allowExistingAccountTransfer
  ) {
    return;
  }
  const {
    allowExistingAccountTransfer: _authorization,
    existingAccountTransferExpiresAt: _expiry,
    ...record
  } = existing;
  await SafeZustandStorage.setItem(GUEST_CONVERSION_LEDGER_KEY, JSON.stringify(record));
}

export async function bindGuestConversionTarget(
  sourceGuestId: string,
  targetSubject: AuthenticatedAuthSubject,
): Promise<GuestConversionRecord> {
  if (
    !isValidSubjectId(sourceGuestId) ||
    !targetSubject ||
    targetSubject.is_anonymous !== false ||
    !isValidSubjectId(targetSubject.id)
  ) {
    throw new Error('Guest conversion target must be an authenticated subject.');
  }

  const existing = await readGuestConversionRecord();
  if (!existing || existing.sourceGuestId !== sourceGuestId) {
    throw new Error('No pending conversion exists for this anonymous auth subject.');
  }
  if (existing.targetUserId && existing.targetUserId !== targetSubject.id) {
    throw new Error('Guest conversion is already bound to a different authenticated subject.');
  }
  const authorizationIsActive =
    existing.allowExistingAccountTransfer === true &&
    typeof existing.existingAccountTransferExpiresAt === 'string' &&
    Date.parse(existing.existingAccountTransferExpiresAt) > Date.now();
  if (targetSubject.id !== sourceGuestId && !authorizationIsActive) {
    throw new Error(
      'An existing-account transfer requires an explicit sign-in action from this guest source.',
    );
  }

  const record: GuestConversionRecord = {
    ...existing,
    allowExistingAccountTransfer: undefined,
    existingAccountTransferExpiresAt: undefined,
    targetUserId: targetSubject.id,
    targetKind:
      existing.sourceKind === 'local-device' || targetSubject.id !== sourceGuestId
        ? 'existing-account'
        : 'identity-linked',
  };
  await SafeZustandStorage.setItem(GUEST_CONVERSION_LEDGER_KEY, JSON.stringify(record));
  return record;
}

export async function clearGuestConversionRecord(): Promise<void> {
  await SafeZustandStorage.removeItem(GUEST_CONVERSION_LEDGER_KEY);
}

/** Explicit discard removes guest payload first, retaining its ledger if storage cleanup fails. */
export async function discardGuestConversion(): Promise<void> {
  await GuestDataManager.clearAllGuestData();
  await clearGuestConversionRecord();
}
