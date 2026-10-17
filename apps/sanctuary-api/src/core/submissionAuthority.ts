import { ORPCError } from '@orpc/server';
import type { ORPCContext } from './orpc';

type SubmissionReader = Pick<
  NonNullable<ORPCContext['db']>,
  'assignment' | 'classroom' | 'classroomStudent'
>;

export async function assertSubmissionAuthority(
  db: SubmissionReader,
  context: ORPCContext,
  assignmentId: string,
) {
  const assignment = await db.assignment.findUnique({
    where: { id: assignmentId },
    select: { classroom_id: true },
  });
  if (!assignment) throw new ORPCError('NOT_FOUND', { message: 'Assignment was not found.' });
  const classroom = await db.classroom.findUnique({
    where: { id: assignment.classroom_id },
    select: { id: true, school_id: true, is_archived: true },
  });
  if (!classroom) throw new ORPCError('NOT_FOUND', { message: 'Classroom was not found.' });
  if (classroom.is_archived || classroom.school_id !== (context.schoolId ?? null)) {
    throw new ORPCError('FORBIDDEN', {
      message: 'Assignment is outside the active classroom scope.',
    });
  }
  if (context.capacity === 'student') {
    const enrollment = await db.classroomStudent.findUnique({
      where: {
        classroom_id_student_id: { classroom_id: classroom.id, student_id: context.user.id },
      },
      select: { status: true },
    });
    if (enrollment?.status !== 'active') {
      throw new ORPCError('FORBIDDEN', { message: 'Active classroom enrollment is required.' });
    }
  }
  return classroom;
}
