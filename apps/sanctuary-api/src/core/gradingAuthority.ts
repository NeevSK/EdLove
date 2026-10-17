import { ORPCError } from '@orpc/server';
import { assertDatabase } from './apiErrors';
import type { ORPCContext } from './orpc';

export async function resolveGradeMarkAuthority(
  context: ORPCContext,
  input: Record<string, unknown>,
  action: 'grade' | 'publish',
): Promise<Record<string, unknown>> {
  assertDatabase(context);
  let scope = input;
  if (action === 'publish') {
    if (typeof input.id !== 'string') {
      throw new ORPCError('BAD_REQUEST', { message: 'A grade identifier is required.' });
    }
    const mark = await context.db.gradeMark.findUnique({
      where: { id: input.id },
      select: { school_id: true, academic_cycle_id: true, grade_class_id: true, subject_id: true },
    });
    if (!mark) throw new ORPCError('NOT_FOUND', { message: 'Grade mark was not found.' });
    scope = {
      schoolId: mark.school_id,
      academicCycleId: mark.academic_cycle_id,
      gradeClassId: mark.grade_class_id,
      subjectId: mark.subject_id,
    };
  }
  if (typeof scope.gradeClassId !== 'string' || typeof scope.academicCycleId !== 'string') {
    throw new ORPCError('BAD_REQUEST', { message: 'Grade lifecycle scope is required.' });
  }
  const gradeClass = await context.db.gradeClass.findUnique({
    where: { id: scope.gradeClassId },
    select: { id: true, school_id: true, academic_cycle_id: true, status: true },
  });
  if (
    !gradeClass ||
    gradeClass.status !== 'active' ||
    gradeClass.school_id !== context.schoolId ||
    scope.schoolId !== gradeClass.school_id ||
    gradeClass.academic_cycle_id !== scope.academicCycleId
  ) {
    throw new ORPCError('FORBIDDEN', { message: 'Grade scope is outside the active lifecycle.' });
  }
  const facts: Record<string, unknown> = { ...scope };
  if (context.capacity !== 'teacher') return facts;
  const now = new Date();
  const assignment = await context.db.gradeClassTeacherAssignment.findFirst({
    where: {
      grade_class_id: gradeClass.id,
      academic_cycle_id: gradeClass.academic_cycle_id,
      teacher_id: context.user.id,
      status: 'active',
      effective_from: { lte: now },
      AND: [
        { OR: [{ effective_to: null }, { effective_to: { gt: now } }] },
        {
          OR: [
            { subject_id: null },
            ...(typeof scope.subjectId === 'string' ? [{ subject_id: scope.subjectId }] : []),
          ],
        },
      ],
    },
    select: { id: true },
  });
  if (!assignment) {
    throw new ORPCError('FORBIDDEN', { message: 'An active teaching assignment is required.' });
  }
  return { ...facts, teacherId: context.user.id };
}
