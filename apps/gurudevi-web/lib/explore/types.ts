/**
 * Browser-local data contracts for the public Explore session.
 *
 * These contracts deliberately describe only records that can be truthful in
 * a private browser session. They contain no account identity, sync queue, or
 * remote mutation metadata.
 */

export const EXPLORE_STATE_SCHEMA_VERSION = 1 as const;
export const EXPLORE_BASELINE_VERSION = '2026-09-14' as const;

export type ExploreStorageKind = 'local-storage' | 'memory';

export interface ExploreJournalEntry {
  readonly id: string;
  readonly content: string;
  readonly createdAt: string;
  readonly provenance: 'baseline' | 'explorer';
}

export interface ExploreSelfData {
  readonly journalEntries: readonly ExploreJournalEntry[];
}

export interface ExploreState {
  readonly schemaVersion: typeof EXPLORE_STATE_SCHEMA_VERSION;
  readonly baselineVersion: typeof EXPLORE_BASELINE_VERSION;
  readonly seededAt: string;
  readonly self: ExploreSelfData;
}

export interface CreateExploreJournalEntryInput {
  readonly content: string;
}

export interface UpdateExploreJournalEntryInput extends CreateExploreJournalEntryInput {
  readonly id: string;
}

export interface DeleteExploreJournalEntryInput {
  readonly id: string;
}

export interface ExploreStorage {
  readonly kind: ExploreStorageKind;
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface ExploreSelfReflectionAdapter {
  readonly storageKind: ExploreStorageKind;
  load(): ExploreState;
  addJournalEntry(input: CreateExploreJournalEntryInput): ExploreState;
  updateJournalEntry(input: UpdateExploreJournalEntryInput): ExploreState;
  deleteJournalEntry(input: DeleteExploreJournalEntryInput): ExploreState;
  reset(): ExploreState;
  exportForAccountConversion(): ExploreState;
}

export interface ExploreAdapterOptions {
  readonly storage?: ExploreStorage;
  readonly now?: () => Date;
  readonly createId?: () => string;
}
