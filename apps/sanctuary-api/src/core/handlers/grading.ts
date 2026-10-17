import { ORPCError } from '@orpc/server';
import { gradingORPCContract } from '@repo/core/api/grading.orpc.contract';
import { assertDatabase } from '../apiErrors';
import { implement, type ORPCContext } from '../orpc';
import { doubleGateMiddleware } from '../orpcMiddleware';

const impl = implement(gradingORPCContract).$context<ORPCContext>();

const iso = (value: unknown) => (value instanceof Date ? value.toISOString() : String(value ?? ''));

function letterGrade(percentage: number) {
  if (percentage >= 75) return 'A';
  if (percentage >= 65) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'S';
  return 'F';
}

function mapGradeMark(row: any) {
  return {
    id: String(row.id),
    student_id: String(row.student_id),
    school_id: String(row.school_id),
    academic_cycle_id: String(row.academic_cycle_id),
    grade_class_id: String(row.grade_class_id),
    term_id: String(row.term_id),
    subject_id: String(row.subject_id),
    assignment_id: row.assignment_id ?? null,
    submission_id: row.submission_id ?? null,
    marks_earned: Number(row.marks_earned),
    max_points: Number(row.max_points),
    percentage: Number(row.percentage),
    gpa: Number(row.gpa),
    letter_grade: String(row.letter_grade ?? ''),
    publication_state: String(row.publication_state ?? 'draft'),
    graded_by: String(row.graded_by),
    graded_at: iso(row.graded_at),
    published_by: row.published_by ?? null,
    published_at: row.published_at ? iso(row.published_at) : null,
    feedback: row.feedback ?? null,
    idempotency_key: row.idempotency_key ?? null,
    created_at: iso(row.created_at),
    updated_at: iso(row.updated_at),
  };
}

function lifecycleWhere(input: Record<string, string>, extra: Record<string, unknown> = {}) {
  return {
    school_id: input.schoolId,
    academic_cycle_id: input.academicCycleId,
    ...extra,
  };
}

export const gradingRouter = impl.router({
  getGradingSettings: impl.getGradingSettings
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      assertDatabase(context);
      const row = await (context.db as any).classroomGradingSettings.findUnique({
        where: { classroom_id: input.params.classroomId },
      });
      return (
        row ?? { classroom_id: input.params.classroomId, grading_mode: 'both', show_ranks: true }
      );
    }),

  updateGradingSettings: impl.updateGradingSettings
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      assertDatabase(context);
      return (context.db as any).classroomGradingSettings.upsert({
        where: { classroom_id: input.params.classroomId },
        create: {
          classroom_id: input.params.classroomId,
          grading_mode: input.body.grading_mode ?? 'both',
          show_ranks: input.body.show_ranks ?? true,
        },
        update: {
          ...(input.body.grading_mode !== undefined
            ? { grading_mode: input.body.grading_mode }
            : {}),
          ...(input.body.show_ranks !== undefined ? { show_ranks: input.body.show_ranks } : {}),
        },
      });
    }),

  getReportCard: impl.getReportCard
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      assertDatabase(context);
      const rows = await (context.db as any).gradeMark.findMany({
        where: lifecycleWhere(input.query, {
          student_id: input.query.studentId,
          ...(input.query.termId ? { term_id: input.query.termId } : {}),
          ...(input.query.subjectId ? { subject_id: input.query.subjectId } : {}),
        }),
        orderBy: [{ term_id: 'asc' }, { subject_id: 'asc' }, { created_at: 'desc' }],
      });
      return rows.map(mapGradeMark);
    }),

  getClassroomGrades: impl.getClassroomGrades
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      assertDatabase(context);
      const rows = await (context.db as any).gradeMark.findMany({
        where: lifecycleWhere(input.query, {
          grade_class_id: input.query.gradeClassId,
          ...(input.query.termId ? { term_id: input.query.termId } : {}),
          ...(input.query.subjectId ? { subject_id: input.query.subjectId } : {}),
        }),
        orderBy: [{ student_id: 'asc' }, { created_at: 'desc' }],
      });
      return rows.map(mapGradeMark);
    }),

  submitGrade: impl.submitGrade.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    assertDatabase(context);
    if (input.body.schoolId !== context.schoolId) {
      throw new ORPCError('FORBIDDEN', { message: 'Grade scope is outside the active school.' });
    }
    const percentage = (input.body.marksEarned / input.body.maxPoints) * 100;
    const gradeMark = await context.db.$transaction(async (tx) => {
      const gradeMark = await tx.gradeMark.create({
        data: {
          student_id: input.body.studentId,
          school_id: input.body.schoolId,
          academic_cycle_id: input.body.academicCycleId,
          grade_class_id: input.body.gradeClassId,
          term_id: input.body.termId,
          subject_id: input.body.subjectId,
          marks_earned: input.body.marksEarned,
          max_points: input.body.maxPoints,
          percentage,
          gpa: percentage / 25,
          letter_grade: letterGrade(percentage),
          assignment_id: input.body.assignmentId,
          submission_id: input.body.submissionId,
          feedback: input.body.feedback,
          idempotency_key: input.body.idempotencyKey,
          graded_by: context.user.id,
          graded_at: new Date(),
        },
      });
      await tx.sentinelAuditLog.create({
        data: {
          action: 'grade_mark_submitted',
          resource_id: gradeMark.id,
          resource_type: 'grade_mark',
          actor_id: context.user.id,
          details: input.body,
        },
      });
      return gradeMark;
    });
    return mapGradeMark(gradeMark);
  }),

  publishGrade: impl.publishGrade.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    assertDatabase(context);
    const gradeMark = await context.db.$transaction(async (tx) => {
      const gradeMark = await tx.gradeMark.update({
        where: { id: input.params.id },
        data: {
          publication_state: 'published',
          published_at: new Date(),
          published_by: context.user.id,
        },
      });
      if (!gradeMark) throw new ORPCError('NOT_FOUND', { message: 'Grade mark not found' });
      await tx.sentinelAuditLog.create({
        data: {
          action: 'grade_mark_published',
          resource_id: input.params.id,
          resource_type: 'grade_mark',
          actor_id: context.user.id,
          details: { publication_state: 'published' },
        },
      });
      return gradeMark;
    });
    return mapGradeMark(gradeMark);
  }),
});
