import { z } from 'zod';
import type { SovereignContract } from './contract';
import { FacetedProfileSchema, IdentitySchema } from './identity.generated';

export const OnboardingStateSchema = z.enum([
  'ARRIVAL',
  'IDENTITY_SELECTION',
  'SANCTUARY_INIT',
  'COMPLETED',
]);

export const ClassroomRoleSummarySchema = z.strictObject({
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

/**
 * Identity & Profile Port (Sovereign RPC)
 * Framework-agnostic definition of the Identity API.
 * [LOUD-FAILURE] Renamed methods to force architectural compliance.
 */
export const identityContract = {
  identifyActiveCitizen: {
    method: 'get',
    path: '/identity/resolve',
    request: {},
    responses: {
      200: {
        schema: IdentitySchema,
        description: 'Resolve current identity',
      },
    },
    metadata: userAuthority('resolve'),
  },

  fetchUserProfile: {
    method: 'get',
    path: '/identity/profile/:id',
    request: {
      params: z.strictObject({ id: z.uuid() }),
    },
    responses: {
      200: {
        schema: IdentitySchema,
        description: 'Get user profile',
      },
    },
    metadata: userAuthority('read'),
  },

  resolveWorkspaceContext: {
    method: 'get',
    path: '/identity/classroom-capacity-summary/:id',
    request: {
      params: z.strictObject({ id: z.uuid() }),
    },
    responses: {
      200: {
        schema: ClassroomRoleSummarySchema,
        description: 'Get capacity summary',
      },
    },
    metadata: userAuthority('read'),
  },

  modifyUserProfile: {
    method: 'patch',
    path: '/identity/profile/:id',
    request: {
      params: z.strictObject({ id: z.uuid() }),
      body: IdentitySchema.partial(),
    },
    responses: {
      200: {
        schema: IdentitySchema,
        description: 'Update user profile',
      },
    },
    metadata: userAuthority('update'),
  },
} as const satisfies SovereignContract;
