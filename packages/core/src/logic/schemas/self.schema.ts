import { makeModelSchema } from '@repo/schema';
import type { z } from 'zod';

/**
 * MoodLogSchema - A signal of internal state.
 * Derived from ZenStack MoodLog model.
 */
export const MoodLogSchema = makeModelSchema('MoodLog');

/**
 * FireJournalEntrySchema - A moment released to the flames.
 * Derived from ZenStack FireJournalEntry model.
 */
export const FireJournalEntrySchema = makeModelSchema('FireJournalEntry');

/**
 * ThoughtRecordSchema - A structured CBT-style thought record.
 * Derived from ZenStack ThoughtRecord model.
 */
export const ThoughtRecordSchema = makeModelSchema('ThoughtRecord');

/**
 * UserPreferencesSchema - Customizing the sanctuary experience.
 * Derived from ZenStack UserPreferences model.
 */
export const UserPreferencesSchema = makeModelSchema('UserPreferences');

export type MoodLog = z.infer<typeof MoodLogSchema>;
export type FireJournalEntry = z.infer<typeof FireJournalEntrySchema>;
export type ThoughtRecord = z.infer<typeof ThoughtRecordSchema>;
export type SelfUserPreferences = z.infer<typeof UserPreferencesSchema>;
