import { applyTemporalFilter, getTemporalRange } from '@repo/core';
import { supabase } from '@repo/core/api';;

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
  return selfAPI.burnJournal(userId, content);
}
