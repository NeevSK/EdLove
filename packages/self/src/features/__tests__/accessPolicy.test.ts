import { describe, it, expect } from 'vitest';
import { resolveAccessibleFeatures } from '@repo/self/features/accessPolicy';

describe('AccessPolicy composite', () => {
  const base = { userId: 'u', capacities: [], roles: ['student'] as never[] };
  it('table-driven role×citizenship', () => {
    const student = resolveAccessibleFeatures({ ...base, capabilities: ['read:SelfJourney', 'read:InnerPulse', 'read:StudentDashboard', 'read:SelfCare', 'read:SelfReflection'], citizenshipLevel: 3 });
    expect(student.some((f) => f.id === 'daily_pulse')).toBe(true);
    expect(student.some((f) => f.id === 'decisions')).toBe(false);
    const teacher = resolveAccessibleFeatures({ ...base, capabilities: ['read:TeacherDashboard', 'read:InnerPulse'], citizenshipLevel: 2, roles: ['teacher'] as never });
    expect(teacher.some((f) => f.id === 'daily_rhythm')).toBe(true);
  });
  it('multi-role affinity', () => {
    const both = resolveAccessibleFeatures({ userId: 'u', capabilities: ['read:InnerPulse', 'read:SelfCare', 'manage:TeacherDashboard', 'manage:GuardianDashboard'], capacities: ['teacher', 'guardian'], citizenshipLevel: 3, roles: ['teacher', 'guardian'] as never });
    const pulse = both.find((f) => f.id === 'daily_pulse');
    expect(pulse?.roleAffinity).toBeGreaterThanOrEqual(60);
  });
});
