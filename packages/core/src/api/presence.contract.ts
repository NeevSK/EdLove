import type { SovereignContract } from '@repo/core/api/contracts';
import { z } from 'zod';

const userAuthority = (action: 'read' | 'update') =>
  ({ policy: { action, subject: 'User' } }) as const;

export const presenceContract = {
  getFallbackCount: {
    method: 'get',
    path: '/presence/fallback-count',
    request: {
      query: z
        .object({
          targetCapacities: z.string().optional(),
          cumulative: z.coerce.boolean().optional(),
          windowMs: z.coerce.number().int().min(10_000).max(86_400_000).optional(),
        })
        .optional(),
    },
    responses: {
      200: {
        schema: z.object({ count: z.number().int().nonnegative() }),
        description: 'Recent presence count',
      },
    },
    metadata: userAuthority('read'),
  },
  markSeen: {
    method: 'post',
    path: '/presence/seen',
    request: { body: z.object({}) },
    responses: {
      200: {
        schema: z.object({ seenAt: z.string().datetime() }),
        description: 'Recorded current-user presence',
      },
    },
    metadata: userAuthority('update'),
  },
} as const satisfies SovereignContract;
