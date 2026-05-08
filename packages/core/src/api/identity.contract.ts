import { createRoute, z } from '@hono/zod-openapi';
import { POAMetadataSchema, type POAMetadata } from './contract';
import { FacetedProfileSchema, IdentitySchema } from './identity.generated';

export const OnboardingStateSchema = z.enum([
  'ARRIVAL',
  'IDENTITY_SELECTION',
  'SANCTUARY_INIT',
  'COMPLETED',
]);

export const ClassroomRoleSummarySchema = z.object({
  user_id: z.uuid(),
  school_id: z.uuid().nullable(),
  profile_completed: z.boolean(),
  onboarding_completed: z.boolean(),
  onboarding_state: OnboardingStateSchema,
  real_class_count: z.number().int().nonnegative(),
  profile: FacetedProfileSchema,
});

const userAuthority = (action: 'resolve' | 'read' | 'update') =>
  POAMetadataSchema.parse({ authority: { action, subject: 'User' } }) as POAMetadata;

export const identityContract = {
  resolveIdentity: createRoute({
    method: 'get',
    path: '/identity/resolve',
    responses: {
      200: {
        content: { 'application/json': { schema: IdentitySchema } },
        description: 'Resolve the current user identity and roles',
      },
    },
    metadata: userAuthority('resolve'),
  }),
  getProfile: createRoute({
    method: 'get',
    path: '/identity/profile/{id}',
    request: {
      params: z.object({ id: z.string() }),
    },
    responses: {
      200: {
        content: { 'application/json': { schema: IdentitySchema } },
        description: 'Get a user profile by ID',
      },
    },
    metadata: userAuthority('read'),
  }),
  getClassroomRoleSummary: createRoute({
    method: 'get',
    path: '/identity/classroom-role-summary/{id}',
    request: {
      params: z.object({ id: z.string() }),
    },
    responses: {
      200: {
        content: { 'application/json': { schema: ClassroomRoleSummarySchema } },
        description: 'Get classroom workspace role summary for a user',
      },
    },
    metadata: userAuthority('read'),
  }),
  updateProfile: createRoute({
    method: 'patch',
    path: '/identity/profile/{id}',
    request: {
      params: z.object({ id: z.string() }),
      body: {
        content: { 'application/json': { schema: IdentitySchema.partial() } },
      },
    },
    responses: {
      200: {
        content: { 'application/json': { schema: IdentitySchema } },
        description: 'Update a user profile',
      },
    },
    metadata: userAuthority('update'),
  }),
  getOnboardingStatus: createRoute({
    method: 'get',
    path: '/identity/onboarding-status/{id}',
    request: {
      params: z.object({ id: z.string() }),
    },
    responses: {
      200: {
        content: {
          'application/json': {
            schema: z.object({
              state: OnboardingStateSchema,
              profile: IdentitySchema,
            }),
          },
        },
        description: 'Get the explicit onboarding state for a user',
      },
    },
    metadata: userAuthority('read'),
  }),
  blockUser: createRoute({
    method: 'post',
    path: '/identity/blocks',
    request: {
      body: {
        content: {
          'application/json': {
            schema: z.object({
              blocker_id: z.string().uuid(),
              blocked_id: z.string().uuid(),
            }),
          },
        },
      },
    },
    responses: {
      201: {
        content: { 'application/json': { schema: z.object({ success: z.boolean() }) } },
        description: 'User blocked successfully',
      },
    },
    metadata: userAuthority('update'),
  }),
  unblockUser: createRoute({
    method: 'delete',
    path: '/identity/blocks',
    request: {
      query: z.object({
        blocker_id: z.string().uuid(),
        blocked_id: z.string().uuid(),
      }),
    },
    responses: {
      200: {
        content: { 'application/json': { schema: z.object({ success: z.boolean() }) } },
        description: 'User unblocked successfully',
      },
    },
    metadata: userAuthority('update'),
  }),
} as const;
