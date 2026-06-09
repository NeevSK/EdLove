// ============================================================
// THESE ARE PRODUCT DECISIONS — NOT IMPLEMENTATION DETAILS
// Do not change these without:
// 1. Neev's explicit approval
// 2. Running the calibration test suite
// 3. All ground truth corpus tests passing
// 4. Documenting why the change was made
// ============================================================

export const SCORE_WEIGHTS = {
  maintenance: 30, // bus factor + rhythm + responsiveness
  architecture: 25, // new arch + hermes + wasm + thread safety
  temporal: 20, // lindy + version trajectory + decay
  ecosystem: 15, // adoption + vendor + alternatives
  cost: 10, // bundle + fan-out
} as const;

// Verify weights always sum to 100
const weightSum = Object.values(SCORE_WEIGHTS).reduce((a, b) => a + b, 0);
if (weightSum !== 100) {
  throw new Error(`Weights must sum to 100, got ${weightSum}`);
}

export const VERDICT_THRESHOLDS = {
  ADOPT: 80, // requires ALL signals green + high confidence
  TRIAL: 60,
  ASSESS: 40,
  HOLD: 0, // anything below ASSESS
} as const;

export const HOLD_TRIGGERS = [
  // Any of these alone triggers HOLD regardless of score
  'npm_deprecated',
  'days_since_meaningful_commit > 365 AND bus_factor === 1',
  'legacy_arch_only AND rn_version >= 0.84',
  'maintainer_publicly_abandoned',
] as const;
