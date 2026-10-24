import type { CapacityFacts, GovernorSnapshot, LeverSpec } from './types';

/**
 * Demand and supply as data. The registry says what the host's work is, which class it is in and
 * which resource accounts it spends; the accounts say how each resource stands now and how sure
 * verger is. Both are read models: a policy may use them, the lab shows them, telemetry reports
 * them. Policy verger-p4 decides without them.
 */

/** The seven resources the device holds and the app spends. */
export type ResourceAccount = 'cpu' | 'gpu' | 'memory' | 'energy' | 'thermal' | 'network' | 'storage';

export const RESOURCE_ACCOUNTS: readonly ResourceAccount[] = [
  'cpu',
  'gpu',
  'memory',
  'energy',
  'thermal',
  'network',
  'storage',
];

/**
 * `critical` fails the user if late (never shed, degrades only inside its ladder); `committed` is
 * the screen in front of the user (lowered, never removed); `deferrable` is useful later
 * (postponed); `ornamental` is pleasure, not function (removed first).
 */
export type WorkloadClass = 'critical' | 'committed' | 'deferrable' | 'ornamental';

export const WORKLOAD_CLASSES: readonly WorkloadClass[] = [
  'critical',
  'committed',
  'deferrable',
  'ornamental',
];

/** A unit of work the host does. Its quality ladder is the levers it reads, if any. */
export interface WorkloadSpec {
  readonly id: string;
  readonly class: WorkloadClass;
  /** Accounts it is believed to spend; measured cost vectors replace belief later. */
  readonly spends: readonly ResourceAccount[];
  /** Levers that set its quality; none for work verger only admits or protects. */
  readonly levers?: readonly string[];
  /** Where it lives in the host, for people reading the registry. */
  readonly source: string;
}

export function validateWorkloads(
  workloads: readonly WorkloadSpec[],
  levers: readonly LeverSpec[],
): void {
  const leverIds = new Set(levers.map((lever) => lever.id));
  const seen = new Set<string>();
  for (const workload of workloads) {
    if (seen.has(workload.id)) throw new Error(`Duplicate workload "${workload.id}"`);
    seen.add(workload.id);
    if (!WORKLOAD_CLASSES.includes(workload.class)) {
      throw new Error(`Workload "${workload.id}" has unknown class "${workload.class}"`);
    }
    if (workload.spends.length === 0) {
      throw new Error(`Workload "${workload.id}" must name at least one account it spends`);
    }
    for (const account of workload.spends) {
      if (!RESOURCE_ACCOUNTS.includes(account)) {
        throw new Error(`Workload "${workload.id}" spends unknown account "${account}"`);
      }
    }
    for (const id of workload.levers ?? []) {
      if (!leverIds.has(id)) throw new Error(`Workload "${workload.id}" reads unknown lever "${id}"`);
    }
  }
}

/** The classes a lever's workloads are in: what lowering it would cost the user. */
export function classesOfLever(workloads: readonly WorkloadSpec[], leverId: string): WorkloadClass[] {
  const classes = new Set<WorkloadClass>();
  for (const workload of workloads) {
    if (workload.levers?.includes(leverId)) classes.add(workload.class);
  }
  return WORKLOAD_CLASSES.filter((c) => classes.has(c));
}

// ---------------------------------------------------------------------------------------------
// Supply: how each account stands.
// ---------------------------------------------------------------------------------------------

/** `unknown` means no reading, which is not the same as `ample`. */
export type AccountState = 'unknown' | 'ample' | 'tight' | 'overdrawn';

export interface AccountReading {
  readonly state: AccountState;
  /** 0 (no evidence) to 1. Low confidence should widen a policy's safety margin. */
  readonly confidence: number;
  /** The signal behind the reading, for the lab and for reasons. */
  readonly source: string;
}

const UNKNOWN: AccountReading = { state: 'unknown', confidence: 0, source: 'no signal' };

/**
 * Reads the accounts from a snapshot and the device's facts. Confidence reflects how direct the
 * signal is on this device (thermal headroom from Android 11, GPU time from Android 12); its
 * numbers are provisional until device captures calibrate them.
 */
export function estimateAccounts(
  snapshot: GovernorSnapshot,
  capacity: CapacityFacts,
): Readonly<Record<ResourceAccount, AccountReading>> {
  const sense = snapshot.activation.sense;
  const sdk = capacity.sdkInt ?? 0;

  const thermal: AccountReading =
    !sense.thermal || snapshot.thermal === 'unknown'
      ? UNKNOWN
      : {
          state:
            snapshot.thermal === 'nominal' ? 'ample' : snapshot.thermal === 'warm' ? 'tight' : 'overdrawn',
          confidence: sdk >= 30 ? 0.9 : 0.7,
          source: sdk >= 30 ? 'thermal status and headroom' : 'thermal status',
        };

  const memory: AccountReading =
    !sense.memory || snapshot.memory === 'unknown'
      ? UNKNOWN
      : {
          state: snapshot.memory === 'normal' ? 'ample' : snapshot.memory === 'trimmed' ? 'tight' : 'overdrawn',
          confidence: 0.8,
          source: sdk >= 34 ? 'polled free memory' : 'trim callbacks and polled free memory',
        };

  const framesHeard = sense.frames && snapshot.frameState !== 'quiet';
  // Over budget is overdrawn; near budget (neutral) is tight.
  const frameState = (): AccountState =>
    snapshot.frameState === 'stressed'
      ? 'overdrawn'
      : snapshot.frameState === 'neutral'
        ? 'tight'
        : 'ample';

  const cpu: AccountReading =
    sense.threads && snapshot.contention !== 'none'
      ? { state: 'overdrawn', confidence: 0.8, source: `${snapshot.contention} thread saturated` }
      : framesHeard
        ? { state: frameState(), confidence: sense.threads ? 0.7 : 0.5, source: 'frame cost' }
        : sense.threads
          ? { state: 'ample', confidence: 0.4, source: 'thread load, no frames drawn' }
          : UNKNOWN;

  const gpu: AccountReading = framesHeard
    ? { state: frameState(), confidence: sdk >= 31 ? 0.7 : 0.4, source: sdk >= 31 ? 'frame GPU time' : 'frame cost' }
    : UNKNOWN;

  const energy: AccountReading = sense.power
    ? {
        state: snapshot.powerSaver ? 'tight' : 'ample',
        confidence: 0.5,
        source: 'battery saver (battery level not yet sensed)',
      }
    : UNKNOWN;

  return { cpu, gpu, memory, energy, thermal, network: UNKNOWN, storage: UNKNOWN };
}
