import { TimeProfileSchema } from '@repo/core/logic/registry/timeProfile';
import { featureCatalog } from '@repo/self/features/featureCatalog';
import { describe, expect, it } from 'vitest';

describe('FeatureCatalog', () => {
  it('is immutable and byCategory/byZone work', () => {
    expect(featureCatalog.all().length).toBe(25);
    expect(featureCatalog.byCategory('wellbeing').length).toBeGreaterThan(0);
    expect(featureCatalog.byZone('today').length).toBeGreaterThan(0);
    expect(Object.isFrozen(featureCatalog as unknown as object)).toBe(true);
  });

  it('gives every feature a valid time lens profile', () => {
    for (const feature of featureCatalog.all()) {
      expect(TimeProfileSchema.safeParse(feature.time).success, feature.id).toBe(true);
    }
  });
});
