import { registerGuestLeaseDataKey } from '@repo/core/native/guestLease';
import { getGuestScope, guestStorageKey } from '@repo/core/native/guestScope';
import { SafeZustandStorage } from '@repo/core/native/storageWrapper';
import * as Data from 'effect/Data';
import * as Effect from 'effect/Effect';

// Keys for MMKV storage
const GUEST_TIMETABLE_KEY = () => guestStorageKey('timetable');
const GUEST_MOOD_LOGS_KEY = () => guestStorageKey('mood-logs');
const GUEST_JOURNAL_ENTRIES_KEY = () => guestStorageKey('journal-entries');
const GUEST_CLASSROOM_DATA_KEY = () => guestStorageKey('classroom-data');
const GUEST_STUDENTS_KEY = () => guestStorageKey('students');

export class GuestStorageError extends Data.TaggedError('GuestStorageError')<{
  readonly operation: 'read' | 'write' | 'parse' | 'remove';
  readonly key: string;
  readonly cause: unknown;
}> {}

let localIdCounter = 0;
const createLocalId = () => {
  localIdCounter += 1;
  const suffix = globalThis.crypto?.randomUUID?.() ?? `seq-${localIdCounter}`;
  return `local-${Date.now()}-${suffix}`;
};

function readStorage$(key: string): Effect.Effect<string | null, GuestStorageError> {
  return Effect.tryPromise({
    try: () => SafeZustandStorage.getItem(key) as Promise<string | null>,
    catch: (cause) => new GuestStorageError({ operation: 'read', key, cause }),
  });
}

function writeStorage$(key: string, data: unknown): Effect.Effect<void, GuestStorageError> {
  return Effect.tryPromise({
    try: async () => {
      await registerGuestLeaseDataKey(getGuestScope(), key);
      await SafeZustandStorage.setItem(key, JSON.stringify(data) ?? '');
    },
    catch: (cause) => new GuestStorageError({ operation: 'write', key, cause }),
  });
}

function parseArray$<T>(data: string, key: string): Effect.Effect<T[], GuestStorageError> {
  return Effect.try({
    try: () => JSON.parse(data) as T[],
    catch: (cause) => new GuestStorageError({ operation: 'parse', key, cause }),
  });
}

export interface GuestTimetablePeriod {
  localId: string;
  day_of_week: number;
  period_number: number;
  subject: string;
  class_name: string;
  type: 'subject' | 'relief' | 'interval';
  start_time: string;
  end_time: string;
}

export interface GuestMoodLog {
  localId: string;
  mood: number;
  note?: string;
  timestamp: string;
}

export interface GuestJournalEntry {
  localId: string;
  content: string;
  timestamp: string;
}

export interface GuestStudent {
  localId: string;
  name: string;
  index_number: string;
  notes?: string;
}

export class GuestDataManager {
  static async getTimetable(dayOfWeek: number): Promise<GuestTimetablePeriod[]> {
    return Effect.runPromise(
      readStorage$(GUEST_TIMETABLE_KEY()).pipe(
        Effect.flatMap((data) => {
          if (!data) return Effect.succeed([]);
          return parseArray$<GuestTimetablePeriod>(data, GUEST_TIMETABLE_KEY()).pipe(
            Effect.map((allPeriods) => allPeriods.filter((p) => p.day_of_week === dayOfWeek)),
          );
        }),
        Effect.catchAll(() => Effect.succeed([])),
      ),
    );
  }

  static async addTimetablePeriod(
    period: Omit<GuestTimetablePeriod, 'localId'>,
  ): Promise<GuestTimetablePeriod> {
    return Effect.runPromise(
      Effect.gen(function* () {
        const data = yield* readStorage$(GUEST_TIMETABLE_KEY());
        const allPeriods = data
          ? yield* parseArray$<GuestTimetablePeriod>(data, GUEST_TIMETABLE_KEY())
          : [];

        const newPeriod: GuestTimetablePeriod = {
          ...period,
          localId: createLocalId(),
        };

        allPeriods.push(newPeriod);
        yield* writeStorage$(GUEST_TIMETABLE_KEY(), allPeriods);
        return newPeriod;
      }).pipe(
        Effect.catchAll((e) =>
          Effect.sync(() => {
            console.error('Failed to add guest timetable period:', e);
            throw e;
          }),
        ),
      ),
    );
  }

  static async updateTimetablePeriod(
    localId: string,
    updates: Partial<GuestTimetablePeriod>,
  ): Promise<void> {
    return Effect.runPromise(
      Effect.gen(function* () {
        const data = yield* readStorage$(GUEST_TIMETABLE_KEY());
        if (!data) return;

        const allPeriods = yield* parseArray$<GuestTimetablePeriod>(data, GUEST_TIMETABLE_KEY());
        const index = allPeriods.findIndex((p) => p.localId === localId);

        if (index !== -1) {
          allPeriods[index] = { ...allPeriods[index], ...updates } as GuestTimetablePeriod;
          yield* writeStorage$(GUEST_TIMETABLE_KEY(), allPeriods);
        }
      }).pipe(
        Effect.catchAll((e) =>
          Effect.sync(() => {
            console.error('Failed to update guest timetable period:', e);
            throw e;
          }),
        ),
      ),
    );
  }

  static async deleteTimetablePeriod(localId: string): Promise<void> {
    return Effect.runPromise(
      Effect.gen(function* () {
        const data = yield* readStorage$(GUEST_TIMETABLE_KEY());
        if (!data) return;

        const allPeriods = yield* parseArray$<GuestTimetablePeriod>(data, GUEST_TIMETABLE_KEY());
        const filtered = allPeriods.filter((p) => p.localId !== localId);
        yield* writeStorage$(GUEST_TIMETABLE_KEY(), filtered);
      }).pipe(
        Effect.catchAll((e) =>
          Effect.sync(() => {
            console.error('Failed to delete guest timetable period:', e);
            throw e;
          }),
        ),
      ),
    );
  }

  static async getMoodLogs(): Promise<GuestMoodLog[]> {
    return Effect.runPromise(
      readStorage$(GUEST_MOOD_LOGS_KEY()).pipe(
        Effect.flatMap((data) =>
          data ? parseArray$<GuestMoodLog>(data, GUEST_MOOD_LOGS_KEY()) : Effect.succeed([]),
        ),
        Effect.catchAll(() => Effect.succeed([])),
      ),
    );
  }

  static async addMoodLog(mood: number, note?: string): Promise<GuestMoodLog> {
    return Effect.runPromise(
      Effect.gen(function* () {
        const data = yield* readStorage$(GUEST_MOOD_LOGS_KEY());
        const logs = data ? yield* parseArray$<GuestMoodLog>(data, GUEST_MOOD_LOGS_KEY()) : [];

        const newLog: GuestMoodLog = {
          localId: createLocalId(),
          mood,
          note,
          timestamp: new Date().toISOString(),
        };

        logs.push(newLog);
        yield* writeStorage$(GUEST_MOOD_LOGS_KEY(), logs);
        return newLog;
      }).pipe(
        Effect.catchAll((e) =>
          Effect.sync(() => {
            console.error('Failed to add guest mood log:', e);
            throw e;
          }),
        ),
      ),
    );
  }

  static async getJournalEntries(): Promise<GuestJournalEntry[]> {
    return Effect.runPromise(
      readStorage$(GUEST_JOURNAL_ENTRIES_KEY()).pipe(
        Effect.flatMap((data) =>
          data
            ? parseArray$<GuestJournalEntry>(data, GUEST_JOURNAL_ENTRIES_KEY())
            : Effect.succeed([]),
        ),
        Effect.catchAll(() => Effect.succeed([])),
      ),
    );
  }

  static async addJournalEntry(content: string): Promise<GuestJournalEntry> {
    return Effect.runPromise(
      Effect.gen(function* () {
        const data = yield* readStorage$(GUEST_JOURNAL_ENTRIES_KEY());
        const entries = data
          ? yield* parseArray$<GuestJournalEntry>(data, GUEST_JOURNAL_ENTRIES_KEY())
          : [];

        const newEntry: GuestJournalEntry = {
          localId: createLocalId(),
          content,
          timestamp: new Date().toISOString(),
        };

        entries.push(newEntry);
        yield* writeStorage$(GUEST_JOURNAL_ENTRIES_KEY(), entries);
        return newEntry;
      }).pipe(
        Effect.catchAll((e) =>
          Effect.sync(() => {
            console.error('Failed to add guest journal entry:', e);
            throw e;
          }),
        ),
      ),
    );
  }

  static async getStudents(): Promise<GuestStudent[]> {
    return Effect.runPromise(
      readStorage$(GUEST_STUDENTS_KEY()).pipe(
        Effect.flatMap((data) =>
          data ? parseArray$<GuestStudent>(data, GUEST_STUDENTS_KEY()) : Effect.succeed([]),
        ),
        Effect.catchAll(() => Effect.succeed([])),
      ),
    );
  }

  static async addStudents(students: Omit<GuestStudent, 'localId'>[]): Promise<GuestStudent[]> {
    return Effect.runPromise(
      Effect.gen(function* () {
        const data = yield* readStorage$(GUEST_STUDENTS_KEY());
        const existing = data ? yield* parseArray$<GuestStudent>(data, GUEST_STUDENTS_KEY()) : [];

        const newStudents = students.map((s) => ({ ...s, localId: createLocalId() }));

        const updated = [...existing, ...newStudents];
        yield* writeStorage$(GUEST_STUDENTS_KEY(), updated);
        return newStudents;
      }).pipe(
        Effect.catchAll((e) =>
          Effect.sync(() => {
            console.error('Failed to add guest students:', e);
            throw e;
          }),
        ),
      ),
    );
  }

  static async getDataSummary(): Promise<{
    timetablePeriods: number;
    moodLogs: number;
    journalEntries: number;
    students: number;
  }> {
    const [timetableData, moodData, journalData, studentData] = await Promise.all([
      SafeZustandStorage.getItem(GUEST_TIMETABLE_KEY()),
      SafeZustandStorage.getItem(GUEST_MOOD_LOGS_KEY()),
      SafeZustandStorage.getItem(GUEST_JOURNAL_ENTRIES_KEY()),
      SafeZustandStorage.getItem(GUEST_STUDENTS_KEY()),
    ]);

    return {
      timetablePeriods: timetableData ? JSON.parse(timetableData).length : 0,
      moodLogs: moodData ? JSON.parse(moodData).length : 0,
      journalEntries: journalData ? JSON.parse(journalData).length : 0,
      students: studentData ? JSON.parse(studentData).length : 0,
    };
  }

  static async clearAllGuestData(): Promise<void> {
    await Promise.all([
      SafeZustandStorage.removeItem(GUEST_TIMETABLE_KEY()),
      SafeZustandStorage.removeItem(GUEST_MOOD_LOGS_KEY()),
      SafeZustandStorage.removeItem(GUEST_JOURNAL_ENTRIES_KEY()),
      SafeZustandStorage.removeItem(GUEST_STUDENTS_KEY()),
      SafeZustandStorage.removeItem(GUEST_CLASSROOM_DATA_KEY()),
    ]);
  }

  static async exportAllData(): Promise<{
    timetable: GuestTimetablePeriod[];
    moodLogs: GuestMoodLog[];
    journalEntries: GuestJournalEntry[];
    students: GuestStudent[];
  }> {
    const [timetableData, moodData, journalData, studentData] = await Promise.all([
      SafeZustandStorage.getItem(GUEST_TIMETABLE_KEY()),
      SafeZustandStorage.getItem(GUEST_MOOD_LOGS_KEY()),
      SafeZustandStorage.getItem(GUEST_JOURNAL_ENTRIES_KEY()),
      SafeZustandStorage.getItem(GUEST_STUDENTS_KEY()),
    ]);

    return {
      timetable: timetableData ? JSON.parse(timetableData) : [],
      moodLogs: moodData ? JSON.parse(moodData) : [],
      journalEntries: journalData ? JSON.parse(journalData) : [],
      students: studentData ? JSON.parse(studentData) : [],
    };
  }
}
