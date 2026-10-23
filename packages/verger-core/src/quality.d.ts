import type { GovernorSnapshot, LeverSpec } from './types';
/**
 * Quality given up, from 0 (every lever at full quality) to 1 (every lever at its cheapest),
 * weighted by visual impact. This is the other half of every result: a runtime that sheds
 * quality always looks fast, so performance is only reported beside what it cost (Odyssey's
 * fidelity, judged jointly with performance).
 */
export declare function qualityCost(levels: Readonly<Record<string, number>>, levers: readonly LeverSpec[]): number;
export interface QualityMeter {
    onSnapshot(snapshot: GovernorSnapshot): void;
    /** Time-weighted means since the last take (or creation), then restarts the span at `at`. */
    take(at: number): {
        readonly applied: number;
        readonly proposed: number;
        readonly spanMs: number;
    };
}
/** Integrates quality cost over time between snapshots (snapshots arrive only on change). */
export declare function createQualityMeter(levers: readonly LeverSpec[]): QualityMeter;
//# sourceMappingURL=quality.d.ts.map