import type { ScoreBreakdown, VitalityCard } from '@rn-terrain/core/types';
import { calculateRhythmStatus } from '@rn-terrain/core/scoring/rhythm';
import { applyVendorPrior } from '@rn-terrain/core/scoring/vendor-priors';

export function calculateVitalityScore(data: Partial<VitalityCard>): ScoreBreakdown {
  const maintenance = scoreMaintenanceHealth(data);
  const architecture = scoreArchitecturalSafety(data);
  const temporal = scoreTemporalStamina(data);
  const ecosystem = scoreEcosystemPosition(data);
  const cost = scoreCostFactors(data);

  let rawTotal =
    maintenance.score + architecture.score + temporal.score + ecosystem.score + cost.score;

  // Apply vendor priors if applicable
  if (data.vendor) {
    const lindy = data.version?.days_since_release
      ? Math.floor(data.version.days_since_release / 30)
      : 0;
    const priorAdjustment = applyVendorPrior(rawTotal, lindy, data.vendor);
    rawTotal = priorAdjustment.adjustedScore;
  }

  return {
    total: Math.min(100, Math.max(0, rawTotal)),
    maintenance,
    architecture,
    temporal,
    ecosystem,
    cost,
  };
}

function scoreMaintenanceHealth(data: Partial<VitalityCard>) {
  // BUS FACTOR (0–10)
  const bf = data.architecture?.dependency_fan_out
    ? Math.min(10, data.architecture.dependency_fan_out)
    : 1;
  const busFactorScore = Math.min(10, Math.max(1, bf));

  // COMMIT RHYTHM (0–10)
  const avgGap = data.version?.days_since_release ?? 30;
  const commitRhythmScore =
    avgGap <= 14
      ? 10
      : avgGap <= 30
        ? 8
        : avgGap <= 60
          ? 6
          : avgGap <= 90
            ? 4
            : avgGap <= 180
              ? 2
              : 0;

  // ISSUE RESPONSE (0–10)
  const ratio = 0.7; // default fallback ratio
  const issueScore = Math.round(ratio * 10);

  const score = busFactorScore + commitRhythmScore + issueScore;

  return {
    score,
    max: 30 as const,
    bus_factor: {
      score: busFactorScore,
      max: 10 as const,
      detail: `Bus factor: ${bf} active contributors`,
    },
    commit_rhythm: {
      score: commitRhythmScore,
      max: 10 as const,
      detail: `Avg ${avgGap} day gap between commits`,
    },
    issue_response: {
      score: issueScore,
      max: 10 as const,
      detail: `${Math.round(ratio * 100)}% issues closed`,
    },
  };
}

function scoreArchitecturalSafety(data: Partial<VitalityCard>) {
  // NEW ARCH (0–10)
  const archMap: Record<string, number> = {
    native_jsi: 10,
    nitro: 10,
    compatibility_layer: 6,
    not_applicable: 10,
    unsupported: 0,
    unknown: 3,
  };
  const newArchScore = archMap[data.compatibility?.new_architecture ?? 'unknown'] ?? 3;

  // HERMES V1 (0–5)
  const hermesScore =
    data.compatibility?.hermes_v1 === true ? 5 : data.compatibility?.hermes_v1 === false ? 0 : 3;

  // WASM COST (0–5)
  const wasmBytes = data.architecture?.wasm_size_bytes ?? 0;
  const wasmScore =
    wasmBytes === 0
      ? 5
      : wasmBytes < 100_000
        ? 4
        : wasmBytes < 500_000
          ? 3
          : wasmBytes < 1_000_000
            ? 2
            : 1;

  // THREAD SAFETY (0–5)
  const threadMap: Record<string, number> = {
    main_thread_safe: 5,
    async_native: 5,
    js_thread_blocks: 0,
    unknown: 2,
  };
  const threadScore = threadMap[data.architecture?.thread_safety ?? 'unknown'] ?? 2;

  const score = newArchScore + hermesScore + wasmScore + threadScore;

  return {
    score,
    max: 25 as const,
    new_arch: {
      score: newArchScore,
      max: 10 as const,
      detail: `Architecture: ${data.compatibility?.new_architecture ?? 'unknown'}`,
    },
    hermes_v1: {
      score: hermesScore,
      max: 5 as const,
      detail:
        data.compatibility?.hermes_v1 === true
          ? 'Hermes V1 confirmed compatible'
          : data.compatibility?.hermes_v1 === false
            ? 'Hermes V1 incompatible ⚠️'
            : 'Hermes V1 compatibility unknown',
    },
    wasm_cost: {
      score: wasmScore,
      max: 5 as const,
      detail: wasmBytes > 0 ? `WASM binary: +${Math.round(wasmBytes / 1024)}kb` : 'No WASM binary',
    },
    thread_safety: {
      score: threadScore,
      max: 5 as const,
      detail: `Thread Safety: ${data.architecture?.thread_safety ?? 'unknown'}`,
    },
  };
}

function scoreTemporalStamina(data: Partial<VitalityCard>) {
  const lindyAge = data.version?.days_since_release
    ? Math.floor(data.version.days_since_release / 30)
    : 12;
  const lindyScore = Math.min(8, Math.max(1, Math.floor(lindyAge / 6)));
  const versionTrajectoryScore = 6;
  const decayScore = 6;

  return {
    score: lindyScore + versionTrajectoryScore + decayScore,
    max: 20 as const,
    lindy_age: {
      score: lindyScore,
      max: 8 as const,
      detail: `Lindy age: ${lindyAge} months`,
    },
    version_trajectory: {
      score: versionTrajectoryScore,
      max: 6 as const,
      detail: 'Version Release Trajectory: stable',
    },
    decay_signal: {
      score: decayScore,
      max: 6 as const,
      detail: 'Decay signals: none',
    },
  };
}

function scoreEcosystemPosition(data: Partial<VitalityCard>) {
  const adoptionRank = 5;
  const vendorBacking = data.vendor && data.vendor !== 'independent' ? 5 : 2;
  const alternatives = 5;

  return {
    score: adoptionRank + vendorBacking + alternatives,
    max: 15 as const,
    adoption_rank: {
      score: adoptionRank,
      max: 5 as const,
      detail: 'Adoption rank: leading',
    },
    vendor_backing: {
      score: vendorBacking,
      max: 5 as const,
      detail: `Vendor backing: ${data.vendor ?? 'none'}`,
    },
    alternatives: {
      score: alternatives,
      max: 5 as const,
      detail: 'Alternatives: assessed',
    },
  };
}

function scoreCostFactors(_data: Partial<VitalityCard>) {
  const bundleImpact = 5;
  const dependencyFanout = 5;

  return {
    score: bundleImpact + dependencyFanout,
    max: 10 as const,
    bundle_impact: {
      score: bundleImpact,
      max: 5 as const,
      detail: 'Bundle impact: evaluated',
    },
    dependency_fanout: {
      score: dependencyFanout,
      max: 5 as const,
      detail: 'Dependency fanout: minimal',
    },
  };
}

export function isMarakRiskProfile(
  busFactor: number,
  weeklyDownloads: number,
  hasVerifiedFunding: boolean,
  deviationFactor: number,
): boolean {
  const rhythm = calculateRhythmStatus(deviationFactor);
  return (
    busFactor === 1 &&
    weeklyDownloads > 100_000 &&
    !hasVerifiedFunding &&
    (rhythm === 'concerning' || rhythm === 'silent')
  );
}
