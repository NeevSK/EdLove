import {
  getSelfFeatureDelivery,
  resolveSelfFeatureManifest,
} from '@repo/self/features/featureManifest';
import { describe, expect, it } from 'vitest';

/** The web's renderers, as declared by a platform (fixture). */
const WEB_DELIVERS_FIRE_JOURNAL = { deliveredFeatureIds: ['fire_journal'] };

const preferences = {
  selectedIds: [],
  customOrder: [],
  hiddenIds: [],
};

describe('resolveSelfFeatureManifest', () => {
  it('keeps the full catalog visible while distinguishing access and delivery truthfully', () => {
    const manifest = resolveSelfFeatureManifest(
      {
        userId: 'learner',
        capabilities: ['read:SelfReflection'],
        capacities: ['student'],
        citizenshipLevel: 3,
        roles: ['student'],
      },
      preferences,
      'browser',
      WEB_DELIVERS_FIRE_JOURNAL,
    );

    expect(manifest.all).toHaveLength(25);
    expect(manifest.all.find((feature) => feature.id === 'fire_journal')).toMatchObject({
      availability: 'available',
      delivery: 'runnable',
      taskBehavior: { kind: 'single' },
    });
    expect(manifest.all.find((feature) => feature.id === 'daily_pulse')).toMatchObject({
      availability: 'unavailable',
      unavailableReason: 'capability',
      taskBehavior: { kind: 'transient' },
    });
    expect(manifest.accessible.all.map((feature) => feature.id)).toEqual([
      'fire_journal',
      'voice_journal',
      'reframe',
      'tomorrow_prep',
    ]);
    expect(manifest.runnable.map((feature) => feature.id)).toEqual(['fire_journal']);
  });

  it('does not imply browser delivery merely because a feature is accessible', () => {
    const manifest = resolveSelfFeatureManifest(
      {
        capabilities: ['read:InnerPulse'],
        capacities: ['student'],
        citizenshipLevel: 3,
        roles: ['student'],
      },
      preferences,
      'browser',
      WEB_DELIVERS_FIRE_JOURNAL,
    );

    expect(manifest.all.find((feature) => feature.id === 'daily_pulse')).toMatchObject({
      availability: 'unavailable',
      unavailableReason: 'not-delivered-on-platform',
    });
  });

  it('does not fabricate browser authorization when only delivery is known', () => {
    const manifest = resolveSelfFeatureManifest(
      null,
      preferences,
      'browser',
      WEB_DELIVERS_FIRE_JOURNAL,
    );

    expect(manifest.all.find((feature) => feature.id === 'fire_journal')).toMatchObject({
      delivery: 'runnable',
      availability: 'authorization-unresolved',
    });
    expect(manifest.all.find((feature) => feature.id === 'daily_pulse')).toMatchObject({
      delivery: 'catalog-only',
      availability: 'unavailable',
      unavailableReason: 'not-delivered-on-platform',
    });
  });

  it('uses an explicit browser delivery declaration instead of guessing from the catalog', () => {
    const manifest = resolveSelfFeatureManifest(
      {
        capabilities: ['read:InnerPulse'],
        capacities: ['student'],
        citizenshipLevel: 3,
        roles: ['student'],
      },
      preferences,
      'browser',
      { deliveredFeatureIds: new Set(['daily_pulse']) },
    );

    expect(manifest.all.find((feature) => feature.id === 'daily_pulse')).toMatchObject({
      delivery: 'runnable',
      availability: 'available',
    });
    expect(manifest.all.find((feature) => feature.id === 'fire_journal')).toMatchObject({
      delivery: 'catalog-only',
      availability: 'unavailable',
      unavailableReason: 'capability',
    });
  });

  it('runs only what the platform declares; nothing is assumed', () => {
    expect(getSelfFeatureDelivery('voice_journal', 'native')).toBe('catalog-only');
    expect(
      getSelfFeatureDelivery('voice_journal', 'native', { deliveredFeatureIds: ['voice_journal'] }),
    ).toBe('runnable');
    expect(
      getSelfFeatureDelivery('voice_journal', 'native', {
        deliveredFeatureIds: ['fire_journal'],
      }),
    ).toBe('catalog-only');
  });
});
