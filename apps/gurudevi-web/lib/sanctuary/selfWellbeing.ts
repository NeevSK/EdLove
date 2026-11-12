import type { MoodLog, MoodValue } from '@repo/core/types/Wellbeing';
import { requestAccountSelfProcedure } from './selfApiClient';

export const MOOD_CHOICES = [
  { emoji: '😞', label: 'Sad', score: 1, value: 'sad' },
  { emoji: '😤', label: 'Frustrated', score: 2, value: 'frustrated' },
  { emoji: '😰', label: 'Anxious', score: 3, value: 'anxious' },
  { emoji: '🧘', label: 'Calm', score: 4, value: 'calm' },
  { emoji: '🧐', label: 'Curious', score: 4, value: 'curious' },
  { emoji: '✨', label: 'Joyful', score: 5, value: 'joyful' },
] as const satisfies ReadonlyArray<{ emoji: string; label: string; score: number; value: MoodValue }>;

function isMoodLog(value: unknown): value is MoodLog {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.id === 'string' &&
    typeof entry.user_id === 'string' &&
    typeof entry.mood_score === 'number' &&
    (entry.mood === null || entry.mood === undefined || MOOD_CHOICES.some((c) => c.value === entry.mood)) &&
    (typeof entry.note === 'string' || entry.note === null || entry.note === undefined) &&
    typeof entry.created_at === 'string'
  );
}

export async function loadMoodHistory(limit = 8): Promise<readonly MoodLog[]> {
  const entries = await requestAccountSelfProcedure(
    'getMoodHistory',
    { query: { limit } },
    (value): value is unknown[] => Array.isArray(value),
    'Sanctuary returned an invalid Mood Lotus response.',
  );
  // One unreadable entry (a mood this app doesn't know) is skipped, not allowed to hide the rest.
  return entries.filter(isMoodLog);
}

export function logMood(input: Readonly<{ mood: MoodValue; note?: string }>): Promise<MoodLog> {
  const choice = MOOD_CHOICES.find((candidate) => candidate.value === input.mood);
  if (!choice) throw new Error('Choose how you are feeling before saving this check-in.');
  return requestAccountSelfProcedure(
    'logMood',
    (authenticatedUserId) => ({
      body: {
        user_id: authenticatedUserId,
        mood: choice.value,
        mood_score: choice.score,
        note: input.note?.trim() || null,
      },
    }),
    isMoodLog,
    'Sanctuary returned an invalid Mood Lotus response.',
  );
}
