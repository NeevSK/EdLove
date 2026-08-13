import { z } from 'zod';
import { ClassroomSchema } from '@repo/core/logic/schemas/classroom.schema';
import { CommunityGroupSchema } from '@repo/core/logic/schemas/community.schema';
import {
  EcosystemPulseSchema,
  EcosystemStatsSchema,
  GlobalUserSchema,
  SentinelAuditLogSchema,
} from '@repo/core/logic/schemas/founder.schema';
import { SchoolSchema } from '@repo/core/logic/schemas/school.schema';
import type { SovereignContract } from '@repo/core/api/contracts';

const founderAuthority = (action: 'create' | 'read' | 'update' | 'delete', subject: string) =>
  ({ policy: { action, subject } }) as const;

export const founderContract = {
  getEcosystemStats: {
    method: 'get',
    path: '/founder/ecosystem/stats',
    responses: {
      200: {
        schema: EcosystemStatsSchema,
        description: 'Get ecosystem statistics',
      },
    },
    metadata: founderAuthority('read', 'FounderDashboard'),
  },
  getAllSchools: {
    method: 'get',
    path: '/founder/ecosystem/schools',
    responses: {
      200: {
        schema: z.array(SchoolSchema),
        description: 'Get all schools list',
      },
    },
    metadata: founderAuthority('read', 'School'),
  },
  createSchool: {
    method: 'post',
    path: '/founder/ecosystem/schools',
    request: {
      body: z.object({
        name: z.string().min(1),
        type: z.string(),
        created_by: z.string(),
      }),
    },
    responses: {
      201: {
        schema: SchoolSchema,
        description: 'School created successfully',
      },
    },
    metadata: founderAuthority('create', 'School'),
  },
  createClassroom: {
    method: 'post',
    path: '/founder/ecosystem/classrooms',
    request: {
      body: z.object({
        school_id: z.string(),
        name: z.string().min(1),
        grade_number: z.number(),
        created_by: z.string(),
      }),
    },
    responses: {
      201: {
        schema: ClassroomSchema,
        description: 'Classroom created successfully',
      },
    },
    metadata: founderAuthority('create', 'Classroom'),
  },
  createGroup: {
    method: 'post',
    path: '/founder/ecosystem/groups',
    request: {
      body: z.object({
        name: z.string().min(1),
        description: z.string(),
        school_id: z.string(),
      }),
    },
    responses: {
      201: {
        schema: CommunityGroupSchema.or(z.any()),
        description: 'Ecosystem group created successfully',
      },
    },
    metadata: founderAuthority('create', 'Group'),
  },
  listAllUsers: {
    method: 'get',
    path: '/founder/ecosystem/users',
    responses: {
      200: {
        schema: z.array(GlobalUserSchema),
        description: 'List all ecosystem users',
      },
    },
    metadata: founderAuthority('read', 'FounderDashboard'),
  },
  updateSchoolMetadata: {
    method: 'patch',
    path: '/founder/ecosystem/schools/:schoolId/metadata',
    request: {
      params: z.object({ schoolId: z.string() }),
      body: z.object({
        metadata: z.record(z.string(), z.any()),
      }),
    },
    responses: {
      200: {
        schema: SchoolSchema,
        description: 'School metadata updated successfully',
      },
    },
    metadata: founderAuthority('update', 'School'),
  },
  getEcosystemPulse: {
    method: 'get',
    path: '/founder/ecosystem/pulse',
    responses: {
      200: {
        schema: EcosystemPulseSchema,
        description: 'Get ecosystem pulse snapshot',
      },
    },
    metadata: founderAuthority('read', 'FounderDashboard'),
  },
  getSentinelGovernance: {
    method: 'get',
    path: '/founder/ecosystem/sentinel',
    responses: {
      200: {
        schema: z.array(SentinelAuditLogSchema),
        description: 'Get sentinel governance audit logs',
      },
    },
    metadata: founderAuthority('read', 'FounderDashboard'),
  },
} as const satisfies SovereignContract;
