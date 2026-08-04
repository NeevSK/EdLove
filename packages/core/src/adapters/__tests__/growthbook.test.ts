import { describe, expect, it, vi } from 'vitest';
import type { UserContext } from '../../logic/schemas/user.schema';
import { GrowthBookFeatureRolloutAdapter } from '../feature-rollout/growthBookFeatureRollout.adapter';

// Mock GrowthBook SDK internally to prevent network calls
vi.mock('@growthbook/growthbook', () => {
  class MockGrowthBook {
    private attributes: any = {};
    private renderer: () => void = () => {};

    constructor() {}

    init() {
      return Promise.resolve({ success: true, source: 'network' });
    }

    setAttributes(attrs: any) {
      this.attributes = attrs;
      return Promise.resolve();
    }

    getFeatures() {
      return {
        'gurudevi.core.graphics-engine': { defaultValue: false },
      };
    }

    evalFeature(key: string) {
      if (key === 'gurudevi.core.graphics-engine' && this.attributes.pricing_tier === 'PRO') {
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
  it('maps UserContext and resolves manifest flags by GrowthBook key', async () => {
    const adapter = new GrowthBookFeatureRolloutAdapter('http://mock', 'sdk-mock');
    const context = {
      userId: 'user-123',
      pricing_tier: 'PRO',
      citizenship: 'CITIZEN',
    } as unknown as UserContext;

    const snapshot = await adapter.resolveFlags(context);
    expect(snapshot.flags['isGraphicsEngineEnabled']).toBe(true);
    expect(snapshot.flags['isAIAssistantEnabled']).toBe(false);
    expect(snapshot.source).toBe('remote');

    const contextFree = {
      userId: 'user-123',
      pricing_tier: 'FREE',
      citizenship: 'CITIZEN',
    } as unknown as UserContext;

    const snapshotFree = await adapter.resolveFlags(contextFree);
    expect(snapshotFree.flags['isGraphicsEngineEnabled']).toBe(false);
  });

  it('emits app keys only, never raw GrowthBook keys', async () => {
    const adapter = new GrowthBookFeatureRolloutAdapter('http://mock', 'sdk-mock');
    const context = {
      userId: 'user-123',
      pricing_tier: 'PRO',
      citizenship: 'CITIZEN',
    } as unknown as UserContext;

    const snapshot = await adapter.resolveFlags(context);
    expect(Object.keys(snapshot.flags).sort()).toEqual(
      expect.arrayContaining(['isInventoryEnabled', 'isPowerSyncEnabled', 'isAIAssistantEnabled']),
    );
    expect(Object.keys(snapshot.flags)).not.toContain('gurudevi.core.graphics-engine');
  });
});
