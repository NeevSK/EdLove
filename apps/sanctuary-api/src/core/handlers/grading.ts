import { implement } from '../orpc';
import { ORPCError } from '@orpc/server';
import { gradingORPCContract } from '@repo/core/api/grading.orpc.contract';
import type { ORPCContext } from '../orpc';
import { doubleGateMiddleware } from '../orpcMiddleware';

const impl = implement(gradingORPCContract).$context<ORPCContext>();
const iso = (value: unknown) => value instanceof Date ? value.toISOString() : value ? String(value) : null;
const mapGrade = (row: any) => ({
  id: String(row.id), classroom_id: String(row.classroom_id), assignment_id: row.assignment_id ?? null, student_id: String(row.student_id), graded_by: String(row.graded_by),
  marks: Number(row.marks), grade: String(row.grade ?? ''), gpa: Number(row.gpa ?? 0), feedback: row.feedback ?? null, publication_state: String(row.publication_state ?? 'draft'),
  published_at: iso(row.published_at), published_by: row.published_by ?? null, publication_action: row.publication_action ?? null,
  created_at: iso(row.created_at) ?? '', updated_at: iso(row.updated_at) ?? '', classroom_name: row.classroom?.name ?? null, classroom_subject: row.classroom?.subject ?? null,
});

export const gradingRouter = impl.router({
  getReportCard: impl.getReportCard.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    if (!context.db) throw new Error('Database context not initialized');
    const rows = await (context.db as any).grade.findMany({ where: { student_id: input.studentId }, orderBy: { created_at: 'desc' }, include: { classroom: { select: { name: true, subject: true } } } });
    return rows.map(mapGrade);
  }),
  getClassroomGrades: impl.getClassroomGrades.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    if (!context.db) throw new Error('Database context not initialized');
    const rows = await (context.db as any).grade.findMany({ where: { classroom_id: input.classroomId }, orderBy: { created_at: 'desc' } });
    return rows.map(mapGrade);
  }),
  submitGrade: impl.submitGrade.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    if (!context.db) throw new Error('Database context not initialized');
    const db = context.db as any;
    const grade = await db.grade.create({ data: { student_id: input.studentId, classroom_id: input.classroomId, marks: input.marks, assignment_id: input.assignmentId, feedback: input.feedback, graded_by: context.user.id, grade: input.marks >= 75 ? 'A' : input.marks >= 65 ? 'B' : input.marks >= 50 ? 'C' : 'S', gpa: input.marks / 25 } });
    await db.sentinelAuditLog.create({ data: { action: 'grade_submitted', entity_id: grade.id, entity_type: 'grade', executor_id: context.user.id, metadata: input } });
    return mapGrade(grade);
  }),
  publishGrade: impl.publishGrade.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    if (!context.db) throw new Error('Database context not initialized');
    const db = context.db as any;
    const grade = await db.grade.update({ where: { id: input.id }, data: { publication_state: 'published', published_at: new Date(), published_by: context.user.id } });
    if (!grade) throw new ORPCError('NOT_FOUND', { message: 'Grade not found' });
    await db.sentinelAuditLog.create({ data: { action: 'grade_published', entity_id: input.id, entity_type: 'grade', executor_id: context.user.id, metadata: { publication_state: 'published' } } });
    return mapGrade(grade);
  }),
  getGradingSettings: impl.getGradingSettings.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    if (!context.db) throw new Error('Database context not initialized');
    const settings = await (context.db as any).classroomGradingSettings.findUnique({ where: { classroom_id: input.classroomId } });
    return settings
      ? { classroom_id: String(settings.classroom_id ?? input.classroomId), grading_mode: String(settings.grading_mode ?? 'both'), show_ranks: settings.show_ranks ?? true }
      : { classroom_id: input.classroomId, grading_mode: 'both', show_ranks: true };
  }),
  updateGradingSettings: impl.updateGradingSettings.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const row = await (context.db as any).classroomGradingSettings.upsert({ where: { classroom_id: input.classroomId }, update: { grading_mode: input.gradingMode, show_ranks: input.showRanks }, create: { classroom_id: input.classroomId, grading_mode: input.gradingMode, show_ranks: input.showRanks } });
    return { classroom_id: String(row.classroom_id ?? input.classroomId), grading_mode: String(row.grading_mode ?? input.gradingMode), show_ranks: row.show_ranks ?? input.showRanks };
  }),
});
