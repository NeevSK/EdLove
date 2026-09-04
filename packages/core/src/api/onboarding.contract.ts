import type { SovereignContract } from '@repo/core/api/contracts';
import { z } from 'zod';

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

  createFounderSchoolBond: {
    method: 'post',
    path: '/identity/school-founder-bond',
    request: {
      body: z.object({ schoolId: z.string() }),
    },
    responses: {
      200: {
        schema: z.object({ success: z.literal(true), bondId: z.string() }),
        description: 'Create or return the authenticated founder school bond',
      },
    },
    metadata: userIdentity('update'),
  },

  revokeSchoolBond: {
    method: 'delete',
    path: '/identity/school-bond/:schoolId',
    request: {
      params: z.object({ schoolId: z.string() }),
    },
    responses: {
      200: {
        schema: z.object({ success: z.literal(true) }),
        description:
          'Revoke a school bond for the authenticated user or an authorized administrator',
      },
    },
    metadata: userIdentity('update'),
  },
} as const satisfies SovereignContract;
