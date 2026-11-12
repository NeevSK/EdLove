import { storage } from '@repo/core/lib/storage.adapter';
import type { JourneySnapshotStore } from '@repo/core/logic/ports/journeySnapshot.port';
import type { WorkspaceRolePersona } from '@repo/core/types';
import { z } from 'zod';

/**
 * Where a role journey's XState snapshot is kept on the device, decoded here at the boundary.
 * A snapshot this version can't read is dropped, so the machine starts fresh instead of crashing.
 */

// 2: XState 6 beta. Snapshots written by the alpha use shapes the beta does not read, so the
// version bump discards them on load.
const SNAPSHOT_SCHEMA_VERSION = 2;

export const SnapshotEnvelopeSchema = z.object({
  version: z.number().int(),
  savedAt: z.iso.datetime(),
  snapshot: z.unknown(),
});

export function getJourneySnapshotStorageKey(persona: WorkspaceRolePersona): string {
  return `role_journey:v6:${persona}:snapshot`;
}

export function saveJourneySnapshot(persona: WorkspaceRolePersona, snapshot: unknown): void {
  const envelope = {
    version: SNAPSHOT_SCHEMA_VERSION,
    savedAt: new Date().toISOString(),
    snapshot,
  };
  storage.set(getJourneySnapshotStorageKey(persona), JSON.stringify(envelope));
}

export function loadJourneySnapshot(persona: WorkspaceRolePersona): unknown | null {
  const raw = storage.getString(getJourneySnapshotStorageKey(persona));
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    const validated = SnapshotEnvelopeSchema.safeParse(parsed);
    if (!validated.success || validated.data.version !== SNAPSHOT_SCHEMA_VERSION) {
      // Version mismatch or schema drift — safely discard to prevent state crash
      storage.delete(getJourneySnapshotStorageKey(persona));
      return null;
    }
    return validated.data.snapshot;
  } catch {
    storage.delete(getJourneySnapshotStorageKey(persona));
    return null;
  }
}

export function dropJourneySnapshot(persona: WorkspaceRolePersona): void {
  storage.delete(getJourneySnapshotStorageKey(persona));
}

export const journeySnapshotStore: JourneySnapshotStore = {
  load: loadJourneySnapshot,
  save: saveJourneySnapshot,
  drop: dropJourneySnapshot,
};
