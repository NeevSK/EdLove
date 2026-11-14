import { type CreateGovernorOptions } from './governor';
import type { GovernorTelemetry } from './telemetry';
import type { CapacityFacts, GovernorConfig, GovernorEvent, GovernorMode, GovernorSnapshot, LeverSpec } from './types';
/**
 * The live half of a platform: its sensors and hardware levers. Created only when verger
 * runs, so a launch that keeps verger off never touches this code. The Android port is
 * `@repo/verger-android`; tests implement it in memory.
 */
export interface RuntimePort {
    /** Starts sensing; returns a function that stops it. Must tolerate being called once only. */
    start(config: GovernorConfig, onEvent: (event: GovernorEvent) => void): () => void;
    setRefreshCap(hz: number | null): void;
    setCpuBoost(enabled: boolean): void;
}
export interface RuntimeScheduler {
    setTimeout(callback: () => void, delayMs: number): unknown;
    clearTimeout(handle: unknown): void;
}
export interface RuntimeControllerOptions {
    readonly port: RuntimePort;
    /** What the device is, read once by the platform. */
    readonly capacity: CapacityFacts;
    readonly levers: readonly LeverSpec[];
    readonly mode: GovernorMode;
    readonly config: GovernorConfig;
    /** Monotonic milliseconds, the clock every event is stamped with. */
    readonly now: () => number;
    readonly scheduler: RuntimeScheduler;
    readonly telemetry?: GovernorTelemetry;
    /** Whether the port senses memory (absence of trims then means normal). */
    readonly memorySensing: boolean;
    /** What this launch may do, from the recovery ladder and the learned profile. */
    readonly launch?: Pick<CreateGovernorOptions, 'hardware' | 'capacityGrant' | 'initialPressure'>;
}
export interface RuntimeController {
    start(): void;
    stop(): void;
    /** Feeds an event from outside the port: interactions, app state, preferences, long tasks. */
    dispatch(event: GovernorEvent): void;
    getSnapshot(): GovernorSnapshot;
    subscribe(listener: () => void): () => void;
}
/**
 * The runtime loop: events in, one pure reduction, outputs applied only when they change.
 * It owns no policy. Decisions come from the reducer; this file sequences them, applies the
 * hardware levers through the port, wakes itself for time-only changes, and isolates every
 * consumer and sink so that a failure outside the governor cannot stop it.
 */
export declare function createRuntimeController(options: RuntimeControllerOptions): RuntimeController;
/**
 * Rejects events a defective sensor could produce. One NaN timestamp would otherwise become the
 * governor's clock for good (max(x, NaN) is NaN) and freeze every timed decision.
 */
export declare function isValidEvent(event: GovernorEvent): boolean;
//# sourceMappingURL=controller.d.ts.map