import { describe, expect, it } from 'vitest';
import { check, generateSnapshot } from '../index';

describe('Sovereign Authorization Engine', () => {
  it('should allow platform admin full CRUD on any resource', () => {
    const adminUser = {
      type: 'admin',
      id: 'admin-1',
      attributes: {
        school_id: 'school-a',
        capacity: 'admin',
      },
    };

    const classroomResource = {
      type: 'Classroom',
      id: 'classroom-1',
      attributes: {
        school_id: 'school-b',
      },
    };

    const res = check({
      principal: adminUser,
      action: 'delete',
      resource: classroomResource,
    });

    expect(res.permitted).toBe(true);
  });

  it('should allow school principal CRUD only within their own school', () => {
    const principalUser = {
      type: 'principal',
      id: 'principal-1',
      attributes: {
        school_id: 'school-a',
        capacity: 'principal',
      },
    };

    const sameSchoolClassroom = {
      type: 'Classroom',
      id: 'classroom-1',
      attributes: {
        school_id: 'school-a',
      },
    };

    const otherSchoolClassroom = {
      type: 'Classroom',
      id: 'classroom-2',
      attributes: {
        school_id: 'school-b',
      },
    };

    // Allowed same school
    expect(
      check({
        principal: principalUser,
        action: 'create',
        resource: sameSchoolClassroom,
      }).permitted,
    ).toBe(true);

    // Denied other school
    expect(
      check({
        principal: principalUser,
        action: 'create',
        resource: otherSchoolClassroom,
      }).permitted,
    ).toBe(false);
  });

  it('should restrict teacher to classrooms they teach', () => {
    const teacherUser = {
      type: 'teacher',
      id: 'teacher-1',
      attributes: {
        school_id: 'school-a',
        capacity: 'teacher',
        classroom_ids: ['classroom-1'],
      },
    };

    const taughtClassroom = {
      type: 'Classroom',
      id: 'classroom-1',
      attributes: {
        school_id: 'school-a',
        teacher_id: 'teacher-1',
      },
    };

    const otherClassroom = {
      type: 'Classroom',
      id: 'classroom-2',
      attributes: {
        school_id: 'school-a',
        teacher_id: 'teacher-2',
      },
    };

    // Allowed taught classroom
    expect(
      check({
        principal: teacherUser,
        action: 'update',
        resource: taughtClassroom,
      }).permitted,
    ).toBe(true);

    // Denied other classroom
    expect(
      check({
        principal: teacherUser,
        action: 'update',
        resource: otherClassroom,
      }).permitted,
    ).toBe(false);
  });

  it('should restrict student to enrolled classrooms and self-scoped grades/attendance', () => {
    const studentUser = {
      type: 'student',
      id: 'student-1',
      attributes: {
        school_id: 'school-a',
        capacity: 'student',
        classroom_ids: ['classroom-1'],
      },
    };

    const ownGrade = {
      type: 'Grade',
      id: 'grade-1',
      attributes: {
        school_id: 'school-a',
        classroom_id: 'classroom-1',
        student_id: 'student-1',
      },
    };

    const otherGrade = {
      type: 'Grade',
      id: 'grade-2',
      attributes: {
        school_id: 'school-a',
        classroom_id: 'classroom-1',
        student_id: 'student-2',
      },
    };

    // Read own grade allowed
    expect(
      check({
        principal: studentUser,
        action: 'read',
        resource: ownGrade,
      }).permitted,
    ).toBe(true);

    // Read other grade denied
    expect(
      check({
        principal: studentUser,
        action: 'read',
        resource: otherGrade,
      }).permitted,
    ).toBe(false);

    // Write own grade denied
    expect(
      check({
        principal: studentUser,
        action: 'create',
        resource: ownGrade,
      }).permitted,
    ).toBe(false);
  });

  it('should check GAP rules for parents reading child academic data', () => {
    const parentUser = {
      type: 'parent',
      id: 'parent-1',
      attributes: {
        school_id: 'school-a',
        capacity: 'parent',
        child_student_ids: ['student-1'],
      },
    };

    const childGrade = {
      type: 'Grade',
      id: 'grade-1',
      attributes: {
        school_id: 'school-a',
        student_id: 'student-1',
      },
    };

    const otherGrade = {
      type: 'Grade',
      id: 'grade-2',
      attributes: {
        school_id: 'school-a',
        student_id: 'student-2',
      },
    };

    // Allowed for parent's child
    const resOwn = check({
      principal: parentUser,
      action: 'read',
      resource: childGrade,
    });
    expect(resOwn.permitted).toBe(true);
    expect(resOwn.gaps).toContain(
      'GAP: Read Grades for own child only (currently missing in ZenStack)',
    );

    // Denied for other student
    expect(
      check({
        principal: parentUser,
        action: 'read',
        resource: otherGrade,
      }).permitted,
    ).toBe(false);
  });

  it('should generate a robust offline permission snapshot', () => {
    const principalUser = {
      id: 'principal-1',
      school_id: 'school-a',
      capacity: 'principal',
    };

    const snapshot = generateSnapshot(principalUser);

    expect(snapshot.userId).toBe('principal-1');
    expect(snapshot.schoolId).toBe('school-a');
    expect(snapshot.permissions['Classroom']?.['create']).toBe(true);
    expect(snapshot.permissions['Classroom']?.['delete']).toBe(true);
    expect(snapshot.signature).toBeDefined();
  });
});
