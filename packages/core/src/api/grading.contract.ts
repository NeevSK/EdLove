import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import {
  GradeSchema,
  ClassroomGradingSettingsSchema,
  GradebookSnapshotSchema,
  SchoolGradingCompletionSchema,
  PublishedStudentGradesSnapshotSchema,
  PublishedSchoolGradingCompletionSchema,
} from './schemas/grading.schema';
import { POAMetadataSchema } from './contract';

const c = initContract();

export const gradingContract = c.router({
  getReportCard: {
    method: 'GET',
    path: '/grades/report-card',
    responses: {
      200: z.array(GradeSchema),
    },
    query: z.object({
      studentId: z.string().uuid(),
    }),
    metadata: POAMetadataSchema.parse({
      authority: {
        action: 'read',
        subject: 'Grade',
      },
    }),
    summary: 'Retrieve grades for a student',
  },
  getClassroomGrades: {
    method: 'GET',
    path: '/grades/classroom',
    responses: {
      200: z.array(GradeSchema),
    },
    query: z.object({
      classroomId: z.string().uuid(),
    }),
    metadata: POAMetadataSchema.parse({
      authority: {
        action: 'read',
        subject: 'Grade',
      },
    }),
    summary: 'Retrieve grades for a classroom',
  },
  getGradebookSnapshot: {
    method: 'GET',
    path: '/grades/classroom/snapshot',
    responses: {
      200: GradebookSnapshotSchema,
    },
    query: z.object({
      classroomId: z.string().uuid(),
      viewDate: z.string(),
    }),
    metadata: POAMetadataSchema.parse({
      authority: {
        action: 'read',
        subject: 'Grade',
      },
    }),
    summary: 'Retrieve classroom gradebook snapshot for a view date',
  },
  getStudentGradeTimeline: {
    method: 'GET',
    path: '/grades/student/timeline',
    responses: {
      200: z.array(GradeSchema),
    },
    query: z.object({
      studentId: z.string().uuid(),
      classroomId: z.string().uuid().optional(),
      fromDate: z.string().optional(),
      toDate: z.string().optional(),
    }),
    metadata: POAMetadataSchema.parse({
      authority: {
        action: 'read',
        subject: 'Grade',
      },
    }),
    summary: 'Retrieve longitudinal grade timeline for a student',
  },
  getPublishedStudentGrades: {
    method: 'GET',
    path: '/grades/student/published',
    responses: {
      200: PublishedStudentGradesSnapshotSchema,
    },
    query: z.object({
      studentId: z.string().uuid(),
      viewDate: z.string(),
      classroomId: z.string().uuid().optional(),
    }),
    metadata: POAMetadataSchema.parse({
      authority: {
        action: 'read',
        subject: 'Grade',
      },
    }),
    summary: 'Retrieve guardian-safe and admin-safe published grade snapshot for a student',
  },
  getSchoolGradingCompletion: {
    method: 'GET',
    path: '/grades/school/completion',
    responses: {
      200: SchoolGradingCompletionSchema,
    },
    query: z.object({
      schoolId: z.string().uuid(),
      viewDate: z.string(),
    }),
    metadata: POAMetadataSchema.parse({
      authority: {
        action: 'read',
        subject: 'Grade',
      },
    }),
    summary: 'Retrieve institutional grading completion projection',
  },
  getSchoolPublishedGradingCompletion: {
    method: 'GET',
    path: '/grades/school/published-completion',
    responses: {
      200: PublishedSchoolGradingCompletionSchema,
    },
    query: z.object({
      schoolId: z.string().uuid(),
      viewDate: z.string(),
    }),
    metadata: POAMetadataSchema.parse({
      authority: {
        action: 'read',
        subject: 'Grade',
      },
    }),
    summary: 'Retrieve published-only institutional grading completion projection',
  },
  saveGradeDraft: {
    method: 'POST',
    path: '/grades/draft',
    body: z.object({
      studentId: z.string().uuid(),
      classroomId: z.string().uuid(),
      marks: z.number(),
      assignmentId: z.string().uuid().optional(),
      feedback: z.string().optional(),
    }),
    responses: {
      201: GradeSchema,
    },
    metadata: POAMetadataSchema.parse({
      authority: {
        action: 'grade',
        subject: 'Grade',
      },
    }),
    summary: 'Save a grade draft for a student',
  },
  submitGrade: {
    method: 'POST',
    path: '/grades',
    body: z.object({
      studentId: z.string().uuid(),
      classroomId: z.string().uuid(),
      marks: z.number(),
      assignmentId: z.string().uuid().optional(),
      feedback: z.string().optional(),
    }),
    responses: {
      201: GradeSchema,
    },
    metadata: POAMetadataSchema.parse({
      authority: {
        action: 'grade',
        subject: 'Grade',
      },
    }),
    summary: 'Submit a new grade for a student',
  },
  publishGrade: {
    method: 'POST',
    path: '/grades/:id/publish',
    body: z.object({}),
    responses: {
      200: GradeSchema,
    },
    metadata: POAMetadataSchema.parse({
      authority: {
        action: 'publish',
        subject: 'Grade',
      },
    }),
    summary: 'Publish a draft grade for institutional and guardian visibility',
  },
  revisePublishedGrade: {
    method: 'PATCH',
    path: '/grades/:id/revise',
    body: z.object({
      marks: z.number(),
      feedback: z.string().optional(),
    }),
    responses: {
      200: GradeSchema,
    },
    metadata: POAMetadataSchema.parse({
      authority: {
        action: 'update',
        subject: 'Grade',
      },
    }),
    summary: 'Revise an already published grade and persist a new published snapshot',
  },
  overrideGrade: {
    method: 'PATCH',
    path: '/grades/:id/override',
    body: z.object({
      marks: z.number(),
      feedback: z.string().optional(),
    }),
    responses: {
      200: GradeSchema,
    },
    metadata: POAMetadataSchema.parse({
      authority: {
        action: 'override',
        subject: 'Grade',
      },
    }),
    summary: 'Override a grade with audited authority',
  },
  deleteGrade: {
    method: 'DELETE',
    path: '/grades/:id',
    responses: {
      204: z.void(),
    },
    metadata: POAMetadataSchema.parse({
      authority: {
        action: 'delete',
        subject: 'Grade',
      },
    }),
    summary: 'Delete a grade',
  },
  getGradingSettings: {
    method: 'GET',
    path: '/grades/settings/:classroomId',
    responses: {
      200: ClassroomGradingSettingsSchema,
    },
    metadata: POAMetadataSchema.parse({
      authority: {
        action: 'read',
        subject: 'Grade',
      },
    }),
    summary: 'Retrieve grading settings for a classroom',
  },
  updateGradingSettings: {
    method: 'PATCH',
    path: '/grades/settings/:classroomId',
    body: ClassroomGradingSettingsSchema.partial(),
    responses: {
      200: ClassroomGradingSettingsSchema,
    },
    metadata: POAMetadataSchema.parse({
      authority: {
        action: 'update',
        subject: 'Grade',
      },
    }),
    summary: 'Update grading settings for a classroom',
  },
});
