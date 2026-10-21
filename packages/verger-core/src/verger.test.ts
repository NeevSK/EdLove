import { afterEach, describe, expect, it, vi } from 'vitest';
import { SAMPLE_LEVERS } from './__fixtures__/sampleHost';
import {
  type CapacityFacts,
  createVerger,
  defineHost,
  type ExitRecord,
  type GovernorEvent,
  parseRecord,
  type RuntimePort,
  type TelemetryValue,
  type VergerPlatform,
  type VergerStore,
} from './index';

const HOST = defineHost({ name: 'sample', levers: SAMPLE_LEVERS });

const CAPACITY: CapacityFacts = {
  totalMemoryBytes: 8 * 1024 ** 3,
  isLowRamDevice: false,
  memoryClassMb: 256,
  sdkInt: 34,
  cpuCores: 8,
  refreshRateHz: 120,
  supportsRenderEffect: true,
  supportsRuntimeShader: true,
  refreshRatesHz: [60, 120],
  supportsCpuHints: true,
  buildFingerprint: 'vendor/model/device:14/UP1A/123:user/release-keys',
};

/** An asynchronous store, like AsyncStorage: every call resolves on a later microtask. */
function asyncStore(): VergerStore & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    get: async (key) => data.get(key) ?? null,
    set: async (key, value) => {
      data.set(key, value);
    },
    remove: async (key) => {
      data.delete(key);
    },
  };
}

/** One device across launches: its exit history survives process deaths. */
function device() {
  const exits: ExitRecord[] = [];
  const calls: string[] = [];
  let failStart = false;
  let wall = 1_000_000;
  let mono = 0;
  const platform = (): VergerPlatform => ({
    readCapacity: () => {
      calls.push('capacity');
      return CAPACITY;
    },
    readExits: (since) => {
      calls.push('exits');
      return exits.filter((e) => e.atWallMs >= since);
    },
    memorySensing: true,
    createPort(): RuntimePort {
      calls.push('port');
      return {
        start(_config, _onEvent: (event: GovernorEvent) => void) {
          calls.push('start');
          if (failStart) throw new Error('native start blew up');
          return () => calls.push('stop');
        },
        setRefreshCap: (hz) => calls.push(`refresh:${hz}`),
        setCpuBoost: (on) => calls.push(`boost:${on}`),
      };
    },
  });
  return {
    exits,
    calls,
    platform,
    failStart: (on: boolean) => {
      failStart = on;
    },
    wallNow: () => wall,
    now: () => mono,
    pass(ms: number) {
      wall += ms;
      mono += ms;
    },
    /** The process dies; a new one starts with a fresh monotonic clock. */
    die(reason: ExitRecord['reason'] | null, foreground: boolean) {
      if (reason) exits.push({ reason, atWallMs: wall, foreground });
      wall += 1_000;
      mono = 0;
    },
  };
}

const scheduler = {
  setTimeout: (_cb: () => void, _ms: number) => 0,
  clearTimeout: () => {},
};

function launcher(
  d: ReturnType<typeof device>,
  store: VergerStore | undefined,
  extra: {
    sink?: (n: string, a: Readonly<Record<string, TelemetryValue>>) => void;
    killSwitch?: boolean;
    release?: string;
  } = {},
) {
  return createVerger({
    host: HOST,
    platform: d.platform,
    store,
    requested: 'active',
    telemetrySink: extra.sink,
    release: extra.release ?? '1.0.0',
    assignment: extra.killSwitch
      ? {
          key: 'k',
          arm: 'control',
          bucket: 1,
          mode: 'shadow',
          runtime: 'off',
          reason: 'kill-switch',
        }
      : undefined,
    now: d.now,
    wallNow: d.wallNow,
    scheduler,
    random: () => 0.99,
  });
}

/** A session that runs in the foreground for `ms`, then goes to the background. */
async function session(d: ReturnType<typeof device>, store: VergerStore, ms: number) {
  const v = launcher(d, store);
  const plan = await v.start();
  v.dispatch({ type: 'app-state', at: d.now(), state: 'active' });
  d.pass(ms);
  v.dispatch({ type: 'app-state', at: d.now(), state: 'background' });
  await Promise.resolve();
  return { v, plan };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('verger launch', () => {
  it('runs fully on a healthy first launch, and writes its marker before any native call', async () => {
    const d = device();
    const store = asyncStore();
    const order: string[] = [];
    const set = store.set;
    store.set = async (key, value) => {
      if (key.endsWith(':session')) order.push(`marker:${JSON.parse(value).phase}`);
      await set(key, value);
    };
    const platform = d.platform;
    const v = createVerger({
      host: HOST,
      platform: () => {
        order.push('platform');
        return platform();
      },
      store,
      requested: 'active',
      now: d.now,
      wallNow: d.wallNow,
      scheduler,
      random: () => 0.99,
    });
    const plan = await v.start();
    expect(plan).toMatchObject({ runtime: 'active', rung: 0, hardware: true });
    expect(order.slice(0, 2)).toEqual(['marker:starting', 'platform']);
    expect(v.getSnapshot()?.mode).toBe('active');
  });

  it('touches nothing native under the kill switch', async () => {
    const d = device();
    const store = asyncStore();
    const plan = await launcher(d, store, { killSwitch: true }).start();
    expect(plan.runtime).toBe('off');
    expect(d.calls).toEqual([]);
    expect(store.data.size).toBe(0);
  });

  it('steps down after repeated foreground crashes and comes back after clean sessions', async () => {
    const d = device();
    const store = asyncStore();
    for (let i = 0; i < 2; i += 1) {
      const v = launcher(d, store);
      await v.start();
      d.pass(60_000);
      d.die('native-crash', true);
    }
    const third = launcher(d, store);
    expect((await third.start()).rung).toBe(1);
    d.pass(60_000);
    third.dispatch({ type: 'app-state', at: d.now(), state: 'background' });
    d.die('low-memory', false); // the system ending a hidden app is not a failure

    let rung = 1;
    for (let i = 0; i < 4 && rung > 0; i += 1) {
      const { plan } = await session(d, store, 60_000);
      rung = plan.rung;
      d.die(null, false);
    }
    const last = await launcher(d, store).start();
    expect(last.rung).toBe(0);
  });

  it('keeps verger off, native code included, after a death during native start', async () => {
    const d = device();
    const store = asyncStore();
    const first = launcher(d, store);
    // The process dies inside the starting stretch: simulate by never letting it reach `running`.
    d.failStart(true);
    vi.spyOn(console, 'error').mockImplementation(() => {});
    store.set = (() => {
      const set = store.set;
      return async (key: string, value: string) => {
        if (key.endsWith(':session') && JSON.parse(value).phase !== 'starting') return; // lost with the process
        await set(key, value);
      };
    })();
    await first.start().catch(() => {});
    d.die('native-crash', true);
    d.failStart(false);

    const store2: VergerStore = {
      get: (k) => store.data.get(k) ?? null,
      set: (k, v) => void store.data.set(k, v),
      remove: (k) => void store.data.delete(k),
    };
    d.calls.length = 0;
    const plan = await launcher(d, store2).start();
    expect(plan).toMatchObject({ runtime: 'off', rung: 4 });
    expect(d.calls).toEqual(['exits', 'capacity']); // read facts once to judge, started nothing
    d.calls.length = 0;
    d.die(null, false);
    const again = await launcher(d, store2).start();
    expect(again).toMatchObject({ runtime: 'off', rung: 4 });
    expect(d.calls).toEqual([]); // on rung 4 nothing native is touched at all
    // A new release gets another chance.
    expect((await launcher(d, store2, { release: '1.0.1' }).start()).rung).toBe(0);
  });

  it('fails closed when its own launch throws', async () => {
    const d = device();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const v = createVerger({
      host: HOST,
      platform: () => {
        throw new Error('no module');
      },
      store: asyncStore(),
      requested: 'active',
      now: d.now,
      wallNow: d.wallNow,
      scheduler,
    });
    expect((await v.start()).runtime).toBe('off');
    expect(v.getSnapshot()).toBeNull();
  });

  it('stop then start (as React strict mode does) runs two orderly launches', async () => {
    const d = device();
    const store = asyncStore();
    const v = launcher(d, store);
    const a = v.start();
    const stopped = v.stop();
    const b = v.start();
    await Promise.all([a, stopped, b]);
    expect((await b).runtime).toBe('active');
    expect(d.calls.filter((c) => c === 'start')).toHaveLength(2);
    expect(d.calls.filter((c) => c === 'stop')).toHaveLength(1);
    await v.stop();
    const record = parseRecord(store.data.get('verger:sample:record'));
    expect(record?.ladder.rung).toBe(0);
    expect(JSON.parse(store.data.get('verger:sample:session') ?? '{}').phase).toBe('stopped');
  });

  it('sends the flight record home once, after a failed session', async () => {
    const d = device();
    const store = asyncStore();
    const v = launcher(d, store);
    await v.start();
    v.dispatch({ type: 'thermal', at: d.now(), status: 'severe', headroom: 0.97 });
    v.dispatch({ type: 'app-state', at: d.now(), state: 'inactive' }); // forces a persist
    await Promise.resolve();
    d.die('anr', true);
    const events: [string, Readonly<Record<string, TelemetryValue>>][] = [];
    const second = launcher(d, store, { sink: (n, a) => events.push([n, a]) });
    await second.start();
    const launch = events.find(([n]) => n === 'verger_launch')?.[1];
    expect(launch).toMatchObject({ last: 'failure', cause: 'anr', trust: 0.25 });
    const flight = events.find(([n]) => n === 'verger_flight')?.[1];
    expect(String(flight?.record)).toMatch(/hot/);
    expect(store.data.has('verger:sample:flight')).toBe(true); // the new session's own record
    const events2: string[] = [];
    second.dispatch({ type: 'app-state', at: d.now(), state: 'background' });
    await Promise.resolve();
    d.die(null, false);
    await launcher(d, store, { sink: (n) => events2.push(n) }).start();
    expect(events2).not.toContain('verger_flight');
  });

  it('runs without a store, with no memory and no learned profile', async () => {
    const d = device();
    const plan = await launcher(d, undefined).start();
    expect(plan).toMatchObject({
      runtime: 'active',
      rung: 0,
      reason: 'no-store',
      prior: {},
      grant: 0,
    });
  });
});
