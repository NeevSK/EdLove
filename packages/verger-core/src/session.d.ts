import type { GovernorSnapshot, LeverSpec, MemoryLevel, ThermalLevel } from './types';
/**
 * What one session showed about this device, in the terms the record learns from: how long
 * the app was in front of the user, how much of that time frames were over budget, the worst
 * heat and memory seen, whether contention defeated the levers, the quality given up, and the
 * pressure the closed loop held each lever at (before floors), all weighted by time.
 */
export interface SessionReport {
    readonly foregroundMs: number;
    readonly stressedMs: number;
    readonly worstThermal: ThermalLevel;
    readonly worstMemory: MemoryLevel;
    readonly contentionExhausted: boolean;
    /** Time-weighted quality given up while in the foreground, 0–1. */
    readonly qualityCost: number;
    /** Time-weighted mean closed-loop pressure per lever while in the foreground. */
    readonly pressure: Readonly<Record<string, number>>;
}
export interface SessionLedger {
    onSnapshot(snapshot: GovernorSnapshot): void;
    report(at: number): SessionReport;
}
/** Integrates a session from snapshots, which arrive only when an output changes. */
export declare function createSessionLedger(levers: readonly LeverSpec[]): SessionLedger;
//# sourceMappingURL=session.d.ts.map