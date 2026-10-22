import { ORPCError } from '@orpc/server';

/**
 * Claiming a shadow learner (a classroom_students row with an invite code whose
 * student_id is a placeholder users row with identity_state 'shadow').
 *
 * Everything runs in one transaction: either the whole history (daily attendance,
 * sessions, grade-class enrollments, marks, submissions, classroom seats) moves to
 * the claiming account and the seat is marked claimed, or nothing changes.
 * Errors are not swallowed; a failed step rolls the claim back.
 */
export async function claimShadowStudentAtomically(
  db: any,
  input: { inviteCode: string; claimingUserId: string; schoolId?: string | null },
) {
  const { inviteCode, claimingUserId, schoolId } = input;
  const run = async (tx: any) => {
    const row = await tx.classroomStudent.findUnique({ where: { invite_code: inviteCode } });
    if (!row) throw new ORPCError('NOT_FOUND', { message: 'Invite code not found' });

    if (row.claimed_at) {
      // Re-submitting your own code is harmless; anyone else must not re-key history.
      if (row.student_id === claimingUserId) return row;
      throw new ORPCError('CONFLICT', { message: 'This invite code has already been claimed' });
    }

    const shadowUserId: string | null = row.student_id ?? null;
    if (shadowUserId && shadowUserId !== claimingUserId) {
      const shadow = await tx.user.findUnique({
        where: { id: shadowUserId },
        select: { id: true, identity_state: true },
      });
      if (shadow?.identity_state !== 'shadow') {
        throw new ORPCError('CONFLICT', {
          message: 'This seat is linked to another account and cannot be claimed',
        });
      }
      await carryForwardHistory(tx, { shadowUserId, claimingUserId, seatId: row.id });

      if (row.full_name) {
        const current = await tx.user.findUnique({
          where: { id: claimingUserId },
          select: { full_name: true, school_id: true },
        });
        const updates: Record<string, unknown> = {};
        if (
          !current?.full_name ||
          current.full_name.startsWith('Student ') ||
          current.full_name === 'Unnamed student'
        ) {
          updates.full_name = row.full_name;
        }
        if (!current?.school_id && schoolId) updates.school_id = schoolId;
        if (Object.keys(updates).length > 0) {
          await tx.user.update({ where: { id: claimingUserId }, data: updates });
        }
      }

      await tx.user.update({
        where: { id: shadowUserId },
        data: {
          identity_state: `claimed_by_${claimingUserId}`,
          metadata: { claimed_by: claimingUserId, claimed_at: new Date().toISOString() },
        },
      });
    }

    // Guard against two claims racing on the same seat.
    const sealed = await tx.classroomStudent.updateMany({
      where: { id: row.id, claimed_at: null },
      data: { student_id: claimingUserId, claimed_at: new Date() },
    });
    if (typeof sealed?.count === 'number' && sealed.count !== 1) {
      throw new ORPCError('CONFLICT', { message: 'This invite code has already been claimed' });
    }
    return tx.classroomStudent.findUnique({ where: { id: row.id } });
  };

  try {
    return await db.$transaction(run);
  } catch (error: any) {
    if (error instanceof ORPCError) throw error;
    throw new ORPCError('CONFLICT', {
      message: 'Claim was not applied; nothing was changed',
      cause: error,
    });
  }
}

async function carryForwardHistory(
  tx: any,
  ids: { shadowUserId: string; claimingUserId: string; seatId: string },
) {
  const { shadowUserId, claimingUserId, seatId } = ids;

  // 1. Daily attendance: move rows unless the claimer already has that class + day.
  const movedDailyIds: string[] = [];
  const shadowDaily =
    (await tx.dailyAttendance.findMany({ where: { student_id: shadowUserId } })) ?? [];
  for (const daily of shadowDaily) {
    const existing = await tx.dailyAttendance.findUnique({
      where: {
        student_id_grade_class_id_attendance_date: {
          student_id: claimingUserId,
          grade_class_id: daily.grade_class_id,
          attendance_date: daily.attendance_date,
        },
      },
    });
    if (!existing) {
      await tx.dailyAttendance.update({
        where: { id: daily.id },
        data: { student_id: claimingUserId },
      });
      movedDailyIds.push(String(daily.id));
    }
  }

  // 2. Sessions follow their daily row, so a session never points at another student's day.
  if (movedDailyIds.length > 0) {
    await tx.attendanceSession.updateMany({
      where: { student_id: shadowUserId, daily_attendance_id: { in: movedDailyIds } },
      data: { student_id: claimingUserId },
    });
  }

  // 3. Grade-class enrollments (continuous history), skipping classes the claimer is already in.
  const shadowEnrollments =
    (await tx.studentGradeClassEnrollment.findMany({ where: { student_id: shadowUserId } })) ?? [];
  for (const enr of shadowEnrollments) {
    const existingEnr = await tx.studentGradeClassEnrollment.findFirst({
      where: { grade_class_id: enr.grade_class_id, student_id: claimingUserId },
    });
    if (!existingEnr) {
      await tx.studentGradeClassEnrollment.update({
        where: { id: enr.id },
        data: { student_id: claimingUserId },
      });
    }
  }

  // 4-5. Marks and submissions.
  await tx.gradeMark.updateMany({
    where: { student_id: shadowUserId },
    data: { student_id: claimingUserId },
  });
  await tx.assignmentSubmission.updateMany({
    where: { student_id: shadowUserId },
    data: { student_id: claimingUserId },
  });

  // 6. Other classroom seats held by the shadow (unique per classroom + student).
  const seats = (await tx.classroomStudent.findMany({ where: { student_id: shadowUserId } })) ?? [];
  for (const seat of seats) {
    if (String(seat.id) === String(seatId)) continue; // sealed by the caller
    const taken = await tx.classroomStudent.findFirst({
      where: { classroom_id: seat.classroom_id, student_id: claimingUserId },
    });
    if (!taken) {
      await tx.classroomStudent.update({
        where: { id: seat.id },
        data: { student_id: claimingUserId },
      });
    }
  }
}
