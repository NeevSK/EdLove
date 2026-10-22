import { parseStudentHistoryAccess } from './studentHistoryAccess';

/**
 * Which of a student's attendance rows a caller may read (attendance.getStudentHistory).
 * Returns a Prisma-style `where` fragment, or null when the caller has no relationship
 * to the student. Facts are read with the raw client because they define the caller's
 * authority; the rows themselves are then read through the policy client.
 *
 * - The student: all of their rows.
 * - A VERIFIED guardian: rows in schools whose setting allows guardians.
 * - A principal (plus capacities the school adds) of a school the student is enrolled
 *   in: the student's rows in that school.
 * - A teacher with an active assignment to a grade class the student is actively
 *   enrolled in: rows for that class; a class teacher sees the student's rows in that
 *   school unless the school limits class teachers to their own class.
 */
export type HistoryScope = { student_id: string; OR?: Array<Record<string, unknown>> };

export async function resolveStudentHistoryScope(
  raw: any,
  callerId: string,
  studentId: string,
  now = new Date(),
): Promise<HistoryScope | null> {
  if (callerId === studentId) return { student_id: studentId };

  const enrollments: Array<{ grade_class_id: string; school_id: string; status: string }> =
    (await raw.studentGradeClassEnrollment.findMany({
      where: { student_id: studentId },
      select: { grade_class_id: true, school_id: true, status: true },
    })) ?? [];
  const schoolIds = [...new Set(enrollments.map((row) => String(row.school_id)))];
  if (schoolIds.length === 0) return null;

  const schools: Array<{ id: string; student_history_access: unknown }> =
    (await raw.school.findMany({
      where: { id: { in: schoolIds } },
      select: { id: true, student_history_access: true },
    })) ?? [];
  const settings = new Map(
    schools.map((school) => [
      String(school.id),
      parseStudentHistoryAccess(school.student_history_access),
    ]),
  );
  const settingFor = (schoolId: string) => settings.get(schoolId) ?? parseStudentHistoryAccess({});

  const allowedSchools = new Set<string>();
  const allowedClasses = new Set<string>();

  // Verified guardian.
  const link = await raw.studentGuardianRelationship.findFirst({
    where: { guardian_id: callerId, student_id: studentId, verification_status: 'verified' },
    select: { id: true },
  });
  if (link) {
    for (const schoolId of schoolIds) {
      if (settingFor(schoolId).guardians === 'verified') allowedSchools.add(schoolId);
    }
  }

  // School leaders.
  const bonds: Array<{ capacity: string; entity_id: string; valid_until?: Date | null }> =
    (await raw.bond.findMany({
      where: { user_id: callerId, status: 'active', entity_id: { in: schoolIds } },
      select: { capacity: true, entity_id: true, valid_until: true },
    })) ?? [];
  for (const bond of bonds) {
    if (bond.valid_until && new Date(bond.valid_until) <= now) continue;
    const schoolId = String(bond.entity_id);
    const leaders = ['principal', ...settingFor(schoolId).leaderCapacities];
    if (leaders.includes(String(bond.capacity))) allowedSchools.add(schoolId);
  }

  // Teachers of a class the student is actively enrolled in.
  const activeClasses = new Map(
    enrollments
      .filter((row) => row.status === 'active')
      .map((row) => [String(row.grade_class_id), String(row.school_id)]),
  );
  if (activeClasses.size > 0) {
    const assignments: Array<{ grade_class_id: string; role: string }> =
      (await raw.gradeClassTeacherAssignment.findMany({
        where: {
          teacher_id: callerId,
          grade_class_id: { in: [...activeClasses.keys()] },
          status: 'active',
          effective_from: { lte: now },
          OR: [{ effective_to: null }, { effective_to: { gte: now } }],
        },
        select: { grade_class_id: true, role: true },
      })) ?? [];
    for (const assignment of assignments) {
      const gradeClassId = String(assignment.grade_class_id);
      const schoolId = activeClasses.get(gradeClassId);
      if (!schoolId) continue;
      const setting = settingFor(schoolId);
      if (assignment.role === 'class_teacher') {
        if (setting.classTeachers === 'school_history') allowedSchools.add(schoolId);
        else allowedClasses.add(gradeClassId);
      } else if (setting.subjectTeachers === 'own_class') {
        allowedClasses.add(gradeClassId);
      }
    }
  }

  const OR: Array<Record<string, unknown>> = [];
  if (allowedSchools.size > 0) OR.push({ school_id: { in: [...allowedSchools] } });
  if (allowedClasses.size > 0) OR.push({ grade_class_id: { in: [...allowedClasses] } });
  return OR.length > 0 ? { student_id: studentId, OR } : null;
}
