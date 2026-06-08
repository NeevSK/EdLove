import { moodLogs } from '@repo/core/adapters/powersync/schema';
import { supabase } from '@repo/core/api';
import { applyTemporalFilter, getTemporalRange } from '@repo/core/logic';
import { getDrizzleDB } from '@repo/core/powersync';
import { desc, eq } from 'drizzle-orm';
import { Platform } from 'react-native';

import type { FireJournalEntry, MoodLog } from '../types';
import { selfAPI } from './self';

const MOOD_SEQUENCE: NonNullable<MoodLog['mood']>[] = [
  'joyful',
  'calm',
  'curious',
  'anxious',
  'frustrated',
  'sad',
];

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
    } catch (err) {
      console.warn(
        '[WellbeingRepository] Local Drizzle mood log fetch failed. Falling back to RPC API.',
        err,
      );
    }
  }

  // Fallback / Web path:
  let query = supabase.from('mood_logs').select('*').eq('user_id', userId);

  query = applyTemporalFilter(query, {
    column: 'created_at',
    mode: 'event_time',
    capability: 'event_stream',
  });

  if (options.phase === 'present') {
    query = query.order('created_at', { ascending: false }).limit(30);
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data ?? []).map((entry) => ({
    ...entry,
    mood_score: normalizeMoodScore(entry.mood_score),
    mood: (entry.mood as MoodLog['mood'] | null | undefined) ?? scoreToMood(entry.mood_score),
  }));
}

export async function createMoodLog(
  userId: string,
  mood: MoodLog['mood'],
  note?: string,
): Promise<MoodLog> {
  if (Platform.OS !== 'web') {
    try {
      const db = getDrizzleDB();
      const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
      const score = moodToScore(mood);
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

      // Outbox Sync Queue enrollment
      const { useMutationQueue } = await import('@repo/core');
      await useMutationQueue.getState().addToQueue({
        name: 'logMood',
        scope: 'wellbeing',
        variables: {
          id,
          user_id: userId,
          mood_score: score,
          mood,
          note,
          created_at: createdAt,
        },
        type: 'CUSTOM',
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
      console.warn(
        '[WellbeingRepository] Local SQLite insert failed. Falling back to RPC API.',
        err,
      );
    }
  }

  // Web / Fallback RPC path:
  const entry = await selfAPI.logMood(userId, moodToScore(mood), note, mood);

  return {
    ...entry,
    mood_score: normalizeMoodScore(entry.mood_score),
    mood: (entry.mood as MoodLog['mood'] | null | undefined) ?? mood,
  };
}

export async function fetchFireJournalHistoryForView(
  userId: string,
  options: { viewDate: string; isPastView: boolean },
): Promise<FireJournalEntry[]> {
  // Fire journal is fully transient/private by design and bypassed in SQLite schema.
  // We fetch directly from the remote database or local temporal caching state.
  let query = supabase.from('fire_journal').select('*').eq('user_id', userId);

  if (options.isPastView) {
    const range = getTemporalRange(options.viewDate, 'day');
    query = query.gte('created_at', range.start).lte('created_at', range.end);
  } else {
    query = query.order('created_at', { ascending: false }).limit(10);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data ?? [];
}

export async function burnFireJournalEntry(
  userId: string,
  content: string,
): Promise<FireJournalEntry> {
  if (Platform.OS !== 'web') {
    const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
    const createdAt = new Date().toISOString();
    const entry: FireJournalEntry = {
      id,
      user_id: userId,
      content_preview: content.substring(0, 50),
      is_burned: true,
      created_at: createdAt,
    };

    // Queued outbox synchronization to Hono API
    const { useMutationQueue } = await import('@repo/core');
    await useMutationQueue.getState().addToQueue({
      name: 'burnJournal',
      scope: 'wellbeing',
      variables: {
        id,
        user_id: userId,
        content,
        created_at: createdAt,
      },
      type: 'CUSTOM',
    });

    return entry;
  }

  return selfAPI.burnJournal(userId, content);
}
