import type { SovereignContract } from '@repo/core/api/contracts';
import { z } from 'zod';

export const journalEntry = z.object({
  id: z.uuid(),
  user_id: z.uuid(),
  content: z.string(),
  created_at: z.string().datetime(),
});

const authority = (action: 'read' | 'create') =>
  ({ policy: { action, subject: 'FireJournal' } }) as const;

export const journalEntriesContract = {
  list: {
    method: 'get',
    path: '/journalEntries',
    request: {
      query: z.object({
        limit: z.coerce.number().int().min(1).max(100).default(50),
        view_date: z.string().datetime().optional(),
      }),
    },
    responses: {
      200: { schema: z.array(journalEntry), description: 'Current user journal entries' },
    },
    metadata: authority('read'),
  },
  create: {
    method: 'post',
    path: '/journalEntries',
    request: {
      body: z.object({ content: z.string().trim().min(1).max(10000) }),
    },
    responses: { 201: { schema: journalEntry, description: 'Create a journal entry' } },
    metadata: authority('create'),
  },
} as const satisfies SovereignContract;

export type JournalEntry = z.infer<typeof journalEntry>;
