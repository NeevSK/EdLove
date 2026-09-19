import { requestAccountSelfProcedure } from './selfApiClient';

export const MOOD_CHOICES = [
  { emoji: '😞', label: 'Sad', score: 1, value: 'sad' },
  { emoji: '😤', label: 'Frustrated', score: 2, value: 'frustrated' },
  { emoji: '😰', label: 'Anxious', score: 3, value: 'anxious' },
  { emoji: '🧘', label: 'Calm', score: 4, value: 'calm' },
  { emoji: '🧐', label: 'Curious', score: 4, value: 'curious' },
  { emoji: '✨', label: 'Joyful', score: 5, value: 'joyful' },
] as const;

export type MoodValue = (typeof MOOD_CHOICES)[number]['value'];

export type MoodLog = Readonly<{
  id: string;
  user_id: string;
  mood_score: number;
  mood: string | null;
  note: string | null;
  created_at: string;
}>;

function isMoodLog(value: unknown): value is MoodLog {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.id === 'string' &&
    typeof entry.user_id === 'string' &&
    typeof entry.mood_score === 'number' &&
    (typeof entry.mood === 'string' || entry.mood === null) &&
    (typeof entry.note === 'string' || entry.note === null) &&
    typeof entry.created_at === 'string'
  );
}

export function loadMoodHistory(limit = 8): Promise<readonly MoodLog[]> {
  return requestAccountSelfProcedure(
    'getMoodHistory',
    { query: { limit } },
    (value): value is MoodLog[] => Array.isArray(value) && value.every(isMoodLog),
    'Sanctuary returned an invalid Mood Lotus response.',
  );
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
