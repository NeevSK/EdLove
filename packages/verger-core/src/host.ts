import { DEFAULT_GOVERNOR_CONFIG } from './config';
import { validateLevers } from './levers';
import { DEFAULT_RECOVERY_CONFIG, type RecoveryConfig, validateRecoveryConfig } from './recovery';
import { configHash, GOVERNOR_POLICY_VERSION } from './telemetry';
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

const NAME = /^[a-z][a-z0-9-]{1,40}$/;

/** Validates a host definition and freezes it. Throws at startup, never at decision time. */
export function defineHost(definition: HostDefinition): VergerHost {
  if (!NAME.test(definition.name)) {
    throw new Error(`Host name "${definition.name}" must be lowercase letters, digits and dashes`);
  }
  validateLevers(definition.levers);
  const config: GovernorConfig = { ...DEFAULT_GOVERNOR_CONFIG, ...definition.config };
  validateConfig(config);
  const recovery: RecoveryConfig = { ...DEFAULT_RECOVERY_CONFIG, ...definition.recovery };
  validateRecoveryConfig(recovery);
  return Object.freeze({
    name: definition.name,
    levers: Object.freeze([...definition.levers]),
    config: Object.freeze(config),
    recovery: Object.freeze(recovery),
    configHash: configHash(config),
    experimentKey: `${definition.name}-verger-p${GOVERNOR_POLICY_VERSION}`,
  });
}

function validateConfig(config: GovernorConfig): void {
  for (const [key, value] of Object.entries(config)) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
      throw new Error(`Config "${key}" must be a finite positive number`);
    }
  }
  const order = (low: keyof GovernorConfig, high: keyof GovernorConfig) => {
    if (!(config[low] < config[high])) throw new Error(`Config "${low}" must be below "${high}"`);
  };
  order('comfortRatio', 'stressRatio');
  order('comfortDroppedRatio', 'stressDroppedRatio');
  order('headroomWarm', 'headroomHot');
  order('upgradeAfterMs', 'maxUpgradeAfterMs');
  if (!(config.headroomHot <= config.headroomCritical)) {
    throw new Error('Config "headroomHot" must not exceed "headroomCritical"');
  }
  if (!Number.isInteger(config.minSamples))
    throw new Error('Config "minSamples" must be an integer');
}
