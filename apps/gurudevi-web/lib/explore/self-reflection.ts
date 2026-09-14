import { createExploreStorage } from './storage';
import {
  type CreateExploreJournalEntryInput,
  type DeleteExploreJournalEntryInput,
  EXPLORE_BASELINE_VERSION,
  EXPLORE_STATE_SCHEMA_VERSION,
  type ExploreAdapterOptions,
  type ExploreJournalEntry,
  type ExploreSelfReflectionAdapter,
  type ExploreState,
  type ExploreStorage,
  type UpdateExploreJournalEntryInput,
} from './types';

export const EXPLORE_SELF_STORAGE_KEY = 'gurudevi:explore:v1:self-reflection';
const MAX_JOURNAL_CONTENT_LENGTH = 10_000;
let fallbackIdSequence = 0;

function createBaselineState(now: Date): ExploreState {
  const seededAt = now.toISOString();

  return {
    schemaVersion: EXPLORE_STATE_SCHEMA_VERSION,
    baselineVersion: EXPLORE_BASELINE_VERSION,
    seededAt,
    self: {
      journalEntries: [
        {
          id: 'baseline-arrival-reflection',
          content: 'What would make this moment feel a little more spacious?',
          createdAt: seededAt,
          provenance: 'baseline',
        },
      ],
    },
  };
}

function isDate(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

function isJournalEntry(value: unknown): value is ExploreJournalEntry {
  if (typeof value !== 'object' || value === null) return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.id === 'string' &&
    typeof entry.content === 'string' &&
    isDate(entry.createdAt) &&
    (entry.provenance === 'baseline' || entry.provenance === 'explorer')
  );
}

function isExploreState(value: unknown): value is ExploreState {
  if (typeof value !== 'object' || value === null) return false;
  const state = value as Record<string, unknown>;
  if (
    state.schemaVersion !== EXPLORE_STATE_SCHEMA_VERSION ||
    state.baselineVersion !== EXPLORE_BASELINE_VERSION ||
    !isDate(state.seededAt) ||
    typeof state.self !== 'object' ||
    state.self === null
  ) {
    return false;
  }

  const self = state.self as Record<string, unknown>;
  return Array.isArray(self.journalEntries) && self.journalEntries.every(isJournalEntry);
}

function parseStoredState(value: string | null): ExploreState | null {
  if (value === null) return null;

  try {
    const parsed: unknown = JSON.parse(value);
    return isExploreState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function defaultId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') return globalThis.crypto.randomUUID();
  fallbackIdSequence += 1;
  return `explore-fallback-${fallbackIdSequence}`;
}

function normalizeJournalInput(input: CreateExploreJournalEntryInput): string {
  const content = input.content.trim();
  if (content.length === 0)
    throw new Error('A reflection needs some words before it can be saved.');
  if (content.length > MAX_JOURNAL_CONTENT_LENGTH) {
    throw new Error(`A reflection can contain up to ${MAX_JOURNAL_CONTENT_LENGTH} characters.`);
  }
  return content;
}

function writeState(storage: ExploreStorage, state: ExploreState): void {
  storage.setItem(EXPLORE_SELF_STORAGE_KEY, JSON.stringify(state));
}

function findEditableEntry(state: ExploreState, id: string): ExploreJournalEntry {
  const entry = state.self.journalEntries.find((candidate) => candidate.id === id);
  if (entry === undefined) throw new Error('That reflection is no longer available.');
  if (entry.provenance !== 'explorer') {
    throw new Error('Sample reflections cannot be changed. Reset Explore to restore them.');
  }
  return entry;
}

/**
 * A truthful local adapter for the first Explore vertical slice. It performs
 * no authentication, network request, sync, or outbox write.
 */
export function createExploreSelfReflectionAdapter(
  options: ExploreAdapterOptions = {},
): ExploreSelfReflectionAdapter {
  const storage = options.storage ?? createExploreStorage();
  const now = options.now ?? (() => new Date());
  const createId = options.createId ?? defaultId;

  const load = (): ExploreState => {
    const stored = parseStoredState(storage.getItem(EXPLORE_SELF_STORAGE_KEY));
    if (stored !== null) return stored;

    const baseline = createBaselineState(now());
    writeState(storage, baseline);
    return baseline;
  };

  return {
    storageKind: storage.kind,
    load,
    addJournalEntry: (input) => {
      const current = load();
      const entry: ExploreJournalEntry = {
        id: createId(),
        content: normalizeJournalInput(input),
        createdAt: now().toISOString(),
        provenance: 'explorer',
      };
      const next: ExploreState = {
        ...current,
        self: { journalEntries: [entry, ...current.self.journalEntries] },
      };
      writeState(storage, next);
      return next;
    },
    updateJournalEntry: (input: UpdateExploreJournalEntryInput) => {
      const current = load();
      const existing = findEditableEntry(current, input.id);
      const updated: ExploreJournalEntry = { ...existing, content: normalizeJournalInput(input) };
      const next: ExploreState = {
        ...current,
        self: {
          journalEntries: current.self.journalEntries.map((entry) =>
            entry.id === updated.id ? updated : entry,
          ),
        },
      };
      writeState(storage, next);
      return next;
    },
    deleteJournalEntry: (input: DeleteExploreJournalEntryInput) => {
      const current = load();
      findEditableEntry(current, input.id);
      const next: ExploreState = {
        ...current,
        self: {
          journalEntries: current.self.journalEntries.filter((entry) => entry.id !== input.id),
        },
      };
      writeState(storage, next);
      return next;
    },
    reset: () => {
      storage.removeItem(EXPLORE_SELF_STORAGE_KEY);
      const baseline = createBaselineState(now());
      writeState(storage, baseline);
      return baseline;
    },
    exportForAccountConversion: load,
  };
}
