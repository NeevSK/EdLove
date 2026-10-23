import { classifyMemoryTier } from '@repo/core/efficiency';
import { resolveExperienceProfile, type SensoryPreferences } from './experiencePolicy';
import type { DeviceTier, FidelityLevel, RealityState, VisualCapabilities } from './types';

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
  const isConstrained = reality.pressure === 'constrained';
  const isSevere = reality.pressure === 'severe';

  const experience = resolveExperienceProfile(reality, fidelityLevel, preferences);
  const effectiveFidelity = isSevere
    ? 'low'
    : computeEffectiveFidelity(fidelityLevel, reality.deviceTier);
  const powerAllowsEffects =
    fidelityLevel === 'high' || (!reality.isBatterySaverMode && !isSevere);
  const motionAllowsEffects = !reality.isReducedMotionEnabled && !isSevere;
  const allowRichAnimation =
    effectiveFidelity === 'high' &&
    powerAllowsEffects &&
    motionAllowsEffects &&
    !isConstrained &&
    experience.motion === 'rich';
  const allowSubtleAnimation = motionAllowsEffects && experience.motion !== 'off';
  const useMemoryCache =
    fidelityLevel !== 'low' &&
    !reality.isDataSaverMode &&
    !isConstrained &&
    !isSevere &&
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
    allowBlur: allowRichAnimation && !isConstrained && !isSevere,
    allowRichAnimation,
    allowSubtleAnimation,
    imageCachePolicy: useMemoryCache ? 'memory-disk' : 'disk',
    imageDecodeFormat:
      fidelityLevel === 'low' || isSevere || (reality.deviceTier === 'low' && fidelityLevel !== 'high')
        ? 'rgb'
        : 'argb',
    shouldPrefetchAssets:
      fidelityLevel !== 'low' &&
      !reality.isDataSaverMode &&
      !isSevere &&
      reality.networkQuality !== 'poor' &&
      reality.networkQuality !== 'offline',
    maxCelebrationParticles: isSevere
      ? 0
      : isConstrained
        ? Math.min(experience.maxParticles, 12)
        : experience.maxParticles,
    experience,
  };
}
