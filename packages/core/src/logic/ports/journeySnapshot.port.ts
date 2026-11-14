import type { WorkspaceRolePersona } from '@repo/core/types';

/** Where a role journey's persisted actor snapshot is kept; one that can't be read loads as null. */
export interface JourneySnapshotStore {
  load(persona: WorkspaceRolePersona): unknown | null;
  save(persona: WorkspaceRolePersona, snapshot: unknown): void;
  drop(persona: WorkspaceRolePersona): void;
}
