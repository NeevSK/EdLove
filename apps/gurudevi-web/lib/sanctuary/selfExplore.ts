import {
  createPersistenceIdentity,
  derivePersistenceKey,
  resolvePersistenceWriteDecision,
} from '@repo/core/lib/persistenceBoundary';
import type { WorkbenchRestorationSnapshot } from '@repo/core/types';
import type { WorkbenchStorage } from '@/lib/workbench';
import { parseWorkbenchSnapshot } from '@/lib/workbench/storage';
import { createExploreStorage } from '../explore/storage';
import type { ExploreStorage } from '../explore/types';
import type { BurnedJournalEntry } from './selfJournal';
import { MOOD_CHOICES, type MoodLog, type MoodValue } from './selfWellbeing';

const exploreIdentity = createPersistenceIdentity({
  experience: 'explore',
  principal: { kind: 'guest', id: 'browser-explorer' },
});
const journalKey = derivePersistenceKey(exploreIdentity, 'self:fire_journal');
const moodKey = derivePersistenceKey(exploreIdentity, 'self:mood_lotus');
const workbenchKey = derivePersistenceKey(exploreIdentity, 'workbench:self');
const LOCAL_SCHEMA_VERSION = 1;

export type ExploreJournalEntry = BurnedJournalEntry & Readonly<{ source: 'sample' | 'explore' }>;
export type ExploreMoodLog = MoodLog & Readonly<{ source: 'sample' | 'explore' }>;

type LocalCollection<T> = Readonly<{ version: 1; entries: readonly T[] }>;

export type ExploreSelfPracticeAdapter = Readonly<{
  loadJournal(): readonly ExploreJournalEntry[];
  burnJournal(content: string): ExploreJournalEntry;
  loadMoodHistory(): readonly ExploreMoodLog[];
  logMood(input: Readonly<{ mood: MoodValue; note?: string }>): ExploreMoodLog;
  reset(): void;
}>;

function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `explore-${Date.now()}-${Math.random()}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isDate(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

function isJournalEntry(value: unknown): value is ExploreJournalEntry {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.content_preview === 'string' &&
    isDate(value.created_at) &&
    value.is_burned === true &&
    (value.source === 'sample' || value.source === 'explore')
  );
}

function isMoodEntry(value: unknown): value is ExploreMoodLog {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.mood_score === 'number' &&
    typeof value.mood === 'string' &&
    (value.note === null || typeof value.note === 'string') &&
    isDate(value.created_at) &&
    (value.source === 'sample' || value.source === 'explore')
  );
}

function parseCollection<T>(
  raw: string | null,
  isEntry: (entry: unknown) => entry is T,
): LocalCollection<T> | null {
  if (raw === null) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(
      'Explore data could not be read. It was left untouched; reset Explore to begin again.',
    );
  }
  if (
    !isRecord(parsed) ||
    parsed.version !== LOCAL_SCHEMA_VERSION ||
    !Array.isArray(parsed.entries)
  ) {
    throw new Error('Explore data uses an unsupported format. It was left untouched.');
  }
  if (!parsed.entries.every(isEntry)) {
    throw new Error('Explore data failed validation. It was left untouched.');
  }
  return { version: LOCAL_SCHEMA_VERSION, entries: parsed.entries };
}

function readCollection<T>(
  storage: ExploreStorage,
  key: string,
  isEntry: (entry: unknown) => entry is T,
  createSample: (now: Date) => readonly T[],
  now: () => Date,
): LocalCollection<T> {
  const existing = parseCollection(storage.getItem(key), isEntry);
  if (existing) return existing;
  const initialized = { version: LOCAL_SCHEMA_VERSION, entries: createSample(now()) } as const;
  storage.setItem(key, JSON.stringify(initialized));
  return initialized;
}

function assertLocalExploreWrite(): void {
  const local = resolvePersistenceWriteDecision(exploreIdentity, 'local');
  const cloud = resolvePersistenceWriteDecision(exploreIdentity, 'production');
  if (!local.allowed || cloud.allowed) throw new Error('Explore writes must stay on this browser.');
}

function createSampleJournal(now: Date): readonly ExploreJournalEntry[] {
  return [
    {
      id: 'sample-fire-journal-entry',
      content_preview: 'I can set down one thing I cannot solve today.',
      created_at: now.toISOString(),
      is_burned: true,
      source: 'sample',
    },
  ];
}

function createSampleMood(now: Date): readonly ExploreMoodLog[] {
  return [
    {
      id: 'sample-mood-lotus-entry',
      user_id: 'explore-local',
      mood_score: 4,
      mood: 'calm',
      note: null,
      created_at: now.toISOString(),
      source: 'sample',
    },
  ];
}

function store<T>(storage: ExploreStorage, key: string, entries: readonly T[]): LocalCollection<T> {
  const collection = { version: LOCAL_SCHEMA_VERSION, entries } as const;
  storage.setItem(key, JSON.stringify(collection));
  return collection;
}

export function createExploreSelfPracticeAdapter(
  options: { storage?: ExploreStorage; now?: () => Date; createId?: () => string } = {},
): ExploreSelfPracticeAdapter {
  const storage = options.storage ?? createExploreStorage();
  const now = options.now ?? (() => new Date());
  const createId = options.createId ?? newId;
  const journal = () =>
    readCollection(storage, journalKey, isJournalEntry, createSampleJournal, now);
  const moods = () => readCollection(storage, moodKey, isMoodEntry, createSampleMood, now);

  return {
    loadJournal: () => journal().entries,
    burnJournal: (content) => {
      assertLocalExploreWrite();
      const normalized = content.trim();
      if (!normalized) throw new Error('Write a few words before releasing this reflection.');
      const previous = journal().entries;
      const entry: ExploreJournalEntry = {
        id: createId(),
        content_preview: normalized.slice(0, 50),
        created_at: now().toISOString(),
        is_burned: true,
        source: 'explore',
      };
      store(storage, journalKey, [entry, ...previous]);
      return entry;
    },
    loadMoodHistory: () => moods().entries,
    logMood: ({ mood, note }) => {
      assertLocalExploreWrite();
      const choice = MOOD_CHOICES.find((candidate) => candidate.value === mood);
      if (!choice) throw new Error('Choose how you are feeling before saving this check-in.');
      const entry: ExploreMoodLog = {
        id: createId(),
        user_id: 'explore-local',
        mood_score: choice.score,
        mood: choice.value,
        note: note?.trim() || null,
        created_at: now().toISOString(),
        source: 'explore',
      };
      store(storage, moodKey, [entry, ...moods().entries]);
      return entry;
    },
    reset: () => {
      assertLocalExploreWrite();
      storage.removeItem(journalKey);
      storage.removeItem(moodKey);
    },
  };
}

export function createExploreSelfWorkbenchStorage(storage: ExploreStorage): WorkbenchStorage {
  return {
    load: (domain) => {
      if (domain !== 'self') return null;
      return parseWorkbenchSnapshot(storage.getItem(workbenchKey), domain);
    },
    save: (snapshot: WorkbenchRestorationSnapshot) => {
      if (snapshot.domain !== 'self') return;
      assertLocalExploreWrite();
      storage.setItem(workbenchKey, JSON.stringify(snapshot));
    },
  };
}

export function isExploreSelfEntry(entry: ExploreJournalEntry | ExploreMoodLog): boolean {
  return entry.source === 'explore';
}
