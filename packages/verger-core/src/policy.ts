import {
  type CreateVergerStateOptions,
  createVergerState,
  type VergerState,
  nextTimedChangeAt,
  reduceVerger,
  snapshotOf,
} from './reducer';
import { VERGER_POLICY_VERSION } from './telemetry';
import type { VergerEvent, VergerSnapshot } from './types';

/**
 * A policy: the rules that turn events into decisions, as one swappable, versioned unit. Its
 * state is its own; everything outside sees only the snapshot, so consumers, telemetry and the
 * lab work the same whichever policy runs, and two policies can be compared on one recording.
 *
 * A policy must be deterministic: the same options and events give the same snapshots. Any
 * change to a rule or default is a new version, so field data splits by the policy behind it.
 */
export interface VergerPolicy<State = unknown> {
  /** Stable name: lowercase letters, digits and dashes. */
  readonly id: string;
  readonly version: number;
  create(options: CreateVergerStateOptions): State;
  reduce(state: State, event: VergerEvent): State;
  snapshot(state: State, at?: number): VergerSnapshot;
  /** Increments exactly when the published outputs change. */
  outputVersion(state: State): number;
  /** When the next change that depends only on elapsed time is due, or null. */
  nextTimedChangeAt(state: State): number | null;
}

/** Verger's own rules: the reducer in `reducer.ts`. */
export const VERGER_POLICY: VergerPolicy<VergerState> = {
  id: 'verger',
  version: VERGER_POLICY_VERSION,
  create: createVergerState,
  reduce: reduceVerger,
  snapshot: snapshotOf,
  outputVersion: (state) => state.version,
  nextTimedChangeAt,
};

/** How a policy is named in keys and telemetry: `verger-p4`. */
export const policyKey = (policy: Pick<VergerPolicy, 'id' | 'version'>): string =>
  `${policy.id}-p${policy.version}`;

/**
 * The key verger's memory on a device is filed under: a new policy, config or release starts the
 * recovery ladder over. This is a persisted format; changing it needs a migration below and a
 * new pin in policy.test.ts.
 */
export const ladderKey = (policy: VergerPolicy, configHash: string, release: string): string =>
  `${policyKey(policy)}:${configHash}:${release}`;

/** Keys written before policies had names (`p4:hash:release`): only verger's own policy existed. */
const UNNAMED = /^p(\d+):/;

/**
 * Reads a stored key in today's format. A key from before policies were named is verger's own
 * policy's, so it is renamed rather than treated as a different policy (which would reset the
 * ladder and lose a rung the device earned).
 */
export const canonicalLadderKey = (stored: string): string =>
  stored.replace(UNNAMED, `${VERGER_POLICY.id}-p$1:`);

const ID = /^[a-z][a-z0-9-]{1,40}$/;

export function validatePolicy(policy: VergerPolicy): void {
  if (!ID.test(policy.id)) {
    throw new Error(`Policy id "${policy.id}" must be lowercase letters, digits and dashes`);
  }
  if (!Number.isInteger(policy.version) || policy.version < 1) {
    throw new Error(`Policy "${policy.id}" needs an integer version of at least 1`);
  }
}
