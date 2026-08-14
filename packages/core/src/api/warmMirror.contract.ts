import type { SovereignContract } from '@repo/core/api/contracts';
import { z } from 'zod';

export const warmMirrorDataPoints = z.object({
  days_present: z.number().int().nonnegative(),
  quiet_moments: z.number().int().nonnegative(),
  ripples_received: z.number().int().nonnegative(),
  assignments_with_feedback: z.number().int().nonnegative(),
  resources_that_reached_others: z.number().int().nonnegative(),
  posts_that_sparked: z.number().int().nonnegative(),
  days_since_joined: z.number().int().nonnegative(),
  primary_classroom_name: z.string().optional(),
});

export const warmMirrorContract = {
  getDataPoints: {
    method: 'get',
    path: '/warmMirror/:userId',
    request: {
      params: z.object({ userId: z.uuid() }),
      query: z.object({ since: z.string().datetime().optional() }),
    },
    responses: {
      200: { schema: warmMirrorDataPoints, description: 'Personal warm mirror data points' },
    },
    metadata: { policy: { action: 'read', subject: 'Wellbeing' } },
  },
} as const satisfies SovereignContract;

export type WarmMirrorDataPoints = z.infer<typeof warmMirrorDataPoints>;
