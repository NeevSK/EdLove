import { classifyMemoryTier } from '@repo/core/efficiency';
import type {
  DeviceTier,
  FidelityLevel,
  RealityState,
  VisualCapabilities,
} from './types';
import { resolveExperienceProfile, type SensoryPreferences } from './experiencePolicy';

export function classifyDeviceTier(totalMemoryBytes: number | null): DeviceTier {
  return classifyMemoryTier(totalMemoryBytes);
}

export function computeEffectiveFidelity(
  fidelityLevel: FidelityLevel,
  deviceTier: DeviceTier,
): 'low' | 'high' {
  if (fidelityLevel === 'low') return 'low';
  if (fidelityLevel === 'high') return 'high';
  return deviceTier === 'low' ? 'low' : 'high';
}

export function resolveVisualCapabilities(
  reality: RealityState,
  fidelityLevel: FidelityLevel,
  preferences: SensoryPreferences = {},
): VisualCapabilities {
  const experience = resolveExperienceProfile(reality, fidelityLevel, preferences);
  const effectiveFidelity = computeEffectiveFidelity(fidelityLevel, reality.deviceTier);
  const powerAllowsEffects = fidelityLevel === 'high' || !reality.isBatterySaverMode;
  const motionAllowsEffects = !reality.isReducedMotionEnabled;
  const allowRichAnimation =
    effectiveFidelity === 'high' && powerAllowsEffects && motionAllowsEffects && experience.motion === 'rich';
  const allowSubtleAnimation = motionAllowsEffects && experience.motion !== 'off';
  const useMemoryCache =
    fidelityLevel !== 'low' &&
    !reality.isDataSaverMode &&
    (reality.deviceTier === 'high' || fidelityLevel === 'high');

  return {
    deviceTier: reality.deviceTier,
    effectiveFidelity,
    quality:
      effectiveFidelity === 'high' && allowRichAnimation
        ? 'full'
        : effectiveFidelity === 'high'
          ? 'reduced'
          : 'essential',
    allowAmbientEffects: allowRichAnimation,
    allowBlur: allowRichAnimation,
    allowRichAnimation,
    allowSubtleAnimation,
    imageCachePolicy: useMemoryCache ? 'memory-disk' : 'disk',
    imageDecodeFormat:
      fidelityLevel === 'low' || (reality.deviceTier === 'low' && fidelityLevel !== 'high')
        ? 'rgb'
        : 'argb',
    shouldPrefetchAssets:
      fidelityLevel !== 'low' &&
      !reality.isDataSaverMode &&
      reality.networkQuality !== 'poor' &&
      reality.networkQuality !== 'offline',
    maxCelebrationParticles: experience.maxParticles,
    experience,
  };
}
