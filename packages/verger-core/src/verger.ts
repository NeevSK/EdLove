import {
  type ActivationPatch,
  activationForMode,
  capActivation,
  resolveActivation,
  type VergerActivation,
} from './activation';
import {
  createRuntimeController,
  type RuntimeController,
  type RuntimePort,
  type RuntimeScheduler,
} from './controller';
import type { ExperimentAssignment } from './experiment';
import { fnv1a32 } from './experiment';
import { createFlightRecorder, type FlightRecorder } from './flightRecorder';
import type { VergerHost } from './host';
import {
  classifySession,
  type ExitRecord,
  foldSession,
  freshRecord,
  guardedRecord,
  type LaunchPlan,
  parseMarker,
  parseRecord,
  planLaunch,
  type Rung,
  type SessionMarker,
  type SessionOutcome,
  type VergerRecord,
} from './recovery';
import { createOutcomeLedger, type MoveRecord, type OutcomeLedger, type OutcomeSummary } from './outcomes';
import { canonicalLadderKey, ladderKey as ladderKeyOf } from './policy';
import { createSessionLedger, type SessionLedger } from './session';
import {
  createGovernorTelemetry,
  type GovernorTelemetry,
  type GovernorTelemetrySink,
  type TelemetryValue,
} from './telemetry';
import { validateConfig } from './config';
import type {
  CapacityFacts,
  GovernorConfig,
  GovernorEvent,
  GovernorMode,
  GovernorSnapshot,
} from './types';

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
 * Everything verger needs from a platform. Facts (`readCapacity`, `readExits`,
 * `readProcessId`) are read-only calls that start nothing; `createPort` brings up the live
 * sensors and levers. A launch the ladder keeps off calls none of them.
 */
export interface VergerPlatform {
  readCapacity(): CapacityFacts;
  /** How earlier processes ended since a wall time; null when the platform keeps no record. */
  readExits?(sinceWallMs: number): readonly ExitRecord[] | null;
  /** This process's id, so the next launch can match the exit record to this session. */
  readProcessId?(): number | null;
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
  /**
   * The activation asked for (a preset with any overrides); the ladder caps it. Defaults to the
   * preset that reproduces `requested`.
   */
  readonly activation?: VergerActivation;
  /** The experiment assignment, if any: its kill switch wins, its arm labels telemetry. */
  readonly assignment?: ExperimentAssignment;
  readonly telemetrySink?: GovernorTelemetrySink;
  /**
   * The host's release (app version and build). A new release starts the ladder over, and is
   * the only way off rung 4 besides a new policy version, so it is required.
   */
  readonly release: string;
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
  /**
   * Changes what verger may do while it runs: the patch applies over the launch's activation,
   * and the result is capped by the launch exactly as at start. `null` returns to the launch's
   * activation. Ignored while verger is not running.
   */
  configure(patch: ActivationPatch | null): void;
  /** The activation in force, or null while verger is not running. */
  readonly activation: VergerActivation | null;
  /**
   * How every move this session turned out (loop 2's evidence), judged up to now; null while
   * verger is not running.
   */
  outcomes(): { readonly records: readonly MoveRecord[]; readonly summary: OutcomeSummary } | null;
  /**
   * Changes thresholds while verger runs: the patch applies over the host's config and must
   * validate, or nothing changes and the error is thrown. `null` returns to the host's config.
   * The native sensors keep the thresholds they started with.
   */
  tune(patch: Partial<GovernorConfig> | null): void;
  /** Null while verger is not running. */
  getSnapshot(): GovernorSnapshot | null;
  subscribe(listener: () => void): () => void;
}

/** Marker and flight writes while running: often enough to keep the last minutes, rarely enough for slow storage. */
const PERSIST_EVERY_MS = 10_000;
const FLIGHT_SENT_CHARS = 1_800;

const offPlan = (reason: string, rung: Rung = 0): LaunchPlan => ({
  runtime: 'off',
  rung,
  exercise: false,
  hardware: false,
  prior: {},
  grant: 0,
  reason,
});

const defaultScheduler: RuntimeScheduler = {
  setTimeout: (callback, delayMs) => setTimeout(callback, delayMs),
  clearTimeout: (handle) => clearTimeout(handle as ReturnType<typeof setTimeout>),
};

/**
 * One queue for every verger instance in the process. The native side is a singleton, so a
 * remount's new instance must not start until the old one has stopped, nor the old one's stop
 * land after the new one's start.
 */
let processQueue: Promise<unknown> = Promise.resolve();
const enqueue = <T>(work: () => Promise<T> | T): Promise<T> => {
  const next = processQueue.then(work);
  processQueue = next.catch(() => undefined);
  return next;
};

/**
 * Verger for one app process. Construction does nothing; `start` runs the launch.
 *
 * The launch is crash-only and fails closed:
 * 1. Read what the last session left. If the store cannot be read, stay off and write nothing:
 *    an unread record may be the one holding verger down.
 * 2. Decide from the store alone whether verger may touch native code at all. A session that
 *    died in its `starting` stretch, or a record already on rung 4, ends the launch here,
 *    before any native call, so a fault in native code cannot loop.
 * 3. Write the `starting` marker and wait for it to land; if it cannot be written, stay off.
 * 4. In one synchronous stretch: read the platform's facts, judge the last session, decide,
 *    and start the port. Then wait for the `running` marker and the record to land.
 * Any exception leaves verger off for the process, recorded as an `off` session.
 */
export function createVerger(options: VergerOptions): Verger {
  const { host, store } = options;
  const now = options.now ?? (() => performance.now());
  const wallNow = options.wallNow ?? (() => Date.now());
  const scheduler = options.scheduler ?? defaultScheduler;
  const random = options.random ?? Math.random;
  const recovery = host.recovery;
  const keys = {
    record: `verger:${host.name}:record`,
    marker: `verger:${host.name}:session`,
    flight: `verger:${host.name}:flight`,
  };
  const ladderKey = ladderKeyOf(host.policy, host.configHash, options.release);

  let plan: LaunchPlan | null = null;
  let controller: RuntimeController | null = null;
  const requestedActivation = options.activation ?? activationForMode(options.requested);
  /** Caps the activation to what this launch's plan allows. */
  let capFor: (activation: VergerActivation) => VergerActivation = (a) => a;
  let session: {
    marker: SessionMarker;
    ledger: SessionLedger;
    outcomes: OutcomeLedger;
    flight: FlightRecorder;
    unsubscribe: () => void;
    timer: unknown;
    lastPersistAt: number;
  } | null = null;
  // The record as this instance last wrote it: a store may not read back its own pending write.
  let lastRecord: VergerRecord | null = null;
  const listeners = new Set<() => void>();
  const notify = () => {
    for (const listener of listeners) guard(listener);
  };

  /** Resolves true once the value is durably handed to the store, false on any failure. */
  const write = async (key: string, value: string | null): Promise<boolean> => {
    if (!store) return true;
    try {
      await (value === null ? store.remove(key) : store.set(key, value));
      return true;
    } catch (error) {
      console.error('[verger] store write failed', error);
      return false;
    }
  };
  /** Reads every key, or returns null if any read fails (unknown is not the same as absent). */
  const readAll = async (names: readonly string[]): Promise<(string | null)[] | null> => {
    if (!store) return names.map(() => null);
    try {
      return await Promise.all(names.map(async (name) => (await store.get(name)) ?? null));
    } catch (error) {
      console.error('[verger] store read failed', error);
      return null;
    }
  };

  const markerFor = (
    runtime: SessionMarker['runtime'],
    rung: Rung,
    phase: SessionMarker['phase'],
  ): SessionMarker => ({
    v: 1,
    key: ladderKey,
    startedAtWall: wallNow(),
    pid: null,
    phase,
    foreground: true,
    runtime,
    rung,
    exercise: false,
    report: null,
  });

  const persist = () => {
    if (!session || !controller) return;
    if (session.timer !== null) scheduler.clearTimeout(session.timer);
    session.timer = null;
    session.lastPersistAt = now();
    session.marker = { ...session.marker, report: session.ledger.report(now()) };
    void write(keys.marker, JSON.stringify(session.marker));
    void write(keys.flight, JSON.stringify(session.flight.lines()));
  };
  const persistSoon = () => {
    if (!session || session.timer !== null) return;
    const wait = Math.max(0, session.lastPersistAt + PERSIST_EVERY_MS - now());
    session.timer = scheduler.setTimeout(persist, wait);
  };

  const remember = (record: VergerRecord) => {
    lastRecord = record;
    return write(keys.record, JSON.stringify(record));
  };

  const launch = async (): Promise<LaunchPlan> => {
    if (options.assignment?.runtime === 'off') return offPlan('kill-switch');

    // 1. What the last session left.
    const texts = await readAll([keys.marker, keys.record, keys.flight]);
    if (!texts) return offPlan('store-unreadable');
    const [markerText = null, recordText = null, flightText = null] = texts;
    let previous = migrateMarker(parseMarker(markerText));
    const parsed = lastRecord ?? migrateRecord(parseRecord(recordText));
    const corrupt = recordText !== null && parsed === null;
    let base =
      parsed ??
      (corrupt ? guardedRecord(ladderKey, null, recovery) : freshRecord(ladderKey, null, recovery));

    // 2. May verger touch native code at all? Decided from the store alone.
    if (previous?.phase === 'starting' || (base.key === ladderKey && base.ladder.rung === 4)) {
      const folded = foldSession(
        base,
        classifySession(previous, null),
        { key: ladderKey, device: base.profile.device, nowWall: wallNow() },
        recovery,
      );
      base = folded.record;
      previous = null; // consumed
      if (base.ladder.rung === 4) {
        const ok = await remember(base);
        await write(keys.marker, JSON.stringify(markerFor('off', 4, 'running')));
        return offPlan(ok ? 'rung-4-off' : 'rung-4-off-unrecorded', 4);
      }
    }

    // 3. The one write that must land before native code: from here until `running`, a death
    // is charged to verger.
    const starting = markerFor(options.requested, base.ladder.rung, 'starting');
    if (!(await write(keys.marker, JSON.stringify(starting)))) return offPlan('store-unwritable');

    // 4. One synchronous stretch: facts, judgement, decision, start.
    const platform = options.platform();
    const exits =
      previous && previous.phase !== 'stopped' && platform.readExits
        ? platform.readExits(previous.startedAtWall)
        : null;
    const capacity = platform.readCapacity();
    const pid = platform.readProcessId?.() ?? null;
    const device = capacity.buildFingerprint
      ? fnv1a32(capacity.buildFingerprint).toString(16)
      : null;
    const outcome = classifySession(previous, exits);
    const folded = foldSession(
      base,
      outcome,
      { key: ladderKey, device, nowWall: wallNow() },
      recovery,
    );
    const decided = store
      ? planLaunch(folded.record, options.requested, random(), recovery)
      : {
          ...planLaunch(freshRecord(ladderKey, device, recovery), options.requested, 1, recovery),
          reason: 'no-store',
        };
    const recorded = remember(folded.record);

    if (decided.runtime === 'off') {
      await Promise.all([
        recorded,
        write(keys.marker, JSON.stringify(markerFor('off', decided.rung, 'running'))),
      ]);
      return decided;
    }

    const telemetry = options.telemetrySink
      ? createGovernorTelemetry({
          sink: options.telemetrySink,
          // From the assignment or the request, never from the ladder: labelling crashed
          // devices `control` would bias the comparison.
          arm:
            options.assignment?.arm ?? (options.requested === 'active' ? 'treatment' : 'control'),
          experimentKey: options.assignment?.key ?? host.experimentKey,
          sessionId: (fnv1a32(`${wallNow()}:${random()}`) >>> 0).toString(16).padStart(8, '0'),
          configHash: host.configHash,
          policy: host.policy,
          config: host.config,
          levers: host.levers,
          readTotals: platform.readTotals,
          device: deviceStratum(capacity, platform.memorySensing),
        })
      : undefined;
    capFor = (activation) =>
      capActivation(activation, {
        runtime: decided.runtime === 'active' ? 'active' : 'shadow',
        hardware: decided.hardware,
      });
    const activation = capFor(requestedActivation);
    const started = createRuntimeController({
      port: platform.createPort(now),
      capacity,
      levers: host.levers,
      mode: decided.runtime,
      config: host.config,
      now,
      scheduler,
      telemetry,
      memorySensing: platform.memorySensing,
      activation,
      policy: host.policy,
      launch: {
        hardware: decided.hardware,
        // Growth is a direction activation can switch off; the earned grant is kept, unused.
        capacityGrant: activation.grow ? decided.grant : 0,
        initialPressure: decided.prior,
      },
    });
    const ledger = createSessionLedger(host.levers);
    const outcomes = createOutcomeLedger({ levers: host.levers, capacity });
    const flight = createFlightRecorder(now());
    const initial = started.getSnapshot();
    ledger.onSnapshot(initial);
    outcomes.observe(initial);
    flight.record(initial);
    controller = started;
    session = {
      marker: {
        ...markerFor(decided.runtime, decided.rung, 'running'),
        startedAtWall: starting.startedAtWall,
        pid,
        exercise: decided.exercise,
      },
      ledger,
      outcomes,
      flight,
      timer: null,
      lastPersistAt: now(),
      unsubscribe: started.subscribe(() => {
        const snapshot = started.getSnapshot();
        guard(() => ledger.onSnapshot(snapshot));
        guard(() => outcomes.observe(snapshot));
        guard(() => flight.record(snapshot));
        persistSoon();
        notify();
      }),
    };
    started.start();
    // Close the starting stretch as soon as the port is up, before any host code runs.
    session.marker = { ...session.marker, report: ledger.report(now()) };
    await Promise.all([recorded, write(keys.marker, JSON.stringify(session.marker))]);
    // The last session's flight was read above; from here the key holds this session's.
    void write(keys.flight, JSON.stringify(flight.lines()));
    guard(() => reportLaunch(telemetry, decided, outcome, folded.transition, corrupt, flightText));
    notify();
    return decided;
  };

  const teardown = (clean: boolean) => {
    const current = session;
    const running = controller;
    session = null;
    controller = null;
    if (current) {
      if (current.timer !== null) scheduler.clearTimeout(current.timer);
      guard(current.unsubscribe);
    }
    if (running) guard(() => running.stop());
    if (current && clean) {
      const report = guardValue(() => current.ledger.report(now()));
      void write(
        keys.marker,
        JSON.stringify({
          ...current.marker,
          phase: 'stopped',
          report: report ?? current.marker.report,
        }),
      );
      void write(keys.flight, null);
    }
    notify();
  };

  const verger: Verger = {
    start: () =>
      enqueue(async () => {
        if (plan) return plan;
        try {
          plan = await launch();
        } catch (error) {
          console.error('[verger] launch failed; staying off', error);
          teardown(false);
          plan = offPlan('launch-error');
          // An off session, so nothing in this process is charged to verger later.
          await write(keys.marker, JSON.stringify(markerFor('off', 0, 'running')));
        }
        return plan;
      }),
    stop: () =>
      enqueue(() => {
        if (!plan) return;
        teardown(true);
        plan = null;
      }),
    get plan() {
      return plan;
    },
    dispatch(event) {
      const running = controller;
      if (!running) return;
      running.dispatch(event);
      if (event.type === 'app-state' && session) {
        const foreground = event.state === 'active';
        if (session.marker.foreground !== foreground) {
          session.marker = { ...session.marker, foreground };
          // Leaving the foreground is when Android may end the process without notice.
          persist();
        }
      }
    },
    configure(patch) {
      const running = controller;
      if (!running) return;
      const activation = capFor(resolveActivation(requestedActivation, patch));
      running.dispatch({ type: 'activation', at: now(), activation });
    },
    tune(patch) {
      const running = controller;
      if (!running) return;
      const config: GovernorConfig = { ...host.config, ...patch };
      validateConfig(config);
      running.dispatch({ type: 'config', at: now(), config });
    },
    outcomes() {
      const current = session;
      if (!current) return null;
      current.outcomes.settle(now());
      return { records: current.outcomes.records(), summary: current.outcomes.summary() };
    },
    get activation() {
      return controller?.getSnapshot().activation ?? null;
    },
    getSnapshot: () => controller?.getSnapshot() ?? null,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
  return verger;
}

const migrateMarker = (marker: SessionMarker | null): SessionMarker | null =>
  marker && { ...marker, key: canonicalLadderKey(marker.key) };
const migrateRecord = (record: VergerRecord | null): VergerRecord | null =>
  record && { ...record, key: canonicalLadderKey(record.key) };

function deviceStratum(capacity: CapacityFacts, sensing: boolean): Record<string, TelemetryValue> {
  const bytes = capacity.totalMemoryBytes;
  const gb = 1024 ** 3;
  return {
    ram:
      bytes === null
        ? 'unknown'
        : bytes < 3 * gb
          ? '<3GB'
          : bytes < 5 * gb
            ? '3-5GB'
            : bytes < 7 * gb
              ? '5-7GB'
              : '>=7GB',
    sdk: capacity.sdkInt ?? 0,
    max_hz: Math.round(Math.max(0, ...capacity.refreshRatesHz)),
    hints: capacity.supportsCpuHints,
    sensing,
  };
}

function reportLaunch(
  telemetry: GovernorTelemetry | undefined,
  plan: LaunchPlan,
  outcome: SessionOutcome,
  transition: {
    from: Rung;
    to: Rung;
    trustFrom: number;
    trustTo: number;
    grantFrom: number;
    grantTo: number;
  },
  corrupt: boolean,
  flightText: string | null,
): void {
  if (!telemetry) return;
  telemetry.event('verger_launch', {
    runtime: plan.runtime,
    rung: plan.rung,
    rung_from: transition.from,
    exercise: plan.exercise,
    hardware: plan.hardware,
    grant: plan.grant,
    prior_levers: Object.keys(plan.prior).length,
    trust: transition.trustTo,
    last: outcome.kind,
    cause:
      outcome.kind === 'failure'
        ? outcome.cause
        : outcome.kind === 'clean'
          ? (outcome.exit ?? 'none')
          : 'none',
    boot: outcome.kind === 'failure' && outcome.boot,
    corrupt,
    reason: plan.reason,
  });
  if (outcome.kind !== 'failure' || flightText === null) return;
  let lines: unknown = null;
  try {
    lines = JSON.parse(flightText);
  } catch {
    return;
  }
  if (!Array.isArray(lines) || !lines.every((l) => typeof l === 'string')) return;
  const joined = (lines as string[]).join('\n');
  telemetry.event('verger_flight', {
    cause: outcome.cause,
    lines: lines.length,
    record:
      joined.length > FLIGHT_SENT_CHARS ? joined.slice(joined.length - FLIGHT_SENT_CHARS) : joined,
  });
}

function guard(effect: () => void): void {
  try {
    effect();
  } catch (error) {
    console.error('[verger] side effect failed', error);
  }
}

function guardValue<T>(effect: () => T): T | null {
  try {
    return effect();
  } catch (error) {
    console.error('[verger] side effect failed', error);
    return null;
  }
}
