import { describe, it, expect } from 'vitest';
import { FEATURE_CATALOG } from '@repo/self/features/featureCatalog';
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

  it('returns no spaces when the account has no matching capabilities', () => {
    expect(
      resolveAccessibleFeatures({
        ...base,
        capabilities: [],
        citizenshipLevel: 3,
      }),
    ).toEqual([]);
  });

  it('denies every catalog feature when one declared capability is absent', () => {
    for (const feature of Object.values(FEATURE_CATALOG)) {
      const capabilities = feature.requiredCapabilities.slice();
      const missingCapability = capabilities.pop();
      expect(missingCapability).toBeDefined();

      const accessible = resolveAccessibleFeatures({
        ...base,
        capabilities,
        citizenshipLevel: feature.minCitizenship ?? 3,
      });

      expect(accessible.some((candidate) => candidate.id === feature.id)).toBe(false);
    }
  });

  it('enforces every declared citizenship boundary', () => {
    for (const feature of Object.values(FEATURE_CATALOG)) {
      if (feature.minCitizenship === undefined) continue;

      const capabilities = feature.requiredCapabilities.slice();
      const allowed = resolveAccessibleFeatures({
        ...base,
        capabilities,
        citizenshipLevel: feature.minCitizenship,
      });
      expect(allowed.some((candidate) => candidate.id === feature.id)).toBe(true);

      const denied = resolveAccessibleFeatures({
        ...base,
        capabilities,
        citizenshipLevel: feature.minCitizenship + 1,
      });
      expect(denied.some((candidate) => candidate.id === feature.id)).toBe(false);
    }
  });
});
