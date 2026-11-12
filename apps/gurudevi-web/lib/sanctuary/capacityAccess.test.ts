import { describe, expect, it } from 'vitest';
import {
  leadership,
  leadershipOrGuardian,
  schoolLeadership,
  staff,
  steward,
} from './capacityAccess';

describe('capacity rules', () => {
  it('read account capacities and capitalised preview capacities alike', () => {
    expect(leadership({ capacity: 'principal' })).toBe(true);
    expect(leadership({ capacity: 'PRINCIPAL' })).toBe(true);
    expect(leadership({ capacity: 'assistantPrincipal' })).toBe(true);
    expect(steward({ capacity: 'founder' })).toBe(true);
    expect(steward({ capacity: 'FOUNDER' })).toBe(true);
  });

  it('let a bond role qualify when the capacity does not', () => {
    expect(staff({ capacity: 'student', activeScope: { roles: ['teacher'] } })).toBe(true);
    expect(
      leadershipOrGuardian({ capacity: 'student', activeScope: { roles: ['guardian'] } }),
    ).toBe(true);
  });

  it('refuse capacities outside the rule', () => {
    expect(leadership({ capacity: 'teacher' })).toBe(false);
    expect(schoolLeadership({ capacity: 'student', activeScope: { roles: [] } })).toBe(false);
    expect(staff({ capacity: 'guardian' })).toBe(false);
    expect(steward({ capacity: 'principal' })).toBe(false);
  });

  it('keep the leadership tiers distinct', () => {
    expect(schoolLeadership({ capacity: 'gradeHead' })).toBe(true);
    expect(leadership({ capacity: 'gradeHead' })).toBe(false);
  });
});
