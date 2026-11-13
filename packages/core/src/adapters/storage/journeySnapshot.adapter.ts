import { storage } from '@repo/core/lib/storage.adapter';
import type { JourneySnapshotStore } from '@repo/core/logic/ports/journeySnapshot.port';
import type { WorkspaceRolePersona } from '@repo/core/types';

/**
 * Where a role journey's XState snapshot is kept on the device. It stores the persisted snapshot
 * as XState writes it, which carries the machine's `{ id, version }`; whether a stored snapshot is
 * still usable is the machine's call (`roleJourneyVersions`), not this file's. Unparseable JSON is
 * dropped here.
 */

export function getJourneySnapshotStorageKey(persona: WorkspaceRolePersona): string {
  return `role_journey:v6:${persona}:snapshot`;
}

export function saveJourneySnapshot(persona: WorkspaceRolePersona, snapshot: unknown): void {
  storage.set(getJourneySnapshotStorageKey(persona), JSON.stringify(snapshot));
}

export function loadJourneySnapshot(persona: WorkspaceRolePersona): unknown | null {
  const raw = storage.getString(getJourneySnapshotStorageKey(persona));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
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
