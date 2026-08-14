import type { SovereignContract } from '@repo/core/api/contracts';
import { z } from 'zod';

export const privacyLedgerEntry = z.object({
  id: z.uuid(),
  user_id: z.uuid(),
  activity_type: z.string(),
  resource_name: z.string(),
  description: z.string(),
  metadata: z.record(z.string(), z.unknown()),
  created_at: z.string(),
});

const authority = (action: 'read' | 'create') =>
  ({ policy: { action, subject: 'PrivacyLedgerEntry' } }) as const;

export const privacyContract = {
  getPrivacyLedger: {
    method: 'get',
    path: '/privacy/ledger',
    request: {},
    responses: {
      200: { schema: z.array(privacyLedgerEntry), description: 'Current user privacy ledger' },
    },
    metadata: authority('read'),
  },
  logPrivacyEvent: {
    method: 'post',
    path: '/privacy/ledger/events',
    request: {
      body: z.object({
        activity_type: z.string().trim().min(1).max(120),
        resource_name: z.string().trim().min(1).max(200),
        description: z.string().trim().min(1).max(2000),
        metadata: z.record(z.string(), z.unknown()).optional(),
      }),
    },
    responses: { 201: { schema: privacyLedgerEntry, description: 'Recorded privacy event' } },
    metadata: authority('create'),
  },
} as const satisfies SovereignContract;

export type PrivacyLedgerEntry = z.infer<typeof privacyLedgerEntry>;
