import { z } from 'zod';
import { RoleSchema } from '../../permissions/schemas/role.schema';

export const PrincipalInviteRoleSchema = z.enum([
  'teacher',
  'principal',
  'student',
  'gradeHead',
  'sectionHead',
  'assistantPrincipal',
]);
export const PrincipalGovernanceEventTypeSchema = z.enum([
  'create',
  'read',
  'use',
  'expire',
  'revoke',
  'follow_up',
  'approve',
]);

export const InviteCodeSchema = z.object({
  code: z.string().min(1),
  school_id: z.string(),
  authority: RoleSchema,
  created_by: z.string(),
  used: z.boolean(),
  created_at: z.string(),
  expires_at: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
});

export const PrincipalObservationSchema = z.object({
  id: z.string(),
  school_id: z.string(),
  principal_id: z.string(),
  type: z.string().min(1),
  content: z.string().min(1),
  created_at: z.string(),
});

export const PrincipalObservationCreateSchema = z.object({
  schoolId: z.string().min(1),
  principalId: z.string().min(1),
  type: z.string().min(1),
  content: z.string().min(1),
});

export const PrincipalInviteEventCreateSchema = z.object({
  schoolId: z.string().min(1),
  principalId: z.string().min(1),
  inviteCode: z.string().min(1),
  eventType: z.enum(['use', 'expire', 'revoke']),
  occurredAt: z.string().optional(),
  effectiveTo: z.string().optional().nullable(),
  snapshot: z.record(z.string(), z.any()).optional(),
});

export const PrincipalObservationFollowUpCreateSchema = z.object({
  schoolId: z.string().min(1),
  principalId: z.string().min(1),
  observationId: z.string().min(1),
  content: z.string().min(1),
  status: z.enum(['noted', 'escalated', 'resolved']).default('noted'),
  occurredAt: z.string().optional(),
});

export const PrincipalGovernanceEventSchema = z.object({
  id: z.string(),
  school_id: z.string(),
  principal_id: z.string(),
  entity_type: z.enum(['principal_observation', 'school_invite']),
  entity_id: z.string(),
  event_type: PrincipalGovernanceEventTypeSchema,
  snapshot: z.record(z.string(), z.any()),
  occurred_at: z.string(),
  recorded_at: z.string(),
  effective_from: z.string().nullable().optional(),
  effective_to: z.string().nullable().optional(),
  recorded_by: z.string().nullable().optional(),
});

export type InviteCodeZod = z.infer<typeof InviteCodeSchema>;
export type PrincipalInviteRole = z.infer<typeof PrincipalInviteRoleSchema>;
export type PrincipalObservationZod = z.infer<typeof PrincipalObservationSchema>;
export type PrincipalObservationCreate = z.infer<typeof PrincipalObservationCreateSchema>;
export type PrincipalInviteEventCreate = z.infer<typeof PrincipalInviteEventCreateSchema>;
export type PrincipalObservationFollowUpCreate = z.infer<
  typeof PrincipalObservationFollowUpCreateSchema
>;
export type PrincipalGovernanceEventZod = z.infer<typeof PrincipalGovernanceEventSchema>;
