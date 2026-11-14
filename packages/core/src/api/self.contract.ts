import type { SovereignContract } from '@repo/core/api/contracts';
import {
  FireJournalEntrySchema,
  MoodLogSchema,
  ThoughtRecordSchema,
  UserPreferencesSchema,
} from '@repo/core/logic/schemas/self.schema';
import { z } from 'zod';

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
        userId: z.uuid().optional(),
        limit: z.coerce.number().optional(),
        viewDate: z.string().datetime().optional(),
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
        userId: z.uuid().optional(),
        limit: z.coerce.number().optional(),
        viewDate: z.string().datetime().optional(),
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
      query: z.strictObject({ userId: z.uuid().optional() }),
    },
    responses: {
      200: {
        schema: MoodLogSchema.nullable(),
        description: "Retrieve today's mood log",
      },
    },
    metadata: wellbeingAuthority('read'),
  },

  saveThoughtRecord: {
    method: 'post',
    path: '/self/thought-record',
    request: {
      body: ThoughtRecordSchema.omit({ id: true, created_at: true, user_id: true }),
    },
    responses: {
      201: {
        schema: ThoughtRecordSchema,
        description: 'Thought record saved successfully',
      },
    },
    metadata: wellbeingAuthority('create'),
  },

  getThoughtRecords: {
    method: 'get',
    path: '/self/thought-record',
    request: {
      query: z.strictObject({
        userId: z.uuid().optional(),
        limit: z.coerce.number().optional(),
        viewDate: z.string().datetime().optional(),
      }),
    },
    responses: {
      200: {
        schema: z.array(ThoughtRecordSchema),
        description: 'Retrieve thought records',
      },
    },
    metadata: wellbeingAuthority('read'),
  },

  completeThoughtRecordFollowUp: {
    method: 'patch',
    path: '/self/thought-record/:id',
    request: {
      params: z.strictObject({ id: z.string().min(1) }),
      body: z.strictObject({
        post_outcome: z.enum(['better', 'same', 'worse']).optional(),
        follow_up: z
          .object({
            due_at: z.string().datetime(),
            completed_at: z.string().datetime().optional(),
            outcome: z.enum(['better', 'same', 'worse']).optional(),
            reflection: z.string().optional(),
          })
          .partial()
          .optional(),
      }),
    },
    responses: {
      200: {
        schema: ThoughtRecordSchema,
        description: 'Thought record follow-up updated',
      },
    },
    metadata: wellbeingAuthority('update'),
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
