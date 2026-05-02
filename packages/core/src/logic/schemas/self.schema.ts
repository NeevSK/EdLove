import { z } from 'zod';
import { makeModelSchema } from '../generated/zod';

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
 * UserPreferencesSchema - Customizing the sanctuary experience.
 * Derived from ZenStack UserPreferences model.
 */
export const UserPreferencesSchema = makeModelSchema('UserPreferences');

export type MoodLog = z.infer<typeof MoodLogSchema>;
export type FireJournalEntry = z.infer<typeof FireJournalEntrySchema>;
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;
