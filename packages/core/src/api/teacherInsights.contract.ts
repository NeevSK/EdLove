import { z } from 'zod';
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
} from '@/logic/schemas/teacher-insights.schema';
import type { SovereignContract } from '@/api/contract';

const teacherInsightAuthority = (
  action: 'create' | 'read' | 'update' | 'delete',
  subject: string,
) => ({ policy: { action, subject } }) as const;

export const teacherInsightsContract = {
  listPrivateNotes: {
    method: 'get',
    path: '/teacher-insights/:teacherId/notes',
    request: {
      params: z.object({ teacherId: z.string() }),
      query: z.object({
        type: z.enum(['venting', 'reflection', 'note']).optional(),
      }),
    },
    responses: {
      200: {
        schema: z.array(TeacherPrivateNoteSchema),
        description: 'List private notes',
      },
    },
    metadata: teacherInsightAuthority('read', 'TeacherInsight'),
  },
  createPrivateNote: {
    method: 'post',
    path: '/teacher-insights/notes',
    request: {
      body: TeacherPrivateNoteCreateSchema,
    },
    responses: {
      201: {
        schema: TeacherPrivateNoteSchema,
        description: 'Private note created successfully',
      },
    },
    metadata: teacherInsightAuthority('create', 'TeacherInsight'),
  },
  deletePrivateNote: {
    method: 'delete',
    path: '/teacher-insights/notes/:id',
    request: {
      params: z.object({ id: z.string() }),
    },
    responses: {
      200: {
        schema: z.object({ success: z.literal(true) }),
        description: 'Private note deleted successfully',
      },
    },
    metadata: teacherInsightAuthority('delete', 'TeacherInsight'),
  },
  listStudentObservations: {
    method: 'get',
    path: '/teacher-insights/classrooms/:classroomId/observations',
    request: {
      params: z.object({ classroomId: z.string() }),
    },
    responses: {
      200: {
        schema: z.array(TeacherStudentObservationSchema),
        description: 'List student observations for classroom',
      },
    },
    metadata: teacherInsightAuthority('read', 'TeacherInsight'),
  },
  listStudentObservationsForEnrollment: {
    method: 'get',
    path: '/teacher-insights/enrollments/:classroomStudentId/observations',
    request: {
      params: z.object({ classroomStudentId: z.string() }),
    },
    responses: {
      200: {
        schema: z.array(TeacherStudentObservationSchema),
        description: 'List student observations for enrollment',
      },
    },
    metadata: teacherInsightAuthority('read', 'TeacherInsight'),
  },
  listStudentObservationsForStudent: {
    method: 'get',
    path: '/teacher-insights/students/:studentId/observations',
    request: {
      params: z.object({ studentId: z.string() }),
    },
    responses: {
      200: {
        schema: z.array(TeacherStudentObservationSchema),
        description: 'List student observations for student',
      },
    },
    metadata: teacherInsightAuthority('read', 'TeacherInsight'),
  },
  createStudentObservation: {
    method: 'post',
    path: '/teacher-insights/observations',
    request: {
      body: TeacherStudentObservationCreateSchema,
    },
    responses: {
      201: {
        schema: TeacherStudentObservationSchema,
        description: 'Student observation created successfully',
      },
    },
    metadata: teacherInsightAuthority('create', 'TeacherInsight'),
  },
  finalizeStudentObservation: {
    method: 'patch',
    path: '/teacher-insights/observations/:id/finalize',
    request: {
      params: z.object({ id: z.string() }),
      body: z.object({
        acceptDeclaration: z.literal(true),
      }),
    },
    responses: {
      200: {
        schema: TeacherStudentObservationSchema,
        description: 'Student observation finalized successfully',
      },
    },
    metadata: teacherInsightAuthority('update', 'TeacherInsight'),
  },
  deleteStudentObservation: {
    method: 'delete',
    path: '/teacher-insights/observations/:id',
    request: {
      params: z.object({ id: z.string() }),
    },
    responses: {
      200: {
        schema: z.object({ success: z.literal(true) }),
        description: 'Student observation deleted successfully',
      },
    },
    metadata: teacherInsightAuthority('delete', 'TeacherInsight'),
  },
  getStudentPotential: {
    method: 'get',
    path: '/teacher-insights/students/:studentId/potential',
    request: {
      params: z.object({ studentId: z.string() }),
      query: z.object({
        classroomId: z.string().min(1),
      }),
    },
    responses: {
      200: {
        schema: TeacherStudentPotentialSchema.nullable(),
        description: 'Get student potential',
      },
    },
    metadata: teacherInsightAuthority('read', 'TeacherInsight'),
  },
  upsertStudentPotential: {
    method: 'put',
    path: '/teacher-insights/students/:studentId/potential',
    request: {
      params: z.object({ studentId: z.string() }),
      body: TeacherStudentPotentialUpsertSchema,
    },
    responses: {
      200: {
        schema: TeacherStudentPotentialSchema,
        description: 'Student potential upserted successfully',
      },
    },
    metadata: teacherInsightAuthority('update', 'TeacherInsight'),
  },
  shareStudentObservation: {
    method: 'patch',
    path: '/teacher-insights/observations/:id/share',
    request: {
      params: z.object({ id: z.string() }),
      body: TeacherInsightShareUpdateSchema,
    },
    responses: {
      200: {
        schema: TeacherStudentObservationSchema,
        description: 'Student observation shared successfully',
      },
    },
    metadata: teacherInsightAuthority('update', 'TeacherInsight'),
  },
  revokeStudentObservationShare: {
    method: 'patch',
    path: '/teacher-insights/observations/:id/revoke-share',
    request: {
      params: z.object({ id: z.string() }),
      body: z.object({}),
    },
    responses: {
      200: {
        schema: TeacherStudentObservationSchema,
        description: 'Student observation share revoked successfully',
      },
    },
    metadata: teacherInsightAuthority('update', 'TeacherInsight'),
  },
  promoteStudentObservation: {
    method: 'post',
    path: '/teacher-insights/observations/:id/promote',
    request: {
      params: z.object({ id: z.string() }),
      body: TeacherInsightPromotionSchema,
    },
    responses: {
      200: {
        schema: z.object({
          success: z.literal(true),
          recordedAt: z.string(),
        }),
        description: 'Student observation promoted successfully',
      },
    },
    metadata: teacherInsightAuthority('create', 'TeacherInsightPromotion'),
  },
  getInsightAuditTrail: {
    method: 'get',
    path: '/teacher-insights/:insightType/:insightId/audit',
    request: {
      params: z.object({
        insightType: z.string(),
        insightId: z.string(),
      }),
    },
    responses: {
      200: {
        schema: z.array(TeacherInsightAuditEventSchema),
        description: 'Get insight audit trail',
      },
    },
    metadata: teacherInsightAuthority('read', 'TeacherInsightAudit'),
  },
  getInsightTimeline: {
    method: 'get',
    path: '/teacher-insights/:insightType/:insightId/timeline',
    request: {
      params: z.object({
        insightType: z.string(),
        insightId: z.string(),
      }),
    },
    responses: {
      200: {
        schema: z.array(TeacherInsightLifecycleEventSchema),
        description: 'Get insight timeline',
      },
    },
    metadata: teacherInsightAuthority('read', 'TeacherInsight'),
  },
} as const satisfies SovereignContract;
