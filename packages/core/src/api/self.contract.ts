import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import {
  FireJournalEntrySchema,
  MoodLogSchema,
  UserPreferencesSchema,
} from '../logic/schemas/self.schema';
import { POAMetadataSchema } from './contract';

const c = initContract();

/**
 * Self (Wellbeing & Profile) Contract
 * Authoritative POA endpoints for personal state.
 */
export const selfContract = c.router({
  logMood: {
    method: 'POST',
    path: '/self/mood',
    body: MoodLogSchema.omit({ id: true, created_at: true }),
    responses: {
      201: MoodLogSchema,
    },
    metadata: POAMetadataSchema.parse({
      authority: {
        action: 'create',
        subject: 'Wellbeing',
      },
    }),
  },
  getMoodHistory: {
    method: 'GET',
    path: '/self/mood',
    query: z.object({ userId: z.string(), limit: z.coerce.number().optional() }),
    responses: {
      200: z.array(MoodLogSchema),
    },
    metadata: POAMetadataSchema.parse({
      authority: {
        action: 'read',
        subject: 'Wellbeing',
      },
    }),
  },
  burnJournal: {
    method: 'POST',
    path: '/self/journal/burn',
    body: z.object({ content: z.string() }),
    responses: {
      201: FireJournalEntrySchema,
    },
    metadata: POAMetadataSchema.parse({
      authority: {
        action: 'create',
        subject: 'Wellbeing',
      },
    }),
  },
  getJournalHistory: {
    method: 'GET',
    path: '/self/journal',
    query: z.object({ userId: z.string(), limit: z.coerce.number().optional() }),
    responses: {
      200: z.array(FireJournalEntrySchema),
    },
    metadata: POAMetadataSchema.parse({
      authority: {
        action: 'read',
        subject: 'Wellbeing',
      },
    }),
  },
  getTodayMood: {
    method: 'GET',
    path: '/self/mood/today',
    query: z.object({ userId: z.string() }),
    responses: {
      200: MoodLogSchema.nullable(),
    },
    metadata: POAMetadataSchema.parse({
      authority: {
        action: 'read',
        subject: 'Wellbeing',
      },
    }),
  },
  getPreferences: {
    method: 'GET',
    path: '/self/preferences',
    responses: {
      200: UserPreferencesSchema,
    },
    metadata: POAMetadataSchema.parse({
      authority: {
        action: 'read',
        subject: 'User',
      },
    }),
  },
  updatePreferences: {
    method: 'PATCH',
    path: '/self/preferences',
    body: UserPreferencesSchema.partial(),
    responses: {
      200: UserPreferencesSchema,
    },
    metadata: POAMetadataSchema.parse({
      authority: {
        action: 'update',
        subject: 'User',
      },
    }),
  },
});
