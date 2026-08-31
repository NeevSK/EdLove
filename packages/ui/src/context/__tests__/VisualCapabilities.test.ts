import type { RealityState } from '@repo/ui/context/types';
import { classifyDeviceTier, resolveVisualCapabilities } from '@repo/ui/context/visualPolicy';
import { resolveExperienceProfile } from '@repo/ui/context/experiencePolicy';

const reality = (overrides: Partial<RealityState> = {}): RealityState => ({
  deviceTier: 'high',
  totalMemoryGB: 8,
  networkQuality: 'good',
  isDataSaverMode: false,
  isBatterySaverMode: false,
  isReducedMotionEnabled: false,
  ...overrides,
});

describe('resolveVisualCapabilities', () => {
  it('classifies native memory without requiring a browser navigator', () => {
    const GB = 1024 * 1024 * 1024;

    expect(classifyDeviceTier(2 * GB)).toBe('low');
    expect(classifyDeviceTier(4 * GB)).toBe('medium');
    expect(classifyDeviceTier(8 * GB)).toBe('high');
    expect(classifyDeviceTier(null)).toBe('medium');
  });

  it('keeps the rich path on capable hardware in Auto mode', () => {
    const capabilities = resolveVisualCapabilities(reality(), 'auto');

    expect(capabilities.allowRichAnimation).toBe(true);
    expect(capabilities.allowSubtleAnimation).toBe(true);
    expect(capabilities.allowBlur).toBe(true);
    expect(capabilities.quality).toBe('full');
    expect(capabilities.maxCelebrationParticles).toBe(200);
    expect(capabilities.imageCachePolicy).toBe('memory-disk');
    expect(capabilities.shouldPrefetchAssets).toBe(true);
  });

  it('reduces expensive layers on low hardware without changing the artwork contract', () => {
    const capabilities = resolveVisualCapabilities(
      reality({ deviceTier: 'low', totalMemoryGB: 2 }),
      'auto',
    );

    expect(capabilities.effectiveFidelity).toBe('low');
    expect(capabilities.quality).toBe('essential');
    expect(capabilities.allowAmbientEffects).toBe(false);
    expect(capabilities.allowSubtleAnimation).toBe(true);
    expect(capabilities.allowBlur).toBe(false);
    expect(capabilities.imageCachePolicy).toBe('disk');
    expect(capabilities.imageDecodeFormat).toBe('rgb');
    expect(capabilities.maxCelebrationParticles).toBe(32);
  });

  it('honors explicit High for visual richness on constrained hardware', () => {
    const capabilities = resolveVisualCapabilities(
      reality({ deviceTier: 'low', totalMemoryGB: 2 }),
      'high',
    );

    expect(capabilities.effectiveFidelity).toBe('high');
    expect(capabilities.quality).toBe('full');
    expect(capabilities.allowAmbientEffects).toBe(true);
    expect(capabilities.allowBlur).toBe(true);
    expect(capabilities.imageDecodeFormat).toBe('argb');
  });

  it('lets accessibility reduced motion override High animation', () => {
    const capabilities = resolveVisualCapabilities(
      reality({ isReducedMotionEnabled: true }),
      'high',
    );

    expect(capabilities.allowAmbientEffects).toBe(false);
    expect(capabilities.allowRichAnimation).toBe(false);
    expect(capabilities.allowSubtleAnimation).toBe(false);
    expect(capabilities.allowBlur).toBe(false);
  });

  it('lets Auto respond to battery saver without downgrading the illustration', () => {
    const capabilities = resolveVisualCapabilities(reality({ isBatterySaverMode: true }), 'auto');

    expect(capabilities.allowAmbientEffects).toBe(false);
    expect(capabilities.allowBlur).toBe(false);
    expect(capabilities.effectiveFidelity).toBe('high');
    expect(capabilities.quality).toBe('reduced');
    expect(capabilities.maxCelebrationParticles).toBe(64);
  });

  it('avoids prefetching on poor or offline connections', () => {
    expect(
      resolveVisualCapabilities(reality({ networkQuality: 'poor' }), 'auto').shouldPrefetchAssets,
    ).toBe(false);
    expect(
      resolveVisualCapabilities(reality({ networkQuality: 'offline' }), 'auto')
        .shouldPrefetchAssets,
    ).toBe(false);
  });

  it('resolves independent experience levels instead of one binary switch', () => {
    const profile = resolveExperienceProfile(
      reality({ deviceTier: 'low', isBatterySaverMode: true }),
      'auto',
      { quietMode: true },
    );

    expect(profile.motion).toBe('essential');
    expect(profile.visualEffects).toBe('essential');
    expect(profile.haptics).toBe('off');
    expect(profile.sound).toBe('off');
    expect(profile.celebration).toBe('essential');
    expect(profile.maxParticles).toBe(32);
  });

  it('keeps sound independent from visual fidelity when the user allows it', () => {
    const profile = resolveExperienceProfile(reality({ deviceTier: 'high' }), 'high', {
      soundEnabled: true,
    });

    expect(profile.motion).toBe('rich');
    expect(profile.visualEffects).toBe('rich');
    expect(profile.sound).toBe('essential');
    expect(profile.maxConcurrentSounds).toBe(1);
  });

  it('does not let battery saver remove meaningful sensory feedback', () => {
    const profile = resolveExperienceProfile(reality({ isBatterySaverMode: true }), 'auto');

    expect(profile.haptics).toBe('refined');
    expect(profile.sound).toBe('essential');
    expect(profile.motion).toBe('refined');
  });
});
