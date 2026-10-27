import { describe, expect, it, vi } from 'vitest';
import { UserContextSchema } from '../../logic/schemas/user.schema';
import { GrowthBookFeatureRolloutAdapter } from '../feature-rollout/growthBookFeatureRollout.adapter';

const growthBookInit = vi.hoisted(() => vi.fn());
vi.mock('@repo/core/logic/managers/NetworkManager', () => ({
  networkManager: { getSnapshot: () => ({ status: 'online' }), subscribe: () => () => undefined },
}));

// Mock GrowthBook SDK internally to prevent network calls
vi.mock('@growthbook/growthbook', () => {
  class MockGrowthBook {
    private attributes: Record<string, unknown> = {};

    constructor() {}

    init(options: unknown) {
      growthBookInit(options);
      return Promise.resolve({ success: true, source: 'network' });
    }

    setAttributes(attrs: Record<string, unknown>) {
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

    setRenderer(_renderer: (() => void) | null) {}
  }

  return {
    GrowthBook: MockGrowthBook,
    setPolyfills: vi.fn(),
  };
});

describe('GrowthBookFeatureRolloutAdapter', () => {
  it('loads lazily without an unowned SDK stream or poller', async () => {
    growthBookInit.mockClear();
    const adapter = new GrowthBookFeatureRolloutAdapter('http://mock', 'sdk-mock');
    expect(growthBookInit).not.toHaveBeenCalled();
    await adapter.resolveFlags(UserContextSchema.parse({ userId: 'user-123' }));

    expect(growthBookInit).toHaveBeenCalledWith({
      streaming: false,
      skipCache: true,
      timeout: 10_000,
    });
  });

  it('maps UserContext and resolves manifest flags by GrowthBook key', async () => {
    const adapter = new GrowthBookFeatureRolloutAdapter('http://mock', 'sdk-mock');
    const context = UserContextSchema.parse({
      userId: 'user-123',
      pricing_tier: 'PRO',
      citizenship: 'FIRST_CLASS',
    });

    const snapshot = await adapter.resolveFlags(context);
    expect(snapshot.flags['isGraphicsEngineEnabled']).toBe(true);
    expect(snapshot.flags['isAIAssistantEnabled']).toBe(false);
    expect(snapshot.source).toBe('remote');

    const contextFree = UserContextSchema.parse({
      userId: 'user-123',
      pricing_tier: 'FREE',
      citizenship: 'FIRST_CLASS',
    });

    const snapshotFree = await adapter.resolveFlags(contextFree);
    expect(snapshotFree.flags['isGraphicsEngineEnabled']).toBe(false);
  });

  it('emits app keys only, never raw GrowthBook keys', async () => {
    const adapter = new GrowthBookFeatureRolloutAdapter('http://mock', 'sdk-mock');
    const context = UserContextSchema.parse({
      userId: 'user-123',
      pricing_tier: 'PRO',
      citizenship: 'FIRST_CLASS',
    });

    const snapshot = await adapter.resolveFlags(context);
    expect(Object.keys(snapshot.flags).sort()).toEqual(
      expect.arrayContaining(['isInventoryEnabled', 'isPowerSyncEnabled', 'isAIAssistantEnabled']),
    );
    expect(Object.keys(snapshot.flags)).not.toContain('gurudevi.core.graphics-engine');
  });
});
