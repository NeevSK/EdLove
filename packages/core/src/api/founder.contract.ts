import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { POAMetadataSchema } from './contract';
import { EcosystemPulseSchema, EcosystemStatsSchema, GlobalUserSchema, SentinelAuditLogSchema } from './schemas/founder.schema';
import { SchoolSchema } from './schemas/school.schema';
import { ClassroomSchema } from './schemas/classroom.schema';
import { CommunityGroupSchema } from './schemas/community.schema';

const c = initContract();

const founderAuthority = (action: 'create' | 'read' | 'update' | 'delete', subject: string) => POAMetadataSchema.parse({ authority: { action, subject } });

export const founderContract = c.router({
  getEcosystemStats: {
    method: 'GET',
    path: '/founder/ecosystem/stats',
    responses: { 200: EcosystemStatsSchema },
    metadata: founderAuthority('read', 'FounderDashboard'),
  },
  getAllSchools: {
    method: 'GET',
    path: '/founder/ecosystem/schools',
    responses: { 200: z.array(SchoolSchema) },
    metadata: founderAuthority('read', 'School'),
  },
  createSchool: {
    method: 'POST',
    path: '/founder/ecosystem/schools',
    body: z.object({
      name: z.string().min(1),
      type: z.string(),
      created_by: z.string(),
    }),
    responses: { 201: SchoolSchema },
    metadata: founderAuthority('create', 'School'),
  },
  createClassroom: {
    method: 'POST',
    path: '/founder/ecosystem/classrooms',
    body: z.object({
      school_id: z.string(),
      name: z.string().min(1),
      grade_number: z.number(),
      created_by: z.string(),
    }),
    responses: { 201: ClassroomSchema },
    metadata: founderAuthority('create', 'Classroom'),
  },
  createGroup: {
    method: 'POST',
    path: '/founder/ecosystem/groups',
    body: z.object({
      name: z.string().min(1),
      description: z.string(),
      school_id: z.string(),
    }),
    responses: { 201: CommunityGroupSchema.or(z.any()) },
    metadata: founderAuthority('create', 'Group'),
  },
  listAllUsers: {
    method: 'GET',
    path: '/founder/ecosystem/users',
    responses: { 200: z.array(GlobalUserSchema) },
    metadata: founderAuthority('read', 'FounderDashboard'),
  },
  updateSchoolMetadata: {
    method: 'PATCH',
    path: '/founder/ecosystem/schools/:schoolId/metadata',
    body: z.object({
      metadata: z.record(z.string(), z.any()),
    }),
    responses: { 200: SchoolSchema },
    metadata: founderAuthority('update', 'School'),
  },
  getEcosystemPulse: {
    method: 'GET',
    path: '/founder/ecosystem/pulse',
    responses: { 200: EcosystemPulseSchema },
    metadata: founderAuthority('read', 'FounderDashboard'),
  },
  getSentinelGovernance: {
    method: 'GET',
    path: '/founder/ecosystem/sentinel',
    responses: { 200: z.array(SentinelAuditLogSchema) },
    metadata: founderAuthority('read', 'FounderDashboard'),
  },
});
