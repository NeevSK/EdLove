import { describe, expect, it } from 'vitest';
import { resolveFeaturePresentation } from '../featurePresentation';
import type { SanctuaryFeatureResult } from '../sanctuaryFeature';

describe('resolveFeaturePresentation', () => {
  it('maps entitlement denial to an upgrade presentation', () => {
    const result: SanctuaryFeatureResult = {
      permitted: false,
      reason: 'entitlement',
      required: 'PRO',
      current: 'FREE',
    };
    expect(resolveFeaturePresentation(result)).toEqual({
      mode: 'upgrade_required',
      requiredTier: 'PRO',
      reason: 'entitlement',
    });
  });

  it('hides authorization denial and labels a temporary rollout as coming soon', () => {
    expect(resolveFeaturePresentation({ permitted: false, reason: 'authz' })).toMatchObject({
      mode: 'hidden',
    });
    expect(
      resolveFeaturePresentation(
        {
          permitted: false,
          reason: 'feature',
          flagKey: 'reports.beta',
          flagType: 'beta',
        },
        'beta',
      ),
    ).toMatchObject({ mode: 'coming_soon' });
  });
});
