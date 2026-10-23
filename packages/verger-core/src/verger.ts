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
  type LaunchPlan,
  parseMarker,
  parseRecord,
  planLaunch,
  type Rung,
  type SessionMarker,
  type SessionOutcome,
  type VergerRecord,
} from './recovery';
import { createSessionLedger, type SessionLedger } from './session';
import {
  createGovernorTelemetry,
  GOVERNOR_POLICY_VERSION,
  type GovernorTelemetry,
  type GovernorTelemetrySink,
  type TelemetryValue,
} from './telemetry';
import type { CapacityFacts, GovernorEvent, GovernorMode, GovernorSnapshot } from './types';

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
 * Everything verger needs from a platform. Facts (`readCapacity`, `readExits`) are cheap,
 * read-only calls; `createPort` brings up the live sensors and levers. A launch the recovery
 * ladder keeps off calls none of them.
 */
export interface VergerPlatform {
  readCapacity(): CapacityFacts;
  /** How earlier processes ended, newest or oldest first, since a wall time. Absent: unknown. */
  readExits?(sinceWallMs: number): readonly ExitRecord[];
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
  /** The experiment assignment, if any: its kill switch wins, its arm labels telemetry. */
  readonly assignment?: ExperimentAssignment;
  readonly telemetrySink?: GovernorTelemetrySink;
  /** The host's release (app version). A new release starts the ladder over. */
  readonly release?: string;
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
  /** Null while verger is not running. */
  getSnapshot(): GovernorSnapshot | null;
  subscribe(listener: () => void): () => void;
}

const PERSIST_EVERY_MS = 2_000;
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
 * Verger for one app process. Construction does nothing; `start` runs the launch.
 *
 * The launch is crash-only. It reads what the last session left, then writes a `starting`
 * marker and waits for it to land before any native call, and only then reads the platform's
 * facts and starts the port, in one synchronous stretch. A process that dies inside that
 * stretch leaves `starting` behind, and the next launch keeps verger off entirely. Every
 * failure inside verger's own code ends the launch with verger off: it fails closed.
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
  const ladderKey = `p${GOVERNOR_POLICY_VERSION}:${host.configHash}:${options.release ?? ''}`;

  let plan: LaunchPlan | null = null;
  let controller: RuntimeController | null = null;
  let session: {
    marker: SessionMarker;
    ledger: SessionLedger;
    flight: FlightRecorder;
    unsubscribe: () => void;
    timer: unknown;
    lastPersistAt: number;
  } | null = null;
  // The record as this instance last wrote it: a store may not read back its own pending write.
  let lastRecord: VergerRecord | null = null;
  let chain: Promise<unknown> = Promise.resolve();
  const listeners = new Set<() => void>();
  const notify = () => {
    for (const listener of listeners) guard(listener);
  };

  const write = (key: string, value: string | null): Promise<void> => {
    if (!store) return Promise.resolve();
    try {
      return Promise.resolve(value === null ? store.remove(key) : store.set(key, value)).catch(
        (error: unknown) => console.error('[verger] store write failed', error),
      );
    } catch (error) {
      console.error('[verger] store write failed', error);
      return Promise.resolve();
    }
  };
  const read = async (key: string): Promise<string | null> => {
    if (!store) return null;
    try {
      return (await store.get(key)) ?? null;
    } catch (error) {
      console.error('[verger] store read failed', error);
      return null;
    }
  };

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

  const launch = async (): Promise<LaunchPlan> => {
    if (options.assignment?.runtime === 'off') return offPlan('kill-switch');
    const [markerText, recordText, flightText] = await Promise.all([
      read(keys.marker),
      read(keys.record),
      read(keys.flight),
    ]);
    const previous = parseMarker(markerText);
    const stored = lastRecord ?? parseRecord(recordText);
    const corrupt =
      (recordText !== null && stored === null) || (markerText !== null && previous === null);
    const base = stored ?? freshRecord(ladderKey, null, recovery);

    // Rung 4: the platform is the suspect, so nothing native is touched, exits included.
    // The last session ran with verger off, so folding it changes nothing but the keys.
    if (base.key === ladderKey && base.ladder.rung === 4) {
      const folded = foldSession(
        base,
        classifySession(previous, null),
        { key: ladderKey, device: base.profile.device, nowWall: wallNow() },
        recovery,
      );
      lastRecord = folded.record;
      void write(keys.record, JSON.stringify(folded.record));
      await write(keys.marker, JSON.stringify(markerFor('off', 4, false, 'running')));
      void write(keys.flight, null);
      return offPlan('rung-4-off', 4);
    }

    // The one write that must land first: from here until `running`, a death is verger's.
    const starting = markerFor(options.requested, base.ladder.rung, false, 'starting');
    await write(keys.marker, JSON.stringify(starting));

    // One synchronous stretch: facts, judgement, decision, start.
    const platform = options.platform();
    const exits =
      previous && previous.phase !== 'stopped' && platform.readExits
        ? platform.readExits(previous.startedAtWall)
        : null;
    const capacity = platform.readCapacity();
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
    lastRecord = folded.record;
    void write(keys.record, JSON.stringify(folded.record));
    const decided = store
      ? planLaunch(folded.record, options.requested, random(), recovery)
      : {
          ...planLaunch(freshRecord(ladderKey, device, recovery), options.requested, 1, recovery),
          reason: 'no-store',
        };

    const telemetry = options.telemetrySink
      ? createGovernorTelemetry({
          sink: options.telemetrySink,
          arm: options.assignment?.arm ?? (decided.runtime === 'active' ? 'treatment' : 'control'),
          experimentKey: options.assignment?.key ?? host.experimentKey,
          sessionId: (fnv1a32(`${wallNow()}:${random()}`) >>> 0).toString(16).padStart(8, '0'),
          configHash: host.configHash,
          config: host.config,
          levers: host.levers,
          readTotals: platform.readTotals,
          device: deviceStratum(capacity, platform.memorySensing),
        })
      : undefined;
    guard(() => reportLaunch(telemetry, decided, outcome, folded.transition, corrupt, flightText));
    void write(keys.flight, null);

    if (decided.runtime === 'off') {
      await write(keys.marker, JSON.stringify(markerFor('off', decided.rung, false, 'running')));
      return decided;
    }

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
      launch: {
        hardware: decided.hardware,
        capacityGrant: decided.grant,
        initialPressure: decided.prior,
      },
    });
    const sessionStart = now();
    const ledger = createSessionLedger(host.levers);
    const flight = createFlightRecorder(sessionStart);
    const initial = started.getSnapshot();
    ledger.onSnapshot(initial);
    flight.record(initial);
    controller = started;
    session = {
      marker: {
        ...markerFor(decided.runtime, decided.rung, decided.exercise, 'running'),
        startedAtWall: starting.startedAtWall,
      },
      ledger,
      flight,
      timer: null,
      lastPersistAt: Number.NEGATIVE_INFINITY,
      unsubscribe: started.subscribe(() => {
        const snapshot = started.getSnapshot();
        guard(() => ledger.onSnapshot(snapshot));
        guard(() => flight.record(snapshot));
        persistSoon();
        notify();
      }),
    };
    started.start();
    persist();
    notify();
    return decided;
  };

  const markerFor = (
    runtime: SessionMarker['runtime'],
    rung: Rung,
    exercise: boolean,
    phase: SessionMarker['phase'],
  ): SessionMarker => ({
    v: 1,
    startedAtWall: wallNow(),
    phase,
    foreground: true,
    runtime,
    rung,
    exercise,
    report: null,
  });

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
    start() {
      const next = chain.then(async () => {
        if (plan) return plan;
        try {
          plan = await launch();
        } catch (error) {
          console.error('[verger] launch failed; staying off', error);
          teardown(false);
          plan = offPlan('launch-error');
        }
        return plan;
      });
      chain = next.catch(() => undefined);
      return next;
    },
    stop() {
      const next = chain.then(() => {
        if (!plan) return;
        teardown(true);
        plan = null;
      });
      chain = next.catch(() => undefined);
      return next;
    },
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
