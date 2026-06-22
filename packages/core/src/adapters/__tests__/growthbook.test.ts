import { describe, expect, it, vi } from 'vitest';
import { GrowthBookFeatureRolloutAdapter } from '../feature-rollout/growthBookFeatureRollout.adapter';
import type { UserContext } from '../../logic/schemas/user.schema';

// Mock GrowthBook SDK internally to prevent network calls
vi.mock('@growthbook/growthbook', () => {
  class MockGrowthBook {
    private attributes: any = {};
    private renderer: () => void = () => {};

    constructor() {}

    loadFeatures() {
      return Promise.resolve();
    }

    setAttributes(attrs: any) {
      this.attributes = attrs;
      return Promise.resolve();
    }

    getFeatures() {
      return {
        'new-dashboard': { defaultValue: false },
      };
    }

    evalFeature(key: string) {
      if (key === 'new-dashboard' && this.attributes.pricing_tier === 'PRO') {
        return { value: true };
      }
      return { value: false };
    }

    setRenderer(renderer: () => void) {
      this.renderer = renderer;
    }
  }

  return {
    GrowthBook: MockGrowthBook,
    setPolyfills: vi.fn(),
  };
});

describe('GrowthBookFeatureRolloutAdapter', () => {
  it('maps UserContext and resolves features correctly', async () => {
    const adapter = new GrowthBookFeatureRolloutAdapter('http://mock', 'sdk-mock');
    const context = {
      userId: 'user-123',
      pricing_tier: 'PRO',
      citizenship: 'CITIZEN',
    } as unknown as UserContext;

    const snapshot = await adapter.resolveFlags(context);
    expect(snapshot.flags['new-dashboard']).toBe(true);

    const contextFree = {
      userId: 'user-123',
      pricing_tier: 'FREE',
      citizenship: 'CITIZEN',
    } as unknown as UserContext;

    const snapshotFree = await adapter.resolveFlags(contextFree);
    expect(snapshotFree.flags['new-dashboard']).toBe(false);
  });
});
