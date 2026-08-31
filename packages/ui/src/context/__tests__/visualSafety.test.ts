import type { VisualCapabilities } from '../types';
import { applyVisualSafeMode } from '../visualSafety';

const capabilities: VisualCapabilities = {
  deviceTier: 'high',
  effectiveFidelity: 'high',
  quality: 'full',
  allowAmbientEffects: true,
  allowBlur: true,
  allowRichAnimation: true,
  allowSubtleAnimation: true,
  imageCachePolicy: 'memory-disk',
  imageDecodeFormat: 'argb',
  shouldPrefetchAssets: true,
  maxCelebrationParticles: 200,
  experience: {
    motion: 'rich',
    visualEffects: 'rich',
    haptics: 'refined',
    sound: 'essential',
    celebration: 'rich',
    maxParticles: 200,
    maxConcurrentSounds: 1,
    allowAssetPrefetch: true,
  },
};

describe('visual safe mode', () => {
  afterEach(() => {
    globalThis.__GURUDEVI_VISUAL_SAFE_MODE__ = undefined;
    delete process.env.EXPO_PUBLIC_GURUDEVI_VISUAL_SAFE_MODE;
  });

  it('removes expensive layers without changing the device identity', () => {
    globalThis.__GURUDEVI_VISUAL_SAFE_MODE__ = true;
    const safe = applyVisualSafeMode(capabilities);

    expect(safe.deviceTier).toBe('high');
    expect(safe.allowBlur).toBe(false);
    expect(safe.allowSubtleAnimation).toBe(false);
    expect(safe.imageCachePolicy).toBe('disk');
    expect(safe.maxCelebrationParticles).toBe(0);
  });

  it('also honors the deployment-level environment override', () => {
    process.env.EXPO_PUBLIC_GURUDEVI_VISUAL_SAFE_MODE = 'true';
    const safe = applyVisualSafeMode(capabilities);

    expect(safe.quality).toBe('essential');
  });
});
