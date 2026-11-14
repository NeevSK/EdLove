import { type RecoveryConfig } from './recovery';
import type { GovernorConfig, LeverSpec } from './types';
/**
 * Everything verger needs to know about a host app, as data. A host lists its levers (its own
 * and any built-ins it switches on, each carrying its declared rules) and may override
 * thresholds. Nothing about the host lives in verger's code.
 */
export interface VergerHost {
    /** Stable host name, used in experiment keys and telemetry. */
    readonly name: string;
    readonly levers: readonly LeverSpec[];
    readonly config: GovernorConfig;
    /** How verger recovers, heals and grows across launches on this host. */
    readonly recovery: RecoveryConfig;
    /** Hash of the effective config, attached to telemetry so data splits by thresholds. */
    readonly configHash: string;
    /** Default experiment key; it carries the policy version so each version reshuffles arms. */
    readonly experimentKey: string;
}
export interface HostDefinition {
    readonly name: string;
    readonly levers: readonly LeverSpec[];
    readonly config?: Partial<GovernorConfig>;
    readonly recovery?: Partial<RecoveryConfig>;
}
/** Validates a host definition and freezes it. Throws at startup, never at decision time. */
export declare function defineHost(definition: HostDefinition): VergerHost;
//# sourceMappingURL=host.d.ts.map