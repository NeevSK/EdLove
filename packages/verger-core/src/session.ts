import { qualityCost } from './quality';
import type { LeverGain, VergerSnapshot, LeverSpec, MemoryLevel, ThermalLevel } from './types';

/**
 * What one session showed about this device, in the terms the record learns from: how long
 * the app was in front of the user, how much of that time frames were over budget, the worst
 * heat and memory seen, whether contention defeated the levers, the quality given up, and the
 * pressure the closed loop held each lever at (before floors), all weighted by time.
 */
export interface SessionReport {
  readonly foregroundMs: number;
  /** Foreground time with frames being drawn: the only time pressure says anything. */
  readonly evidenceMs: number;
  readonly stressedMs: number;
  readonly worstThermal: ThermalLevel;
  readonly worstMemory: MemoryLevel;
  readonly contentionExhausted: boolean;
  /** Time-weighted quality given up while in the foreground, 0–1. */
  readonly qualityCost: number;
  /**
   * Time-weighted mean pressure per lever over evidence time: the loop's own, plus what it
   * kept of the starting point while frames were not calm (calm frames would have had it
   * given back). A starting point merely held on a still screen is not evidence for itself.
   */
  readonly pressure: Readonly<Record<string, number>>;
  /** Each lever's measured gain as the session ended (P6), kept across launches (R6). */
  readonly gains?: Readonly<Record<string, LeverGain>>;
}

export interface SessionLedger {
  onSnapshot(snapshot: VergerSnapshot): void;
  report(at: number): SessionReport;
}

const THERMAL_ORDER: readonly ThermalLevel[] = ['unknown', 'nominal', 'warm', 'hot', 'critical'];
const MEMORY_ORDER: readonly MemoryLevel[] = ['unknown', 'normal', 'trimmed', 'low'];

const worse = <T>(order: readonly T[], a: T, b: T): T =>
  order.indexOf(b) > order.indexOf(a) ? b : a;

/** Integrates a session from snapshots, which arrive only when an output changes. */
export function createSessionLedger(levers: readonly LeverSpec[]): SessionLedger {
  let last: VergerSnapshot | null = null;
  let foregroundMs = 0;
  let evidenceMs = 0;
  let stressedMs = 0;
  let costSum = 0;
  const pressureSum: Record<string, number> = {};
  let worstThermal: ThermalLevel = 'unknown';
  let worstMemory: MemoryLevel = 'unknown';
  let exhausted = false;

  const advance = (at: number) => {
    if (!last || last.visibility !== 'active') return;
    const dt = Math.max(0, at - last.at);
    foregroundMs += dt;
    if (last.frameState === 'stressed') stressedMs += dt;
    costSum += qualityCost(last.levels, levers) * dt;
    if (last.frameState === 'quiet') return;
    evidenceMs += dt;
    for (const [id, level] of Object.entries(last.pressure)) {
      pressureSum[id] = (pressureSum[id] ?? 0) + level * dt;
    }
    if (last.frameState === 'stressed' || last.frameState === 'neutral') {
      for (const [id, level] of Object.entries(last.priorHeld)) {
        pressureSum[id] = (pressureSum[id] ?? 0) + level * dt;
      }
    }
  };

  return {
    onSnapshot(snapshot) {
      advance(snapshot.at);
      last = snapshot;
      worstThermal = worse(THERMAL_ORDER, worstThermal, snapshot.thermal);
      worstMemory = worse(MEMORY_ORDER, worstMemory, snapshot.memory);
      exhausted ||= snapshot.contentionExhausted;
    },
    report(at) {
      advance(at);
      if (last) last = { ...last, at: Math.max(last.at, at) };
      const pressure: Record<string, number> = {};
      if (evidenceMs > 0) {
        for (const [id, sum] of Object.entries(pressureSum)) {
          const mean = sum / evidenceMs;
          if (mean > 0) pressure[id] = Math.round(mean * 100) / 100;
        }
      }
      return {
        foregroundMs: Math.round(foregroundMs),
        evidenceMs: Math.round(evidenceMs),
        stressedMs: Math.round(stressedMs),
        worstThermal,
        worstMemory,
        contentionExhausted: exhausted,
        qualityCost: foregroundMs > 0 ? Math.round((costSum / foregroundMs) * 1000) / 1000 : 0,
        pressure,
        ...(last && Object.keys(last.gains).length > 0 ? { gains: last.gains } : {}),
      };
    },
  };
}
