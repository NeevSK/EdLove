import { z } from 'zod';
import { GradeMarkSchema } from '@repo/core/logic/schemas/grade-domain.schema';
import type { SovereignContract } from '@repo/core/api/contracts';

const gradingAuthority = (
  action: 'read' | 'grade' | 'publish',
) => ({ policy: { action, subject: 'GradeMark' } }) as const;

const lifecycleReadScope = z.object({
  studentId: z.uuid(),
  schoolId: z.uuid(),
  academicCycleId: z.uuid(),
  termId: z.uuid().optional(),
  subjectId: z.uuid().optional(),
});

const gradeMarkResponse = {
  schema: GradeMarkSchema,
  description: 'Authoritative grade mark',
};

/** Sanctuary grading API. All data is backed by the academic lifecycle GradeMark model. */
export const gradingContract = {
  getReportCard: {
    method: 'get',
    path: '/grades/report-card',
    request: { query: z.strictObject(lifecycleReadScope.shape) },
    responses: {
      200: { schema: z.array(GradeMarkSchema), description: 'Retrieve grade marks for a student and academic cycle' },
    },
    metadata: gradingAuthority('read'),
  },

  getClassroomGrades: {
    method: 'get',
    path: '/grades/classroom',
    request: {
      query: z.strictObject({
        schoolId: z.uuid(),
        academicCycleId: z.uuid(),
        gradeClassId: z.uuid(),
        termId: z.uuid().optional(),
        subjectId: z.uuid().optional(),
      }),
    },
    responses: {
      200: { schema: z.array(GradeMarkSchema), description: 'Retrieve grade marks for a lifecycle grade class' },
    },
    metadata: gradingAuthority('read'),
  },

  submitGrade: {
    method: 'post',
    path: '/grades',
    request: {
      body: z.strictObject({
        studentId: z.uuid(),
        schoolId: z.uuid(),
        academicCycleId: z.uuid(),
        gradeClassId: z.uuid(),
        termId: z.uuid(),
        subjectId: z.uuid(),
        marksEarned: z.number().finite().min(0),
        maxPoints: z.number().finite().positive(),
        assignmentId: z.uuid().optional(),
        submissionId: z.uuid().optional(),
        idempotencyKey: z.string().trim().min(1).optional(),
        feedback: z.string().optional(),
      }).superRefine((input, context) => {
        if (input.marksEarned > input.maxPoints) {
          context.addIssue({ code: 'too_big', origin: 'number', maximum: input.maxPoints, inclusive: true, path: ['marksEarned'], message: 'Marks earned cannot exceed max points' });
        }
      }),
    },
    responses: { 201: gradeMarkResponse },
    metadata: gradingAuthority('grade'),
  },

  publishGrade: {
    method: 'post',
    path: '/grades/:id/publish',
    request: { params: z.strictObject({ id: z.uuid() }) },
    responses: { 200: gradeMarkResponse },
    metadata: gradingAuthority('publish'),
  },
} as const satisfies SovereignContract;
