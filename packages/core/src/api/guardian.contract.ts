import { z } from 'zod';
import {
  GuardianDashboardSchema,
  GuardianIdentitySchema,
  GuardianNotificationSettingsSchema,
  GuardianPermissionConfigSchema,
  GuardianProfileCreateSchema,
  GuardianStudentOverviewSchema,
  GuardianVerificationDocumentSchema,
  StudentGuardianRelationshipSchema,
} from '@/logic/schemas/guardian.schema';
import type { SovereignContract } from '@/api/contract';

const guardianAuthority = (action: 'create' | 'read' | 'update' | 'delete', subject: string) =>
  ({ policy: { action, subject } }) as const;

export const guardianContract = {
  createGuardianProfile: {
    method: 'post',
    path: '/guardian/profile',
    request: {
      body: GuardianProfileCreateSchema,
    },
    responses: {
      200: {
        schema: GuardianIdentitySchema,
        description: 'Guardian profile created successfully',
      },
    },
    metadata: guardianAuthority('create', 'GuardianProfile'),
  },
  getGuardianProfile: {
    method: 'get',
    path: '/guardian/:guardianId/profile',
    request: {
      params: z.object({ guardianId: z.string() }),
    },
    responses: {
      200: {
        schema: GuardianIdentitySchema,
        description: 'Retrieve guardian profile details',
      },
    },
    metadata: guardianAuthority('read', 'GuardianProfile'),
  },
  updateGuardianProfile: {
    method: 'patch',
    path: '/guardian/:guardianId/profile',
    request: {
      params: z.object({ guardianId: z.string() }),
      body: GuardianIdentitySchema.partial(),
    },
    responses: {
      200: {
        schema: GuardianIdentitySchema,
        description: 'Guardian profile updated successfully',
      },
    },
    metadata: guardianAuthority('update', 'GuardianProfile'),
  },
  getGuardianStudents: {
    method: 'get',
    path: '/guardian/:guardianId/students',
    request: {
      params: z.object({ guardianId: z.string() }),
    },
    responses: {
      200: {
        schema: z.array(GuardianStudentOverviewSchema),
        description: 'Get guardian students list',
      },
    },
    metadata: guardianAuthority('read', 'GuardianDashboard'),
  },
  getStudentGuardians: {
    method: 'get',
    path: '/guardian/students/:studentId/guardians',
    request: {
      params: z.object({ studentId: z.string() }),
    },
    responses: {
      200: {
        schema: z.array(GuardianIdentitySchema),
        description: 'Get student guardians list',
      },
    },
    metadata: guardianAuthority('read', 'GuardianRelationship'),
  },
  getGuardianDashboard: {
    method: 'get',
    path: '/guardian/:guardianId/dashboard',
    request: {
      params: z.object({ guardianId: z.string() }),
    },
    responses: {
      200: {
        schema: GuardianDashboardSchema,
        description: 'Get guardian dashboard analytics',
      },
    },
    metadata: guardianAuthority('read', 'GuardianDashboard'),
  },
  verifyGuardian: {
    method: 'post',
    path: '/guardian/:guardianId/verification',
    request: {
      params: z.object({ guardianId: z.string() }),
      body: z.object({
        documents: z.array(GuardianVerificationDocumentSchema),
      }),
    },
    responses: {
      200: {
        schema: z.object({ success: z.literal(true) }),
        description: 'Verify guardian documents successfully',
      },
    },
    metadata: guardianAuthority('update', 'GuardianVerification'),
  },
  linkGuardianToStudent: {
    method: 'post',
    path: '/guardian/:guardianId/students/:studentId/link',
    request: {
      params: z.object({ guardianId: z.string(), studentId: z.string() }),
      body: z.object({
        relationshipType: z.enum(['parent', 'guardian', 'caregiver']),
        schoolId: z.string().optional(),
      }),
    },
    responses: {
      200: {
        schema: StudentGuardianRelationshipSchema,
        description: 'Link guardian to student successfully',
      },
    },
    metadata: guardianAuthority('create', 'GuardianRelationship'),
  },
  updateGuardianPermissions: {
    method: 'patch',
    path: '/guardian/:guardianId/students/:studentId/permissions',
    request: {
      params: z.object({ guardianId: z.string(), studentId: z.string() }),
      body: z.object({
        permissions: z.array(GuardianPermissionConfigSchema),
      }),
    },
    responses: {
      200: {
        schema: z.object({ success: z.literal(true) }),
        description: 'Update guardian permissions successfully',
      },
    },
    metadata: guardianAuthority('update', 'GuardianRelationship'),
  },
  terminateGuardianRelationship: {
    method: 'delete',
    path: '/guardian/:guardianId/students/:studentId/link',
    request: {
      params: z.object({ guardianId: z.string(), studentId: z.string() }),
    },
    responses: {
      200: {
        schema: z.object({ success: z.literal(true) }),
        description: 'Terminate guardian relationship successfully',
      },
    },
    metadata: guardianAuthority('delete', 'GuardianRelationship'),
  },
  updateGuardianNotificationSettings: {
    method: 'patch',
    path: '/guardian/:guardianId/notification-settings',
    request: {
      params: z.object({ guardianId: z.string() }),
      body: GuardianNotificationSettingsSchema,
    },
    responses: {
      200: {
        schema: z.object({ success: z.literal(true) }),
        description: 'Update guardian notification settings successfully',
      },
    },
    metadata: guardianAuthority('update', 'GuardianNotificationSettings'),
  },
} as const satisfies SovereignContract;
