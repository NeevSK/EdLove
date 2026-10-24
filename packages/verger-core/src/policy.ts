import {
  type CreateGovernorOptions,
  createGovernor,
  type GovernorState,
  nextTimedChangeAt,
  reduceGovernor,
  snapshotOf,
} from './governor';
import { GOVERNOR_POLICY_VERSION } from './telemetry';
import type { GovernorEvent, GovernorSnapshot } from './types';

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
  create(options: CreateGovernorOptions): State;
  reduce(state: State, event: GovernorEvent): State;
  snapshot(state: State, at?: number): GovernorSnapshot;
  /** Increments exactly when the published outputs change. */
  outputVersion(state: State): number;
  /** When the next change that depends only on elapsed time is due, or null. */
  nextTimedChangeAt(state: State): number | null;
}

/** Verger's own rules: the governor in `governor.ts`. */
export const VERGER_POLICY: VergerPolicy<GovernorState> = {
  id: 'verger',
  version: GOVERNOR_POLICY_VERSION,
  create: createGovernor,
  reduce: reduceGovernor,
  snapshot: snapshotOf,
  outputVersion: (state) => state.version,
  nextTimedChangeAt,
};

/** How a policy is named in keys and telemetry: `verger-p4`. */
export const policyKey = (policy: Pick<VergerPolicy, 'id' | 'version'>): string =>
  `${policy.id}-p${policy.version}`;

const ID = /^[a-z][a-z0-9-]{1,40}$/;

export function validatePolicy(policy: VergerPolicy): void {
  if (!ID.test(policy.id)) {
    throw new Error(`Policy id "${policy.id}" must be lowercase letters, digits and dashes`);
  }
  if (!Number.isInteger(policy.version) || policy.version < 1) {
    throw new Error(`Policy "${policy.id}" needs an integer version of at least 1`);
  }
}
