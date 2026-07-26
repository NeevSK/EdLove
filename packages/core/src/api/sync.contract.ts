import { z } from 'zod';
import type { SovereignContract } from '@/api/contract';

const syncAuthority = (action: 'update') =>
  ({
    policy: { action, subject: 'User' },
  }) as const;

/**
 * PowerSync / Outbox Synchronization Contract (Sovereign RPC)
 * Framework-agnostic definition of bulk transactional operations.
 */
export const syncContract = {
  uploadPowerSyncBatch: {
    method: 'post',
    path: '/powersync/upload',
    request: {
      body: z.object({
        crud: z.array(
          z.object({
            id: z.string(),
            op: z.enum(['PUT', 'PATCH', 'DELETE']),
            table: z.string(),
            opData: z.record(z.string(), z.any()).optional(),
          }),
        ),
      }),
    },
    responses: {
      200: {
        schema: z.object({
          success: z.boolean(),
          processedCount: z.number(),
        }),
        description: 'PowerSync batch uploaded and processed successfully',
      },
    },
    metadata: syncAuthority('update'),
  },
} as const satisfies SovereignContract;
