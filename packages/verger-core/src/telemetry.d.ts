import type { ExperimentArm } from './experiment';
import type { FrameWindow, GovernorConfig, GovernorSnapshot, LeverSpec } from './types';
export type TelemetryValue = string | number | boolean;
/** Port: the app supplies the transport (Expo Observe, PostHog). Never called per frame. */
export type GovernorTelemetrySink = (name: string, attributes: Readonly<Record<string, TelemetryValue>>) => void;
export interface GovernorTelemetryOptions {
    readonly sink: GovernorTelemetrySink;
    readonly arm: ExperimentArm;
    readonly experimentKey: string;
    /** Stable for one app launch; lets sessions be compared without identifying anyone. */
    readonly sessionId?: string;
    /** Device stratum attached to `governor_started` so arms are compared within strata. */
    readonly device?: Readonly<Record<string, TelemetryValue>>;
    /** Hash of the active config, so data can be split by every threshold that produced it. */
    readonly configHash?: string;
    /** Classifies windows for the summary with the governor's own rule. */
    readonly config?: GovernorConfig;
    /**
     * Native cumulative frame totals. The window stream is filtered (calm repeats are not
     * forwarded), so summaries count frames from these totals, not from forwarded windows.
     */
    readonly readTotals?: () => {
        readonly frames: number;
        readonly missedVsyncs: number;
        readonly costMs: number;
    };
    /** The levers in play, so summaries report the quality given up beside the performance gained. */
    readonly levers?: readonly LeverSpec[];
    /** Separate budget for periodic summaries, so state churn cannot starve them. */
    readonly maxSummaries?: number;
    /** Hard cap per process, so a flapping signal cannot flood the network. */
    readonly maxEvents?: number;
    /** Summary cadence while foreground. */
    readonly summaryEveryMs?: number;
}
export interface GovernorTelemetry {
    /** Call with each new snapshot; emits only when governed outputs change. */
    onSnapshot(snapshot: GovernorSnapshot): void;
    /** Call with each frame window; aggregated into a periodic summary. */
    /** `at` is the caller's clock; it defaults to the window's end on the sensor timeline. */
    onFrameWindow(window: FrameWindow, interactionIdle: boolean, at?: number): void;
    /** Call with each CPU sample and long task; aggregated into the periodic summary. */
    onThreadLoad(at: number, jsCores: number, mainCores: number): void;
    onLongTask(at: number, durationMs: number): void;
    /** Emits the pending summary, if any, e.g. on background. */
    flush(at: number): void;
    /** A one-off event (launch, recovery, flight record), under the same event budget. */
    event(name: string, attributes: Readonly<Record<string, TelemetryValue>>): void;
    readonly emitted: number;
}
/**
 * Bumped whenever a decision rule or default changes, so field data can be split by the policy
 * that produced it (deterministic, versioned policies: telemetry informs the next version).
 */
export declare const GOVERNOR_POLICY_VERSION = 4;
/** Reasons carry measured numbers; telemetry keeps their shape, not their values. */
export declare function reasonCode(reason: string): string;
/** Durations are bucketed so events stay low-cardinality and carry no fine timing fingerprint. */
export declare function bucketMs(value: number): string;
export declare function createGovernorTelemetry(options: GovernorTelemetryOptions): GovernorTelemetry;
/** A short stable hash of a config object, for splitting field data by thresholds. */
export declare function configHash(config: GovernorConfig): string;
//# sourceMappingURL=telemetry.d.ts.map