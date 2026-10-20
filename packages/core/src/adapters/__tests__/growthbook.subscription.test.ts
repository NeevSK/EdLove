import { GrowthBook } from '@growthbook/growthbook';
import { UserContextSchema } from '@repo/core/logic/schemas/user.schema';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GrowthBookFeatureRolloutAdapter } from '../feature-rollout/growthBookFeatureRollout.adapter';

vi.mock('@repo/core/lib/storage', () => ({
  storage: { getString: vi.fn(), set: vi.fn() },
}));
vi.mock('@repo/core/monitoring', () => ({ trackProductEvent: vi.fn() }));

afterEach(() => vi.restoreAllMocks());

describe('GrowthBook renderer subscription with the installed SDK', () => {
  it('publishes attribute and payload changes without feeding them back into setAttributes', async () => {
    vi.spyOn(GrowthBook.prototype, 'init').mockResolvedValue({
      success: true,
      source: 'network',
    });
    const originalSetAttributes = GrowthBook.prototype.setAttributes;
    let sdk: GrowthBook | undefined;
    const attributeWrites = vi.spyOn(GrowthBook.prototype, 'setAttributes').mockImplementation(
      function (this: GrowthBook, attributes) {
        sdk = this;
        // Bound a regression so a recursive renderer fails instead of hanging the runner.
        if (attributeWrites.mock.calls.length > 3) {
          return Promise.reject(new Error('Renderer recursively rewrote attributes'));
        }
        return originalSetAttributes.call(this, attributes);
      },
    );
    const adapter = new GrowthBookFeatureRolloutAdapter('http://unused', 'sdk-test');
    const context = UserContextSchema.parse({
      userId: 'local-guest',
      isAnonymous: true,
      isLocalOnly: true,
      onboarding_completed: true,
    });
    const onChange = vi.fn();
    const unsubscribe = adapter.subscribeToFlagChanges(context, onChange);

    try {
      await adapter.resolveFlags(context);
      await Promise.resolve();
      await Promise.resolve();
      expect(attributeWrites).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(sdk).toBeDefined();
      if (!sdk) throw new Error('The adapter did not configure the SDK');

      await sdk.setPayload({
        features: { 'gurudevi.core.graphics-engine': { defaultValue: true } },
      });
      expect(onChange).toHaveBeenCalledTimes(2);
      expect(onChange.mock.lastCall?.[0].flags.isGraphicsEngineEnabled).toBe(true);
      expect(attributeWrites).toHaveBeenCalledTimes(1);

      unsubscribe();
      await sdk.setPayload({
        features: { 'gurudevi.core.graphics-engine': { defaultValue: false } },
      });
      expect(onChange).toHaveBeenCalledTimes(2);
    } finally {
      unsubscribe();
      sdk?.destroy();
    }
  });
});
