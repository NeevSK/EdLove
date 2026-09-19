import { z } from 'zod';
import { ScopeBootstrapSchema } from './identity.orpc.contract';

const userIdentity = (action: 'update') =>
  ({
    policy: { action, subject: 'User' },
  }) as const;

export const onboardingORPCContract = {
  createInitialBond: {
    method: 'post',
    path: '/identity/initial-bond',
    request: {
      body: z.object({
        orientation: z.string(),
        confirmCapacityChange: z.boolean().default(false),
        context: z.record(z.string(), z.unknown()),
      }),
    },
    responses: {
      200: {
        schema: z.strictObject({ success: z.literal(true), scopeBootstrap: ScopeBootstrapSchema }),
        description: 'Initial Personal Sanctuary Bond and authoritative scope bootstrap created',
      },
    },
    metadata: userIdentity('update'),
  },

  completeOnboarding: {
    method: 'post',
    path: '/identity/complete-onboarding',
    responses: {
      200: { schema: z.object({ success: z.boolean() }), description: 'Onboarding completed' },
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
      200: { schema: z.object({ success: z.literal(true) }), description: 'Revoke a school bond' },
    },
    metadata: userIdentity('update'),
  },
};
