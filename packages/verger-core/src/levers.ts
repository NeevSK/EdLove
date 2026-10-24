import type { LeverSpec, LeverTarget, VisualImpact } from './types';

const IMPACT_RANK: Record<VisualImpact, number> = { low: 0, medium: 1, high: 2 };

/**
 * Picks the lever to lower next (Unity Adaptive Performance's order): levers aimed at the
 * current bottleneck first, then the least visible change, then the lever lowered least so
 * far, then a stable id order so the choice is deterministic.
 */
export function chooseLeverToLower(
  levers: readonly LeverSpec[],
  levels: Readonly<Record<string, number>>,
  bottleneck: readonly LeverTarget[],
  strict: boolean | 'primary' = false,
): LeverSpec | null {
  const matches = (lever: LeverSpec) =>
    strict === 'primary' ? bottleneck.includes(lever.target) : relieves(lever, bottleneck);
  // Strict: only levers that relieve the bottleneck (a workload is never lowered for a
  // resource it does not spend). Non-strict ordering is kept for callers that want a fallback.
  const candidates = levers.filter(
    (lever) => (levels[lever.id] ?? 0) < lever.maxLevel && (!strict || matches(lever)),
  );
  if (candidates.length === 0) return null;
  const sorted = [...candidates].sort((a, b) => {
    const aTargets = relieves(a, bottleneck) ? 0 : 1;
    const bTargets = relieves(b, bottleneck) ? 0 : 1;
    if (aTargets !== bTargets) return aTargets - bTargets;
    const impact = IMPACT_RANK[a.visualImpact] - IMPACT_RANK[b.visualImpact];
    if (impact !== 0) return impact;
    const progress = (levels[a.id] ?? 0) / a.maxLevel - (levels[b.id] ?? 0) / b.maxLevel;
    if (progress !== 0) return progress;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });
  return sorted[0] ?? null;
}

/** Whether a lever relieves any of the given resources. */
export function relieves(lever: LeverSpec, targets: readonly LeverTarget[]): boolean {
  return (
    targets.includes(lever.target) || (lever.alsoRelieves ?? []).some((t) => targets.includes(t))
  );
}

export function validateLevers(levers: readonly LeverSpec[]): void {
  const seen = new Set<string>();
  const actuators = new Map<string, string>();
  for (const lever of levers) {
    if (seen.has(lever.id)) throw new Error(`Duplicate governor lever "${lever.id}"`);
    seen.add(lever.id);
    if (!Number.isInteger(lever.maxLevel) || lever.maxLevel < 1) {
      throw new Error(`Lever "${lever.id}" needs an integer maxLevel of at least 1`);
    }
    if (lever.levels.length !== lever.maxLevel + 1) {
      throw new Error(`Lever "${lever.id}" must describe ${lever.maxLevel + 1} levels`);
    }
    const inRange = (name: string, value: number | undefined, min: number) => {
      if (value === undefined) return;
      if (!Number.isInteger(value) || value < min || value > lever.maxLevel) {
        throw new Error(
          `Lever "${lever.id}": ${name} must be an integer from ${min} to ${lever.maxLevel}`,
        );
      }
    };
    inRange('whenHidden', lever.whenHidden, 0);
    inRange('whenIdle', lever.whenIdle, 0);
    inRange('whenWarm', lever.whenWarm, 0);
    inRange('whenMetered', lever.whenMetered, 0);
    inRange('whenDataSaver', lever.whenDataSaver, 0);
    inRange('whenOffline', lever.whenOffline, 0);
    inRange('whenBatteryLow', lever.whenBatteryLow, 0);
    for (const need of lever.requires ?? [])
      inRange(`requires ${need.capability}`, need.otherwiseLevel, 1);
    if (lever.actuator !== undefined) {
      if (actuators.has(lever.actuator)) {
        throw new Error(
          `Actuator "${lever.actuator}" is declared by both "${actuators.get(lever.actuator)}" and "${lever.id}"`,
        );
      }
      actuators.set(lever.actuator, lever.id);
    }
  }
}
