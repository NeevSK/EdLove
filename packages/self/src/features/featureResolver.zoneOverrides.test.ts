import { describe, expect, it } from 'vitest';
import { resolveAccessibleFeatures } from './accessPolicy';
import { resolveFeatureSet } from './featureResolver';

describe('Self feature zone overrides', () => {
  it('moves an accessible feature into its persisted user-selected zone', () => {
    const accessible = resolveAccessibleFeatures({
      userId: 'user-1',
      capabilities: ['read:SelfJourney'],
      capacities: [],
      citizenshipLevel: 3,
      roles: ['student'],
    });
    const feature = accessible[0];
    if (!feature) throw new Error('Expected the Self catalog to provide an accessible feature.');

    const resolved = resolveFeatureSet(accessible, {
      selectedIds: [],
      customOrder: [],
      hiddenIds: [],
      zoneOverrides: { [feature.id]: 'shared' },
    });

    expect(resolved.byZone.shared.map((item) => item.id)).toContain(feature.id);
    expect(resolved.byZone.today.map((item) => item.id)).not.toContain(feature.id);
    expect(resolved.byZone.private.map((item) => item.id)).not.toContain(feature.id);
  });

  it('keeps a hidden custom-ordered feature out of every rendered feature collection', () => {
    const accessible = resolveAccessibleFeatures({
      userId: 'user-1',
      capabilities: ['read:SelfJourney'],
      capacities: [],
      citizenshipLevel: 3,
      roles: ['student'],
    });
    const feature = accessible[0];
    if (!feature) throw new Error('Expected the Self catalog to provide an accessible feature.');

    const resolved = resolveFeatureSet(accessible, {
      selectedIds: [feature.id],
      customOrder: [feature.id],
      hiddenIds: [feature.id],
    });

    expect(resolved.selected.map((item) => item.id)).not.toContain(feature.id);
    expect(resolved.discoverable.map((item) => item.id)).not.toContain(feature.id);
    expect(
      Object.values(resolved.byZone)
        .flat()
        .map((item) => item.id),
    ).not.toContain(feature.id);
  });
});
