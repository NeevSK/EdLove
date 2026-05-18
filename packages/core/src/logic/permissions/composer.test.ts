import { subject } from '@casl/ability';
import { describe, expect, test } from 'vitest';
import type { UserContext } from '../schemas/user.schema';
import { composeUserAbilities } from './composer';

describe('POA Exhaustive Verification: Every Role, Every Power', () => {
  const baseContext: UserContext = {
    user_id: '00000000-0000-0000-0000-000000000000',
    userId: '00000000-0000-0000-0000-000000000000',
    email: 'test@example.com',
    school_id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
    schoolId: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
    bonds: [],
    primary_capacity: null,
    primaryCapacity: null,
    active_bond: null,
    activeBond: null,
    active_bond_status: 'active',
    capacity: null,
    traits: [],
    tenancy: { kind: 'customer', is_personal: false },
    tenancy_name: 'Test School',
    tenant_kind: 'customer',
    is_anonymous: false,
    isAnonymous: false,
    has_global_access: false,
    is_personal: false,
    tier: 'free',
    citizenship: 'WANDERER',
    pricing_tier: 'FREE',
    features: [],
    flags: {},
    section_id: null,
    grade_id: null,
    classroom_id: null,
  };

  /** ACADEMIC ROLES **/
  test('Student: can see own profile, lessons, and submit tasks', () => {
    const ability = composeUserAbilities({
      ...baseContext,
      active_bond: { id: 'b_student', user_id: baseContext.user_id as string, entity_id: baseContext.school_id as string, entity_type: 'SCHOOL', capacity: 'student', status: 'active' },
    });
    expect(ability.can('read', 'StudentProfile')).toBe(true);
    expect(ability.can('create', 'AssignmentSubmission')).toBe(true);
    expect(ability.can('manage', 'Attendance')).toBe(false);
  });

  test('Teacher: can manage classrooms and mark attendance', () => {
    const ability = composeUserAbilities({
      ...baseContext,
      active_bond: { id: 'b2', user_id: baseContext.user_id as string, entity_id: baseContext.school_id as string, entity_type: 'SCHOOL', capacity: 'teacher', status: 'active' },
    });
    expect(ability.can('manage', 'Classroom')).toBe(true);
    expect(ability.can('manage', 'Attendance')).toBe(true);
    expect(ability.can('manage', 'Staff')).toBe(false);
  });

  test('GradeHead: can see teacher metrics and student summaries', () => {
    const ability = composeUserAbilities({
      ...baseContext,
      active_bond: { id: 'b3', user_id: baseContext.user_id as string, entity_id: baseContext.school_id as string, entity_type: 'SCHOOL', capacity: 'gradeHead', status: 'active' },
    });
    expect(ability.can('read', 'TeacherPulse')).toBe(true);
    expect(ability.can('manage', 'GradeHeadDashboard')).toBe(true);
  });

  /** INSTITUTIONAL ROLES **/
  test('Principal: has full oversight and leave approval power', () => {
    const ability = composeUserAbilities({
      ...baseContext,
      active_bond: { id: 'b4', user_id: baseContext.user_id as string, entity_id: baseContext.school_id as string, entity_type: 'SCHOOL', capacity: 'principal', status: 'active' },
    });
    expect(ability.can('manage', 'School')).toBe(true);
    expect(ability.can('manage', 'LeaveApproval')).toBe(true);
    expect(ability.can('read', 'Report')).toBe(true);
  });

  test('AssistantPrincipal: shares principal powers', () => {
    const ability = composeUserAbilities({
      ...baseContext,
      active_bond: { id: 'b5', user_id: baseContext.user_id as string, entity_id: baseContext.school_id as string, entity_type: 'SCHOOL', capacity: 'assistantPrincipal', status: 'active' },
    });
    expect(ability.can('read', 'PrincipalPulse')).toBe(true);
    expect(ability.can('manage', 'LeaveApproval')).toBe(true);
  });

  /** SPECIALIZED & STAKEHOLDER ROLES **/
  test('Parent: scoped strictly to student visibility', () => {
    const ability = composeUserAbilities({
      ...baseContext,
      active_bond: { id: 'b6', user_id: baseContext.user_id as string, entity_id: baseContext.school_id as string, entity_type: 'SCHOOL', capacity: 'parent', status: 'active' },
    });
    expect(ability.can('read', 'StudentProfile')).toBe(true);
    expect(ability.can('read', 'Attendance')).toBe(true);
    expect(ability.can('manage', 'School')).toBe(false);
  });

  test('Librarian: can manage health inventory and library resources', () => {
    const ability = composeUserAbilities({
      ...baseContext,
      active_bond: { id: 'b7', user_id: baseContext.user_id as string, entity_id: baseContext.school_id as string, entity_type: 'SCHOOL', capacity: 'librarian', status: 'active' },
    });
    expect(ability.can('manage', 'Library')).toBe(true);
  });

  test('Nurse: can manage health records', () => {
    const ability = composeUserAbilities({
      ...baseContext,
      active_bond: { id: 'b8', user_id: baseContext.user_id as string, entity_id: baseContext.school_id as string, entity_type: 'SCHOOL', capacity: 'nurse', status: 'active' },
    });
    expect(ability.can('manage', 'HealthRecords')).toBe(true);
  });

  /** COMMON SECTIONS: SELF, COMMUNITY, LIBRARY **/
  test('Self/Profile: Should allow users to update their own profiles', () => {
    const ability = composeUserAbilities({
      ...baseContext,
      active_bond: { id: 'b_student', user_id: baseContext.user_id as string, entity_id: baseContext.school_id as string, entity_type: 'SCHOOL', capacity: 'student', status: 'active' },
    });
    expect(
      ability.can('update', subject('StudentProfile', { user_id: baseContext.user_id } as any)),
    ).toBe(true);
  });

  test('Community: All roles (including guests) can see the feed', () => {
    const guestAbility = composeUserAbilities({
      ...baseContext,
      is_anonymous: true,
    } as any);
    const studentAbility = composeUserAbilities({
      ...baseContext,
      active_bond: { id: 'b_student', user_id: baseContext.user_id as string, entity_id: baseContext.school_id as string, entity_type: 'SCHOOL', capacity: 'student', status: 'active' },
    });

    expect(guestAbility.can('read', 'CommunityFeed')).toBe(true);
    expect(studentAbility.can('read', 'CommunityFeed')).toBe(true);
  });

  test('Library: Principal, Teacher, and Librarian have Review power', () => {
    const principalAbility = composeUserAbilities({
      ...baseContext,
      active_bond: { id: 'b11', user_id: baseContext.user_id as string, entity_id: baseContext.school_id as string, entity_type: 'SCHOOL', capacity: 'principal', status: 'active' },
    });
    const teacherAbility = composeUserAbilities({
      ...baseContext,
      active_bond: { id: 'b12', user_id: baseContext.user_id as string, entity_id: baseContext.school_id as string, entity_type: 'SCHOOL', capacity: 'teacher', status: 'active' },
    });
    const librarianAbility = composeUserAbilities({
      ...baseContext,
      active_bond: { id: 'b13', user_id: baseContext.user_id as string, entity_id: baseContext.school_id as string, entity_type: 'SCHOOL', capacity: 'librarian', status: 'active' },
    });
    const studentAbility = composeUserAbilities({
      ...baseContext,
      active_bond: { id: 'b14', user_id: baseContext.user_id as string, entity_id: baseContext.school_id as string, entity_type: 'SCHOOL', capacity: 'student', status: 'active' },
    });

    expect(principalAbility.can('manage', 'LibraryReview')).toBe(true);
    expect(teacherAbility.can('manage', 'LibraryReview')).toBe(true);
    expect(librarianAbility.can('manage', 'LibraryReview')).toBe(true);
    expect(studentAbility.can('manage', 'LibraryReview')).toBe(false);
  });

  test('Library: All 1st class citizens have full Library access, and Search is public', () => {
    const studentAbility = composeUserAbilities({
      ...baseContext,
      active_bond: { id: 'b_student', user_id: baseContext.user_id as string, entity_id: baseContext.school_id as string, entity_type: 'SCHOOL', capacity: 'student', status: 'active' },
    });
    const guestAbility = composeUserAbilities({
      ...baseContext,
      is_anonymous: true,
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
      has_global_access: true,
      active_bond: { id: 'b16', user_id: baseContext.user_id as string, entity_id: 'GLOBAL', entity_type: 'PLATFORM', capacity: 'founder', status: 'active' },
    });
    expect(ability.can('manage', 'all')).toBe(true);
  });

  test('2nd Class Citizen: Wanderer mode (no school context)', () => {
    const ability = composeUserAbilities({
      ...baseContext,
      school_id: null,
      active_bond: null,
      is_anonymous: true,
    });
    expect(ability.can('read', 'PublicLibrary')).toBe(true);
    expect(ability.can('read', 'CommunityFeed')).toBe(true);
    expect(ability.can('read', 'DirectMessages')).toBe(false);
  });
});
