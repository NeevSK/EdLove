import type {
  DeviceTier,
  ExperienceLevel,
  ExperienceProfile,
  FidelityLevel,
  RealityState,
} from './types';

export interface SensoryPreferences {
  hapticsEnabled?: boolean;
  soundEnabled?: boolean;
  quietMode?: boolean;
}

const RANK: Record<ExperienceLevel, number> = {
  off: 0,
  essential: 1,
  refined: 2,
  rich: 3,
};

function cap(level: ExperienceLevel, maximum: ExperienceLevel): ExperienceLevel {
  return RANK[level] <= RANK[maximum] ? level : maximum;
}

function baseLevel(fidelityLevel: FidelityLevel, deviceTier: DeviceTier): ExperienceLevel {
  if (fidelityLevel === 'high' || deviceTier === 'high') return 'rich';
  if (fidelityLevel === 'low' || deviceTier === 'low') return 'essential';
  return 'refined';
}

export function resolveExperienceProfile(
  reality: RealityState,
  fidelityLevel: FidelityLevel,
  preferences: SensoryPreferences = {},
): ExperienceProfile {
  const base = baseLevel(fidelityLevel, reality.deviceTier);
  const constrainedByPower = reality.isBatterySaverMode;
  const reducedMotion = reality.isReducedMotionEnabled;
  const soundEnabled = preferences.soundEnabled !== false && !preferences.quietMode;
  const hapticsEnabled = preferences.hapticsEnabled !== false && !preferences.quietMode;

  let motion = base;
  let visualEffects = base;
  let haptics: ExperienceLevel = hapticsEnabled ? 'refined' : 'off';
  let sound: ExperienceLevel = soundEnabled ? 'essential' : 'off';
  let celebration = base;

  if (reality.deviceTier === 'low' && fidelityLevel !== 'high') {
    motion = cap(motion, 'essential');
    visualEffects = cap(visualEffects, 'essential');
    haptics = cap(haptics, 'essential');
    celebration = cap(celebration, 'essential');
  }

  if (constrainedByPower) {
    motion = cap(motion, 'refined');
    visualEffects = cap(visualEffects, 'refined');
    celebration = cap(celebration, 'refined');
    sound = cap(sound, 'essential');
  }

  if (reducedMotion) {
    motion = 'off';
    celebration = cap(celebration, 'essential');
  }

  if (reality.networkQuality === 'poor' || reality.networkQuality === 'offline') {
    sound = cap(sound, 'essential');
  }

  const maxParticles =
    celebration === 'rich'
      ? 200
      : celebration === 'refined'
        ? 64
        : celebration === 'essential'
          ? 32
          : 0;

  return {
    motion,
    visualEffects,
    haptics,
    sound,
    celebration,
    maxParticles,
    maxConcurrentSounds: sound === 'rich' ? 2 : sound === 'essential' ? 1 : 0,
    allowAssetPrefetch:
      !reality.isDataSaverMode &&
      reality.networkQuality !== 'poor' &&
      reality.networkQuality !== 'offline',
  };
}
