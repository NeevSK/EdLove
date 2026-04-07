import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { POAMetadataSchema } from './contract';

const c = initContract();

export const IdentitySchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.string(),
  name: z.string().optional(),
});

export const ClassroomRoleSummarySchema = z.object({
  userId: z.string(),
  schoolId: z.string().nullable(),
  profileCompleted: z.boolean(),
  realClassCount: z.number().int().nonnegative(),
  profile: z.object({
    school_id: z.string().nullable().optional(),
    profile_completed: z.boolean().nullable().optional(),
    role: z.string().nullable().optional(),
    full_name: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    platform_roles: z.array(z.string()).nullable().optional(),
    school_role: z.string().nullable().optional(),
    work_roles: z.array(z.string()).nullable().optional(),
    tenant_kind: z.string().nullable().optional(),
  }),
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
});
