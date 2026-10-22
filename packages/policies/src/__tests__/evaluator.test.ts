import { generateKeyPairSync } from 'node:crypto';
import { describe, expect, expectTypeOf, it, test } from 'vitest';
import {
  type AuthRequest,
  type AuthResponse,
  check,
  generateSnapshot,
  type PermissionSnapshot,
} from '../index';

const { privateKey: snapshotPrivateKey } = generateKeyPairSync('ed25519');
const snapshotSigningKey = snapshotPrivateKey.export({ format: 'pem', type: 'pkcs8' }).toString();

describe('Sovereign Authorization Engine', { tags: ['policies', 'security', 'fast'] }, () => {
  it('limits ordinary operation receipt reads to the account owner', () => {
    const request: AuthRequest = {
      principal: {
        type: 'teacher',
        id: 'owner',
        attributes: { capacity: 'teacher', school_id: 'school-a' },
      },
      action: 'read',
      resource: { id: 'receipt', type: 'OperationReceipt', attributes: { account_id: 'owner' } },
    };
    expect(check(request).permitted).toBe(true);
    expect(
      check({
        ...request,
        resource: { ...request.resource, attributes: { account_id: 'other-owner' } },
      }).permitted,
    ).toBe(false);
    expect(check({ ...request, action: 'update' }).permitted).toBe(false);
  });

  it.each(['grade', 'publish'])(
    'authorizes explicit GradeMark %s using verified teacher ownership without device elevation',
    (action) => {
      const request: AuthRequest = {
        principal: {
          type: 'teacher',
          id: 'teacher-1',
          attributes: {
            capacity: 'teacher',
            school_id: 'school-a',
            classroom_ids: ['grade-class-1'],
          },
        },
        action,
        resource: {
          type: 'GradeMark',
          id: 'grade-mark-1',
          attributes: {
            school_id: 'school-a',
            grade_class_id: 'grade-class-1',
            teacher_id: 'teacher-1',
          },
        },
        context: { device_trust: 'standard', network_zone: 'public' },
      };
      expect(check(request).permitted).toBe(true);
      expect(
        check({
          ...request,
          resource: {
            ...request.resource,
            attributes: {
              ...request.resource.attributes,
              teacher_id: 'another-teacher',
            },
          },
        }).permitted,
      ).toBe(false);
      expect(
        check({
          ...request,
          principal: {
            ...request.principal,
            attributes: {
              ...request.principal.attributes,
              capacity: 'student',
            },
          },
        }).permitted,
      ).toBe(false);
    },
  );

  it('enforces static type boundary on authorization check engine (T16 expectTypeOf)', () => {
    expectTypeOf(check).toBeFunction();
    expectTypeOf(check).parameter(0).toMatchTypeOf<AuthRequest>();
    expectTypeOf(check).returns.toMatchTypeOf<AuthResponse>();
    expectTypeOf(generateSnapshot).toBeFunction();
    expectTypeOf(generateSnapshot).returns.toMatchTypeOf<PermissionSnapshot>();
  });

  test.for([
    { capacity: 'admin', expectedPermitted: true },
    { capacity: 'stranger', expectedPermitted: false },
  ])(
    'parametric capability check for root platform actions with role: $capacity (T17 test.for)',
    ({ capacity, expectedPermitted }) => {
      const res = check({
        principal: {
          type: capacity,
          id: `user-${capacity}`,
          attributes: { school_id: 'school-a', capacity },
        },
        action: 'delete',
        resource: {
          type: 'Classroom',
          id: 'classroom-global-target',
          attributes: { school_id: 'school-b' },
        },
      });
      expect(res.permitted).toBe(expectedPermitted);
    },
  );

  it('allows a non-wanderer contributor to submit only as themselves', () => {
    const contributor = {
      type: 'member',
      id: 'author-1',
      attributes: { capacity: 'member', school_id: 'school-1' },
    };

    expect(
      check({
        principal: contributor,
        action: 'create',
        resource: {
          type: 'EditorialSubmission',
          id: 'submission-1',
          attributes: { submitter_id: 'author-1' },
        },
      }).permitted,
    ).toBe(true);

    expect(
      check({
        principal: contributor,
        action: 'create',
        resource: {
          type: 'EditorialSubmission',
          id: 'submission-2',
          attributes: { submitter_id: 'someone-else' },
        },
      }).permitted,
    ).toBe(false);
  });

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

  it('should allow any user to read and update their own User resource regardless of capacity', () => {
    const principalUser = {
      type: 'principal',
      id: 'principal-1',
      attributes: {
        school_id: '',
        capacity: 'principal',
      },
    };

    const ownUserResource = {
      type: 'User',
      id: 'principal-1',
      attributes: {
        id: 'principal-1',
        school_id: '',
        capacity: 'principal',
      },
    };

    const otherUserResource = {
      type: 'User',
      id: 'other-user-2',
      attributes: {
        id: 'other-user-2',
        school_id: 'school-a',
        capacity: 'teacher',
      },
    };

    // Allowed to read own User profile even during onboarding (empty school_id)
    expect(
      check({
        principal: principalUser,
        action: 'read',
        resource: ownUserResource,
      }).permitted,
    ).toBe(true);

    // Denied to read other User profiles
    expect(
      check({
        principal: principalUser,
        action: 'read',
        resource: otherUserResource,
      }).permitted,
    ).toBe(false);
  });

  it('should generate a robust offline permission snapshot', { timeout: 15000 }, () => {
    const principalUser = {
      id: 'principal-1',
      school_id: 'school-a',
      capacity: 'principal',
      active_bond_id: 'bond-principal-1',
      active_entity_id: 'school-a',
      active_entity_type: 'SCHOOL',
      policy_version: 'policy-v1',
    };

    const snapshot = generateSnapshot(principalUser, snapshotSigningKey);

    expect(snapshot.userId).toBe('principal-1');
    expect(snapshot.schoolId).toBe('school-a');
    expect(snapshot.permissions.Classroom?.create).toBe(true);
    expect(snapshot.permissions.Classroom?.delete).toBe(true);
    expect(snapshot.signature).toBeDefined();
  });
});
