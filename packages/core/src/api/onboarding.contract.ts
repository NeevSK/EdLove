import { z } from 'zod';
import type { SovereignContract } from '@repo/core/api/contract';

const userIdentity = (action: 'update') =>
  ({
    policy: { action, subject: 'User' },
  }) as const;

export const onboardingContract = {
  createInitialBond: {
    method: 'post',
    path: '/identity/initial-bond',
    request: {
      body: z.object({
        orientation: z.string(),
        context: z.record(z.string(), z.any()),
      }),
    },
    responses: {
      200: {
        schema: z.object({ success: z.boolean() }),
        description: 'Initial bond and user profile created',
      },
    },
    metadata: userIdentity('update'),
  },

  completeOnboarding: {
    method: 'post',
    path: '/identity/complete-onboarding',
    request: {
      body: z.object({
        userId: z.string(),
      }),
    },
    responses: {
      200: {
        schema: z.object({ success: z.boolean() }),
        description: 'Onboarding completed',
      },
    },
    metadata: userIdentity('update'),
  },
} as const satisfies SovereignContract;
