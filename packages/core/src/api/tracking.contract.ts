import type { SovereignContract } from '@repo/core/api/contracts';
import { z } from 'zod';

const featureUsage = z.object({
  id: z.uuid(),
  user_id: z.uuid(),
  feature_name: z.string(),
  interaction_type: z.string(),
  created_at: z.string().datetime(),
});

const userAuthority = (action: 'read' | 'create') =>
  ({ policy: { action, subject: 'User' } }) as const;

export const trackingContract = {
  listExploredFeatures: {
    method: 'get',
    path: '/tracking/features',
    request: {},
    responses: {
      200: { schema: z.array(z.string()), description: 'Features explored by the current user' },
    },
    metadata: userAuthority('read'),
  },
  logFeatureUsage: {
    method: 'post',
    path: '/tracking/features',
    request: {
      body: z.object({
        featureName: z.string().trim().min(1).max(200),
        interactionType: z.string().trim().min(1).max(100).default('exploration'),
      }),
    },
    responses: { 200: { schema: featureUsage, description: 'Recorded feature usage' } },
    metadata: userAuthority('create'),
  },
} as const satisfies SovereignContract;

export type FeatureUsage = z.infer<typeof featureUsage>;
