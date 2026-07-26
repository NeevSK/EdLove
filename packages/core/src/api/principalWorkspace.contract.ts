import { z } from 'zod';
import {
  InviteCodeSchema,
  PrincipalGovernanceEventSchema,
  PrincipalInviteEventCreateSchema,
  PrincipalInviteRoleSchema,
  PrincipalObservationCreateSchema,
  PrincipalObservationFollowUpCreateSchema,
  PrincipalObservationSchema,
} from '@/logic/schemas/principal-workspace.schema';
import type { SovereignContract } from '@/api/contract';

const principalWorkspaceAuthority = (
  action: 'create' | 'read' | 'update' | 'delete',
  subject: string,
) => ({ policy: { action, subject } }) as const;

export const principalWorkspaceContract = {
  listInviteCodes: {
    method: 'get',
    path: '/principal-workspace/:schoolId/invites',
    request: {
      params: z.object({ schoolId: z.string() }),
    },
    responses: {
      200: {
        schema: z.array(InviteCodeSchema),
        description: 'List invite codes',
      },
    },
    metadata: principalWorkspaceAuthority('read', 'SchoolInvite'),
  },
  getInviteCodes: {
    method: 'get',
    path: '/principal-workspace/:schoolId/invites',
    request: {
      params: z.object({ schoolId: z.string() }),
    },
    responses: {
      200: {
        schema: z.array(InviteCodeSchema),
        description: 'Get invite codes',
      },
    },
    metadata: principalWorkspaceAuthority('read', 'SchoolInvite'),
  },
  generateInviteCode: {
    method: 'post',
    path: '/principal-workspace/:schoolId/invites',
    request: {
      params: z.object({ schoolId: z.string() }),
      body: z.object({
        capacity: PrincipalInviteRoleSchema,
        createdBy: z.string().min(1),
      }),
    },
    responses: {
      201: {
        schema: InviteCodeSchema,
        description: 'Invite code generated successfully',
      },
    },
    metadata: principalWorkspaceAuthority('create', 'SchoolInvite'),
  },
  listObservationsByDate: {
    method: 'get',
    path: '/principal-workspace/:principalId/observations',
    request: {
      params: z.object({ principalId: z.string() }),
      query: z.object({
        viewDate: z.string().min(1),
        limit: z.number().int().positive().max(100).optional(),
      }),
    },
    responses: {
      200: {
        schema: z.array(PrincipalObservationSchema),
        description: 'List observations by date',
      },
    },
    metadata: principalWorkspaceAuthority('read', 'PrincipalObservation'),
  },
  listRecentObservations: {
    method: 'get',
    path: '/principal-workspace/:principalId/observations/recent',
    request: {
      params: z.object({ principalId: z.string() }),
      query: z.object({
        limit: z.number().int().positive().max(100).optional(),
      }),
    },
    responses: {
      200: {
        schema: z.array(PrincipalObservationSchema),
        description: 'List recent observations',
      },
    },
    metadata: principalWorkspaceAuthority('read', 'PrincipalObservation'),
  },
  createObservation: {
    method: 'post',
    path: '/principal-workspace/observations',
    request: {
      body: PrincipalObservationCreateSchema,
    },
    responses: {
      201: {
        schema: PrincipalObservationSchema,
        description: 'Observation created successfully',
      },
    },
    metadata: principalWorkspaceAuthority('create', 'PrincipalObservation'),
  },
  recordInviteEvent: {
    method: 'post',
    path: '/principal-workspace/invites/events',
    request: {
      body: PrincipalInviteEventCreateSchema,
    },
    responses: {
      201: {
        schema: PrincipalGovernanceEventSchema,
        description: 'Invite event recorded successfully',
      },
    },
    metadata: principalWorkspaceAuthority('update', 'SchoolInvite'),
  },
  recordObservationFollowUp: {
    method: 'post',
    path: '/principal-workspace/observations/follow-up',
    request: {
      body: PrincipalObservationFollowUpCreateSchema,
    },
    responses: {
      201: {
        schema: PrincipalGovernanceEventSchema,
        description: 'Observation follow up recorded successfully',
      },
    },
    metadata: principalWorkspaceAuthority('update', 'PrincipalObservation'),
  },
  getGovernanceTimeline: {
    method: 'get',
    path: '/principal-workspace/:principalId/timeline',
    request: {
      params: z.object({ principalId: z.string() }),
      query: z.object({
        viewDate: z.string().min(1),
        limit: z.number().int().positive().max(200).optional(),
      }),
    },
    responses: {
      200: {
        schema: z.array(PrincipalGovernanceEventSchema),
        description: 'Retrieve governance timeline',
      },
    },
    metadata: principalWorkspaceAuthority('read', 'PrincipalObservation'),
  },
  getGovernanceSnapshotAsOf: {
    method: 'get',
    path: '/principal-workspace/:principalId/snapshot',
    request: {
      params: z.object({ principalId: z.string() }),
      query: z.object({
        viewDate: z.string().min(1),
        limit: z.number().int().positive().max(200).optional(),
      }),
    },
    responses: {
      200: {
        schema: z.array(PrincipalGovernanceEventSchema),
        description: 'Retrieve governance snapshot',
      },
    },
    metadata: principalWorkspaceAuthority('read', 'PrincipalObservation'),
  },
} as const satisfies SovereignContract;
