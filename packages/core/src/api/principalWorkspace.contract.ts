import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { POAMetadataSchema } from './contract';
import {
  InviteCodeSchema,
  PrincipalGovernanceEventSchema,
  PrincipalInviteEventCreateSchema,
  PrincipalInviteRoleSchema,
  PrincipalObservationFollowUpCreateSchema,
  PrincipalObservationCreateSchema,
  PrincipalObservationSchema,
} from './schemas/principal-workspace.schema';

const c = initContract();

const principalWorkspaceAuthority = (action: 'create' | 'read' | 'update' | 'delete', subject: string) => POAMetadataSchema.parse({ authority: { action, subject } });

export const principalWorkspaceContract = c.router({
  listInviteCodes: {
    method: 'GET',
    path: '/principal-workspace/:schoolId/invites',
    responses: {
      200: z.array(InviteCodeSchema),
    },
    metadata: principalWorkspaceAuthority('read', 'SchoolInvite'),
  },
  generateInviteCode: {
    method: 'POST',
    path: '/principal-workspace/:schoolId/invites',
    body: z.object({
      role: PrincipalInviteRoleSchema,
      createdBy: z.string().min(1),
    }),
    responses: {
      201: InviteCodeSchema,
    },
    metadata: principalWorkspaceAuthority('create', 'SchoolInvite'),
  },
  listObservationsByDate: {
    method: 'GET',
    path: '/principal-workspace/:principalId/observations',
    query: z.object({
      viewDate: z.string().min(1),
      limit: z.number().int().positive().max(100).optional(),
    }),
    responses: {
      200: z.array(PrincipalObservationSchema),
    },
    metadata: principalWorkspaceAuthority('read', 'PrincipalObservation'),
  },
  listRecentObservations: {
    method: 'GET',
    path: '/principal-workspace/:principalId/observations/recent',
    query: z.object({
      limit: z.number().int().positive().max(100).optional(),
    }),
    responses: {
      200: z.array(PrincipalObservationSchema),
    },
    metadata: principalWorkspaceAuthority('read', 'PrincipalObservation'),
  },
  createObservation: {
    method: 'POST',
    path: '/principal-workspace/observations',
    body: PrincipalObservationCreateSchema,
    responses: {
      201: PrincipalObservationSchema,
    },
    metadata: principalWorkspaceAuthority('create', 'PrincipalObservation'),
  },
  recordInviteEvent: {
    method: 'POST',
    path: '/principal-workspace/invites/events',
    body: PrincipalInviteEventCreateSchema,
    responses: {
      201: PrincipalGovernanceEventSchema,
    },
    metadata: principalWorkspaceAuthority('update', 'SchoolInvite'),
  },
  recordObservationFollowUp: {
    method: 'POST',
    path: '/principal-workspace/observations/follow-up',
    body: PrincipalObservationFollowUpCreateSchema,
    responses: {
      201: PrincipalGovernanceEventSchema,
    },
    metadata: principalWorkspaceAuthority('update', 'PrincipalObservation'),
  },
  getGovernanceTimeline: {
    method: 'GET',
    path: '/principal-workspace/:principalId/timeline',
    query: z.object({
      viewDate: z.string().min(1),
      limit: z.number().int().positive().max(200).optional(),
    }),
    responses: {
      200: z.array(PrincipalGovernanceEventSchema),
    },
    metadata: principalWorkspaceAuthority('read', 'PrincipalObservation'),
  },
  getGovernanceSnapshotAsOf: {
    method: 'GET',
    path: '/principal-workspace/:principalId/snapshot',
    query: z.object({
      viewDate: z.string().min(1),
      limit: z.number().int().positive().max(200).optional(),
    }),
    responses: {
      200: z.array(PrincipalGovernanceEventSchema),
    },
    metadata: principalWorkspaceAuthority('read', 'PrincipalObservation'),
  },
});
