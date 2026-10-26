import { storage } from '@repo/core/native/storage';
import type { ShellVariant } from './shellVariant';

/**
 * What each tab shell costs on this phone, kept per variant so A and B can be read side by side
 * after switching. Time is attributed to the state verger reported for it: stressed frames and
 * low memory are the two that a tab bar can cause.
 */
export interface ShellStats {
  readonly launches: number;
  /** Time observed with the shell on screen, in ms. */
  readonly sampleMs: number;
  /** Of that, time verger reported frames as stressed. */
  readonly stressedMs: number;
  /** Of that, time memory was trimmed or low. */
  readonly memoryPressureMs: number;
  /** Tab switches measured, from the press to the first frame of the new tab. */
  readonly switches: number;
  readonly switchMsTotal: number;
  readonly switchMsMax: number;
}

export const EMPTY_STATS: ShellStats = {
  launches: 0,
  sampleMs: 0,
  stressedMs: 0,
  memoryPressureMs: 0,
  switches: 0,
  switchMsTotal: 0,
  switchMsMax: 0,
};

/** Longer gaps mean the app slept; they would swamp the shares, so they are not counted. */
const MAX_SAMPLE_MS = 10_000;

export function addSample(
  stats: ShellStats,
  frameState: string,
  memory: string,
  ms: number,
): ShellStats {
  if (!(ms > 0)) return stats;
  const t = Math.min(ms, MAX_SAMPLE_MS);
  return {
    ...stats,
    sampleMs: stats.sampleMs + t,
    stressedMs: stats.stressedMs + (frameState === 'stressed' ? t : 0),
    memoryPressureMs: stats.memoryPressureMs + (memory === 'low' || memory === 'trimmed' ? t : 0),
  };
}

export function addSwitch(stats: ShellStats, ms: number): ShellStats {
  if (!(ms >= 0) || ms > MAX_SAMPLE_MS) return stats;
  return {
    ...stats,
    switches: stats.switches + 1,
    switchMsTotal: stats.switchMsTotal + ms,
    switchMsMax: Math.max(stats.switchMsMax, ms),
  };
}

export interface ShellSummary {
  readonly minutes: number;
  /** Share of observed time with stressed frames, 0–1. */
  readonly stressedShare: number;
  readonly memoryPressureShare: number;
  readonly switches: number;
  readonly meanSwitchMs: number | null;
  readonly maxSwitchMs: number | null;
}

export function summarize(stats: ShellStats): ShellSummary {
  const share = (part: number) => (stats.sampleMs > 0 ? part / stats.sampleMs : 0);
  return {
    minutes: Math.round(stats.sampleMs / 6000) / 10,
    stressedShare: share(stats.stressedMs),
    memoryPressureShare: share(stats.memoryPressureMs),
    switches: stats.switches,
    meanSwitchMs: stats.switches > 0 ? Math.round(stats.switchMsTotal / stats.switches) : null,
    maxSwitchMs: stats.switches > 0 ? Math.round(stats.switchMsMax) : null,
  };
}

const key = (variant: ShellVariant) => `gurudevi_shell_stats_v1_${variant}`;

export function readStats(variant: ShellVariant): ShellStats {
  try {
    const raw = storage.getString(key(variant));
    if (!raw) return EMPTY_STATS;
    const parsed = JSON.parse(raw) as Partial<ShellStats>;
    const out: Record<string, number> = { ...EMPTY_STATS };
    for (const k of Object.keys(EMPTY_STATS)) {
      const v = (parsed as Record<string, unknown>)[k];
      if (typeof v === 'number' && Number.isFinite(v) && v >= 0) out[k] = v;
    }
    return out as unknown as ShellStats;
  } catch {
    return EMPTY_STATS;
  }
}

export function writeStats(variant: ShellVariant, stats: ShellStats): void {
  try {
    storage.set(key(variant), JSON.stringify(stats));
  } catch {
    // Storage unavailable: numbers for this launch are lost, nothing else is affected.
  }
}

export function resetStats(): void {
  writeStats('custom', EMPTY_STATS);
  writeStats('native', EMPTY_STATS);
}
