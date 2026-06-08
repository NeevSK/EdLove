import { z } from 'zod';
import {
  FireJournalEntrySchema,
  MoodLogSchema,
  UserPreferencesSchema,
} from '../logic/schemas/self.schema';
import type { SovereignContract } from './contract';

const wellbeingAuthority = (action: 'create' | 'read' | 'update' | 'delete') =>
  ({
    policy: { action, subject: 'Wellbeing' },
  }) as const;

const userAuthority = (action: 'read' | 'update') =>
  ({
    policy: { action, subject: 'User' },
  }) as const;

/**
 * Self (Wellbeing & Profile) Port
 * Framework-agnostic definition of personal ecology.
 */
export const selfContract = {
  logMood: {
    method: 'post',
    path: '/self/mood',
    request: {
      body: MoodLogSchema.omit({ id: true, created_at: true }),
    },
    responses: {
      201: {
        schema: MoodLogSchema,
        description: 'Mood logged successfully',
      },
    },
    metadata: wellbeingAuthority('create'),
  },

  getMoodHistory: {
    method: 'get',
    path: '/self/mood',
    request: {
      query: z.strictObject({
        userId: z.uuid(),
        limit: z.coerce.number().optional(),
      }),
    },
    responses: {
      200: {
        schema: z.array(MoodLogSchema),
        description: 'Retrieve mood history',
      },
    },
    metadata: wellbeingAuthority('read'),
  },

  burnJournal: {
    method: 'post',
    path: '/self/journal/burn',
    request: {
      body: z.strictObject({ content: z.string() }),
    },
    responses: {
      201: {
        schema: FireJournalEntrySchema,
        description: 'Journal entry burned successfully',
      },
    },
    metadata: wellbeingAuthority('create'),
  },

  getJournalHistory: {
    method: 'get',
    path: '/self/journal',
    request: {
      query: z.strictObject({
        userId: z.uuid(),
        limit: z.coerce.number().optional(),
      }),
    },
    responses: {
      200: {
        schema: z.array(FireJournalEntrySchema),
        description: 'Retrieve journal history',
      },
    },
    metadata: wellbeingAuthority('read'),
  },

  getTodayMood: {
    method: 'get',
    path: '/self/mood/today',
    request: {
      query: z.strictObject({ userId: z.uuid() }),
    },
    responses: {
      200: {
        schema: MoodLogSchema.nullable(),
        description: "Retrieve today's mood log",
      },
    },
    metadata: wellbeingAuthority('read'),
  },

  getPreferences: {
    method: 'get',
    path: '/self/preferences',
    responses: {
      200: {
        schema: UserPreferencesSchema,
        description: 'Retrieve user preferences',
      },
    },
    metadata: userAuthority('read'),
  },

  updatePreferences: {
    method: 'patch',
    path: '/self/preferences',
    request: {
      body: UserPreferencesSchema.partial(),
    },
    responses: {
      200: {
        schema: UserPreferencesSchema,
        description: 'User preferences updated successfully',
      },
    },
    metadata: userAuthority('update'),
  },
} as const satisfies SovereignContract;
