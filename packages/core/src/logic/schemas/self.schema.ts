import { z } from 'zod';

export const MoodLogSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  mood_score: z.number().min(1).max(5),
  mood: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
  occurred_at: z.string().datetime(), // Event time - Added as per foundation v4
  created_at: z.string().datetime(), // Upload time
});

export const FireJournalEntrySchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  content_preview: z.string().max(50),
  is_burned: z.boolean().default(true),
  created_at: z.string().datetime(),
});

export const UserPreferencesSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  favorite_features: z.array(z.string()).default([]),
  hidden_features: z.array(z.string()).default([]),
  morning_check_time: z.string().optional().nullable(),
  afternoon_check_time: z.string().optional().nullable(),
  evening_wind_down_time: z.string().optional().nullable(),
  enable_contextual_prompts: z.boolean().default(true),
  enable_usage_tracking: z.boolean().default(true),
  updated_at: z.string().datetime(),
  created_at: z.string().datetime(),
});

export type MoodLog = z.infer<typeof MoodLogSchema>;
export type FireJournalEntry = z.infer<typeof FireJournalEntrySchema>;
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;
