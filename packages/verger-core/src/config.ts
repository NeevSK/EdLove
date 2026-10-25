import type { VergerConfig } from './types';

/**
 * Defaults. Frame thresholds and back-off follow @rbayuokt/expo-adaptive-glass (MIT), whose
 * author notes they are not yet benchmarked; thermal thresholds follow the Android ADPF thermal
 * guide (headroom > 0.85 watch, > 0.95 reduce, > 1.0 reduce immediately). Every value here is
 * provisional until A52 and 2–3 GB release-build captures calibrate it.
 */
/** Throws on a config no policy could run; checked at host definition and on every live change. */
export function validateConfig(config: VergerConfig): void {
  for (const [key, value] of Object.entries(config)) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
      throw new Error(`Config "${key}" must be a finite positive number`);
    }
  }
  const order = (low: keyof VergerConfig, high: keyof VergerConfig) => {
    if (!(config[low] < config[high])) throw new Error(`Config "${low}" must be below "${high}"`);
  };
  order('comfortRatio', 'stressRatio');
  order('comfortDroppedRatio', 'stressDroppedRatio');
  order('headroomWarm', 'headroomHot');
  order('upgradeAfterMs', 'maxUpgradeAfterMs');
  order('batteryWarmC', 'batteryHotC');
  order('batteryHotC', 'batteryCriticalC');
  order('lowCapacityBelowBytes', 'midCapacityBelowBytes');
  if (config.batteryLowPercent > 100)
    throw new Error('Config "batteryLowPercent" must be at most 100');
  if (config.gcPauseShareStall > 1)
    throw new Error('Config "gcPauseShareStall" must be at most 1');
  if (config.expandMinConfidence > 1)
    throw new Error('Config "expandMinConfidence" must be at most 1');
  if (!(config.headroomHot <= config.headroomCritical)) {
    throw new Error('Config "headroomHot" must not exceed "headroomCritical"');
  }
  if (!Number.isInteger(config.minSamples))
    throw new Error('Config "minSamples" must be an integer');
  if (!Number.isInteger(config.ineffectiveAfterMoves))
    throw new Error('Config "ineffectiveAfterMoves" must be an integer');
  if (config.selfBudgetMaxDutyRatio > 1)
    throw new Error('Config "selfBudgetMaxDutyRatio" must be at most 1 (1 is no budget)');
  if (!Number.isInteger(config.flapCycles))
    throw new Error('Config "flapCycles" must be an integer');
}

export const DEFAULT_VERGER_CONFIG: VergerConfig = {
  minSamples: 4,
  stressRatio: 1.25,
  stressDroppedRatio: 0.1,
  comfortRatio: 0.8,
  comfortDroppedRatio: 0.02,
  downgradeAfterMs: 750,
  upgradeAfterMs: 4_000,
  maxUpgradeAfterMs: 60_000,
  failedUpgradeWindowMs: 10_000,
  flapWindowMs: 120_000,
  flapCycles: 3,
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
  lowCapacityBelowBytes: 5 * 1024 ** 3,
  midCapacityBelowBytes: 9 * 1024 ** 3,
  slowNetworkKbps: 1_000,
  networkSettleMs: 60_000,
  expandMinConfidence: 0.3,
  saturationCores: 0.9,
  saturationAfterMs: 2_000,
  longTaskWindowMs: 5_000,
  longTasksForContention: 3,
  inputDelayLongMs: 100,
  eventLoopLagLongMs: 100,
  gcPauseShareStall: 0.05,
  storageLowBytes: 512 * 1024 ** 2,
  outcomeJudgeWindowMs: 5_000,
  outcomeHoldWindowMs: 10_000,
  ineffectiveAfterMoves: 3,
  selfBudgetMaxDutyRatio: 1,
  selfBudgetWindowMs: 60_000,
  memoryLowFactor: 1.5,
  memoryModerateFactor: 2,
  refreshCapHz: 60,
  jankFrameFactor: 6,
  maxUnrelievedContentionSteps: 2,
  contentionReliefCores: 0.05,
  gestureQuietMs: 1_000,
};

/**
 * A threshold patch from outside the code (remote config, the lab's saved tuning), untrusted:
 * an object of known thresholds with numbers, which together with `base` must validate. Refused
 * whole, with the reason, on the first problem; nothing partial is ever applied.
 */
export function parseConfigPatch(
  input: unknown,
  base: VergerConfig,
): { readonly patch: Partial<VergerConfig> } | { readonly error: string } {
  if (typeof input !== 'object' || input === null || Array.isArray(input))
    return { error: 'a config patch is an object of thresholds' };
  const isThreshold = (key: string): key is keyof VergerConfig => key in base;
  const patch: Partial<Record<keyof VergerConfig, number>> = {};
  for (const [key, value] of Object.entries(input)) {
    if (!isThreshold(key)) return { error: `unknown threshold "${key}"` };
    if (typeof value !== 'number') return { error: `"${key}" must be a number` };
    patch[key] = value;
  }
  try {
    validateConfig({ ...base, ...patch });
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
  return { patch };
}
