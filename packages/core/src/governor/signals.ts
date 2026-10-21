import type { GovernorConfig, MemoryLevel, ThermalLevel, ThermalStatus, TrimSeverity } from './types';

/**
 * Thermal level from ADPF headroom when the device reports it, otherwise from thermal status.
 * Headroom is preferred: it is continuous and forecastable, while status is coarse and some
 * devices always report `none`. Missing data stays `unknown`; it is never treated as safe proof.
 */
export function thermalLevelOf(
  status: ThermalStatus | null,
  headroom: number | null,
  config: GovernorConfig,
): ThermalLevel {
  if (headroom !== null && Number.isFinite(headroom) && headroom > 0) {
    if (headroom >= config.headroomCritical) return 'critical';
    if (headroom >= config.headroomHot) return 'hot';
    if (headroom >= config.headroomWarm) return 'warm';
    return 'nominal';
  }
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

export function memoryLevelOf(latch: MemoryLatch, at: number, everObserved: boolean): MemoryLevel {
  if (latch.severity !== null && at < latch.until) {
    return latch.severity === 'moderate' ? 'trimmed' : 'low';
  }
  return everObserved ? 'normal' : 'unknown';
}
