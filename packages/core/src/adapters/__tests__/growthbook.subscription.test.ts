import { GrowthBook } from '@growthbook/growthbook';
import { UserContextSchema } from '@repo/core/logic/schemas/user.schema';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GrowthBookFeatureRolloutAdapter } from '../feature-rollout/growthBookFeatureRollout.adapter';

vi.mock('@repo/core/lib/storage', () => ({
  storage: { getStringAsync: vi.fn(), setAsync: vi.fn() },
}));
vi.mock('@repo/core/logic/managers/NetworkManager', () => ({
  networkManager: { getSnapshot: () => ({ status: 'online' }), subscribe: () => () => undefined },
}));
vi.mock('@repo/core/monitoring', () => ({ trackProductEvent: vi.fn() }));

afterEach(() => vi.restoreAllMocks());

describe('GrowthBook renderer subscription with the installed SDK', () => {
  it('serializes attribute updates and keeps a replacement subscription alive after old cleanup', async () => {
    vi.spyOn(GrowthBook.prototype, 'init').mockResolvedValue({ success: true, source: 'network' });
    const originalSetAttributes = GrowthBook.prototype.setAttributes;
    let releaseFirst!: () => void;
    const firstPending = new Promise<void>((resolve) => {
      releaseFirst = resolve;
    });
    let sdk: GrowthBook | undefined;
    const writes = vi
      .spyOn(GrowthBook.prototype, 'setAttributes')
      .mockImplementation(async function (attributes) {
        sdk = this;
        await originalSetAttributes.call(this, attributes);
        if (attributes.id === 'account-a') await firstPending;
      });
    const adapter = new GrowthBookFeatureRolloutAdapter('http://unused', 'sdk-test');
    const first = UserContextSchema.parse({ userId: 'account-a', pricing_tier: 'PRO' });
    const second = UserContextSchema.parse({ userId: 'account-b', pricing_tier: 'FREE' });
    const stopFirst = adapter.subscribeToFlagChanges(first, vi.fn());
    const resultFirst = adapter.resolveFlags(first);
    await vi.waitFor(() => expect(writes).toHaveBeenCalledTimes(1));
    if (!sdk) throw new Error('SDK attributes were not configured');
    const onSecond = vi.fn();
    const stopSecond = adapter.subscribeToFlagChanges(second, onSecond);
    const resultSecond = adapter.resolveFlags(second);
    stopFirst();
    try {
      await sdk.setPayload({
        features: {
          'gurudevi.core.graphics-engine': {
            defaultValue: false,
            rules: [{ condition: { pricing_tier: 'PRO' }, force: true }],
          },
        },
      });
      expect(onSecond).not.toHaveBeenCalled();
      expect(writes).toHaveBeenCalledTimes(1);
      releaseFirst();
      expect((await resultFirst).flags.isGraphicsEngineEnabled).toBe(true);
      expect((await resultSecond).flags.isGraphicsEngineEnabled).toBe(false);
      expect(onSecond).toHaveBeenCalledTimes(1);
      expect(onSecond.mock.lastCall?.[0].flags.isGraphicsEngineEnabled).toBe(false);
      await sdk.setPayload({
        features: { 'gurudevi.core.graphics-engine': { defaultValue: true } },
      });
      expect(onSecond).toHaveBeenCalledTimes(2);
    } finally {
      releaseFirst();
      stopSecond();
      sdk.destroy();
    }
  });

  it('publishes attribute and payload changes without feeding them back into setAttributes', async () => {
    vi.spyOn(GrowthBook.prototype, 'init').mockResolvedValue({
      success: true,
      source: 'network',
    });
    const originalSetAttributes = GrowthBook.prototype.setAttributes;
    let sdk: GrowthBook | undefined;
    const attributeWrites = vi
      .spyOn(GrowthBook.prototype, 'setAttributes')
      .mockImplementation(function (this: GrowthBook, attributes) {
        sdk = this;
        // Bound a regression so a recursive renderer fails instead of hanging the runner.
        if (attributeWrites.mock.calls.length > 3) {
          return Promise.reject(new Error('Renderer recursively rewrote attributes'));
        }
        return originalSetAttributes.call(this, attributes);
      });
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
