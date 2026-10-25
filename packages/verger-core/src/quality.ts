import type { VergerSnapshot, LeverSpec, VisualImpact } from './types';

/** How much a step on a lever costs the user, by its declared visual impact. */
const WEIGHT: Record<VisualImpact, number> = { low: 1, medium: 2, high: 3 };

/**
 * Quality given up, from 0 (every lever at full quality) to 1 (every lever at its cheapest),
 * weighted by visual impact. This is the other half of every result: a runtime that sheds
 * quality always looks fast, so performance is only reported beside what it cost (Odyssey's
 * fidelity, judged jointly with performance).
 */
export function qualityCost(
  levels: Readonly<Record<string, number>>,
  levers: readonly LeverSpec[],
): number {
  let lost = 0;
  let total = 0;
  for (const lever of levers) {
    if (lever.maxLevel <= 0) continue;
    const weight = WEIGHT[lever.visualImpact];
    total += weight;
    lost += weight * Math.min(1, Math.max(0, (levels[lever.id] ?? 0) / lever.maxLevel));
  }
  return total === 0 ? 0 : lost / total;
}

/** What one step down on `lever` costs in `qualityCost` terms, before normalising by the total. */
export function stepQualityCost(lever: LeverSpec): number {
  return lever.maxLevel <= 0 ? 0 : WEIGHT[lever.visualImpact] / lever.maxLevel;
}

export interface QualityMeter {
  onSnapshot(snapshot: VergerSnapshot): void;
  /** Time-weighted means since the last take (or creation), then restarts the span at `at`. */
  take(at: number): {
    readonly applied: number;
    readonly proposed: number;
    readonly spanMs: number;
  };
}

/** Integrates quality cost over time between snapshots (snapshots arrive only on change). */
export function createQualityMeter(levers: readonly LeverSpec[]): QualityMeter {
  let since: number | null = null;
  let applied = 0;
  let proposed = 0;
  let appliedSum = 0;
  let proposedSum = 0;
  const advance = (at: number) => {
    if (since === null) return;
    const dt = Math.max(0, at - since);
    appliedSum += applied * dt;
    proposedSum += proposed * dt;
    since = at;
  };
  let spanStart: number | null = null;
  return {
    onSnapshot(snapshot) {
      if (since === null) {
        since = snapshot.at;
        spanStart = snapshot.at;
      } else advance(snapshot.at);
      applied = qualityCost(snapshot.levels, levers);
      proposed = qualityCost(snapshot.proposedLevels, levers);
    },
    take(at) {
      advance(at);
      const spanMs = spanStart === null ? 0 : Math.max(0, at - spanStart);
      const result =
        spanMs > 0
          ? { applied: appliedSum / spanMs, proposed: proposedSum / spanMs, spanMs }
          : { applied, proposed, spanMs: 0 };
      appliedSum = 0;
      proposedSum = 0;
      if (since !== null) spanStart = at;
      return result;
    },
  };
}
