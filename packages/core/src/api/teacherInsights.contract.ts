import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { POAMetadataSchema } from './contract';
import {
  TeacherInsightAuditEventSchema,
  TeacherInsightLifecycleEventSchema,
  TeacherInsightPromotionSchema,
  TeacherInsightShareUpdateSchema,
  TeacherPrivateNoteCreateSchema,
  TeacherPrivateNoteSchema,
  TeacherStudentObservationCreateSchema,
  TeacherStudentObservationSchema,
  TeacherStudentPotentialSchema,
  TeacherStudentPotentialUpsertSchema,
} from './schemas/teacher-insights.schema';

const c = initContract();

const teacherInsightAuthority = (
  action: 'create' | 'read' | 'update' | 'delete',
  subject: string,
) => POAMetadataSchema.parse({ authority: { action, subject } });

export const teacherInsightsContract = c.router({
  listPrivateNotes: {
    method: 'GET',
    path: '/teacher-insights/:teacherId/notes',
    query: z.object({
      type: z.enum(['venting', 'reflection', 'note']).optional(),
    }),
    responses: {
      200: z.array(TeacherPrivateNoteSchema),
    },
    metadata: teacherInsightAuthority('read', 'TeacherInsight'),
  },
  createPrivateNote: {
    method: 'POST',
    path: '/teacher-insights/notes',
    body: TeacherPrivateNoteCreateSchema,
    responses: {
      201: TeacherPrivateNoteSchema,
    },
    metadata: teacherInsightAuthority('create', 'TeacherInsight'),
  },
  deletePrivateNote: {
    method: 'DELETE',
    path: '/teacher-insights/notes/:id',
    responses: {
      200: z.object({ success: z.literal(true) }),
    },
    metadata: teacherInsightAuthority('delete', 'TeacherInsight'),
  },
  listStudentObservations: {
    method: 'GET',
    path: '/teacher-insights/classrooms/:classroomId/observations',
    responses: {
      200: z.array(TeacherStudentObservationSchema),
    },
    metadata: teacherInsightAuthority('read', 'TeacherInsight'),
  },
  listStudentObservationsForEnrollment: {
    method: 'GET',
    path: '/teacher-insights/enrollments/:classroomStudentId/observations',
    responses: {
      200: z.array(TeacherStudentObservationSchema),
    },
    metadata: teacherInsightAuthority('read', 'TeacherInsight'),
  },
  listStudentObservationsForStudent: {
    method: 'GET',
    path: '/teacher-insights/students/:studentId/observations',
    responses: {
      200: z.array(TeacherStudentObservationSchema),
    },
    metadata: teacherInsightAuthority('read', 'TeacherInsight'),
  },
  createStudentObservation: {
    method: 'POST',
    path: '/teacher-insights/observations',
    body: TeacherStudentObservationCreateSchema,
    responses: {
      201: TeacherStudentObservationSchema,
    },
    metadata: teacherInsightAuthority('create', 'TeacherInsight'),
  },
  finalizeStudentObservation: {
    method: 'PATCH',
    path: '/teacher-insights/observations/:id/finalize',
    body: z.object({
      acceptDeclaration: z.literal(true),
    }),
    responses: {
      200: TeacherStudentObservationSchema,
    },
    metadata: teacherInsightAuthority('update', 'TeacherInsight'),
  },
  deleteStudentObservation: {
    method: 'DELETE',
    path: '/teacher-insights/observations/:id',
    responses: {
      200: z.object({ success: z.literal(true) }),
    },
    metadata: teacherInsightAuthority('delete', 'TeacherInsight'),
  },
  getStudentPotential: {
    method: 'GET',
    path: '/teacher-insights/students/:studentId/potential',
    query: z.object({
      classroomId: z.string().min(1),
    }),
    responses: {
      200: TeacherStudentPotentialSchema.nullable(),
    },
    metadata: teacherInsightAuthority('read', 'TeacherInsight'),
  },
  upsertStudentPotential: {
    method: 'PUT',
    path: '/teacher-insights/students/:studentId/potential',
    body: TeacherStudentPotentialUpsertSchema,
    responses: {
      200: TeacherStudentPotentialSchema,
    },
    metadata: teacherInsightAuthority('update', 'TeacherInsight'),
  },
  shareStudentObservation: {
    method: 'PATCH',
    path: '/teacher-insights/observations/:id/share',
    body: TeacherInsightShareUpdateSchema,
    responses: {
      200: TeacherStudentObservationSchema,
    },
    metadata: teacherInsightAuthority('update', 'TeacherInsight'),
  },
  revokeStudentObservationShare: {
    method: 'PATCH',
    path: '/teacher-insights/observations/:id/revoke-share',
    body: z.object({}),
    responses: {
      200: TeacherStudentObservationSchema,
    },
    metadata: teacherInsightAuthority('update', 'TeacherInsight'),
  },
  promoteStudentObservation: {
    method: 'POST',
    path: '/teacher-insights/observations/:id/promote',
    body: TeacherInsightPromotionSchema,
    responses: {
      200: z.object({
        success: z.literal(true),
        recordedAt: z.string(),
      }),
    },
    metadata: teacherInsightAuthority('create', 'TeacherInsightPromotion'),
  },
  getInsightAuditTrail: {
    method: 'GET',
    path: '/teacher-insights/:insightType/:insightId/audit',
    responses: {
      200: z.array(TeacherInsightAuditEventSchema),
    },
    metadata: teacherInsightAuthority('read', 'TeacherInsightAudit'),
  },
  getInsightTimeline: {
    method: 'GET',
    path: '/teacher-insights/:insightType/:insightId/timeline',
    responses: {
      200: z.array(TeacherInsightLifecycleEventSchema),
    },
    metadata: teacherInsightAuthority('read', 'TeacherInsight'),
  },
});
