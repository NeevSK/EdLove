import { Effect } from 'effect';
import { guestStorageKey } from '@repo/core/native/guestScope';
import { SafeZustandStorage } from '@repo/core/native/storageWrapper';
import { tryPromise } from '@repo/core/utils/effect';

// Keys for MMKV storage
const GUEST_TIMETABLE_KEY = () => guestStorageKey('timetable');
const GUEST_MOOD_LOGS_KEY = () => guestStorageKey('mood-logs');
const GUEST_JOURNAL_ENTRIES_KEY = () => guestStorageKey('journal-entries');
const GUEST_CLASSROOM_DATA_KEY = () => guestStorageKey('classroom-data');
const GUEST_STUDENTS_KEY = () => guestStorageKey('students');

let localIdCounter = 0;
const createLocalId = () => {
  localIdCounter += 1;
  const suffix = globalThis.crypto?.randomUUID?.() ?? `seq-${localIdCounter}`;
  return `local-${Date.now()}-${suffix}`;
};

function readStorage$(key: string): Effect.Effect<string | null> {
  return Effect.tryPromise(() => SafeZustandStorage.getItem(key) as Promise<string | null>).pipe(
    Effect.catchAll((e) =>
      Effect.sync(() => {
        console.error(`[GuestDataManager] Failed to read ${key}:`, e);
        return null;
      }),
    ),
  );
}

function writeStorage$(key: string, data: unknown): Effect.Effect<void> {
  return tryPromise(async () => {
    await SafeZustandStorage.setItem(key, JSON.stringify(data) ?? '');
  }).pipe(
    Effect.catchAll((e) =>
      Effect.sync(() => {
        console.error(`[GuestDataManager] Failed to write ${key}:`, e);
      }),
    ),
  );
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

/**
 * Guest Data Manager
 * Handles local storage for anonymous users using MMKV
 * Data is stored locally. Conversion may explicitly migrate it to a durable
 * account after signup; anonymous sessions never enter PowerSync.
 */
export class GuestDataManager {
  // ============ Timetable Methods ============

  static async getTimetable(dayOfWeek: number): Promise<GuestTimetablePeriod[]> {
    return Effect.runPromise(
      readStorage$(GUEST_TIMETABLE_KEY()).pipe(
        Effect.map((data) => {
          if (!data) return [];
          const allPeriods: GuestTimetablePeriod[] = JSON.parse(data);
          return allPeriods.filter((p) => p.day_of_week === dayOfWeek);
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
        const allPeriods: GuestTimetablePeriod[] = data ? JSON.parse(data) : [];

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

        const allPeriods: GuestTimetablePeriod[] = JSON.parse(data);
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

        const allPeriods: GuestTimetablePeriod[] = JSON.parse(data);
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

  // ============ Mood Log Methods ============

  static async getMoodLogs(): Promise<GuestMoodLog[]> {
    return Effect.runPromise(
      readStorage$(GUEST_MOOD_LOGS_KEY()).pipe(
        Effect.map((data) => (data ? JSON.parse(data) : [])),
        Effect.catchAll(() => Effect.succeed([])),
      ),
    );
  }

  static async addMoodLog(mood: number, note?: string): Promise<GuestMoodLog> {
    return Effect.runPromise(
      Effect.gen(function* () {
        const data = yield* readStorage$(GUEST_MOOD_LOGS_KEY());
        const logs: GuestMoodLog[] = data ? JSON.parse(data) : [];

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

  // ============ Journal Entry Methods ============

  static async getJournalEntries(): Promise<GuestJournalEntry[]> {
    return Effect.runPromise(
      readStorage$(GUEST_JOURNAL_ENTRIES_KEY()).pipe(
        Effect.map((data) => (data ? JSON.parse(data) : [])),
        Effect.catchAll(() => Effect.succeed([])),
      ),
    );
  }

  static async addJournalEntry(content: string): Promise<GuestJournalEntry> {
    return Effect.runPromise(
      Effect.gen(function* () {
        const data = yield* readStorage$(GUEST_JOURNAL_ENTRIES_KEY());
        const entries: GuestJournalEntry[] = data ? JSON.parse(data) : [];

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

  // ============ Student Methods ============

  static async getStudents(): Promise<GuestStudent[]> {
    return Effect.runPromise(
      readStorage$(GUEST_STUDENTS_KEY()).pipe(
        Effect.map((data) => (data ? JSON.parse(data) : [])),
        Effect.catchAll(() => Effect.succeed([])),
      ),
    );
  }

  static async addStudents(students: Omit<GuestStudent, 'localId'>[]): Promise<GuestStudent[]> {
    return Effect.runPromise(
      Effect.gen(function* () {
        const data = yield* readStorage$(GUEST_STUDENTS_KEY());
        const existing: GuestStudent[] = data ? JSON.parse(data) : [];

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

  // ============ Data Summary & Clearing ============

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

  // ============ Data Export (for sync) ============

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
