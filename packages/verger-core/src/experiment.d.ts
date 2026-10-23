import type { GovernorMode } from './types';
export type ExperimentArm = 'control' | 'treatment';
export interface ExperimentAssignment {
    readonly key: string;
    readonly arm: ExperimentArm;
    /** Bucket 0–99 the install fell into; stable for an install and key. */
    readonly bucket: number;
    /** Control runs the governor in shadow: it decides and reports, but applies the open-loop baseline. */
    readonly mode: GovernorMode;
    /**
     * Whether the runtime runs at all. The kill switch turns it off entirely, native sensing
     * included: shadow mode still runs the native module, so it cannot stop a native fault.
     */
    readonly runtime: 'off' | GovernorMode;
    readonly reason: 'assigned' | 'kill-switch' | 'forced';
}
/** FNV-1a 32-bit. Small, dependency-free and stable across JS engines. */
export declare function fnv1a32(input: string): number;
/**
 * Include the policy version in `key` (for example `adaptive-runtime-p3`) so each policy
 * version reshuffles arms; otherwise the same installs stay in treatment every time.
 *
 * Deterministic assignment: the same install always lands in the same arm for a key, with no
 * network and no stored state. A kill switch sends everyone to control (shadow mode), which is
 * also the safe default when the flag cannot be read.
 */
export declare function assignExperiment(options: {
    readonly installId: string;
    readonly key: string;
    readonly treatmentPercent: number;
    readonly killSwitch: boolean;
    readonly forceArm?: ExperimentArm;
}): ExperimentAssignment;
//# sourceMappingURL=experiment.d.ts.map