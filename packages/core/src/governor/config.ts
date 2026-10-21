import type { GovernorConfig } from './types';

/**
 * Defaults. Frame thresholds and back-off follow @rbayuokt/expo-adaptive-glass (MIT), whose
 * author notes they are not yet benchmarked; thermal thresholds follow the Android ADPF thermal
 * guide (headroom > 0.85 watch, > 0.95 reduce, > 1.0 reduce immediately). Every value here is
 * provisional until A52 and 2–3 GB release-build captures calibrate it.
 */
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
};
