import type { Bond } from '@repo/core/logic/schemas/identity.schema';
import type { SanctuaryPerspective } from '@repo/core/types/Perspective';
import { describe, expect, it } from 'vitest';
import { decide, resolveActiveBond, resolveAuthorityContext } from '../authority';

const school = {
  id: 'b-school',
  entity_id: 'school-1',
  entity_type: 'SCHOOL',
  capacity: 'teacher',
} as Bond;
const otherSchool = {
  id: 'b-other',
  entity_id: 'school-2',
  entity_type: 'SCHOOL',
  capacity: 'student',
} as Bond;
const personal = {
  id: 'b-personal',
  entity_id: 'u-1',
  entity_type: 'PERSONAL',
  capacity: 'student',
} as Bond;

const institutional = (schoolId: string): SanctuaryPerspective =>
  ({
    id: schoolId,
    kind: 'institutional',
    displayName: 'School',
    schoolId,
  }) as SanctuaryPerspective;
const personalPerspective = {
  id: 'personal',
  kind: 'personal',
  displayName: 'Me',
} as SanctuaryPerspective;

const entitlement = { pricingTier: 'FREE' as const, activeEntitlements: [], grants: [] };

describe('authority', { tags: ['fast', 'security'] }, () => {
  it('follows the perspective to its bond, else keeps the session choice', () => {
    const bonds = [school, otherSchool, personal];
    expect(resolveActiveBond(institutional('school-2'), bonds, school)).toBe(otherSchool);
    expect(resolveActiveBond(personalPerspective, bonds, school)).toBe(personal);
    expect(resolveActiveBond(institutional('school-9'), bonds, school)).toBe(school);
  });

  it('derives capacity and scope from the active bond, not from the account', () => {
    const context = resolveAuthorityContext({
      user: { id: 'u-1', capacity: 'student' } as never,
      activePerspective: institutional('school-1'),
      availableBonds: [school, personal],
      sessionActiveBond: personal,
      entitlement,
    });
    expect(context.activeBond?.id).toBe('b-school');
    expect(context.capacity).toBe('teacher');
    expect(context.primaryCapacity).toBe('student');
    expect(context.schoolId).toBe('school-1');
    expect(context.isPersonal).toBe(false);
  });

  it('a new active bond gives a new context (what the subscription now recomputes)', () => {
    const base = {
      user: { id: 'u-1', capacity: 'student' } as never,
      activePerspective: {
        id: 'x',
        kind: 'custom',
        displayName: 'X',
      } as unknown as SanctuaryPerspective,
      availableBonds: [school, otherSchool],
      entitlement,
    };
    expect(resolveAuthorityContext({ ...base, sessionActiveBond: school }).capacity).toBe(
      'teacher',
    );
    expect(resolveAuthorityContext({ ...base, sessionActiveBond: otherSchool }).capacity).toBe(
      'student',
    );
  });

  it('decides from the snapshot, with open personal reads as the only default', () => {
    expect(decide('u-1', 'allow', 'record', 'Attendance')).toBe(true);
    expect(decide('u-1', 'deny', 'read', 'SelfJourney')).toBe(false);
    expect(decide('u-1', 'no_decision', 'read', 'SelfJourney')).toBe(true);
    expect(decide('u-1', 'no_decision', 'record', 'Attendance')).toBe(false);
    expect(decide(null, 'allow', 'record', 'Attendance')).toBe(false);
    expect(decide(null, 'no_decision', 'read', 'LibraryResource')).toBe(true);
  });

  it('lets a local guest write their own Self data on the device, and nothing shared', () => {
    const guest = 'local-9ac0f584-4299-4b23-ae2c-5846be605c26';
    expect(decide(guest, 'no_decision', 'create', 'SelfReflection')).toBe(true);
    expect(decide(guest, 'no_decision', 'update', 'InnerPulse')).toBe(true);
    expect(decide(guest, 'no_decision', 'delete', 'SelfCare')).toBe(true);
    expect(decide(guest, 'no_decision', 'read', 'CommunityPost')).toBe(true);
    expect(decide(guest, 'no_decision', 'create', 'CommunityPost')).toBe(false);
    expect(decide(guest, 'no_decision', 'record', 'Attendance')).toBe(false);
    // An id that only looks like a guest is an account and goes through the snapshot.
    expect(decide('local-not-a-guest', 'no_decision', 'create', 'SelfReflection')).toBe(false);
  });
});
