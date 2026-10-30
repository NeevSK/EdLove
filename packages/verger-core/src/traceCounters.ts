import { THERMAL_RANK } from './signals';
import type { MemoryLevel, VergerSnapshot } from './types';

const MEMORY_RANK: Readonly<Record<MemoryLevel, number>> = {
  unknown: 0,
  normal: 1,
  trimmed: 2,
  low: 3,
};

/**
 * A published snapshot as numeric counter tracks, for a platform's system tracer (Perfetto on
 * Android): each lever's level (higher is less quality), the heat and memory verger acts on, and
 * how much optional work it admits. Ranks start at 0 for unknown, so a track never reads a
 * missing reading as a calm one.
 */
export function decisionCounters(snapshot: VergerSnapshot): Record<string, number> {
  const counters: Record<string, number> = {
    'verger.thermal': THERMAL_RANK[snapshot.thermal],
    'verger.memory': MEMORY_RANK[snapshot.memory],
    'verger.optional': snapshot.optionalConcurrency,
  };
  for (const [id, level] of Object.entries(snapshot.levels)) counters[`verger.lever.${id}`] = level;
  return counters;
}
