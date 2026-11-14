import { type RuntimePort, type RuntimeScheduler } from './controller';
import type { ExperimentAssignment } from './experiment';
import type { VergerHost } from './host';
import { type ExitRecord, type LaunchPlan } from './recovery';
import { type GovernorTelemetrySink } from './telemetry';
import type { CapacityFacts, GovernorEvent, GovernorMode, GovernorSnapshot } from './types';
/**
 * Durable key-value storage the host supplies. It may be asynchronous: the launch waits for
 * its reads, and for the one write that must land before native code runs.
 */
export interface VergerStore {
    get(key: string): string | null | undefined | Promise<string | null | undefined>;
    set(key: string, value: string): void | Promise<void>;
    remove(key: string): void | Promise<void>;
}
export interface FrameTotals {
    readonly frames: number;
    readonly missedVsyncs: number;
    readonly costMs: number;
}
/**
 * Everything verger needs from a platform. Facts (`readCapacity`, `readExits`) are cheap,
 * read-only calls; `createPort` brings up the live sensors and levers. A launch the recovery
 * ladder keeps off calls none of them.
 */
export interface VergerPlatform {
    readCapacity(): CapacityFacts;
    /** How earlier processes ended, newest or oldest first, since a wall time. Absent: unknown. */
    readExits?(sinceWallMs: number): readonly ExitRecord[];
    /** Cumulative native frame totals, for unbiased summaries. */
    readTotals?(): FrameTotals;
    /** Whether the port senses memory (absence of trims then means normal). */
    readonly memorySensing: boolean;
    createPort(now: () => number): RuntimePort;
}
export interface VergerOptions {
    readonly host: VergerHost;
    /** Called at most once per launch, and only when the ladder lets verger touch the platform. */
    readonly platform: () => VergerPlatform;
    /** Without a store verger has no memory across launches: no ladder, no trust, no profile. */
    readonly store?: VergerStore;
    /** The most verger may do this launch; the ladder can only lower it. */
    readonly requested: GovernorMode;
    /** The experiment assignment, if any: its kill switch wins, its arm labels telemetry. */
    readonly assignment?: ExperimentAssignment;
    readonly telemetrySink?: GovernorTelemetrySink;
    /** The host's release (app version). A new release starts the ladder over. */
    readonly release?: string;
    readonly now?: () => number;
    readonly wallNow?: () => number;
    readonly scheduler?: RuntimeScheduler;
    /** Uniform [0, 1), for the exercise share. */
    readonly random?: () => number;
}
export interface Verger {
    /** Runs the launch: judges the last session, folds it, decides, and starts what it may. */
    start(): Promise<LaunchPlan>;
    /** Hands the hardware back and records a clean end. */
    stop(): Promise<void>;
    readonly plan: LaunchPlan | null;
    /** Feeds an event from outside the platform (app state, touches, preferences, long tasks). */
    dispatch(event: GovernorEvent): void;
    /** Null while verger is not running. */
    getSnapshot(): GovernorSnapshot | null;
    subscribe(listener: () => void): () => void;
}
/**
 * Verger for one app process. Construction does nothing; `start` runs the launch.
 *
 * The launch is crash-only. It reads what the last session left, then writes a `starting`
 * marker and waits for it to land before any native call, and only then reads the platform's
 * facts and starts the port, in one synchronous stretch. A process that dies inside that
 * stretch leaves `starting` behind, and the next launch keeps verger off entirely. Every
 * failure inside verger's own code ends the launch with verger off: it fails closed.
 */
export declare function createVerger(options: VergerOptions): Verger;
//# sourceMappingURL=verger.d.ts.map