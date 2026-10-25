import type { CapacityClass, FidelityPreference, VergerSnapshot } from '@repo/verger-core';

/**
 * Gurudevi's reading of verger's decision: lever levels turned into the fields its components
 * read (`VisualCapabilities` in `@repo/ui/context/types` is this shape). Levels decide what costs
 * resources; the user's own choices (sound, haptics, quiet, fidelity) and the emergency safe mode
 * are passed in, since no lever owns them.
 */

export type DeviceTier = 'high' | 'medium' | 'low';
export type ExperienceLevel = 'off' | 'essential' | 'refined' | 'rich';
export type VisualQuality = 'full' | 'reduced' | 'essential';

export interface ExperienceProfile {
  readonly motion: ExperienceLevel;
  readonly visualEffects: ExperienceLevel;
  readonly haptics: ExperienceLevel;
  readonly sound: ExperienceLevel;
  readonly celebration: ExperienceLevel;
  readonly maxParticles: number;
  readonly maxConcurrentSounds: number;
  readonly allowAssetPrefetch: boolean;
}

export interface GurudeviExperience {
  readonly deviceTier: DeviceTier;
  readonly effectiveFidelity: 'low' | 'high';
  readonly quality: VisualQuality;
  readonly allowAmbientEffects: boolean;
  readonly allowBlur: boolean;
  readonly allowRichAnimation: boolean;
  readonly allowSubtleAnimation: boolean;
  readonly imageCachePolicy: 'disk' | 'memory-disk';
  readonly imageDecodeFormat: 'argb' | 'rgb';
  readonly shouldPrefetchAssets: boolean;
  /** Loading placeholders animate (`loading-shimmer` at 0) or hold still. */
  readonly allowShimmer: boolean;
  /**
   * FlashList's `drawDistance` (dp) from `list-window`: undefined keeps the list's own default
   * (250 dp natively), then half and a quarter of it. A caller's own value still wins.
   */
  readonly listDrawDistance: number | undefined;
  readonly maxCelebrationParticles: number;
  readonly experience: ExperienceProfile;
}

export interface ExperienceSettings {
  readonly fidelity: FidelityPreference;
  readonly soundEnabled?: boolean;
  readonly hapticsEnabled?: boolean;
  readonly quietMode?: boolean;
  /** The emergency override (remote config or build flag): everything at its cheapest. */
  readonly safeMode?: boolean;
}

/** The levers this view reads: the ones Gurudevi's components apply through it. */
export const EXPERIENCE_LEVER_IDS = [
  'ambient-motion',
  'transitions',
  'blur',
  'particles',
  'prefetch',
  'image-cache',
  'image-decode',
  'loading-shimmer',
  'list-window',
] as const;
type ExperienceLever = (typeof EXPERIENCE_LEVER_IDS)[number];

/** FlashList's native default is 250 dp (`PlatformConfig.defaultDrawDistance`, v2.3). */
const LIST_DRAW_DISTANCE: readonly (number | undefined)[] = [undefined, 125, 60];

/** A three-step lever's level as an experience level: 0 rich, 1 refined, 2 essential. */
const BY_LEVEL: readonly ExperienceLevel[] = ['rich', 'refined', 'essential'];
const PARTICLES: Readonly<Record<ExperienceLevel, number>> = {
  rich: 200,
  refined: 64,
  essential: 32,
  off: 0,
};

/** Verger's capacity class as the tier consumers read; an unknown phone reads as medium. */
const TIER: Readonly<Record<CapacityClass, DeviceTier>> = {
  low: 'low',
  mid: 'medium',
  high: 'high',
  unknown: 'medium',
};

export function experienceOf(
  snapshot: Pick<VergerSnapshot, 'levels' | 'capacityClass'>,
  settings: ExperienceSettings,
): GurudeviExperience {
  // One source for the memory thresholds: verger's config, through its capacity class.
  const deviceTier = TIER[snapshot.capacityClass];
  const level = (id: ExperienceLever) => snapshot.levels[id] ?? 0;
  const stepped = (id: ExperienceLever) => BY_LEVEL[Math.min(level(id), 2)] ?? 'essential';
  const safe = settings.safeMode === true;
  const quiet = settings.quietMode === true;

  const effectiveFidelity: 'low' | 'high' =
    settings.fidelity === 'low'
      ? 'low'
      : settings.fidelity === 'high'
        ? 'high'
        : deviceTier === 'low'
          ? 'low'
          : 'high';
  // Transitions at "instant" means no motion at all (reduced motion, or a hidden app).
  const motion: ExperienceLevel =
    safe || level('transitions') >= 2 ? 'off' : stepped('ambient-motion');
  const visualEffects: ExperienceLevel = safe ? 'essential' : stepped('blur');
  const celebration: ExperienceLevel = safe ? 'essential' : stepped('particles');
  const sound: ExperienceLevel =
    safe || quiet || settings.soundEnabled === false ? 'off' : 'essential';
  // Haptics have no lever: a low-memory phone's motor stays light unless the user asks for high.
  const lightHaptics = safe || (deviceTier === 'low' && settings.fidelity !== 'high');
  const haptics: ExperienceLevel =
    quiet || settings.hapticsEnabled === false ? 'off' : lightHaptics ? 'essential' : 'refined';
  const prefetch = !safe && level('prefetch') === 0;
  const maxParticles = safe ? 0 : PARTICLES[celebration];

  const allowRichAnimation = !safe && level('ambient-motion') === 0;
  const allowSubtleAnimation = motion !== 'off';
  return {
    deviceTier,
    effectiveFidelity,
    quality: safe
      ? 'essential'
      : effectiveFidelity === 'high' && allowRichAnimation
        ? 'full'
        : effectiveFidelity === 'high'
          ? 'reduced'
          : 'essential',
    allowAmbientEffects: allowRichAnimation,
    allowBlur: !safe && level('blur') === 0,
    allowRichAnimation,
    allowSubtleAnimation,
    imageCachePolicy: !safe && level('image-cache') === 0 ? 'memory-disk' : 'disk',
    imageDecodeFormat: safe || level('image-decode') >= 1 ? 'rgb' : 'argb',
    shouldPrefetchAssets: prefetch,
    allowShimmer: !safe && level('loading-shimmer') === 0,
    listDrawDistance: LIST_DRAW_DISTANCE[safe ? 2 : Math.min(level('list-window'), 2)],
    maxCelebrationParticles: maxParticles,
    experience: {
      motion,
      visualEffects,
      haptics,
      sound,
      celebration,
      maxParticles,
      maxConcurrentSounds: sound === 'off' ? 0 : 1,
      allowAssetPrefetch: prefetch,
    },
  };
}
