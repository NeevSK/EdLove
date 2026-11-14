import type { GovernorConfig, MemoryLevel, ThermalLevel, ThermalStatus, TrimSeverity } from './types';
/**
 * Thermal level from status and ADPF headroom, whichever is more severe. Headroom is polled
 * (every 10–60 s) while status arrives by listener, so either can be the stale one; taking the
 * worse of the two means a fresh `severe` is never hidden by an old headroom reading. Headroom
 * 1.0 is the platform's "severe throttling" point, so it maps to `hot` like status `severe`;
 * only headroom above it is `critical`. Missing data stays `unknown`, never proof of safety.
 */
export declare function thermalLevelOf(status: ThermalStatus | null, headroom: number | null, config: GovernorConfig): ThermalLevel;
export interface MemoryLatch {
    readonly severity: TrimSeverity | null;
    readonly until: number;
}
export declare const NO_MEMORY_LATCH: MemoryLatch;
/** A trim holds pressure for `memoryLatchMs`; a more severe trim replaces a milder one. */
export declare function latchMemory(latch: MemoryLatch, severity: TrimSeverity, at: number, config: GovernorConfig): MemoryLatch;
/**
 * Memory level from the trim latch and the last polled reading. A polled reading is a level,
 * not an event: it holds until the next poll says otherwise, because the sensor reports only
 * changes and a steadily low reading must not be forgotten when the latch expires.
 */
export declare function memoryLevelOf(latch: MemoryLatch, at: number, everObserved: boolean, polled?: TrimSeverity | null): MemoryLevel;
//# sourceMappingURL=signals.d.ts.map