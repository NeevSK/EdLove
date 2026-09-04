import { FacetedProfileSchema, IdentitySchema } from '@repo/core/api/identity.generated';
import { z } from 'zod';

export const OnboardingStateSchema = z.enum([
  'ARRIVAL',
  'IDENTITY_SELECTION',
  'SANCTUARY_INIT',
  'COMPLETED',
]);

export const ClassroomCapacitySummarySchema = z.strictObject({
  user_id: z.uuid(),
  school_id: z.uuid().nullable(),
  profile_completed: z.boolean(),
  onboarding_completed: z.boolean(),
  onboarding_state: OnboardingStateSchema,
  real_class_count: z.number().int().nonnegative(),
  profile: FacetedProfileSchema,
});

const userAuthority = (action: 'resolve' | 'read' | 'update') =>
  ({
    policy: { action, subject: 'User' },
  }) as const;

export const identityORPCContract = {
  identifyActiveCitizen: {
    method: 'get',
    path: '/identity/resolveIdentity',
    request: {},
    responses: {
      200: { schema: IdentitySchema, description: 'Resolve current identity' },
    },
    metadata: userAuthority('resolve'),
  },

  fetchUserProfile: {
    method: 'get',
    path: '/identity/profile/:id',
    request: { params: z.object({ id: z.uuid() }) },
    responses: {
      200: { schema: IdentitySchema, description: 'Get user profile' },
    },
    metadata: userAuthority('read'),
  },

  resolveWorkspaceContext: {
    method: 'get',
    path: '/identity/classroom-capacity-summary/:id',
    request: {
      params: z.object({ id: z.union([z.uuid(), z.literal('anonymous')]) }),
    },
    responses: {
      200: { schema: ClassroomCapacitySummarySchema, description: 'Get capacity summary' },
    },
    metadata: userAuthority('read'),
  },

  modifyUserProfile: {
    method: 'patch',
    path: '/identity/profile/:id',
    request: {
      params: z.object({ id: z.uuid() }),
      body: IdentitySchema.partial(),
    },
    responses: {
      200: { schema: IdentitySchema, description: 'Update user profile' },
    },
    metadata: userAuthority('update'),
  },
};

export type OnboardingState = z.infer<typeof OnboardingStateSchema>;
export type ClassroomCapacitySummary = z.infer<typeof ClassroomCapacitySummarySchema>;
