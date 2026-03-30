import { z } from 'zod';

export const TeacherInsightShareStateSchema = z.enum([
  'private',
  'shared_selected',
  'shared_role',
  'official',
]);

export const TeacherInsightTargetTypeSchema = z.enum([
  'student_observation',
  'teacher_note',
  'student_potential',
]);

export const TeacherInsightAuditEventSchema = z.object({
  id: z.string(),
  action: z.string(),
  entity_id: z.string().nullable().optional(),
  entity_type: z.string().nullable().optional(),
  executor_id: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.any()).nullable().optional(),
  created_at: z.string(),
});

export const TeacherInsightLifecycleEventSchema = z.object({
  id: z.string(),
  insight_type: TeacherInsightTargetTypeSchema,
  insight_id: z.string(),
  owner_id: z.string(),
  school_id: z.string().nullable().optional(),
  classroom_id: z.string().nullable().optional(),
  student_id: z.string().nullable().optional(),
  event_type: z.enum(['create', 'update', 'delete', 'finalize', 'share', 'revoke_share', 'promote']),
  visibility: z.enum(['private', 'student_visible', 'handover_visible']).nullable().optional(),
  share_state: TeacherInsightShareStateSchema,
  promotion_target: z.string().nullable().optional(),
  snapshot: z.record(z.string(), z.any()),
  occurred_at: z.string(),
  recorded_at: z.string(),
  effective_from: z.string().nullable().optional(),
  effective_to: z.string().nullable().optional(),
  recorded_by: z.string().nullable().optional(),
});

export const TeacherInsightShareUpdateSchema = z.object({
  visibility: z.enum(['student_visible', 'handover_visible']),
  reason: z.string().optional(),
});

export const TeacherInsightPromotionSchema = z.object({
  promotedTo: z.enum(['official_concern', 'handover_record', 'student_support_flag']),
  reason: z.string().min(1),
});

export const TeacherInsightAuditMarkerSchema = z.object({
  audit_required: z.literal(true),
  owner_id: z.string().min(1),
  share_state: TeacherInsightShareStateSchema,
});

export const TeacherPrivateNoteSchema = z.object({
  id: z.string(),
  teacher_id: z.string(),
  content: z.string().min(1),
  type: z.enum(['venting', 'reflection', 'note']),
  created_at: z.string(),
  updated_at: z.string(),
  visibility: z.literal('private'),
  audit: TeacherInsightAuditMarkerSchema,
});

export const TeacherPrivateNoteCreateSchema = z.object({
  teacherId: z.string().min(1),
  content: z.string().min(1),
  type: z.enum(['venting', 'reflection', 'note']).default('note'),
});

export const TeacherStudentObservationSchema = z.object({
  id: z.string(),
  classroom_id: z.string(),
  classroom_student_id: z.string(),
  student_id: z.string().optional(),
  author_id: z.string(),
  content: z.string().min(1),
  observation_type: z.enum(['positive', 'growth', 'neutral', 'concern']),
  visibility: z.enum(['private', 'student_visible', 'handover_visible']),
  is_finalized: z.boolean(),
  honesty_declaration_accepted: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  audit: TeacherInsightAuditMarkerSchema,
});

export const TeacherStudentObservationCreateSchema = z.object({
  classroom_id: z.string().min(1),
  classroom_student_id: z.string().min(1),
  student_id: z.string().optional(),
  content: z.string().min(1),
  observation_type: z.enum(['positive', 'growth', 'neutral', 'concern']),
  visibility: z.enum(['private', 'student_visible', 'handover_visible']).default('private'),
});

export const TeacherStudentPotentialSchema = z.object({
  id: z.string(),
  student_id: z.string(),
  teacher_id: z.string(),
  classroom_id: z.string(),
  cognitive_flow: z.number(),
  emotional_resonance: z.number(),
  social_weaving: z.number(),
  creative_spark: z.number(),
  practical_mastery: z.number(),
  silver_lining: z.string().nullable(),
  potential_notes: z.array(z.any()),
  created_at: z.string(),
  updated_at: z.string(),
  visibility: z.literal('private'),
  audit: TeacherInsightAuditMarkerSchema,
});

export const TeacherStudentPotentialUpsertSchema = z.object({
  student_id: z.string().min(1),
  classroom_id: z.string().min(1),
  cognitive_flow: z.number(),
  emotional_resonance: z.number(),
  social_weaving: z.number(),
  creative_spark: z.number(),
  practical_mastery: z.number(),
  silver_lining: z.string().nullable().optional(),
});

export type TeacherPrivateNoteZod = z.infer<typeof TeacherPrivateNoteSchema>;
export type TeacherPrivateNoteCreate = z.infer<typeof TeacherPrivateNoteCreateSchema>;
export type TeacherStudentObservationZod = z.infer<typeof TeacherStudentObservationSchema>;
export type TeacherStudentObservationCreate = z.infer<typeof TeacherStudentObservationCreateSchema>;
export type TeacherStudentPotentialZod = z.infer<typeof TeacherStudentPotentialSchema>;
export type TeacherStudentPotentialUpsert = z.infer<typeof TeacherStudentPotentialUpsertSchema>;
export type TeacherInsightAuditEvent = z.infer<typeof TeacherInsightAuditEventSchema>;
export type TeacherInsightLifecycleEvent = z.infer<typeof TeacherInsightLifecycleEventSchema>;
export type TeacherInsightShareUpdate = z.infer<typeof TeacherInsightShareUpdateSchema>;
export type TeacherInsightPromotion = z.infer<typeof TeacherInsightPromotionSchema>;
export type TeacherInsightTargetType = z.infer<typeof TeacherInsightTargetTypeSchema>;
