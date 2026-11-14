import { type MemoryLatch } from './signals';
import type { AppVisibility, CapacityFacts, FidelityPreference, FrameState, GovernorConfig, GovernorEvent, GovernorMode, GovernorSnapshot, IndexerAction, LeverSpec, ThermalStatus, TrimSeverity } from './types';
export declare const UNKNOWN_CAPACITY: CapacityFacts;
export interface GovernorState {
    readonly config: GovernorConfig;
    readonly levers: readonly LeverSpec[];
    readonly capacity: CapacityFacts;
    readonly mode: GovernorMode;
    readonly version: number;
    readonly at: number;
    /** Levels the closed loop has lowered levers to, before floors. */
    readonly pressure: Readonly<Record<string, number>>;
    /** Lowered lever ids in order, restored last-in first-out. */
    readonly stack: readonly string[];
    readonly frameState: FrameState;
    readonly stressMs: number;
    /** Last time anything argued against raising quality (stress, near-budget frames, heat, trims). */
    readonly lastPressureAt: number;
    readonly lastDecreaseAt: number;
    readonly lastIncreaseAt: number;
    readonly upgradeAfterMs: number;
    readonly thermalStatus: ThermalStatus | null;
    readonly headroom: number | null;
    readonly lastThermalActionAt: number;
    readonly memoryLatch: MemoryLatch;
    readonly memorySensing: boolean;
    readonly powerSaver: boolean;
    readonly visibility: AppVisibility;
    readonly lastInteractionAt: number;
    readonly reduceMotion: boolean;
    readonly fidelity: FidelityPreference;
    /** When each role first crossed the saturation line, or null while below it. */
    readonly jsSaturatedSince: number | null;
    readonly mainSaturatedSince: number | null;
    readonly jsCores: number;
    readonly mainCores: number;
    /** Recent long-task end times, newest last, pruned to the long-task window. */
    readonly longTasks: readonly number[];
    readonly lastContentionActionAt: number;
    /** Load when the last contention step was taken, to judge whether the step relieved it. */
    readonly contentionBaseline: {
        readonly js: number;
        readonly main: number;
        readonly longTasks: number;
    } | null;
    readonly contentionUnrelieved: number;
    /** Levers cannot relieve the current contention: the cause is code, not quality settings. */
    readonly contentionExhausted: boolean;
    /** Last polled memory reading as a trim severity; holds until the next poll. */
    readonly polledMemory: TrimSeverity | null;
    /** End of the last stressed window on the sensor timeline, to require contiguous stress. */
    readonly stressEndMs: number | null;
    /**
     * A calm window (frames drawn within budget) has been seen since the last decrease and no
     * neutral or stressed window since. It is a flag, not a count, because the sensor forwards
     * calm windows only when the state changes: a run of calm windows arrives as one.
     */
    readonly comfortSeen: boolean;
    /** Hardware outputs as last published, held while a finger is on the screen. */
    readonly heldRefreshCapHz: number | null;
    readonly heldGlobalMotion: boolean;
    /** Whether verger may drive hardware at all (the recovery ladder turns this off). */
    readonly hardware: boolean;
    /** Steps of capacity floor this device has earned back (0 = none, 2 = all). */
    readonly capacityGrant: number;
    readonly lastAction: IndexerAction;
    readonly lastReason: string;
}
export interface CreateGovernorOptions {
    readonly at: number;
    readonly capacity?: CapacityFacts;
    readonly levers: readonly LeverSpec[];
    readonly mode?: GovernorMode;
    readonly config?: Partial<GovernorConfig>;
    /** Set when a native memory sensor is attached, so absence of trims means "normal". */
    readonly memorySensing?: boolean;
    /** Whether verger may drive hardware levers and CPU hints. Default true. */
    readonly hardware?: boolean;
    /**
     * Steps of the low-capacity floor relaxed because this device proved it can carry more:
     * 1 lifts the floor on non-ambient levers, 2 lifts the ambient floor as well.
     */
    readonly capacityGrant?: number;
    /**
     * Pressure to start from (a learned starting point). It enters the closed loop's stack, so
     * the loop raises it back exactly as it would its own decreases once frames are comfortable.
     */
    readonly initialPressure?: Readonly<Record<string, number>>;
}
export declare function createGovernor(options: CreateGovernorOptions): GovernorState;
/** Static floors: today's open-loop behaviour (capacity, settings, power, visibility). */
export declare function staticFloors(state: GovernorState): Record<string, number>;
/** Folds one event into the governor. Pure: same state and event, same result. */
export declare function reduceGovernor(state: GovernorState, event: GovernorEvent): GovernorState;
/** The governor's published output at time `at` (ambient sleep depends on elapsed time). */
export declare function snapshotOf(state: GovernorState, at?: number): GovernorSnapshot;
/**
 * When the next change that depends only on elapsed time is due, so the caller schedules one
 * tick instead of polling: ambient sleep, contention starting after a sustained saturation,
 * the next contention step while it lasts, long tasks ageing out, and an upgrade becoming due.
 * Native sensors report only changes, so without this a steady saturated thread would never
 * be acted on.
 */
export declare function nextTimedChangeAt(state: GovernorState): number | null;
//# sourceMappingURL=governor.d.ts.map