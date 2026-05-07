import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { POAMetadataSchema } from './contract';
import { FacetedProfileSchema, IdentitySchema } from './identity.generated';

const c = initContract();

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

export const identityContract = c.router({
  resolveIdentity: {
    method: 'GET',
    path: '/identity/resolve',
    responses: {
      200: IdentitySchema,
    },
    metadata: POAMetadataSchema.parse({
      authority: {
        action: 'resolve',
        subject: 'User',
      },
    }),
    summary: 'Resolve the current user identity and roles',
  },
  getProfile: {
    method: 'GET',
    path: '/identity/profile/:id',
    responses: {
      200: IdentitySchema,
    },
    metadata: POAMetadataSchema.parse({
      authority: {
        action: 'read',
        subject: 'User',
      },
    }),
    summary: 'Get a user profile by ID',
  },
  getClassroomRoleSummary: {
    method: 'GET',
    path: '/identity/classroom-role-summary/:id',
    responses: {
      200: ClassroomRoleSummarySchema,
    },
    metadata: POAMetadataSchema.parse({
      authority: {
        action: 'read',
        subject: 'User',
      },
    }),
    summary: 'Get classroom workspace role summary for a user',
  },
  updateProfile: {
    method: 'PATCH',
    path: '/identity/profile/:id',
    body: IdentitySchema.partial(),
    responses: {
      200: IdentitySchema,
    },
    metadata: POAMetadataSchema.parse({
      authority: {
        action: 'update',
        subject: 'User',
      },
    }),
    summary: 'Update a user profile',
  },
  getOnboardingStatus: {
    method: 'GET',
    path: '/identity/onboarding-status/:id',
    responses: {
      200: z.object({
        state: OnboardingStateSchema,
        profile: IdentitySchema,
      }),
    },
    metadata: POAMetadataSchema.parse({
      authority: {
        action: 'read',
        subject: 'User',
      },
    }),
    summary: 'Get the explicit onboarding state for a user',
  },
});
