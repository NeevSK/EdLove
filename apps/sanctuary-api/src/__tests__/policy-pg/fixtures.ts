/**
 * Two schools, people in different roles, one grade class and one classroom each.
 * Seeded with the raw (policy-free) client into a throwaway database whose schema
 * ZenStack pushes from the zmodel. Requires POLICY_TEST_DATABASE_URL; the database
 * name must contain "test" because `public` is dropped and recreated.
 */
import { createPolicyDbForUser, createZenStackDb } from '@repo/database/client';
import pg from 'pg';

export const url = process.env.POLICY_TEST_DATABASE_URL;

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
export const ID = {
  schoolA: id(1),
  schoolB: id(2),
  cycleA: id(11),
  cycleB: id(12),
  sectionA: id(21),
  sectionB: id(22),
  levelA: id(31),
  levelB: id(32),
  gcA: id(41), // 5A at school A
  gcA2: id(43), // 5B at school A
  gcB: id(42), // 5A at school B
  classroomA: id(51),
  classroomB: id(52),
  teacherA: id(101), // class teacher of 5A, school A
  subjectTeacherA: id(106), // subject teacher of 5A only
  teacherA2: id(107), // class teacher of 5B (student not enrolled there)
  teacherB: id(102), // class teacher of 5A, school B
  principalA: id(103),
  principalB: id(108),
  student: id(201), // enrolled in 5A (school A), earlier in 5B
  otherStudent: id(202),
  guardian: id(301), // verified guardian of student
  pendingGuardian: id(302),
  stranger: id(401),
  admin: id(501),
};

export async function resetAndSeed() {
  if (!url || !/test/i.test(new URL(url).pathname)) {
    throw new Error('POLICY_TEST_DATABASE_URL must point at a database whose name contains "test"');
  }
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  await client.query('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;');
  await client.end();
  const raw: any = createZenStackDb({ id: 'policy-test-system' }, url);
  await raw.$pushSchema();

  const users: Array<[string, string]> = [
    [ID.teacherA, 'Teacher A'],
    [ID.subjectTeacherA, 'Subject Teacher A'],
    [ID.teacherA2, 'Teacher A2'],
    [ID.teacherB, 'Teacher B'],
    [ID.principalA, 'Principal A'],
    [ID.principalB, 'Principal B'],
    [ID.student, 'Nimal'],
    [ID.otherStudent, 'Kamala'],
    [ID.guardian, 'Guardian'],
    [ID.pendingGuardian, 'Pending Guardian'],
    [ID.stranger, 'Stranger'],
    [ID.admin, 'Platform Admin'],
  ];
  for (const [uid, full_name] of users) await raw.user.create({ data: { id: uid, full_name } });

  for (const [school, cycle, section, level, name] of [
    [ID.schoolA, ID.cycleA, ID.sectionA, ID.levelA, 'School A'],
    [ID.schoolB, ID.cycleB, ID.sectionB, ID.levelB, 'School B'],
  ]) {
    await raw.school.create({ data: { id: school, name } });
    await raw.academicCycle.create({
      data: {
        id: cycle,
        school_id: school,
        name: '2026',
        starts_at: new Date('2026-01-01'),
        ends_at: new Date('2026-12-31'),
        status: 'active',
      },
    });
    await raw.section.create({ data: { id: section, school_id: school, name: 'Primary' } });
    await raw.gradeLevel.create({
      data: { id: level, section_id: section, school_id: school, grade_number: 5 },
    });
  }
  const gc = (gid: string, school: string, cycle: string, level: string, name: string) =>
    raw.gradeClass.create({
      data: { id: gid, school_id: school, academic_cycle_id: cycle, grade_level_id: level, name },
    });
  await gc(ID.gcA, ID.schoolA, ID.cycleA, ID.levelA, '5A');
  await gc(ID.gcA2, ID.schoolA, ID.cycleA, ID.levelA, '5B');
  await gc(ID.gcB, ID.schoolB, ID.cycleB, ID.levelB, '5A');

  const bond = (user_id: string, entity_id: string, capacity: string, entity_type = 'SCHOOL') =>
    raw.bond.create({ data: { user_id, entity_id, entity_type, capacity, status: 'active' } });
  await bond(ID.teacherA, ID.schoolA, 'teacher');
  await bond(ID.subjectTeacherA, ID.schoolA, 'teacher');
  await bond(ID.teacherA2, ID.schoolA, 'teacher');
  await bond(ID.teacherB, ID.schoolB, 'teacher');
  await bond(ID.principalA, ID.schoolA, 'principal');
  await bond(ID.principalB, ID.schoolB, 'principal');
  await bond(ID.student, ID.schoolA, 'student');
  await bond(ID.guardian, ID.schoolA, 'parent');
  await bond(ID.pendingGuardian, ID.schoolA, 'parent');
  await bond(ID.admin, 'GLOBAL', 'admin', 'PLATFORM');

  const assign = (teacher_id: string, grade_class_id: string, cycle: string, role: string) =>
    raw.gradeClassTeacherAssignment.create({
      data: {
        teacher_id,
        grade_class_id,
        academic_cycle_id: cycle,
        role,
        effective_from: new Date('2026-01-01'),
        status: 'active',
      },
    });
  await assign(ID.teacherA, ID.gcA, ID.cycleA, 'class_teacher');
  await assign(ID.subjectTeacherA, ID.gcA, ID.cycleA, 'subject_teacher');
  await assign(ID.teacherA2, ID.gcA2, ID.cycleA, 'class_teacher');
  await assign(ID.teacherB, ID.gcB, ID.cycleB, 'class_teacher');

  const enroll = (
    student_id: string,
    gcId: string,
    school: string,
    cycle: string,
    status = 'active',
  ) =>
    raw.studentGradeClassEnrollment.create({
      data: {
        student_id,
        grade_class_id: gcId,
        school_id: school,
        academic_cycle_id: cycle,
        effective_from: new Date('2026-01-01'),
        status,
      },
    });
  await enroll(ID.student, ID.gcA, ID.schoolA, ID.cycleA);
  await enroll(ID.student, ID.gcA2, ID.schoolA, ID.cycleA, 'completed');
  await enroll(ID.otherStudent, ID.gcB, ID.schoolB, ID.cycleB);

  const mark = (
    student_id: string,
    gcId: string,
    school: string,
    cycle: string,
    day: string,
    status: string,
  ) =>
    raw.dailyAttendance.create({
      data: {
        student_id,
        grade_class_id: gcId,
        school_id: school,
        academic_cycle_id: cycle,
        attendance_date: new Date(`${day}T00:00:00.000Z`),
        status,
        recorded_by: ID.teacherA,
      },
    });
  await mark(ID.student, ID.gcA, ID.schoolA, ID.cycleA, '2026-10-20', 'present');
  await mark(ID.student, ID.gcA, ID.schoolA, ID.cycleA, '2026-10-21', 'absent');
  await mark(ID.student, ID.gcA2, ID.schoolA, ID.cycleA, '2026-03-02', 'late');
  await mark(ID.otherStudent, ID.gcB, ID.schoolB, ID.cycleB, '2026-10-20', 'present');

  await raw.classroom.create({
    data: {
      id: ID.classroomA,
      school_id: ID.schoolA,
      teacher_id: ID.teacherA,
      name: '5A',
      academic_year: '2026',
    },
  });
  await raw.classroom.create({
    data: {
      id: ID.classroomB,
      school_id: ID.schoolB,
      teacher_id: ID.teacherB,
      name: '5A',
      academic_year: '2026',
    },
  });
  await raw.classroomStudent.create({
    data: { id: id(61), classroom_id: ID.classroomA, student_id: ID.student, roll_number: 1 },
  });
  await raw.classroomStudent.create({
    data: { id: id(62), classroom_id: ID.classroomB, student_id: ID.otherStudent, roll_number: 1 },
  });

  await raw.studentGuardianRelationship.create({
    data: {
      student_id: ID.student,
      guardian_id: ID.guardian,
      relationship_type: 'parent',
      verification_status: 'verified',
      verified_by: ID.principalA,
      verified_at: new Date(),
    },
  });
  await raw.studentGuardianRelationship.create({
    data: { student_id: ID.student, guardian_id: ID.pendingGuardian, relationship_type: 'parent' },
  });
  await raw.guardianNotification.create({
    data: {
      guardian_id: ID.guardian,
      student_id: ID.student,
      type: 'notice',
      title: 'Trip',
      message: 'Friday',
    },
  });
  await raw.guardianNotificationSetting.create({
    data: { guardian_id: ID.guardian, settings: { push: true } },
  });
  return raw;
}

/** Policy-enforced client for a user, built exactly as the API builds it per request. */
export async function as(raw: any, userId: string) {
  return (await createPolicyDbForUser(raw, userId)) as any;
}
