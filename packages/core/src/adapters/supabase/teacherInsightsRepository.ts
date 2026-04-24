import type { SupabaseClient } from '@supabase/supabase-js';
import type { TeacherInsightsRepository } from '../../logic/domains/teacherInsights/ports';
import {
  type TeacherInsightAuditEvent,
  TeacherInsightAuditEventSchema,
  type TeacherInsightLifecycleEvent,
  TeacherInsightLifecycleEventSchema,
  type TeacherInsightTargetType,
  type TeacherPrivateNoteCreate,
  TeacherPrivateNoteCreateSchema,
  TeacherPrivateNoteSchema,
  type TeacherPrivateNoteZod,
  type TeacherStudentObservationCreate,
  TeacherStudentObservationCreateSchema,
  TeacherStudentObservationSchema,
  type TeacherStudentObservationZod,
  TeacherStudentPotentialSchema,
  type TeacherStudentPotentialUpsert,
  TeacherStudentPotentialUpsertSchema,
  type TeacherStudentPotentialZod,
} from '../../logic/schemas/teacher-insights.schema';
import { APIError } from '../../types/API';

const privateAudit = (ownerId: string) => ({
  audit_required: true as const,
  owner_id: ownerId,
  share_state: 'private' as const,
});

const mapObservationShareState = (visibility: TeacherStudentObservationZod['visibility']) => {
  if (visibility === 'handover_visible') return 'shared_role' as const;
  if (visibility === 'student_visible') return 'shared_selected' as const;
  return 'private' as const;
};

const logInsightAudit = async ({
  supabase,
  action,
  entityId,
  entityType,
  executorId,
  metadata,
  idempotencyKey,
}: {
  supabase: SupabaseClient;
  action: string;
  entityId: string;
  entityType: string;
  executorId: string;
  metadata?: Record<string, unknown>;
  idempotencyKey?: string;
}) => {
  const { error } = await supabase.from('audit_logs').insert({
    action,
    entity_id: entityId,
    target_id: entityId,
    entity_type: entityType,
    executor_id: executorId,
    metadata: metadata ?? {},
    idempotency_key: idempotencyKey,
  });

  if (error) {
    console.warn('Failed to record teacher insight audit event', error);
  }
};

const recordInsightLifecycleEvent = async ({
  supabase,
  insightType,
  insightId,
  ownerId,
  schoolId,
  classroomId,
  studentId,
  eventType,
  visibility,
  shareState,
  promotionTarget,
  snapshot,
  occurredAt,
  effectiveFrom,
  effectiveTo,
  recordedBy,
  idempotencyKey,
}: {
  supabase: SupabaseClient;
  insightType: TeacherInsightTargetType;
  insightId: string;
  ownerId: string;
  schoolId?: string | null;
  classroomId?: string | null;
  studentId?: string | null;
  eventType: 'create' | 'update' | 'delete' | 'finalize' | 'share' | 'revoke_share' | 'promote';
  visibility?: 'private' | 'student_visible' | 'handover_visible' | null;
  shareState: 'private' | 'shared_selected' | 'shared_role' | 'official';
  promotionTarget?: string | null;
  snapshot: Record<string, unknown>;
  occurredAt?: string;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  recordedBy?: string | null;
  idempotencyKey?: string;
}) => {
  const { error } = await supabase.from('teacher_insight_events').insert({
    insight_type: insightType,
    insight_id: insightId,
    owner_id: ownerId,
    school_id: schoolId ?? null,
    classroom_id: classroomId ?? null,
    student_id: studentId ?? null,
    event_type: eventType,
    visibility: visibility ?? null,
    share_state: shareState,
    promotion_target: promotionTarget ?? null,
    snapshot,
    occurred_at: occurredAt ?? new Date().toISOString(),
    effective_from: effectiveFrom ?? occurredAt ?? new Date().toISOString(),
    effective_to: effectiveTo ?? null,
    recorded_by: recordedBy ?? null,
    idempotency_key: idempotencyKey,
  });

  if (error) {
    console.warn('Failed to record teacher insight lifecycle event', error);
  }
};

export const createSupabaseTeacherInsightsRepository = (
  supabase: SupabaseClient,
): TeacherInsightsRepository => ({
  async listPrivateNotes(teacherId, type) {
    let query = supabase
      .from('teacher_notes')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;
    if (error) throw new APIError('Failed to fetch teacher private notes', error.code, error);

    return (data ?? []).map((row) =>
      TeacherPrivateNoteSchema.parse({
        ...row,
        visibility: 'private',
        audit: privateAudit(String(row.teacher_id)),
      }),
    ) as TeacherPrivateNoteZod[];
  },

  async createPrivateNote(input, idempotencyKey) {
    const payload = TeacherPrivateNoteCreateSchema.parse(input) as TeacherPrivateNoteCreate;
    const { data, error } = await supabase
      .from('teacher_notes')
      .insert([
        {
          teacher_id: payload.teacherId,
          content: payload.content,
          type: payload.type,
          idempotency_key: idempotencyKey,
        },
      ])
      .select()
      .single();

    if (error) throw new APIError('Failed to create teacher private note', error.code, error);

    await recordInsightLifecycleEvent({
      supabase,
      insightType: 'teacher_note',
      insightId: String(data.id),
      ownerId: payload.teacherId,
      eventType: 'create',
      visibility: 'private',
      shareState: 'private',
      snapshot: data as Record<string, unknown>,
      occurredAt: String(data.created_at ?? new Date().toISOString()),
      effectiveFrom: String(data.created_at ?? new Date().toISOString()),
      recordedBy: payload.teacherId,
    });

    return TeacherPrivateNoteSchema.parse({
      ...data,
      visibility: 'private',
      audit: privateAudit(payload.teacherId),
    }) as TeacherPrivateNoteZod;
  },

  async deletePrivateNote(id) {
    const { data: existing, error: existingError } = await supabase
      .from('teacher_notes')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (existingError)
      throw new APIError(
        'Failed to fetch teacher private note before delete',
        existingError.code,
        existingError,
      );

    const { error } = await supabase.from('teacher_notes').delete().eq('id', id);
    if (error) throw new APIError('Failed to delete teacher private note', error.code, error);

    if (existing) {
      await recordInsightLifecycleEvent({
        supabase,
        insightType: 'teacher_note',
        insightId: String(existing.id),
        ownerId: String(existing.teacher_id),
        eventType: 'delete',
        visibility: 'private',
        shareState: 'private',
        snapshot: existing as Record<string, unknown>,
        occurredAt: new Date().toISOString(),
        effectiveFrom: String(existing.created_at ?? new Date().toISOString()),
        effectiveTo: new Date().toISOString(),
        recordedBy: String(existing.teacher_id),
      });
    }
  },

  async listStudentObservations(classroomId) {
    const { data, error } = await supabase
      .from('student_observations')
      .select('*')
      .eq('classroom_id', classroomId)
      .order('created_at', { ascending: false });

    if (error) throw new APIError('Failed to fetch student observations', error.code, error);

    return (data ?? []).map((row) =>
      TeacherStudentObservationSchema.parse({
        ...row,
        audit: {
          audit_required: true,
          owner_id: String(row.author_id),
          share_state: mapObservationShareState(
            row.visibility as TeacherStudentObservationZod['visibility'],
          ),
        },
      }),
    ) as TeacherStudentObservationZod[];
  },

  async listStudentObservationsForEnrollment(classroomStudentId) {
    const { data, error } = await supabase
      .from('student_observations')
      .select('*')
      .eq('classroom_student_id', classroomStudentId)
      .order('created_at', { ascending: false });

    if (error) throw new APIError('Failed to fetch enrollment observations', error.code, error);

    return (data ?? []).map((row) =>
      TeacherStudentObservationSchema.parse({
        ...row,
        audit: {
          audit_required: true,
          owner_id: String(row.author_id),
          share_state: mapObservationShareState(
            row.visibility as TeacherStudentObservationZod['visibility'],
          ),
        },
      }),
    ) as TeacherStudentObservationZod[];
  },

  async listStudentObservationsForStudent(studentId) {
    const { data, error } = await supabase
      .from('student_observations')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error)
      throw new APIError('Failed to fetch student observations for student', error.code, error);

    return (data ?? []).map((row) =>
      TeacherStudentObservationSchema.parse({
        ...row,
        audit: {
          audit_required: true,
          owner_id: String(row.author_id),
          share_state: mapObservationShareState(
            row.visibility as TeacherStudentObservationZod['visibility'],
          ),
        },
      }),
    ) as TeacherStudentObservationZod[];
  },

  async createStudentObservation(input, idempotencyKey) {
    const payload = TeacherStudentObservationCreateSchema.parse(
      input,
    ) as TeacherStudentObservationCreate;
    const { data, error } = await supabase
      .from('student_observations')
      .insert([{ ...payload, idempotency_key: idempotencyKey }])
      .select()
      .single();

    if (error) throw new APIError('Failed to create student observation', error.code, error);

    await recordInsightLifecycleEvent({
      supabase,
      insightType: 'student_observation',
      insightId: String(data.id),
      ownerId: String(data.author_id),
      schoolId: data.school_id ? String(data.school_id) : null,
      classroomId: data.classroom_id ? String(data.classroom_id) : null,
      studentId: data.student_id ? String(data.student_id) : null,
      eventType: 'create',
      visibility: data.visibility as 'private' | 'student_visible' | 'handover_visible',
      shareState: mapObservationShareState(
        data.visibility as TeacherStudentObservationZod['visibility'],
      ),
      snapshot: data as Record<string, unknown>,
      occurredAt: String(data.created_at ?? new Date().toISOString()),
      effectiveFrom: String(data.created_at ?? new Date().toISOString()),
      recordedBy: String(data.author_id),
    });

    return TeacherStudentObservationSchema.parse({
      ...data,
      audit: {
        audit_required: true,
        owner_id: String(data.author_id),
        share_state: mapObservationShareState(
          data.visibility as TeacherStudentObservationZod['visibility'],
        ),
      },
    }) as TeacherStudentObservationZod;
  },

  async finalizeStudentObservation(id, acceptDeclaration, idempotencyKey) {
    if (!acceptDeclaration) {
      throw new APIError(
        'Honesty declaration must be accepted to finalize',
        'DECLARATION_REQUIRED',
      );
    }

    const { data, error } = await supabase
      .from('student_observations')
      .update({
        is_finalized: true,
        honesty_declaration_accepted: true,
        idempotency_key: idempotencyKey,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new APIError('Failed to finalize student observation', error.code, error);

    await recordInsightLifecycleEvent({
      supabase,
      insightType: 'student_observation',
      insightId: String(data.id),
      ownerId: String(data.author_id),
      schoolId: data.school_id ? String(data.school_id) : null,
      classroomId: data.classroom_id ? String(data.classroom_id) : null,
      studentId: data.student_id ? String(data.student_id) : null,
      eventType: 'finalize',
      visibility: data.visibility as 'private' | 'student_visible' | 'handover_visible',
      shareState: mapObservationShareState(
        data.visibility as TeacherStudentObservationZod['visibility'],
      ),
      snapshot: data as Record<string, unknown>,
      occurredAt: String(data.updated_at ?? new Date().toISOString()),
      effectiveFrom: String(data.created_at ?? data.updated_at ?? new Date().toISOString()),
      recordedBy: String(data.author_id),
    });

    return TeacherStudentObservationSchema.parse({
      ...data,
      audit: {
        audit_required: true,
        owner_id: String(data.author_id),
        share_state: mapObservationShareState(
          data.visibility as TeacherStudentObservationZod['visibility'],
        ),
      },
    }) as TeacherStudentObservationZod;
  },

  async deleteStudentObservation(id) {
    const { data: existing, error: existingError } = await supabase
      .from('student_observations')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (existingError)
      throw new APIError(
        'Failed to fetch student observation before delete',
        existingError.code,
        existingError,
      );

    const { error } = await supabase.from('student_observations').delete().eq('id', id);

    if (error) throw new APIError('Failed to delete student observation', error.code, error);

    if (existing) {
      await recordInsightLifecycleEvent({
        supabase,
        insightType: 'student_observation',
        insightId: String(existing.id),
        ownerId: String(existing.author_id),
        schoolId: existing.school_id ? String(existing.school_id) : null,
        classroomId: existing.classroom_id ? String(existing.classroom_id) : null,
        studentId: existing.student_id ? String(existing.student_id) : null,
        eventType: 'delete',
        visibility: existing.visibility as 'private' | 'student_visible' | 'handover_visible',
        shareState: mapObservationShareState(
          existing.visibility as TeacherStudentObservationZod['visibility'],
        ),
        snapshot: existing as Record<string, unknown>,
        occurredAt: new Date().toISOString(),
        effectiveFrom: String(existing.created_at ?? new Date().toISOString()),
        effectiveTo: new Date().toISOString(),
        recordedBy: String(existing.author_id),
      });
    }
  },

  async shareStudentObservation(id, update, actorId, idempotencyKey) {
    const { data, error } = await supabase
      .from('student_observations')
      .update({
        visibility: update.visibility,
        idempotency_key: idempotencyKey,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new APIError('Failed to share student observation', error.code, error);

    await logInsightAudit({
      supabase,
      action: 'teacher_insight_shared',
      entityId: id,
      entityType: 'student_observation',
      executorId: actorId,
      metadata: {
        visibility: update.visibility,
        reason: update.reason ?? null,
      },
    });

    await recordInsightLifecycleEvent({
      supabase,
      insightType: 'student_observation',
      insightId: String(data.id),
      ownerId: String(data.author_id),
      schoolId: data.school_id ? String(data.school_id) : null,
      classroomId: data.classroom_id ? String(data.classroom_id) : null,
      studentId: data.student_id ? String(data.student_id) : null,
      eventType: 'share',
      visibility: update.visibility,
      shareState: mapObservationShareState(update.visibility),
      snapshot: {
        ...(data as Record<string, unknown>),
        share_reason: update.reason ?? null,
      },
      occurredAt: new Date().toISOString(),
      effectiveFrom: new Date().toISOString(),
      recordedBy: actorId,
    });

    return TeacherStudentObservationSchema.parse({
      ...data,
      audit: {
        audit_required: true,
        owner_id: String(data.author_id),
        share_state: mapObservationShareState(update.visibility),
      },
    }) as TeacherStudentObservationZod;
  },

  async revokeStudentObservationShare(id, actorId, idempotencyKey) {
    const { data, error } = await supabase
      .from('student_observations')
      .update({
        visibility: 'private',
        idempotency_key: idempotencyKey,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new APIError('Failed to revoke student observation share', error.code, error);

    await logInsightAudit({
      supabase,
      action: 'teacher_insight_share_revoked',
      entityId: id,
      entityType: 'student_observation',
      executorId: actorId,
    });

    await recordInsightLifecycleEvent({
      supabase,
      insightType: 'student_observation',
      insightId: String(data.id),
      ownerId: String(data.author_id),
      schoolId: data.school_id ? String(data.school_id) : null,
      classroomId: data.classroom_id ? String(data.classroom_id) : null,
      studentId: data.student_id ? String(data.student_id) : null,
      eventType: 'revoke_share',
      visibility: 'private',
      shareState: 'private',
      snapshot: data as Record<string, unknown>,
      occurredAt: new Date().toISOString(),
      effectiveFrom: new Date().toISOString(),
      recordedBy: actorId,
    });

    return TeacherStudentObservationSchema.parse({
      ...data,
      audit: {
        audit_required: true,
        owner_id: String(data.author_id),
        share_state: 'private',
      },
    }) as TeacherStudentObservationZod;
  },

  async promoteStudentObservation(id, promotion, actorId, idempotencyKey) {
    const { data: observation, error } = await supabase
      .from('student_observations')
      .select('*')
      .eq('id', id)
      .single();

    if (error)
      throw new APIError('Failed to fetch student observation for promotion', error.code, error);

    const recordedAt = new Date().toISOString();
    await logInsightAudit({
      supabase,
      action: 'teacher_insight_promoted',
      entityId: id,
      entityType: 'student_observation',
      executorId: actorId,
      metadata: {
        promotedTo: promotion.promotedTo,
        reason: promotion.reason,
        recordedAt,
      },
    });

    await recordInsightLifecycleEvent({
      supabase,
      insightType: 'student_observation',
      insightId: String(observation.id),
      ownerId: String(observation.author_id),
      schoolId: observation.school_id ? String(observation.school_id) : null,
      classroomId: observation.classroom_id ? String(observation.classroom_id) : null,
      studentId: observation.student_id ? String(observation.student_id) : null,
      eventType: 'promote',
      visibility: observation.visibility as 'private' | 'student_visible' | 'handover_visible',
      shareState: 'official',
      promotionTarget: promotion.promotedTo,
      snapshot: {
        ...(observation as Record<string, unknown>),
        promotion_reason: promotion.reason,
      },
      occurredAt: recordedAt,
      effectiveFrom: recordedAt,
      recordedBy: actorId,
      idempotencyKey,
    });

    return {
      success: true as const,
      recordedAt,
    };
  },

  async getStudentPotential(studentId, classroomId) {
    const { data, error } = await supabase
      .from('student_potential_analysis')
      .select('*')
      .eq('student_id', studentId)
      .eq('classroom_id', classroomId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw new APIError('Failed to fetch student potential', error.code, error);
    if (!data) return null;

    return TeacherStudentPotentialSchema.parse({
      ...data,
      potential_notes: data.potential_notes ?? [],
      visibility: 'private',
      audit: privateAudit(String(data.teacher_id)),
    }) as TeacherStudentPotentialZod;
  },

  async upsertStudentPotential(input, idempotencyKey) {
    const payload = TeacherStudentPotentialUpsertSchema.parse(
      input,
    ) as TeacherStudentPotentialUpsert;
    const { data, error } = await supabase.rpc('upsert_student_potential_analysis', {
      p_student_id: payload.student_id,
      p_classroom_id: payload.classroom_id,
      p_cognitive_flow: payload.cognitive_flow,
      p_emotional_resonance: payload.emotional_resonance,
      p_social_weaving: payload.social_weaving,
      p_creative_spark: payload.creative_spark,
      p_practical_mastery: payload.practical_mastery,
      p_silver_lining: payload.silver_lining ?? null,
      p_idempotency_key: idempotencyKey,
    });

    if (error) throw new APIError('Failed to save student potential', error.code, error);

    await recordInsightLifecycleEvent({
      supabase,
      insightType: 'student_potential',
      insightId: String(data.id),
      ownerId: String(data.teacher_id),
      classroomId: data.classroom_id ? String(data.classroom_id) : null,
      studentId: data.student_id ? String(data.student_id) : null,
      eventType: 'update',
      visibility: 'private',
      shareState: 'private',
      snapshot: data as Record<string, unknown>,
      occurredAt: String(data.updated_at ?? new Date().toISOString()),
      effectiveFrom: String(data.created_at ?? data.updated_at ?? new Date().toISOString()),
      recordedBy: String(data.teacher_id),
    });

    return TeacherStudentPotentialSchema.parse({
      ...data,
      potential_notes: data?.potential_notes ?? [],
      visibility: 'private',
      audit: privateAudit(String(data.teacher_id)),
    }) as TeacherStudentPotentialZod;
  },

  async getInsightAuditTrail(insightType, insightId) {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('id, action, entity_id, entity_type, executor_id, metadata, created_at')
      .eq('entity_type', insightType)
      .eq('entity_id', insightId)
      .order('created_at', { ascending: false });

    if (error) throw new APIError('Failed to fetch teacher insight audit trail', error.code, error);

    return (data ?? []).map((row) =>
      TeacherInsightAuditEventSchema.parse(row),
    ) as TeacherInsightAuditEvent[];
  },

  async getInsightTimeline(insightType, insightId) {
    const { data, error } = await supabase
      .from('teacher_insight_events')
      .select('*')
      .eq('insight_type', insightType)
      .eq('insight_id', insightId)
      .order('occurred_at', { ascending: false })
      .order('recorded_at', { ascending: false });

    if (error) throw new APIError('Failed to fetch teacher insight timeline', error.code, error);

    return (data ?? []).map((row) =>
      TeacherInsightLifecycleEventSchema.parse(row),
    ) as TeacherInsightLifecycleEvent[];
  },
});
