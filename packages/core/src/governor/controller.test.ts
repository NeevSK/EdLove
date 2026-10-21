import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  type CapacityFacts,
  createGovernorTelemetry,
  createRuntimeController,
  DEFAULT_GOVERNOR_CONFIG,
  type GovernorEvent,
  GURUDEVI_LEVERS,
  type RuntimePort,
  type RuntimeScheduler,
} from './index';

const CAPACITY: CapacityFacts = {
  totalMemoryBytes: 6 * 1024 ** 3,
  isLowRamDevice: false,
  memoryClassMb: 256,
  sdkInt: 34,
  cpuCores: 8,
  refreshRateHz: 90,
  supportsRenderEffect: true,
  supportsRuntimeShader: true,
  refreshRatesHz: [60, 90],
  supportsCpuHints: true,
};

/** A fake clock and scheduler: timers fire only when the test advances time. */
function fakeTime() {
  let now = 0;
  let nextId = 1;
  const timers = new Map<number, { at: number; fn: () => void }>();
  const scheduler: RuntimeScheduler = {
    setTimeout(fn, delay) {
      const id = nextId++;
      timers.set(id, { at: now + delay, fn });
      return id;
    },
    clearTimeout(handle) {
      timers.delete(handle as number);
    },
  };
  const advance = (ms: number) => {
    const end = now + ms;
    for (;;) {
      let due: [number, { at: number; fn: () => void }] | null = null;
      for (const entry of timers) if (entry[1].at <= end && (!due || entry[1].at < due[1].at)) due = entry;
      if (!due) break;
      timers.delete(due[0]);
      now = due[1].at;
      due[1].fn();
    }
    now = end;
  };
  return { scheduler, advance, now: () => now, pending: () => timers.size };
}

function fakePort(capacity = CAPACITY) {
  const calls: string[] = [];
  let emit: ((event: GovernorEvent) => void) | null = null;
  const port: RuntimePort = {
    capacity,
    start(_config, onEvent) {
      calls.push('start');
      emit = onEvent;
      return () => {
        calls.push('stop');
        emit = null;
      };
    },
    setRefreshCap(hz) {
      calls.push(`refresh:${hz}`);
    },
    setCpuBoost(enabled) {
      calls.push(`boost:${enabled}`);
    },
  };
  return { port, calls, emit: (e: GovernorEvent) => emit?.(e) };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('runtime controller', () => {
  it('acts on a steadily saturated JS thread although the sensor reports it only once', () => {
    const time = fakeTime();
    const { port, emit } = fakePort();
    const controller = createRuntimeController({
      port,
      levers: GURUDEVI_LEVERS,
      mode: 'active',
      config: DEFAULT_GOVERNOR_CONFIG,
      now: time.now,
      scheduler: time.scheduler,
      memorySensing: true,
    });
    controller.start();
    controller.dispatch({ type: 'interaction', at: 0 });
    time.advance(1000);
    emit({ type: 'thread-load', at: time.now(), cores: { js: 0.97, main: 0.2 }, processCores: 1.2 });
    expect(controller.getSnapshot().contention).toBe('none');
    time.advance(1900);
    expect(controller.getSnapshot().contention).toBe('none');
    time.advance(200); // no new sample: the controller's own timer must notice
    expect(controller.getSnapshot().contention).toBe('js');
    expect(controller.getSnapshot().optionalConcurrency).toBe(0);
    expect(controller.getSnapshot().lastReason).toMatch(/JS thread saturated/);
  });

  it('applies hardware levers only on change, and hands the hardware back on stop', () => {
    const time = fakeTime();
    const { port, calls } = fakePort();
    const controller = createRuntimeController({
      port,
      levers: GURUDEVI_LEVERS,
      mode: 'active',
      config: DEFAULT_GOVERNOR_CONFIG,
      now: time.now,
      scheduler: time.scheduler,
      memorySensing: true,
    });
    controller.start();
    controller.dispatch({ type: 'interaction', at: 0 });
    controller.dispatch({ type: 'interaction', at: 100 });
    expect(calls.filter((c) => c.startsWith('boost:true'))).toHaveLength(1);
    time.advance(10_200); // idle: ambient sleep, refresh cap, no boost
    expect(calls).toContain('refresh:60');
    expect(calls).toContain('boost:false');
    controller.stop();
    expect(calls.slice(-2)).toEqual(['stop', 'refresh:null']);
    expect(time.pending()).toBe(0);
  });

  it('applies no hardware lever in shadow mode', () => {
    const time = fakeTime();
    const { port, calls } = fakePort();
    const controller = createRuntimeController({
      port,
      levers: GURUDEVI_LEVERS,
      mode: 'shadow',
      config: DEFAULT_GOVERNOR_CONFIG,
      now: time.now,
      scheduler: time.scheduler,
      memorySensing: true,
    });
    controller.start();
    controller.dispatch({ type: 'interaction', at: 0 });
    time.advance(30_000);
    // Shadow only hands the hardware back (a previous instance may have left it capped);
    // it never caps or boosts.
    expect(calls.filter((c) => c.startsWith('refresh:') || c.startsWith('boost:'))).toEqual([
      'refresh:null',
      'boost:false',
    ]);
  });

  it('keeps governing when a consumer, the port and the telemetry sink all throw', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const time = fakeTime();
    const { port, emit } = fakePort();
    const broken: RuntimePort = {
      ...port,
      setCpuBoost() {
        throw new Error('hint session refused');
      },
    };
    const telemetry = createGovernorTelemetry({
      sink: () => {
        throw new Error('sink down');
      },
      arm: 'treatment',
      experimentKey: 'adaptive-runtime',
    });
    const controller = createRuntimeController({
      port: broken,
      levers: GURUDEVI_LEVERS,
      mode: 'active',
      config: DEFAULT_GOVERNOR_CONFIG,
      now: time.now,
      scheduler: time.scheduler,
      telemetry,
      memorySensing: true,
    });
    controller.subscribe(() => {
      throw new Error('consumer bug');
    });
    controller.start();
    controller.dispatch({ type: 'interaction', at: 0 });
    emit({ type: 'memory-state', at: 10, availableMb: 100, thresholdMb: 200, lowMemory: true });
    expect(controller.getSnapshot().memory).toBe('low');
  });

  it('emits telemetry stamped with the policy version and reasons without numbers', () => {
    const time = fakeTime();
    const { port, emit } = fakePort();
    const events: Array<[string, Record<string, unknown>]> = [];
    const controller = createRuntimeController({
      port,
      levers: GURUDEVI_LEVERS,
      mode: 'active',
      config: DEFAULT_GOVERNOR_CONFIG,
      now: time.now,
      scheduler: time.scheduler,
      telemetry: createGovernorTelemetry({
        sink: (name, attributes) => events.push([name, attributes]),
        arm: 'treatment',
        experimentKey: 'adaptive-runtime',
      }),
      memorySensing: true,
    });
    controller.start();
    emit({ type: 'thread-load', at: 0, cores: { js: 0.99 }, processCores: 1 });
    time.advance(2500);
    const lever = events.find(([name]) => name === 'governor_lever');
    expect(lever?.[1].policy).toBeGreaterThan(0);
    expect(String(lever?.[1].reason)).toMatch(/^JS thread saturated \(# cores, # long tasks\)$/);
  });

  it('releases hardware a previous instance left behind, and ignores events after stop or with NaN time', () => {
    const time = fakeTime();
    const { port, calls } = fakePort();
    const controller = createRuntimeController({
      port,
      levers: GURUDEVI_LEVERS,
      mode: 'active',
      config: DEFAULT_GOVERNOR_CONFIG,
      now: time.now,
      scheduler: time.scheduler,
      memorySensing: true,
    });
    controller.start();
    expect(calls.slice(0, 2)).toEqual(['refresh:null', 'boost:true']);
    controller.dispatch({ type: 'tick', at: Number.NaN });
    expect(controller.getSnapshot().at).toBe(0);
    controller.stop();
    const after = calls.length;
    controller.dispatch({ type: 'power', at: 5, saver: true });
    expect(calls.length).toBe(after);
  });
});
