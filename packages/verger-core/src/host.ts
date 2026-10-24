import { DEFAULT_VERGER_CONFIG, validateConfig } from './config';
import { validateWorkloads, type WorkloadSpec } from './demand';
import { validateLevers } from './levers';
import { DEFAULT_RECOVERY_CONFIG, type RecoveryConfig, validateRecoveryConfig } from './recovery';
import { policyKey, VERGER_POLICY, type VergerPolicy, validatePolicy } from './policy';
import { configHash } from './telemetry';
import type { VergerConfig, LeverSpec } from './types';

/**
 * Everything verger needs to know about a host app, as data. A host lists its levers (its own
 * and any built-ins it switches on, each carrying its declared rules) and may override
 * thresholds. Nothing about the host lives in verger's code.
 */
export interface VergerHost {
  /** Stable host name, used in experiment keys and telemetry. */
  readonly name: string;
  readonly levers: readonly LeverSpec[];
  /** The host's demand registry: its work, by class, with the accounts it spends. */
  readonly workloads: readonly WorkloadSpec[];
  readonly config: VergerConfig;
  /** How verger recovers, heals and grows across launches on this host. */
  readonly recovery: RecoveryConfig;
  /** The rules verger decides by; `VERGER_POLICY` unless the host brings its own. */
  readonly policy: VergerPolicy;
  /** Hash of the effective config, attached to telemetry so data splits by thresholds. */
  readonly configHash: string;
  /** Default experiment key; it carries the policy version so each version reshuffles arms. */
  readonly experimentKey: string;
}

export interface HostDefinition {
  readonly name: string;
  readonly levers: readonly LeverSpec[];
  readonly workloads?: readonly WorkloadSpec[];
  readonly config?: Partial<VergerConfig>;
  readonly recovery?: Partial<RecoveryConfig>;
  readonly policy?: VergerPolicy;
}

const NAME = /^[a-z][a-z0-9-]{1,40}$/;

/** Validates a host definition and freezes it. Throws at startup, never at decision time. */
export function defineHost(definition: HostDefinition): VergerHost {
  if (!NAME.test(definition.name)) {
    throw new Error(`Host name "${definition.name}" must be lowercase letters, digits and dashes`);
  }
  validateLevers(definition.levers);
  const workloads = definition.workloads ?? [];
  validateWorkloads(workloads, definition.levers);
  const config: VergerConfig = { ...DEFAULT_VERGER_CONFIG, ...definition.config };
  validateConfig(config);
  const recovery: RecoveryConfig = { ...DEFAULT_RECOVERY_CONFIG, ...definition.recovery };
  validateRecoveryConfig(recovery);
  const policy: VergerPolicy = definition.policy ?? VERGER_POLICY;
  validatePolicy(policy);
  return Object.freeze({
    name: definition.name,
    levers: Object.freeze([...definition.levers]),
    workloads: Object.freeze([...workloads]),
    config: Object.freeze(config),
    recovery: Object.freeze(recovery),
    policy,
    configHash: configHash(config),
    experimentKey: `${definition.name}-${policyKey(policy)}`,
  });
}
