import type { SessionReport } from './session';
import type { GovernorMode } from './types';
/**
 * Recovery, healing and growth across launches.
 *
 * Everything here is pure and runs once per launch: read what the last session left behind,
 * judge how it ended, fold that into the record, and decide how much of verger this launch may
 * run. State changes only at boot, from a record written before anything risky starts
 * (crash-only design): there is no shutdown path to get right, because there may be none.
 *
 * Three things are learned, each with its own evidence and its own way back:
 * - The ladder (safety): failures attributed to verger step it down rung by rung; clean
 *   sessions step it back up one rung at a time, more slowly after each relapse.
 * - Trust (in the learned profile): halves on a failure, grows a little per clean session.
 * - The profile (per device build): a starting point for the closed loop, and a grant that
 *   relaxes capacity floors after sessions that proved the device can carry more.
 */
/** Why the platform says the process ended (Android `ApplicationExitInfo`, API 30+). */
export type ExitReason = 'crash' | 'native-crash' | 'anr' | 'excessive-resource' | 'low-memory' | 'user' | 'self' | 'signaled' | 'other';
export interface ExitRecord {
    readonly reason: ExitReason;
    /** Wall-clock milliseconds when the process ended. */
    readonly atWallMs: number;
    /** The process was visible to the user when it ended. */
    readonly foreground: boolean;
}
/**
 * How much of verger runs. Each rung removes one more thing that could be the cause.
 * 0: everything. 1: no learned profile (it starts from scratch). 2: no hardware levers.
 * 3: shadow only (senses and decides, applies nothing). 4: off, native code included; left
 * only by a new policy version or a new app release, never by waiting.
 */
export type Rung = 0 | 1 | 2 | 3 | 4;
export type RuntimeLevel = 'off' | GovernorMode;
export interface RecoveryConfig {
    /** Failures within `failureWindowMs` that step the ladder down one rung (restart intensity). */
    readonly failuresToEscalate: number;
    readonly failureWindowMs: number;
    /** Clean sessions needed to step back up one rung, doubled after each relapse. */
    readonly cleanToRecover: number;
    readonly maxRelapseDoublings: number;
    /** A session shorter than this in the foreground is evidence of nothing. */
    readonly minEvidenceForegroundMs: number;
    readonly trustInitial: number;
    readonly trustPerCleanSession: number;
    /** Below this trust the learned starting point is not used. */
    readonly trustForPriors: number;
    /** Below this trust the device earns no growth. */
    readonly trustForGrowth: number;
    /** Proving sessions in a row that earn one step of growth. */
    readonly provingSessionsToGrow: number;
    readonly maxGrant: number;
    readonly provingForegroundMs: number;
    /** Stressed share of foreground time at or below which a session proves capacity. */
    readonly provingStressedShare: number;
    /** Stressed share at or above which a session shows strain and gives a step back. */
    readonly strainStressedShare: number;
    /** Weight of the newest session in the learned starting point. */
    readonly priorWeight: number;
    /** Share of eligible launches deliberately run on a lower rung, so degraded paths stay exercised. */
    readonly exercisePercent: number;
}
export declare const DEFAULT_RECOVERY_CONFIG: RecoveryConfig;
/** Written during a session, read at the next launch. */
export interface SessionMarker {
    readonly v: 1;
    readonly startedAtWall: number;
    /** `starting` until the native side is up: dying then points at verger itself. */
    readonly phase: 'starting' | 'running' | 'stopped';
    readonly foreground: boolean;
    readonly runtime: RuntimeLevel;
    readonly rung: Rung;
    readonly exercise: boolean;
    readonly report: SessionReport | null;
}
export interface VergerRecord {
    readonly v: 1;
    /** Policy version and release the ladder belongs to; a new one starts the ladder over. */
    readonly key: string;
    readonly ladder: {
        readonly rung: Rung;
        /** Wall times of recent failures, inside the failure window. */
        readonly failures: readonly number[];
        readonly clean: number;
        readonly relapses: number;
    };
    readonly profile: {
        /** Hash of the build fingerprint the profile was learned on, or null if unknown. */
        readonly device: string | null;
        readonly trust: number;
        readonly grant: number;
        readonly proving: number;
        readonly prior: Readonly<Record<string, number>>;
    };
}
export type SessionOutcome = {
    readonly kind: 'none';
} | {
    readonly kind: 'clean';
    readonly marker: SessionMarker;
    readonly exit: ExitReason | null;
} | {
    readonly kind: 'failure';
    readonly marker: SessionMarker;
    /** The platform's exit reason, or `unclean` when the process died visible with no record. */
    readonly cause: ExitReason | 'unclean';
    /** Died before verger's native side was up: the strongest evidence against verger. */
    readonly boot: boolean;
};
export interface LaunchPlan {
    readonly runtime: RuntimeLevel;
    readonly rung: Rung;
    /** A deliberately degraded launch (exercise share); its results feed no growth. */
    readonly exercise: boolean;
    /** Whether verger may drive hardware (refresh rate, CPU hints, global motion). */
    readonly hardware: boolean;
    /** Starting pressure per lever; the closed loop raises it back as soon as it is comfortable. */
    readonly prior: Readonly<Record<string, number>>;
    /** Steps of capacity floor relaxed on this device. */
    readonly grant: number;
    readonly reason: string;
}
export interface Transition {
    readonly from: Rung;
    readonly to: Rung;
    readonly trustFrom: number;
    readonly trustTo: number;
    readonly grantFrom: number;
    readonly grantTo: number;
}
export declare function freshRecord(key: string, device: string | null, config: RecoveryConfig): VergerRecord;
/**
 * How the last session ended. The exit that ended it is the first one after it started (the
 * process that wrote the marker is the first to die after writing it). Without an exit
 * record, a process that died while visible is counted as a failure: on Android a user
 * closing the app sends it to the background first, so visible deaths are rarely benign.
 */
export declare function classifySession(marker: SessionMarker | null, exits: readonly ExitRecord[] | null): SessionOutcome;
/**
 * Folds the last session into the record. Order matters and is fixed: a changed policy or
 * release restarts the ladder; a changed device build restarts the profile; then the outcome
 * moves the ladder, trust and growth. A session in which verger was off moves nothing: its
 * failures are not verger's, and its clean runs prove nothing about verger.
 */
export declare function foldSession(record: VergerRecord, outcome: SessionOutcome, context: {
    readonly key: string;
    readonly device: string | null;
    readonly nowWall: number;
}, config: RecoveryConfig): {
    readonly record: VergerRecord;
    readonly transition: Transition;
};
/**
 * What this launch may run. The requested level (from the host and the experiment) is a
 * ceiling the ladder can only lower. A learned starting point is used only at full trust in
 * the ladder (rung 0) and enough trust in the profile, and only as whole levels the loop held
 * for most of the time (rounded down: start at higher quality when unsure).
 */
export declare function planLaunch(record: VergerRecord, requested: GovernorMode, random: number, config: RecoveryConfig): LaunchPlan;
export declare function parseMarker(text: string | null | undefined): SessionMarker | null;
export declare function parseRecord(text: string | null | undefined): VergerRecord | null;
/** Validates a recovery configuration. Throws at startup, never at decision time. */
export declare function validateRecoveryConfig(config: RecoveryConfig): void;
//# sourceMappingURL=recovery.d.ts.map