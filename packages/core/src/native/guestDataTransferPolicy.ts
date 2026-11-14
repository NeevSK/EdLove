/**
 * Client-readable representation of the product policy. It intentionally
 * cannot authorize transport: only a future Sanctuary receipt contract can do
 * that. Keeping this as data lets record kinds become independently reviewable
 * without resurrecting the legacy generic batch uploader.
 */
export const guestDataRecordKinds = ['timetable', 'mood', 'journal', 'students'] as const;

export type GuestDataRecordKind = (typeof guestDataRecordKinds)[number];
export type GuestDataTransferDisposition = 'retain-local' | 'awaiting-server-contract';

export type GuestDataTransferPolicy = Readonly<{
  version: 1;
  records: Readonly<Record<GuestDataRecordKind, GuestDataTransferDisposition>>;
}>;

export const defaultGuestDataTransferPolicy: GuestDataTransferPolicy = {
  version: 1,
  records: {
    timetable: 'retain-local',
    mood: 'retain-local',
    journal: 'retain-local',
    students: 'retain-local',
  },
};

export type GuestDataTransferAvailability = Readonly<{
  isAvailable: false;
  reason: string;
}>;

export function getGuestDataTransferAvailability(
  policy: GuestDataTransferPolicy = defaultGuestDataTransferPolicy,
): GuestDataTransferAvailability {
  const awaitingServerContract = guestDataRecordKinds.filter(
    (kind) => policy.records[kind] === 'awaiting-server-contract',
  );

  if (awaitingServerContract.length > 0) {
    return {
      isAvailable: false,
      reason:
        'Transfer remains unavailable until Sanctuary provides a reviewed, per-record authorization and durable receipt contract.',
    };
  }

  return {
    isAvailable: false,
    reason:
      'Transfer is not available because every offline guest record is configured to remain on this device.',
  };
}
