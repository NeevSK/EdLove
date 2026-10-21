import type { GovernorConfig, MemoryLevel, ThermalLevel, ThermalStatus, TrimSeverity } from './types';

const THERMAL_RANK: Record<ThermalLevel, number> = { unknown: 0, nominal: 1, warm: 2, hot: 3, critical: 4 };

/**
 * Thermal level from status and ADPF headroom, whichever is more severe. Headroom is polled
 * (every 10–60 s) while status arrives by listener, so either can be the stale one; taking the
 * worse of the two means a fresh `severe` is never hidden by an old headroom reading. Headroom
 * 1.0 is the platform's "severe throttling" point, so it maps to `hot` like status `severe`;
 * only headroom above it is `critical`. Missing data stays `unknown`, never proof of safety.
 */
export function thermalLevelOf(
  status: ThermalStatus | null,
  headroom: number | null,
  config: GovernorConfig,
): ThermalLevel {
  const fromStatus = statusLevel(status);
  if (headroom === null || !Number.isFinite(headroom) || headroom <= 0) return fromStatus;
  const fromHeadroom: ThermalLevel =
    headroom > config.headroomCritical
      ? 'critical'
      : headroom >= config.headroomHot
        ? 'hot'
        : headroom >= config.headroomWarm
          ? 'warm'
          : 'nominal';
  return THERMAL_RANK[fromHeadroom] >= THERMAL_RANK[fromStatus] ? fromHeadroom : fromStatus;
}

function statusLevel(status: ThermalStatus | null): ThermalLevel {
  switch (status) {
    case null:
      return 'unknown';
    case 'none':
      return 'nominal';
    case 'light':
    case 'moderate':
      return 'warm';
    case 'severe':
      return 'hot';
    default:
      return 'critical';
  }
}

export interface MemoryLatch {
  readonly severity: TrimSeverity | null;
  readonly until: number;
}

export const NO_MEMORY_LATCH: MemoryLatch = { severity: null, until: 0 };

/** A trim holds pressure for `memoryLatchMs`; a more severe trim replaces a milder one. */
export function latchMemory(
  latch: MemoryLatch,
  severity: TrimSeverity,
  at: number,
  config: GovernorConfig,
): MemoryLatch {
  const rank = { moderate: 1, low: 2, critical: 3 } as const;
  const active = latch.severity !== null && at < latch.until;
  const keep = active && latch.severity !== null && rank[latch.severity] > rank[severity];
  return { severity: keep ? latch.severity : severity, until: at + config.memoryLatchMs };
}

/**
 * Memory level from the trim latch and the last polled reading. A polled reading is a level,
 * not an event: it holds until the next poll says otherwise, because the sensor reports only
 * changes and a steadily low reading must not be forgotten when the latch expires.
 */
export function memoryLevelOf(
  latch: MemoryLatch,
  at: number,
  everObserved: boolean,
  polled: TrimSeverity | null = null,
): MemoryLevel {
  const latched = latch.severity !== null && at < latch.until ? latch.severity : null;
  const worst = [latched, polled].reduce<TrimSeverity | null>(
    (a, b) => (b === null ? a : a === null || SEVERITY_RANK[b] > SEVERITY_RANK[a] ? b : a),
    null,
  );
  if (worst !== null) return worst === 'moderate' ? 'trimmed' : 'low';
  return everObserved ? 'normal' : 'unknown';
}

const SEVERITY_RANK: Record<TrimSeverity, number> = { moderate: 1, low: 2, critical: 3 };
