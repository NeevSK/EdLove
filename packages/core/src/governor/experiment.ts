import type { GovernorMode } from './types';

export type ExperimentArm = 'control' | 'treatment';

export interface ExperimentAssignment {
  readonly key: string;
  readonly arm: ExperimentArm;
  /** Bucket 0–99 the install fell into; stable for an install and key. */
  readonly bucket: number;
  /** Control runs the governor in shadow: it decides and reports, but applies the open-loop baseline. */
  readonly mode: GovernorMode;
  readonly reason: 'assigned' | 'kill-switch' | 'forced';
}

/** FNV-1a 32-bit. Small, dependency-free and stable across JS engines. */
export function fnv1a32(input: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * Deterministic assignment: the same install always lands in the same arm for a key, with no
 * network and no stored state. A kill switch sends everyone to control (shadow mode), which is
 * also the safe default when the flag cannot be read.
 */
export function assignExperiment(options: {
  readonly installId: string;
  readonly key: string;
  readonly treatmentPercent: number;
  readonly killSwitch: boolean;
  readonly forceArm?: ExperimentArm;
}): ExperimentAssignment {
  const bucket = fnv1a32(`${options.key}:${options.installId}`) % 100;
  if (options.killSwitch) return { key: options.key, arm: 'control', bucket, mode: 'shadow', reason: 'kill-switch' };
  if (options.forceArm) {
    return {
      key: options.key,
      arm: options.forceArm,
      bucket,
      mode: options.forceArm === 'treatment' ? 'active' : 'shadow',
      reason: 'forced',
    };
  }
  const percent = Math.min(100, Math.max(0, options.treatmentPercent));
  const arm: ExperimentArm = bucket < percent ? 'treatment' : 'control';
  return { key: options.key, arm, bucket, mode: arm === 'treatment' ? 'active' : 'shadow', reason: 'assigned' };
}
