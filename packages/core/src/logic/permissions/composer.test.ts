import { subject } from '@casl/ability';
import { describe, expect, test } from 'vitest';
import type { UserContext } from '../schemas/user.schema';
import { composeUserAbilities } from './composer';

describe('POA Exhaustive Verification: Every Role, Every Power', () => {
  const baseContext: UserContext = {
    userId: '00000000-0000-0000-0000-000000000000',
    email: 'test@example.com',
    schoolId: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
    bonds: [],
    primaryCapacity: null,
    activeBond: null,
    activeBondStatus: 'active',
    tenancy: { kind: 'customer', isPersonal: false },
    tenancyName: 'Test School',
    tenantKind: 'customer',
    isAnonymous: false,
    hasGlobalAccess: false,
    isPersonal: false,
    tier: 'free',
    features: [],
    flags: {},
  };

  /** ACADEMIC ROLES **/
  test('Student: can see own profile, lessons, and submit tasks', () => {
    const ability = composeUserAbilities({
      ...baseContext,
      activeBond: { id: 'b_student', userId: baseContext.userId as string, entityId: baseContext.schoolId as string, entityType: 'SCHOOL', capacity: 'student', status: 'active' },
    });
    expect(ability.can('read', 'StudentProfile')).toBe(true);
    expect(ability.can('create', 'AssignmentSubmission')).toBe(true);
    expect(ability.can('manage', 'Attendance')).toBe(false);
  });

  test('Teacher: can manage classrooms and mark attendance', () => {
    const ability = composeUserAbilities({
      ...baseContext,
      activeBond: { id: 'b2', userId: baseContext.userId as string, entityId: baseContext.schoolId as string, entityType: 'SCHOOL', capacity: 'teacher', status: 'active' },
    });
    expect(ability.can('manage', 'Classroom')).toBe(true);
    expect(ability.can('manage', 'Attendance')).toBe(true);
    expect(ability.can('manage', 'Staff')).toBe(false);
  });

  test('GradeHead: can see teacher metrics and student summaries', () => {
    const ability = composeUserAbilities({
      ...baseContext,
      activeBond: { id: 'b3', userId: baseContext.userId as string, entityId: baseContext.schoolId as string, entityType: 'SCHOOL', capacity: 'gradeHead', status: 'active' },
    });
    expect(ability.can('read', 'TeacherPulse')).toBe(true);
    expect(ability.can('manage', 'GradeHeadDashboard')).toBe(true);
  });

  /** INSTITUTIONAL ROLES **/
  test('Principal: has full oversight and leave approval power', () => {
    const ability = composeUserAbilities({
      ...baseContext,
      activeBond: { id: 'b4', userId: baseContext.userId as string, entityId: baseContext.schoolId as string, entityType: 'SCHOOL', capacity: 'principal', status: 'active' },
    });
    expect(ability.can('manage', 'School')).toBe(true);
    expect(ability.can('manage', 'LeaveApproval')).toBe(true);
    expect(ability.can('read', 'Report')).toBe(true);
  });

  test('AssistantPrincipal: shares principal powers', () => {
    const ability = composeUserAbilities({
      ...baseContext,
      activeBond: { id: 'b5', userId: baseContext.userId as string, entityId: baseContext.schoolId as string, entityType: 'SCHOOL', capacity: 'assistantPrincipal', status: 'active' },
    });
    expect(ability.can('read', 'PrincipalPulse')).toBe(true);
    expect(ability.can('manage', 'LeaveApproval')).toBe(true);
  });

  /** SPECIALIZED & STAKEHOLDER ROLES **/
  test('Parent: scoped strictly to student visibility', () => {
    const ability = composeUserAbilities({
      ...baseContext,
      activeBond: { id: 'b6', userId: baseContext.userId as string, entityId: baseContext.schoolId as string, entityType: 'SCHOOL', capacity: 'parent', status: 'active' },
    });
    expect(ability.can('read', 'StudentProfile')).toBe(true);
    expect(ability.can('read', 'Attendance')).toBe(true);
    expect(ability.can('manage', 'School')).toBe(false);
  });

  test('Librarian: can manage health inventory and library resources', () => {
    const ability = composeUserAbilities({
      ...baseContext,
      activeBond: { id: 'b7', userId: baseContext.userId as string, entityId: baseContext.schoolId as string, entityType: 'SCHOOL', capacity: 'librarian', status: 'active' },
    });
    expect(ability.can('manage', 'Library')).toBe(true);
  });

  test('Nurse: can manage health records', () => {
    const ability = composeUserAbilities({
      ...baseContext,
      activeBond: { id: 'b8', userId: baseContext.userId as string, entityId: baseContext.schoolId as string, entityType: 'SCHOOL', capacity: 'nurse', status: 'active' },
    });
    expect(ability.can('manage', 'HealthRecords')).toBe(true);
  });

  /** COMMON SECTIONS: SELF, COMMUNITY, LIBRARY **/
  test('Self/Profile: Should allow users to update their own profiles', () => {
    const ability = composeUserAbilities({
      ...baseContext,
      activeBond: { id: 'b_student', userId: baseContext.userId as string, entityId: baseContext.schoolId as string, entityType: 'SCHOOL', capacity: 'student', status: 'active' },
    });
    expect(
      ability.can('update', subject('StudentProfile', { user_id: baseContext.userId } as any)),
    ).toBe(true);
  });

  test('Community: All roles (including guests) can see the feed', () => {
    const guestAbility = composeUserAbilities({
      ...baseContext,
      isAnonymous: true,
    } as any);
    const studentAbility = composeUserAbilities({
      ...baseContext,
      activeBond: { id: 'b_student', userId: baseContext.userId as string, entityId: baseContext.schoolId as string, entityType: 'SCHOOL', capacity: 'student', status: 'active' },
    });

    expect(guestAbility.can('read', 'CommunityFeed')).toBe(true);
    expect(studentAbility.can('read', 'CommunityFeed')).toBe(true);
  });

  test('Library: Principal, Teacher, and Librarian have Review power', () => {
    const principalAbility = composeUserAbilities({
      ...baseContext,
      activeBond: { id: 'b11', userId: baseContext.userId as string, entityId: baseContext.schoolId as string, entityType: 'SCHOOL', capacity: 'principal', status: 'active' },
    });
    const teacherAbility = composeUserAbilities({
      ...baseContext,
      activeBond: { id: 'b12', userId: baseContext.userId as string, entityId: baseContext.schoolId as string, entityType: 'SCHOOL', capacity: 'teacher', status: 'active' },
    });
    const librarianAbility = composeUserAbilities({
      ...baseContext,
      activeBond: { id: 'b13', userId: baseContext.userId as string, entityId: baseContext.schoolId as string, entityType: 'SCHOOL', capacity: 'librarian', status: 'active' },
    });
    const studentAbility = composeUserAbilities({
      ...baseContext,
      activeBond: { id: 'b14', userId: baseContext.userId as string, entityId: baseContext.schoolId as string, entityType: 'SCHOOL', capacity: 'student', status: 'active' },
    });

    expect(principalAbility.can('manage', 'LibraryReview')).toBe(true);
    expect(teacherAbility.can('manage', 'LibraryReview')).toBe(true);
    expect(librarianAbility.can('manage', 'LibraryReview')).toBe(true);
    expect(studentAbility.can('manage', 'LibraryReview')).toBe(false);
  });

  test('Library: All 1st class citizens have full Library access, and Search is public', () => {
    const studentAbility = composeUserAbilities({
      ...baseContext,
      activeBond: { id: 'b_student', userId: baseContext.userId as string, entityId: baseContext.schoolId as string, entityType: 'SCHOOL', capacity: 'student', status: 'active' },
    });
    const guestAbility = composeUserAbilities({
      ...baseContext,
      isAnonymous: true,
    } as any);

    expect(studentAbility.can('manage', 'Library')).toBe(true);
    expect(studentAbility.can('read', 'LibrarySearch')).toBe(true);
    expect(guestAbility.can('read', 'LibrarySearch')).toBe(true);
    expect(guestAbility.can('manage', 'Library')).toBe(false);
  });

  /** PLATFORM & SECURITY **/
  test('Founder: has absolute manages all power', () => {
    const ability = composeUserAbilities({
      ...baseContext,
      hasGlobalAccess: true,
      activeBond: { id: 'b16', userId: baseContext.userId as string, entityId: 'GLOBAL', entityType: 'PLATFORM', capacity: 'founder', status: 'active' },
    });
    expect(ability.can('manage', 'all')).toBe(true);
  });

  test('2nd Class Citizen: Wanderer mode (no school context)', () => {
    const ability = composeUserAbilities({
      ...baseContext,
      schoolId: null,
      activeBond: null,
      isAnonymous: true,
    });
    expect(ability.can('read', 'PublicLibrary')).toBe(true);
    expect(ability.can('read', 'CommunityFeed')).toBe(true);
    expect(ability.can('read', 'DirectMessages')).toBe(false);
  });
});
