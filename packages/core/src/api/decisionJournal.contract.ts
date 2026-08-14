import type { SovereignContract } from '@repo/core/api/contracts';
import { z } from 'zod';

export const decisionLog = z.object({
  id: z.uuid(),
  user_id: z.uuid(),
  decision_text: z.string().min(1),
  context: z.string().nullable(),
  is_reviewed: z.boolean(),
  created_at: z.string().datetime(),
});

const authority = (action: 'read' | 'create' | 'update') =>
  ({ policy: { action, subject: 'DecisionJournal' } }) as const;

export const decisionJournalContract = {
  list: {
    method: 'get',
    path: '/decisionJournal/logs',
    request: {
      query: z.object({
        limit: z.coerce.number().int().min(1).max(100).default(20),
        view_date: z.string().datetime().optional(),
      }),
    },
    responses: {
      200: { schema: z.array(decisionLog), description: 'Current user decision journal' },
    },
    metadata: authority('read'),
  },
  create: {
    method: 'post',
    path: '/decisionJournal/logs',
    request: {
      body: z.object({
        decision_text: z.string().trim().min(1).max(5000),
        context: z.string().trim().max(5000).nullable().optional(),
        idempotency_key: z.string().trim().min(1).max(200).optional(),
      }),
    },
    responses: { 201: { schema: decisionLog, description: 'Create a decision journal entry' } },
    metadata: authority('create'),
  },
  markReviewed: {
    method: 'patch',
    path: '/decisionJournal/logs/:id/reviewed',
    request: {
      params: z.object({ id: z.uuid() }),
      body: z.object({ is_reviewed: z.boolean() }),
    },
    responses: { 200: { schema: decisionLog, description: 'Update review state' } },
    metadata: authority('update'),
  },
} as const satisfies SovereignContract;

export type DecisionLog = z.infer<typeof decisionLog>;
