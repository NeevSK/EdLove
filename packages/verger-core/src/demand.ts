import { DEFAULT_VERGER_CONFIG } from './config';
import type { DataBudgetState } from './dataBudget';
import { isBatteryLow } from './signals';
import type { CapacityFacts, LeverSpec, StorageLevel, VergerConfig, VergerSnapshot } from './types';

/**
 * Demand and supply as data. The registry says what the host's work is, which class it is in and
 * which resource accounts it spends; the accounts say how each resource stands now and how sure
 * verger is. Both are read models: a policy may use them, the lab shows them, telemetry reports
 * them. Policy verger-p4 decides without them.
 */

/** The seven resources the device holds and the app spends. */
export type ResourceAccount =
  | 'cpu'
  | 'gpu'
  | 'memory'
  | 'energy'
  | 'thermal'
  | 'network'
  | 'storage';

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
  /**
   * `wait`: deferrable or ornamental work that should not run while free storage is low (it
   * writes optional data). Undeclared, low storage never holds it: work that frees space, or
   * that carries the user's records out, must keep running. A host decision per workload.
   */
  readonly whenStorageLow?: 'wait';
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
      if (!leverIds.has(id))
        throw new Error(`Workload "${workload.id}" reads unknown lever "${id}"`);
    }
  }
}

/** The classes a lever's workloads are in: what lowering it would cost the user. */
export function classesOfLever(
  workloads: readonly WorkloadSpec[],
  leverId: string,
): WorkloadClass[] {
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
  snapshot: VergerSnapshot,
  capacity: CapacityFacts,
  config: Pick<VergerConfig, 'batteryLowPercent'> = DEFAULT_VERGER_CONFIG,
): Readonly<Record<ResourceAccount, AccountReading>> {
  const lowPercent = config.batteryLowPercent;
  const sense = snapshot.activation.sense;
  const sdk = capacity.sdkInt ?? 0;

  const fromBattery = snapshot.thermalSource === 'battery';
  const thermal: AccountReading =
    !sense.thermal || snapshot.thermal === 'unknown'
      ? UNKNOWN
      : {
          state:
            snapshot.thermal === 'nominal'
              ? 'ample'
              : snapshot.thermal === 'warm'
                ? 'tight'
                : 'overdrawn',
          // Battery temperature lags the chip's: a weaker witness.
          confidence: fromBattery ? 0.4 : sdk >= 30 ? 0.9 : 0.7,
          source: fromBattery
            ? 'battery temperature (fallback)'
            : sdk >= 30
              ? 'thermal status and headroom'
              : 'thermal status',
        };

  const memory: AccountReading =
    !sense.memory || snapshot.memory === 'unknown'
      ? UNKNOWN
      : {
          state:
            snapshot.memory === 'normal'
              ? 'ample'
              : snapshot.memory === 'trimmed'
                ? 'tight'
                : 'overdrawn',
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
    ? {
        state: frameState(),
        confidence: sdk >= 31 ? 0.7 : 0.4,
        source: sdk >= 31 ? 'frame GPU time' : 'frame cost',
      }
    : UNKNOWN;

  const b = snapshot.battery;
  const energy: AccountReading = !sense.power
    ? UNKNOWN
    : b.pluggedIn === true
      ? { state: 'ample', confidence: 0.8, source: 'plugged in' }
      : b.levelPercent !== null && b.levelPercent <= lowPercent / 2
        ? { state: 'overdrawn', confidence: 0.8, source: `battery at ${b.levelPercent}%` }
        : (b.levelPercent !== null && b.levelPercent <= lowPercent) || snapshot.powerSaver
          ? {
              state: 'tight',
              confidence: b.levelPercent !== null ? 0.8 : 0.5,
              source: snapshot.powerSaver ? 'battery saver' : `battery at ${b.levelPercent}%`,
            }
          : { state: 'ample', confidence: b.levelPercent !== null ? 0.7 : 0.4, source: 'battery' };

  const n = snapshot.network;
  const network: AccountReading =
    !sense.network || n.transport === null
      ? UNKNOWN
      : n.transport === 'none' || n.validated === false
        ? { state: 'overdrawn', confidence: 0.8, source: 'no validated network' }
        : n.dataSaver === 'enabled'
          ? { state: 'overdrawn', confidence: 0.9, source: 'Data Saver restricts this app' }
          : snapshot.dataBudget === 'spent'
            ? { state: 'overdrawn', confidence: 0.8, source: "today's data budget is spent" }
            : // Slow or unstable as the policy reads it (config `slowNetworkKbps`, `networkSettleMs`).
            n.metered === true ||
              snapshot.networkLimit === 'slow' ||
              snapshot.networkLimit === 'unstable'
            ? {
                state: 'tight',
                confidence: 0.7,
                source: n.metered === true ? 'metered network' : `${snapshot.networkLimit} link`,
              }
            : {
                state: 'ample',
                confidence: n.validated === true ? 0.8 : 0.5,
                source: `${n.transport} network`,
              };

  const storage: AccountReading =
    !sense.storage || snapshot.storage === 'unknown'
      ? UNKNOWN
      : snapshot.storage === 'low'
        ? { state: 'overdrawn', confidence: 0.8, source: 'free storage low' }
        : { state: 'ample', confidence: 0.6, source: 'free storage' };

  return { cpu, gpu, memory, energy, thermal, network, storage };
}

export interface Admission {
  readonly admit: boolean;
  /** Why, for logs and telemetry: `eligible`, or the limit that held the work back. */
  readonly reason: string;
}

/**
 * Whether a workload may run now, by its class and the accounts it spends, on a snapshot's
 * limits. Critical and committed work always runs. Deferrable and ornamental work waits while an
 * account it spends is at a limit: network work for offline, Data Saver or a link back from
 * offline under a minute; energy work for battery saver or a low, unplugged battery. Metered is
 * home, never a limit; unknown is never a limit; a spent daily data budget holds network work. For work outside the app's rhythm (background
 * tasks); in the app, `optionalConcurrency` also counts visibility and contention.
 */
export function admitWork(
  snapshot: Pick<VergerSnapshot, 'networkLimit' | 'powerSaver' | 'battery'> & {
    /** Today's data budget (the snapshot's, or `dataBudgetState`); spent holds optional network work. */
    readonly dataBudget?: DataBudgetState;
    /** Free storage (the snapshot's); low holds work that declares `whenStorageLow: 'wait'`. */
    readonly storage?: StorageLevel;
  },
  workload: Pick<WorkloadSpec, 'class' | 'spends' | 'whenStorageLow'>,
  config: Pick<VergerConfig, 'batteryLowPercent'> = DEFAULT_VERGER_CONFIG,
): Admission {
  if (workload.class === 'critical' || workload.class === 'committed')
    return { admit: true, reason: 'eligible' };
  if (workload.spends.includes('network')) {
    const limit = snapshot.networkLimit;
    if (limit === 'offline' || limit === 'data-saver' || limit === 'unstable')
      return { admit: false, reason: limit };
    if (snapshot.dataBudget === 'spent') return { admit: false, reason: 'data-budget-spent' };
  }
  if (workload.whenStorageLow === 'wait' && snapshot.storage === 'low')
    return { admit: false, reason: 'storage-low' };
  if (workload.spends.includes('energy')) {
    if (snapshot.powerSaver) return { admit: false, reason: 'battery-saver' };
    if (isBatteryLow(snapshot.battery, config.batteryLowPercent))
      return { admit: false, reason: 'battery-low' };
  }
  return { admit: true, reason: 'eligible' };
}

/**
 * The accounts a lever relieves, as the lever declares them (animation levers declare CPU: the
 * UI thread drives every frame). Easing any compute or energy load also eases heat.
 */
export function accountsRelievedBy(lever: LeverSpec): ResourceAccount[] {
  const targets = new Set<ResourceAccount>([lever.target, ...(lever.alsoRelieves ?? [])]);
  if (targets.has('gpu') || targets.has('cpu') || targets.has('energy')) targets.add('thermal');
  return [...targets];
}
