import { initContract } from '@ts-rest/core';
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
} from '../logic/schemas/guardian.schema';
import { POAMetadataSchema } from './contract';

const c = initContract();

const guardianAuthority = (action: 'create' | 'read' | 'update' | 'delete', subject: string) =>
  POAMetadataSchema.parse({ policy: { action, subject } });

export const guardianContract = c.router({
  createGuardianProfile: {
    method: 'POST',
    path: '/guardian/profile',
    body: GuardianProfileCreateSchema,
    responses: { 200: GuardianIdentitySchema },
    metadata: guardianAuthority('create', 'GuardianProfile'),
  },
  getGuardianProfile: {
    method: 'GET',
    path: '/guardian/:guardianId/profile',
    responses: { 200: GuardianIdentitySchema },
    metadata: guardianAuthority('read', 'GuardianProfile'),
  },
  updateGuardianProfile: {
    method: 'PATCH',
    path: '/guardian/:guardianId/profile',
    body: GuardianIdentitySchema.partial(),
    responses: { 200: GuardianIdentitySchema },
    metadata: guardianAuthority('update', 'GuardianProfile'),
  },
  getGuardianStudents: {
    method: 'GET',
    path: '/guardian/:guardianId/students',
    responses: { 200: z.array(GuardianStudentOverviewSchema) },
    metadata: guardianAuthority('read', 'GuardianDashboard'),
  },
  getStudentGuardians: {
    method: 'GET',
    path: '/guardian/students/:studentId/guardians',
    responses: { 200: z.array(GuardianIdentitySchema) },
    metadata: guardianAuthority('read', 'GuardianRelationship'),
  },
  getGuardianDashboard: {
    method: 'GET',
    path: '/guardian/:guardianId/dashboard',
    responses: { 200: GuardianDashboardSchema },
    metadata: guardianAuthority('read', 'GuardianDashboard'),
  },
  verifyGuardian: {
    method: 'POST',
    path: '/guardian/:guardianId/verification',
    body: z.object({
      documents: z.array(GuardianVerificationDocumentSchema),
    }),
    responses: { 200: z.object({ success: z.literal(true) }) },
    metadata: guardianAuthority('update', 'GuardianVerification'),
  },
  linkGuardianToStudent: {
    method: 'POST',
    path: '/guardian/:guardianId/students/:studentId/link',
    body: z.object({
      relationshipType: z.enum(['parent', 'guardian', 'caregiver']),
      schoolId: z.string().optional(),
    }),
    responses: { 200: StudentGuardianRelationshipSchema },
    metadata: guardianAuthority('create', 'GuardianRelationship'),
  },
  updateGuardianPermissions: {
    method: 'PATCH',
    path: '/guardian/:guardianId/students/:studentId/permissions',
    body: z.object({
      permissions: z.array(GuardianPermissionConfigSchema),
    }),
    responses: { 200: z.object({ success: z.literal(true) }) },
    metadata: guardianAuthority('update', 'GuardianRelationship'),
  },
  terminateGuardianRelationship: {
    method: 'DELETE',
    path: '/guardian/:guardianId/students/:studentId/link',
    responses: { 200: z.object({ success: z.literal(true) }) },
    metadata: guardianAuthority('delete', 'GuardianRelationship'),
  },
  updateGuardianNotificationSettings: {
    method: 'PATCH',
    path: '/guardian/:guardianId/notification-settings',
    body: GuardianNotificationSettingsSchema,
    responses: { 200: z.object({ success: z.literal(true) }) },
    metadata: guardianAuthority('update', 'GuardianNotificationSettings'),
  },
});
