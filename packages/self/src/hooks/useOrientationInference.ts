/**
 * useOrientationInference
 *
 * Derives a soft orientation fingerprint from signals already collected
 * by the app.  No quiz, no onboarding, no type labels ever shown.
 *
 * \u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
 * SIGNAL PRIORITY (highest \u2192 lowest confidence)
 *
 *  1. Explicit seeds  \u2014 set during onboarding orientation step
 *  2. Behavioral signals \u2014 mood_logs + energy_forecasts, subject to
 *       data-quality guardrails (see DATA QUALITY section below)
 *  3. Authority-based defaults \u2014 grounded in educational-psychology lit
 *       (Vygotsky, Kolb; teachers=reflective/deep, students=social/active)
 *  4. Neutral fallback (all 50) \u2014 only when authority is unknown
 *
 * DATA QUALITY GUARDRAILS
 * \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
 * Raw behavioral data can be misleading in several ways:
 *
 *   \u2022 All-same input   user always taps "5" \u2014 high avg, near-zero
 *                      variance \u2192 appears "very active"; really just habit.
 *                      Guard: signalConsistency() returns ~0 for flat series.
 *
 *   \u2022 Too sparse       2-3 entries \u2014 any pattern is noise.
 *                      Guard: hard minimums (MOOD_MIN_SAMPLES=7, ENERGY_MIN=5).
 *
 *   \u2022 Stale data       all entries from 6 weeks ago \u2014 not representative now.
 *                      Guard: recentWeightedAvg() uses exponential decay
 *                      (half-life = 14 days); old entries matter very little.
 *
 *   \u2022 Single-session   user logs 10 times on day one then never again.
 *     burst            Looks like rich data; is really one data point.
 *                      Guard: uniqueDays() count; < 3 unique days \u2192 treated
 *                      as sparse regardless of total count.
 *
 *   \u2022 Contradiction    mood signals "active" but energy signals "depleted".
 *                      Trusting either would miscalibrate reflect_act.
 *                      Guard: cross-signal contradiction check; if mood and
 *                      energy point in opposite directions on the same dim,
 *                      behavioralWeight for that dim is halved.
 *
 * The resulting `behavioralWeight` (0\u20131) scales how much the behavioral
 * layer moves the needle away from authority defaults.  Explicit seeds are
 * never down-weighted \u2014 they represent deliberate user intent.
 *
 * EPHEMERALITY
 * \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
 * Seeds are computed on-device each mount.  Nothing is persisted unless
 * the user explicitly completed the orientation step.  Privacy-first.
 * \u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
 */

import type { AuthorityTier } from '@repo/core/types';
import { useMemo, useState } from 'react';
import type { EnergyForecast, MoodLog } from '../types';

type OrientationSeeds = {
  depth_breadth: number;
  reflect_act: number;
  solo_social: number;
  steady_surge: number;
  source: 'seeded' | 'inferred' | 'mixed';
  seeded_at?: string;
  last_updated?: string;
};

// ============================================================================
// CONSTANTS
// ============================================================================

/** Minimum unique calendar days before treating a signal as meaningful */
const MIN_UNIQUE_DAYS = 3;
/** Minimum total entries before mood is used at all */
const MOOD_MIN_SAMPLES = 7;
/** Minimum total entries before energy is used at all */
const ENERGY_MIN_SAMPLES = 5;
/** Recency half-life in milliseconds (14 days) */
const HALF_LIFE_MS = 14 * 24 * 60 * 60 * 1000;

// ============================================================================
// AUTHORITY-BASED DEFAULTS
// ============================================================================

interface AuthorityDefaults {
  depth_breadth: number;
  reflect_act: number;
  solo_social: number;
  steady_surge: number;
}

const AUTHORITY_DEFAULTS: Record<string, AuthorityDefaults> = {
  student: {
    depth_breadth: 60,
    reflect_act: 65,
    solo_social: 65,
    steady_surge: 60,
  },
  teacher: {
    depth_breadth: 35,
    reflect_act: 35,
    solo_social: 55,
    steady_surge: 40,
  },
  gradeHead: {
    depth_breadth: 30,
    reflect_act: 30,
    solo_social: 55,
    steady_surge: 35,
  },
  sectionHead: {
    depth_breadth: 30,
    reflect_act: 30,
    solo_social: 55,
    steady_surge: 35,
  },
  principal: {
    depth_breadth: 25,
    reflect_act: 25,
    solo_social: 60,
    steady_surge: 30,
  },
  developer: {
    depth_breadth: 65,
    reflect_act: 60,
    solo_social: 70,
    steady_surge: 65,
  },
  admin: {
    depth_breadth: 50,
    reflect_act: 50,
    solo_social: 55,
    steady_surge: 50,
  },
};

function studentGradeAdjustment(
  gradeNumber: number | null | undefined,
): Partial<AuthorityDefaults> {
  if (!gradeNumber) return {};
  if (gradeNumber <= 5) return { solo_social: 75, reflect_act: 72, depth_breadth: 68 };
  if (gradeNumber <= 9) return { solo_social: 65, reflect_act: 60, depth_breadth: 58 };
  return { solo_social: 55, reflect_act: 50, depth_breadth: 48 };
}

// ============================================================================
// DATA QUALITY HELPERS
// ============================================================================

/** Count distinct ISO date strings (YYYY-MM-DD) from a list of timestamps. */
function uniqueDays(timestamps: string[]): number {
  return new Set(timestamps.map((ts) => ts.slice(0, 10))).size;
}

/**
 * Exponential recency weight for an entry at `entryTime` relative to `now`.
 * Weight = 2^(-age / HALF_LIFE_MS), so entries from 14 days ago are half-weighted.
 */
function recencyWeight(entryTime: string, now: number): number {
  const age = now - new Date(entryTime).getTime();
  if (Number.isNaN(age) || age < 0) return 1;
  return 2 ** (-age / HALF_LIFE_MS);
}

/**
 * Recency-weighted average of numeric values.
 * Returns null if all weights are effectively zero (all entries very old).
 */
function recentWeightedAvg(values: number[], timestamps: string[], now: number): number | null {
  let weightedSum = 0;
  let totalWeight = 0;
  for (let i = 0; i < values.length; i++) {
    const ts = timestamps[i];
    const val = values[i];
    if (ts !== undefined && val !== undefined) {
      const w = recencyWeight(ts, now);
      weightedSum += val * w;
      totalWeight += w;
    }
  }
  if (totalWeight < 0.01) return null; // all data too stale to be meaningful
  return weightedSum / totalWeight;
}

/**
 * Signal consistency score \u2014 0 to 1.
 *
 * A FLAT series (all same value) has near-zero information content:
 * user is on auto-pilot, not expressing a real tendency.
 *
 * A WILDLY RANDOM series also has near-zero useful signal:
 * noise, not pattern.
 *
 * The sweet spot is a series with moderate, interpretable variance.
 * We model this as a tent function over the coefficient of variation (CV):
 *   CV < 0.05  \u2192 flat/habitual (low consistency score)
 *   CV 0.10\u20130.30 \u2192 clear signal (high consistency score)
 *   CV > 0.55  \u2192 pure noise (low consistency score)
 */
function signalConsistency(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  if (mean === 0) return 0;
  const variance = values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / values.length;
  const sd = Math.sqrt(variance);
  const cv = sd / mean; // coefficient of variation

  // Tent function: peak at cv=0.20
  if (cv < 0.05) return (cv / 0.05) * 0.3; // flat \u2192 low but not zero
  if (cv <= 0.3) return 0.3 + ((cv - 0.05) / 0.25) * 0.7; // rising to 1.0
  if (cv <= 0.55) return 1.0 - ((cv - 0.3) / 0.25) * 0.7; // falling
  return Math.max(0, 1.0 - (cv - 0.55) / 0.45); // noise floor
}

// ============================================================================
// BEHAVIORAL INFERENCE
// ============================================================================

/** Per-dimension result with its own quality weight */
interface DimSignal {
  value: number; // 0\u2013100
  weight: number; // 0\u20131, how much to trust this specific signal
}

interface QualifiedSignals {
  reflect_act?: DimSignal;
  solo_social?: DimSignal;
  steady_surge?: DimSignal;
}

interface DeriveResult {
  signals: QualifiedSignals;
  /** Overall behavioral data quality 0\u20131 */
  quality: number;
}

function deriveFromBehavior(
  moodLogs: MoodLog[],
  energyForecasts: EnergyForecast[],
  now: number,
): DeriveResult {
  const signals: QualifiedSignals = {};
  let qualityPoints = 0;
  let qualityDivisor = 0;

  // \u2500\u2500 MOOD signals \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  const moodDays = uniqueDays(moodLogs.map((l) => l.created_at));
  const moodReady = moodLogs.length >= MOOD_MIN_SAMPLES && moodDays >= MIN_UNIQUE_DAYS;

  if (moodReady) {
    const scores = moodLogs.map((l) => l.mood_score);
    const timestamps = moodLogs.map((l) => l.created_at);
    const consistency = signalConsistency(scores);
    const recentAvg = recentWeightedAvg(scores, timestamps, now);

    // Only proceed if recent data exists and signal is meaningful
    if (recentAvg !== null && consistency > 0.15) {
      const moodWeight = Math.min(1, consistency * Math.min(1, moodDays / 10)); // cap at 10 distinct days

      // High recent mood \u2192 more action-oriented
      if (recentAvg >= 3.8) {
        signals.reflect_act = { value: 58, weight: moodWeight };
      } else if (recentAvg <= 2.5) {
        signals.reflect_act = { value: 40, weight: moodWeight };
      }

      // Variance \u2192 surge tendency (only if consistent enough)
      const variance = scores.reduce((a, v) => a + (v - recentAvg) ** 2, 0) / scores.length;
      if (variance > 1.2 && consistency > 0.2) {
        signals.steady_surge = { value: 65, weight: moodWeight * 0.8 };
      } else if (variance < 0.4 && consistency > 0.3) {
        signals.steady_surge = { value: 38, weight: moodWeight * 0.8 };
      }

      qualityPoints += consistency * Math.min(1, moodDays / 10);
    }
    qualityDivisor += 1;
  }

  // \u2500\u2500 ENERGY signals \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  const energyDays = uniqueDays(energyForecasts.map((f) => f.forecast_date));
  const energyReady = energyForecasts.length >= ENERGY_MIN_SAMPLES && energyDays >= MIN_UNIQUE_DAYS;

  if (energyReady) {
    const levels = energyForecasts.map((f) => f.energy_level);
    const timestamps = energyForecasts.map((f) => f.forecast_date);
    const consistency = signalConsistency(levels);
    const recentAvg = recentWeightedAvg(levels, timestamps, now);

    if (recentAvg !== null && consistency > 0.15) {
      const energyWeight = Math.min(1, consistency * Math.min(1, energyDays / 7));

      if (recentAvg >= 3.8) {
        signals.solo_social = { value: 62, weight: energyWeight };
        // Only override reflect_act if mood didn't already set it
        if (!signals.reflect_act) {
          signals.reflect_act = { value: 57, weight: energyWeight * 0.6 };
        }
      } else if (recentAvg <= 2.5) {
        signals.solo_social = { value: 40, weight: energyWeight };
        if (!signals.reflect_act) {
          signals.reflect_act = { value: 42, weight: energyWeight * 0.6 };
        }
      }

      qualityPoints += consistency * Math.min(1, energyDays / 7);
    }
    qualityDivisor += 1;
  }

  // \u2500\u2500 Cross-signal contradiction check \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  // If mood and energy point in opposite directions on reflect_act,
  // we have a contradiction \u2014 dampen both to avoid miscalibration.
  if (moodReady && energyReady && signals.reflect_act) {
    const moodScores = moodLogs.map((l) => l.mood_score);
    const energyLevels = energyForecasts.map((f) => f.energy_level);
    const moodRecentAvg =
      recentWeightedAvg(
        moodScores,
        moodLogs.map((l) => l.created_at),
        now,
      ) ?? 3;
    const energyRecentAvg =
      recentWeightedAvg(
        energyLevels,
        energyForecasts.map((f) => f.forecast_date),
        now,
      ) ?? 3;

    const moodDirection = moodRecentAvg >= 3.5 ? 1 : moodRecentAvg <= 2.5 ? -1 : 0;
    const energyDirection = energyRecentAvg >= 3.5 ? 1 : energyRecentAvg <= 2.5 ? -1 : 0;

    if (moodDirection !== 0 && energyDirection !== 0 && moodDirection !== energyDirection) {
      // Contradiction: scale back \u2014 blend to neutral 50 by halving each signal's weight
      signals.reflect_act = {
        value: 50 + (signals.reflect_act.value - 50) * 0.5,
        weight: signals.reflect_act.weight * 0.5,
      };
    }
  }

  const quality = qualityDivisor > 0 ? qualityPoints / qualityDivisor : 0;

  return { signals, quality };
}

// ============================================================================
// MERGE UTILITY
// ============================================================================

function clamp(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v)));
}

const DIMS = ['depth_breadth', 'reflect_act', 'solo_social', 'steady_surge'] as const;

/**
 * Layered merge with per-signal quality weights.
 *
 * For each dimension:
 *   - Explicit seed: wins with a small behavioral drift allowance (10%)
 *   - Behavioral signal: blended with role default; blend ratio = signal.weight
 *   - Role default: baseline when no higher-quality data exists
 *
 * The `overallBehavioralQuality` parameter caps how far behavioral signals
 * can move dimensions away from role defaults \u2014 poor-quality data can only
 * nudge by a small amount even if its local weight is high.
 */
function mergeLayers(
  explicit: OrientationSeeds | null | undefined,
  signals: QualifiedSignals,
  authorityDefaults: AuthorityDefaults,
  overallBehavioralQuality: number,
): OrientationSeeds {
  const merged: Record<string, number> = {};

  for (const dim of DIMS) {
    const authorityDef = authorityDefaults[dim];
    const sig = signals[dim as keyof QualifiedSignals];

    if (explicit) {
      const explicitValue = explicit[dim as keyof OrientationSeeds] as number | undefined;
      const hasExplicit = explicitValue !== undefined && explicitValue !== null;

      if (sig && overallBehavioralQuality > 0.4) {
        const drift = sig.weight * overallBehavioralQuality * 0.1; // max 10% drift
        const baseVal = hasExplicit ? (explicitValue as number) : authorityDef;
        merged[dim] = clamp(baseVal * (1 - drift) + sig.value * drift);
      } else {
        merged[dim] = hasExplicit ? (explicitValue as number) : authorityDef;
      }
    } else if (sig) {
      // Behavioral signal present \u2014 blend proportionally to quality
      const blendRatio = sig.weight * overallBehavioralQuality; // 0\u20131
      merged[dim] = clamp(authorityDef * (1 - blendRatio) + sig.value * blendRatio);
    } else {
      // Authority default only
      merged[dim] = authorityDef;
    }
  }

  const db = merged.depth_breadth ?? authorityDefaults.depth_breadth;
  const ra = merged.reflect_act ?? authorityDefaults.reflect_act;
  const ss = merged.solo_social ?? authorityDefaults.solo_social;
  const sz = merged.steady_surge ?? authorityDefaults.steady_surge;

  const source: OrientationSeeds['source'] = explicit
    ? Object.keys(signals).length > 0
      ? 'mixed'
      : 'seeded'
    : 'inferred';

  return {
    depth_breadth: db,
    reflect_act: ra,
    solo_social: ss,
    steady_surge: sz,
    source,
    seeded_at: explicit?.seeded_at,
    last_updated: new Date().toISOString(),
  };
}

// ============================================================================
// HOOK
// ============================================================================

export interface UseOrientationInferenceInput {
  /** Explicit seeds from onboarding \u2014 null/undefined if skipped */
  explicitSeeds?: OrientationSeeds | null;
  /** Recent mood logs from useMoodLogs */
  moodLogs?: MoodLog[];
  /** Recent energy forecasts from useEnergyForecast */
  energyForecasts?: EnergyForecast[];
  /** User's authority \u2014 used for authority defaults */
  authority?: AuthorityTier | null;
  /** Student grade number \u2014 narrows student defaults */
  gradeNumber?: number | null;
}

/** Quality of the inferred signal */
export type DataQuality = 'strong' | 'emerging' | 'default';

export interface UseOrientationInferenceResult {
  seeds: OrientationSeeds;
  /** True if based purely on role defaults \u2014 no behavioral data yet */
  isDefault: boolean;
  /**
   * Confidence 0\u20131: overall trustworthiness of the fingerprint.
   * Explicit seeds \u2192 \u22650.9; rich behavioral data \u2192 0.5\u20130.8;
   * authority defaults only \u2192 0.2.
   */
  confidence: number;
  /**
   * Human-readable data quality band for UI use.
   * 'strong'   \u2014 explicit seeds OR consistent multi-week behavioral data
   * 'emerging' \u2014 behavioral signals present but still accumulating
   * 'default'  \u2014 authority-based baseline only, no behavioral data yet
   */
  dataQuality: DataQuality;
}

export function useOrientationInference(
  input: UseOrientationInferenceInput,
): UseOrientationInferenceResult {
  const { explicitSeeds, moodLogs = [], energyForecasts = [], authority, gradeNumber } = input;

  const [now] = useState(() => Date.now());

  return useMemo(() => {
    // 1. Authority defaults
    const NEUTRAL: AuthorityDefaults = {
      depth_breadth: 50,
      reflect_act: 50,
      solo_social: 50,
      steady_surge: 50,
    };
    const base: AuthorityDefaults = authority
      ? (AUTHORITY_DEFAULTS[authority] ?? NEUTRAL)
      : NEUTRAL;
    const authorityDefaults: AuthorityDefaults =
      authority === 'student' ? { ...base, ...studentGradeAdjustment(gradeNumber) } : base;

    // 2. Derive behavioral signals with quality guardrails
    const { signals, quality: behavioralQuality } = deriveFromBehavior(
      moodLogs,
      energyForecasts,
      now,
    );

    // 3. Merge all layers
    const seeds = mergeLayers(explicitSeeds ?? null, signals, authorityDefaults, behavioralQuality);

    // 4. Metadata
    const hasExplicit = !!explicitSeeds;
    const hasBehavioral = Object.keys(signals).length > 0;

    const confidence = hasExplicit
      ? 0.9
      : hasBehavioral
        ? Math.min(0.85, 0.3 + behavioralQuality * 0.55)
        : 0.2;

    const dataQuality: DataQuality =
      hasExplicit || behavioralQuality > 0.55 ? 'strong' : hasBehavioral ? 'emerging' : 'default';

    return {
      seeds,
      isDefault: !hasExplicit && !hasBehavioral,
      confidence,
      dataQuality,
    };
  }, [explicitSeeds, moodLogs, energyForecasts, authority, gradeNumber, now]);
}
