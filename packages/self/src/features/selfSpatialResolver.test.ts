import { describe, expect, it } from 'vitest';
import { resolveAccessibleFeatures } from '../features/accessPolicy';
import { resolveFeatureSet } from '../features/featureResolver';
import { DEFAULT_SELF_PREFERENCES } from '../features/userPreferences';

describe('Self Spatial Resolver & Policy Contracts', () => {
  const accessible = resolveAccessibleFeatures({
    userId: 'user-polymath',
    capabilities: ['read:SelfJourney', 'read:InnerPulse', 'read:SelfCare'],
    capacities: [],
    citizenshipLevel: 3,
    roles: ['student', 'teacher'],
  });

  it('aggregates multi-role capabilities without duplicates', () => {
    const ids = accessible.map((f) => f.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
    expect(accessible.length).toBeGreaterThanOrEqual(2);
  });

  it('resolves spatial arrangements cleanly against user preferences', () => {
    const feature = accessible[0];
    if (!feature) throw new Error('Feature expected');

    const resolved = resolveFeatureSet(accessible, {
      ...DEFAULT_SELF_PREFERENCES.features,
      selectedIds: [feature.id],
      roleWeights: { teacher: 70, student: 30 },
    });

    expect(resolved.selected.map((f) => f.id)).toContain(feature.id);
    expect(resolved.byZone.today).toBeDefined();
    expect(resolved.byZone.private).toBeDefined();
    expect(resolved.byZone.shared).toBeDefined();
  });

  it('preserves user custom ordering across catalog transformations', () => {
    const ids = accessible.map((f) => f.id);
    const reversed = [...ids].reverse();

    const resolved = resolveFeatureSet(accessible, {
      ...DEFAULT_SELF_PREFERENCES.features,
      customOrder: reversed,
    });

    const outputIds = [...resolved.selected, ...resolved.discoverable].map((f) => f.id);
    expect(outputIds[0]).toBe(reversed[0]);
  });
});
