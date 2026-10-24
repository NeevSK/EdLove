import type { GovernorConfig } from './types';

/**
 * Defaults. Frame thresholds and back-off follow @rbayuokt/expo-adaptive-glass (MIT), whose
 * author notes they are not yet benchmarked; thermal thresholds follow the Android ADPF thermal
 * guide (headroom > 0.85 watch, > 0.95 reduce, > 1.0 reduce immediately). Every value here is
 * provisional until A52 and 2–3 GB release-build captures calibrate it.
 */
/** Throws on a config no policy could run; checked at host definition and on every live change. */
export function validateConfig(config: GovernorConfig): void {
  for (const [key, value] of Object.entries(config)) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
      throw new Error(`Config "${key}" must be a finite positive number`);
    }
  }
  const order = (low: keyof GovernorConfig, high: keyof GovernorConfig) => {
    if (!(config[low] < config[high])) throw new Error(`Config "${low}" must be below "${high}"`);
  };
  order('comfortRatio', 'stressRatio');
  order('comfortDroppedRatio', 'stressDroppedRatio');
  order('headroomWarm', 'headroomHot');
  order('upgradeAfterMs', 'maxUpgradeAfterMs');
  order('batteryWarmC', 'batteryHotC');
  order('batteryHotC', 'batteryCriticalC');
  if (config.batteryLowPercent > 100) throw new Error('Config "batteryLowPercent" must be at most 100');
  if (!(config.headroomHot <= config.headroomCritical)) {
    throw new Error('Config "headroomHot" must not exceed "headroomCritical"');
  }
  if (!Number.isInteger(config.minSamples))
    throw new Error('Config "minSamples" must be an integer');
}

export const DEFAULT_GOVERNOR_CONFIG: GovernorConfig = {
  minSamples: 4,
  stressRatio: 1.25,
  stressDroppedRatio: 0.1,
  comfortRatio: 0.8,
  comfortDroppedRatio: 0.02,
  downgradeAfterMs: 750,
  upgradeAfterMs: 4_000,
  maxUpgradeAfterMs: 60_000,
  failedUpgradeWindowMs: 10_000,
  resetBackoffAfterMs: 30_000,
  thermalActionDelayMs: 2_000,
  headroomWarm: 0.85,
  headroomHot: 0.95,
  headroomCritical: 1.0,
  memoryLatchMs: 30_000,
  ambientSleepAfterMs: 10_000,
  fastDecreaseSteps: 3,
  maxOptionalConcurrency: 2,
  meteredOptionalConcurrency: 2,
  batteryLowPercent: 20,
  batteryWarmC: 40,
  batteryHotC: 45,
  batteryCriticalC: 50,
  saturationCores: 0.9,
  saturationAfterMs: 2_000,
  longTaskWindowMs: 5_000,
  longTasksForContention: 3,
  memoryLowFactor: 1.5,
  memoryModerateFactor: 2,
  refreshCapHz: 60,
  jankFrameFactor: 6,
  maxUnrelievedContentionSteps: 2,
  contentionReliefCores: 0.05,
  gestureQuietMs: 1_000,
};
