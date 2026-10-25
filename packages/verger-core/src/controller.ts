import type { SensorId, VergerActivation } from './activation';
import type { CreateVergerStateOptions } from './reducer';
import { VERGER_POLICY, type VergerPolicy } from './policy';
import { createSessionRecorder, type SessionRecorder, type VergerRecording } from './recording';
import { createSelfCostMeter, type SelfCost } from './selfCost';
import type { VergerTelemetry } from './telemetry';
import type {
  CapacityFacts,
  VergerConfig,
  VergerEvent,
  RunMode,
  VergerSnapshot,
  LeverSpec,
} from './types';

/**
 * The live half of a platform: its sensors and hardware levers. Created only when verger
 * runs, so a launch that keeps verger off never touches this code. The Android port is
 * `@repo/verger-android`; tests implement it in memory.
 */
export interface RuntimePort {
  /** Starts sensing; returns a function that stops it. Must tolerate being called once only. */
  /** `sensors` says which sensors to run; a port may run fewer, never more. */
  start(
    config: VergerConfig,
    onEvent: (event: VergerEvent) => void,
    sensors?: Readonly<Record<SensorId, boolean>>,
  ): () => void;
  /** Starts or stops individual sensors while running. A port without it keeps its start set. */
  setSensors?(sensors: Readonly<Record<SensorId, boolean>>): void;
  setRefreshCap(hz: number | null): void;
  setCpuBoost(enabled: boolean): void;
}

export interface RuntimeScheduler {
  setTimeout(callback: () => void, delayMs: number): unknown;
  clearTimeout(handle: unknown): void;
}

export interface RuntimeControllerOptions {
  readonly port: RuntimePort;
  /** What the device is, read once by the platform. */
  readonly capacity: CapacityFacts;
  readonly levers: readonly LeverSpec[];
  readonly mode: RunMode;
  readonly config: VergerConfig;
  /** Monotonic milliseconds, the clock every event is stamped with. */
  readonly now: () => number;
  readonly scheduler: RuntimeScheduler;
  readonly telemetry?: VergerTelemetry;
  /** Whether the port senses memory (absence of trims then means normal). */
  readonly memorySensing: boolean;
  /** What this launch may do, from the recovery ladder and the learned profile. */
  readonly launch?: Pick<
    CreateVergerStateOptions,
    'hardware' | 'capacityGrant' | 'initialPressure'
  >;
  /** What verger may do at start, already capped by the launch; defaults to the mode's preset. */
  readonly activation?: VergerActivation;
  /** The rules to decide by; `VERGER_POLICY` by default. */
  readonly policy?: VergerPolicy;
  /** A high-resolution clock for verger's own cost; `now` by default. */
  readonly measure?: () => number;
  /** Records up to this many events for exact replay (D1); off when absent. Development only. */
  readonly recordEvents?: number;
  /** Called after every event is handled (the self-budget check); a failure is contained. */
  readonly afterEvent?: () => void;
}

export interface RuntimeController {
  start(): void;
  stop(): void;
  /** Feeds an event from outside the port: interactions, app state, preferences, long tasks. */
  dispatch(event: VergerEvent): void;
  getSnapshot(): VergerSnapshot;
  subscribe(listener: () => void): () => void;
  /** What verger has cost since this controller was created. */
  selfCost(): SelfCost;
  /** The session's inputs so far, or null when recording is off. */
  recording(): VergerRecording | null;
}

/**
 * The runtime loop: events in, one pure reduction, outputs applied only when they change.
 * It owns no policy. Decisions come from the reducer; this file sequences them, applies the
 * hardware levers through the port, wakes itself for time-only changes, and isolates every
 * consumer and sink so that a failure outside verger cannot stop it.
 */
export function createRuntimeController(options: RuntimeControllerOptions): RuntimeController {
  const { port, scheduler, telemetry } = options;
  const policy = options.policy ?? VERGER_POLICY;
  const createOptions: CreateVergerStateOptions = {
    at: options.now(),
    capacity: options.capacity,
    levers: options.levers,
    mode: options.mode,
    config: options.config,
    memorySensing: options.memorySensing,
    activation: options.activation,
    ...options.launch,
  };
  let state = policy.create(createOptions);
  const recorder: SessionRecorder | null =
    options.recordEvents === undefined
      ? null
      : createSessionRecorder(policy.version, createOptions, options.recordEvents);
  let snapshot = policy.snapshot(state);
  const measure = options.measure ?? options.now;
  const cost = createSelfCostMeter(options.now());
  let stopSensing: (() => void) | null = null;
  let timer: unknown = null;
  // Unknown until first applied: a previous JS instance (a reload) may have left the hardware
  // in any state, so the first snapshot is always sent, including a release.
  const UNKNOWN = Symbol('unknown');
  // With hardware off (a lower rung), verger never calls a hardware lever, not even to release.
  const hardwareOff = options.launch?.hardware === false;
  let appliedRefresh: number | null | typeof UNKNOWN = hardwareOff ? null : UNKNOWN;
  let appliedBoost: boolean | typeof UNKNOWN = hardwareOff ? false : UNKNOWN;
  let running = false;
  const listeners = new Set<() => void>();

  const applyHardware = (next: VergerSnapshot) => {
    if (!running) return;
    if (next.refreshCapHz !== appliedRefresh) {
      appliedRefresh = next.refreshCapHz;
      guard(() => port.setRefreshCap(next.refreshCapHz));
    }
    if (next.cpuBoost !== appliedBoost) {
      appliedBoost = next.cpuBoost;
      guard(() => port.setCpuBoost(next.cpuBoost));
    }
  };

  const schedule = () => {
    if (timer !== null) scheduler.clearTimeout(timer);
    timer = null;
    if (stopSensing === null) return;
    const due = policy.nextTimedChangeAt(state);
    if (due === null) return;
    timer = scheduler.setTimeout(
      () => {
        timer = null;
        cost.onWakeup();
        dispatch({ type: 'tick', at: options.now() });
      },
      Math.max(1, Math.ceil(due - options.now()) + 1),
    );
  };

  const observe = (event: VergerEvent) => {
    if (!telemetry) return;
    if (event.type === 'thread-load')
      telemetry.onThreadLoad(event.at, event.cores.js ?? 0, event.cores.main ?? 0);
    else if (event.type === 'long-task') telemetry.onLongTask(event.at, event.durationMs);
    else if (event.type === 'frame-window')
      telemetry.onFrameWindow(event.window, snapshot.interactionIdle, event.at);
    else if (event.type === 'app-state' && event.state !== 'active') telemetry.flush(event.at);
  };

  const dispatch = (event: VergerEvent) => {
    if (!running || !isValidEvent(event)) return;
    const before = policy.outputVersion(state);
    recorder?.record(event);
    const reduceStart = measure();
    state = policy.reduce(state, event);
    cost.onReduce(measure() - reduceStart);
    guard(() => observe(event));
    if (policy.outputVersion(state) !== before) {
      const sensorsBefore = snapshot.activation.sense;
      snapshot = policy.snapshot(state);
      if (snapshot.activation.sense !== sensorsBefore && port.setSensors) {
        const sensors = snapshot.activation.sense;
        guard(() => port.setSensors?.(sensors));
      }
      applyHardware(snapshot);
      guard(() => telemetry?.onSnapshot(snapshot));
      for (const listener of listeners) guard(listener);
    }
    schedule();
    if (options.afterEvent) guard(options.afterEvent);
  };

  return {
    start() {
      if (stopSensing !== null) return;
      stopSensing = () => {};
      running = true;
      guard(() => telemetry?.onSnapshot(snapshot));
      applyHardware(snapshot);
      const stop = guardValue(() =>
        port.start(options.config, dispatch, snapshot.activation.sense),
      );
      stopSensing = stop ?? (() => {});
      schedule();
    },
    stop() {
      if (stopSensing === null) return;
      const stop = stopSensing;
      stopSensing = null;
      running = false;
      if (timer !== null) scheduler.clearTimeout(timer);
      timer = null;
      guard(stop);
      // Hand the hardware back to the system.
      if (appliedRefresh !== null) guard(() => port.setRefreshCap(null));
      if (appliedBoost !== false) guard(() => port.setCpuBoost(false));
      appliedRefresh = hardwareOff ? null : UNKNOWN;
      appliedBoost = hardwareOff ? false : UNKNOWN;
      guard(() => telemetry?.flush(options.now()));
    },
    dispatch,
    getSnapshot: () => snapshot,
    selfCost: () => cost.read(options.now()),
    recording: () => recorder?.recording() ?? null,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

/**
 * Runs a side effect that must not break the loop. The error is reported to the console
 * because a broken actuator is a defect to find, but verger keeps running.
 */
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

const finite = (n: unknown): boolean => typeof n === 'number' && Number.isFinite(n);

/**
 * Rejects events a defective sensor could produce. One NaN timestamp would otherwise become the
 * verger's clock for good (max(x, NaN) is NaN) and freeze every timed decision.
 */
export function isValidEvent(event: VergerEvent): boolean {
  if (!finite(event.at)) return false;
  if (event.type === 'frame-window') {
    const w = event.window;
    return [w.startMs, w.endMs, w.frames, w.averageMs, w.targetMs, w.worstMs, w.droppedRatio].every(
      finite,
    );
  }
  if (event.type === 'thread-load') return finite(event.processCores);
  if (event.type === 'memory-state') return finite(event.availableMb) && finite(event.thresholdMb);
  if (event.type === 'long-task' || event.type === 'input-delay') return finite(event.durationMs);
  if (event.type === 'event-loop-lag') return finite(event.lagMs);
  if (event.type === 'js-heap')
    return finite(event.gcPauseShare) && (event.allocatedBytes === null || finite(event.allocatedBytes));
  if (event.type === 'storage') return event.freeBytes === null || finite(event.freeBytes);
  return true;
}
