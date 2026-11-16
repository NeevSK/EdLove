import { moodLogs } from '@repo/core/adapters/powersync/schema';
import { SafeZustandStorage } from '@repo/core/lib/storageWrapper.adapter';
import { isGuestUserId } from '@repo/core/native';
import { getDrizzleDB } from '@repo/core/powersync';
import type { FireJournalEntry, MoodLog } from '@repo/core/types/Wellbeing';
import { desc, eq } from 'drizzle-orm';
import { Platform } from 'react-native';

const MOOD_SEQUENCE: NonNullable<MoodLog['mood']>[] = [
  'joyful',
  'calm',
  'curious',
  'anxious',
  'frustrated',
  'sad',
];

async function readLocalCollection<T>(key: string): Promise<T[]> {
  try {
    const raw = await SafeZustandStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

async function writeLocalCollection<T>(key: string, records: T[]): Promise<void> {
  await SafeZustandStorage.setItem(key, JSON.stringify(records));
}

export function normalizeMoodScore(score: number | null | undefined): number {
  if (typeof score !== 'number' || Number.isNaN(score)) return 3;
  if (score < 1) return 1;
  if (score > 5) return 5;
  return Math.round(score);
}

export function scoreToMood(score: number | null | undefined): MoodLog['mood'] {
  const normalized = normalizeMoodScore(score);
  return MOOD_SEQUENCE[Math.min(normalized - 1, MOOD_SEQUENCE.length - 1)] ?? 'calm';
}

export function moodToScore(mood: MoodLog['mood'] | undefined): number {
  if (!mood) return 3;
  const index = MOOD_SEQUENCE.indexOf(mood);
  return index >= 0 ? index + 1 : 3;
}

export async function fetchMoodHistoryForView(
  userId: string,
  options: { phase: string },
): Promise<MoodLog[]> {
  if (isGuestUserId(userId)) {
    const { GuestStorage } = await import('@repo/core/native/guestStorage');
    const guestLogs = await GuestStorage.getMoodLogs();
    return guestLogs.map(
      (entry: { localId: string; mood: number; note?: string; timestamp: string }) => ({
        id: entry.localId,
        user_id: userId,
        mood_score: normalizeMoodScore(entry.mood),
        mood: scoreToMood(entry.mood),
        note: entry.note,
        created_at: entry.timestamp,
      }),
    );
  }

  if (Platform.OS !== 'web') {
    try {
      const db = getDrizzleDB();
      const rows = await db
        .select()
        .from(moodLogs)
        .where(eq(moodLogs.userId, userId))
        .orderBy(desc(moodLogs.createdAt))
        .limit(30);

      return rows.map((entry) => ({
        id: entry.id,
        user_id: entry.userId,
        mood_score: normalizeMoodScore(entry.moodScore),
        mood: (entry.mood as MoodLog['mood'] | null | undefined) ?? scoreToMood(entry.moodScore),
        note: entry.note ?? undefined,
        created_at: entry.createdAt,
      }));
    } catch {
      // Local Drizzle query failed; fall through to local collection
    }
  }

  return readLocalCollection<MoodLog>(`mood_logs:${userId}`);
}

export async function createMoodLog(
  userId: string,
  mood: MoodLog['mood'],
  note?: string,
): Promise<MoodLog> {
  const score = moodToScore(mood);

  if (isGuestUserId(userId)) {
    const { GuestStorage } = await import('@repo/core/native/guestStorage');
    const guestEntry = await GuestStorage.addMoodLog(score, note);
    return {
      id: guestEntry.localId,
      user_id: userId,
      mood_score: score,
      mood: mood ?? 'calm',
      note,
      created_at: guestEntry.timestamp,
    };
  }

  if (Platform.OS !== 'web') {
    try {
      const db = getDrizzleDB();
      const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
      const createdAt = new Date().toISOString();

      // Zero-latency local SQLite write
      await db.insert(moodLogs).values({
        id,
        userId,
        moodScore: score,
        mood: mood ?? null,
        note: note ?? null,
        createdAt,
      });

      return {
        id,
        user_id: userId,
        mood_score: score,
        mood: mood ?? 'calm',
        note,
        created_at: createdAt,
      };
    } catch (err) {
      console.warn('[WellbeingRepository] Local SQLite insert failed.', err);
    }
  }

  const record: MoodLog = {
    id: `mood_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    user_id: userId,
    mood_score: score,
    mood,
    note,
    created_at: new Date().toISOString(),
  };
  const records = await readLocalCollection<MoodLog>(`mood_logs:${userId}`);
  records.unshift(record);
  await writeLocalCollection(`mood_logs:${userId}`, records);
  return record;
}

export async function fetchFireJournalHistoryForView(
  userId: string,
  options: { viewDate: string; isPastView: boolean },
): Promise<FireJournalEntry[]> {
  if (isGuestUserId(userId)) {
    const { GuestStorage } = await import('@repo/core/native/guestStorage');
    const entries = await GuestStorage.getJournalEntries();
    return entries.map((entry: { localId: string; content: string; timestamp: string }) => ({
      id: entry.localId,
      user_id: userId,
      content_preview: entry.content.substring(0, 50),
      is_burned: true,
      created_at: entry.timestamp,
    }));
  }

  const entries = await readLocalCollection<FireJournalEntry>(`fire_journal:${userId}`);
  return entries.slice(0, 10);
}

export async function burnFireJournalEntry(
  userId: string,
  content: string,
): Promise<FireJournalEntry> {
  if (isGuestUserId(userId)) {
    const { GuestStorage } = await import('@repo/core/native/guestStorage');
    const guestEntry = await GuestStorage.addJournalEntry(content);
    return {
      id: guestEntry.localId,
      user_id: userId,
      content_preview: content.substring(0, 50),
      is_burned: true,
      created_at: guestEntry.timestamp,
    };
  }

  const record: FireJournalEntry = {
    id: `fire_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    user_id: userId,
    content_preview: content.substring(0, 50),
    is_burned: true,
    created_at: new Date().toISOString(),
  };
  const entries = await readLocalCollection<FireJournalEntry>(`fire_journal:${userId}`);
  entries.unshift(record);
  await writeLocalCollection(`fire_journal:${userId}`, entries);
  return record;
}
