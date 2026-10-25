import { afterEach, describe, expect, it, vi } from 'vitest';
import { SAMPLE_LEVERS } from './__fixtures__/sampleHost';
import {
  type CapacityFacts,
  createVerger,
  defineHost,
  type ExitRecord,
  freshRecord,
  type VergerEvent,
  parseRecord,
  policyKey,
  type RuntimePort,
  type TelemetryValue,
  type VergerPlatform,
  FLOORS_ACTIVATION,
  type VergerStore,
  vergerFloors,
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
function asyncStore(): VergerStore & { data: Map<string, string>; dead: boolean } {
  const data = new Map<string, string>();
  const store = {
    data,
    // A dead process's writes never land.
    dead: false,
    get: async (key: string) => data.get(key) ?? null,
    set: async (key: string, value: string) => {
      if (!store.dead) data.set(key, value);
    },
    remove: async (key: string) => {
      if (!store.dead) data.delete(key);
    },
  };
  return store;
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
        start(_config, _onEvent: (event: VergerEvent) => void) {
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

function options(d: ReturnType<typeof device>, store: VergerStore | undefined) {
  return {
    host: HOST,
    platform: d.platform,
    store,
    requested: 'active' as const,
    release: '1.0.0',
    now: d.now,
    wallNow: d.wallNow,
    scheduler,
    random: () => 0.99,
  };
}

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
      release: '1.0.0',
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

  it('after a death during native start, the next launch calls nothing native at all', async () => {
    const d = device();
    const store = asyncStore();
    // The process dies inside the starting stretch: once native code is touched, no write of
    // this process reaches the store again.
    await createVerger({
      ...options(d, store),
      platform: () => {
        store.dead = true;
        throw new Error('process killed');
      },
    })
      .start()
      .catch(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    store.dead = false;
    d.die('native-crash', true);

    d.calls.length = 0;
    const plan = await launcher(d, store).start();
    expect(plan).toMatchObject({ runtime: 'off', rung: 4 });
    expect(d.calls).toEqual([]); // judged from the store alone: a native fault cannot loop
    d.die(null, false);
    const again = await launcher(d, store).start();
    expect(again).toMatchObject({ runtime: 'off', rung: 4 });
    expect(d.calls).toEqual([]);
    // A new release gets another chance.
    expect((await launcher(d, store, { release: '1.0.1' }).start()).rung).toBe(0);
  });

  it('a boot death under one release does not put the next release on rung 4', async () => {
    const d = device();
    const store = asyncStore();
    await createVerger({
      ...options(d, store),
      platform: () => {
        store.dead = true;
        throw new Error('process killed');
      },
    })
      .start()
      .catch(() => {});
    store.dead = false;
    d.die('native-crash', true);
    const plan = await launcher(d, store, { release: '1.0.1' }).start();
    expect(plan).toMatchObject({ runtime: 'active', rung: 0 });
  });

  it('stays off and writes nothing when the store cannot be read', async () => {
    const d = device();
    const store = asyncStore();
    store.data.set('verger:sample:record', 'held');
    store.get = async () => {
      throw new Error('SQLITE_BUSY');
    };
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const plan = await launcher(d, store).start();
    expect(plan).toMatchObject({ runtime: 'off', reason: 'store-unreadable' });
    expect(d.calls).toEqual([]);
    expect(store.data.get('verger:sample:record')).toBe('held');
  });

  it('stays off when the starting marker cannot be written', async () => {
    const d = device();
    const store = asyncStore();
    store.set = async () => {
      throw new Error('disk full');
    };
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const plan = await launcher(d, store).start();
    expect(plan).toMatchObject({ runtime: 'off', reason: 'store-unwritable' });
    expect(d.calls).toEqual([]);
  });

  it('starts from shadow, not from full, when the record is corrupt', async () => {
    const d = device();
    const store = asyncStore();
    store.data.set('verger:sample:record', '{"v":1,"key":');
    const plan = await launcher(d, store).start();
    expect(plan).toMatchObject({ runtime: 'shadow', rung: 3 });
  });

  it('fails closed when its own launch throws, and charges nothing later to verger', async () => {
    const d = device();
    const store = asyncStore();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const v = createVerger({
      ...options(d, store),
      platform: () => {
        throw new Error('no module');
      },
    });
    expect((await v.start()).runtime).toBe('off');
    // Off, verger publishes only its floors: nothing sensed, nothing on hardware.
    expect(v.getSnapshot()?.activation).toEqual(FLOORS_ACTIVATION);
    expect(JSON.parse(store.data.get('verger:sample:session') ?? '{}')).toMatchObject({
      runtime: 'off',
      phase: 'running',
    });
    d.die('crash', true); // an unrelated crash while verger was off
    const next = await launcher(d, store).start();
    expect(next).toMatchObject({ runtime: 'active', rung: 0 });
    expect(parseRecord(store.data.get('verger:sample:record'))?.ladder.failures).toEqual([]);
  });

  it('on a rung without hardware, never calls a hardware lever, not even to release', async () => {
    const d = device();
    const store = asyncStore();
    const record = freshRecord(
      `${policyKey(HOST.policy)}:${HOST.configHash}:1.0.0`,
      null,
      HOST.recovery,
    );
    store.data.set(
      'verger:sample:record',
      JSON.stringify({ ...record, ladder: { ...record.ladder, rung: 2 } }),
    );
    const v = launcher(d, store);
    expect((await v.start()).hardware).toBe(false);
    await v.stop();
    expect(d.calls.filter((c) => c.startsWith('refresh') || c.startsWith('boost'))).toEqual([]);
  });

  it('a record filed under the unnamed key format keeps its rung: migrated, not reset', async () => {
    const d = device();
    const store = asyncStore();
    // Written before policies had names: `p4:<config>:<release>`.
    const record = freshRecord(`p4:${HOST.configHash}:1.0.0`, null, HOST.recovery);
    store.data.set(
      'verger:sample:record',
      JSON.stringify({ ...record, ladder: { ...record.ladder, rung: 2 } }),
    );
    const v = launcher(d, store);
    const plan = await v.start();
    expect(plan.rung).toBe(2);
    expect(plan.hardware).toBe(false);
    await v.stop();
    const saved = parseRecord(store.data.get('verger:sample:record'));
    expect(saved?.key).toBe(`verger-p4:${HOST.configHash}:1.0.0`);
  });

  it('a second instance starts only after the first has stopped (one native singleton)', async () => {
    const d = device();
    const store = asyncStore();
    const a = launcher(d, store);
    await a.start();
    const stopping = a.stop();
    const b = launcher(d, store);
    await Promise.all([stopping, b.start()]);
    const lastStop = d.calls.lastIndexOf('stop');
    const lastStart = d.calls.lastIndexOf('start');
    expect(lastStop).toBeLessThan(lastStart);
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

describe('verger: the floors hold while verger is not running', () => {
  const LOW_RAM: CapacityFacts = {
    ...CAPACITY,
    totalMemoryBytes: 2 * 1024 ** 3,
    isLowRamDevice: true,
  };

  it('before start, settings and JS-only facts set the floors; nothing native or stored is touched', () => {
    const d = device();
    const store = asyncStore();
    const v = createVerger({ ...options(d, store), facts: () => LOW_RAM });
    const notified: number[] = [];
    v.subscribe(() => notified.push(1));
    // A low-memory phone: the ambient lever is floored even before any event.
    expect(v.getSnapshot()?.levels.sparkle).toBe(2);
    expect(v.getSnapshot()?.levels['rows-ahead']).toBe(1);
    v.dispatch({ type: 'preferences', at: 1, reduceMotion: false, fidelity: 'high' });
    // Fidelity high lifts the low-capacity floor, as the old governor did.
    expect(v.getSnapshot()?.levels.sparkle).toBe(0);
    v.dispatch({ type: 'preferences', at: 2, reduceMotion: true, fidelity: 'high' });
    expect(v.getSnapshot()?.levels.sparkle).toBe(2);
    v.dispatch({ type: 'power', at: 3, saver: true });
    expect(v.getSnapshot()?.levels['warm-ahead']).toBe(2);
    expect(notified.length).toBe(3);
    expect(d.calls).toEqual([]);
    expect(store.data.size).toBe(0);
  });

  it('the snapshot object is stable until an output changes', () => {
    const d = device();
    const v = createVerger({ ...options(d, asyncStore()), facts: () => CAPACITY });
    const first = v.getSnapshot();
    v.dispatch({ type: 'tick', at: 5 });
    v.dispatch({ type: 'interaction', at: 6 });
    expect(v.getSnapshot()).toBe(first);
  });

  it('senses nothing natively: frames, heat and memory events move no floor', () => {
    const d = device();
    const v = createVerger({ ...options(d, asyncStore()), facts: () => CAPACITY });
    const before = v.getSnapshot()?.levels;
    v.dispatch({ type: 'thermal', at: 1, status: 'critical', headroom: 1.2 });
    v.dispatch({ type: 'memory-trim', at: 2, severity: 'critical' });
    expect(v.getSnapshot()?.levels).toEqual(before);
  });

  it('under the kill switch the floors still follow settings', async () => {
    const d = device();
    const v = createVerger({
      ...options(d, asyncStore()),
      facts: () => CAPACITY,
      assignment: {
        key: 'k',
        arm: 'control',
        bucket: 1,
        mode: 'shadow',
        runtime: 'off',
        reason: 'kill-switch',
      },
    });
    expect((await v.start()).reason).toBe('kill-switch');
    v.dispatch({ type: 'preferences', at: 1, reduceMotion: false, fidelity: 'low' });
    expect(v.getSnapshot()?.levels.sparkle).toBe(2);
    expect(d.calls).toEqual([]);
  });

  it('after stop, the floors carry the settings heard while verger ran', async () => {
    const d = device();
    const v = createVerger({ ...options(d, asyncStore()), facts: () => CAPACITY });
    await v.start();
    v.dispatch({ type: 'preferences', at: 1, reduceMotion: true, fidelity: 'auto' });
    await v.stop();
    expect(v.getSnapshot()?.activation).toEqual(FLOORS_ACTIVATION);
    expect(v.getSnapshot()?.levels.sparkle).toBe(2);
  });

  it('facts that throw leave the device unknown, not verger broken', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const v = createVerger({
      ...options(device(), asyncStore()),
      facts: () => {
        throw new Error('no expo-device');
      },
    });
    // Unknown is not low memory, and an unknown phone is not proof a capability is missing.
    expect(v.getSnapshot()?.levels.sparkle).toBe(0);
    expect(v.getSnapshot()?.levels.frosting).toBe(0);
  });
});

describe('verger: host signals fill only what the platform does not sense', () => {
  it('while running, a native sensor wins over the same JS reading; the floors keep the JS one', async () => {
    const d = device();
    const v = createVerger({
      ...options(d, asyncStore()),
      facts: () => CAPACITY,
      platform: () => ({ ...d.platform(), senses: ['power'] }),
    });
    await v.start();
    v.signal({ type: 'power', at: 1, saver: true });
    expect(v.getSnapshot()?.powerSaver).toBe(false);
    await v.stop();
    expect(v.getSnapshot()?.powerSaver).toBe(true);
    expect(v.getSnapshot()?.levels.sparkle).toBe(2);
  });

  it('while running, a sensor the platform lacks is heard from JS', async () => {
    const d = device();
    const v = createVerger({ ...options(d, asyncStore()), facts: () => CAPACITY });
    await v.start();
    v.signal({ type: 'power', at: 1, saver: true });
    expect(v.getSnapshot()?.powerSaver).toBe(true);
  });
});

describe('vergerFloors: a reading without an app', () => {
  it('folds the readings into the floors and touches nothing else', () => {
    const snapshot = vergerFloors({
      host: HOST,
      events: [
        { type: 'power', at: 1, saver: true },
        { type: 'preferences', at: 2, reduceMotion: false, fidelity: 'auto' },
      ],
    });
    expect(snapshot?.powerSaver).toBe(true);
    expect(snapshot?.levels['warm-ahead']).toBe(2);
  });
});

describe('the floors hear the network from host signals', () => {
  it('a JS network reading sets the network limit while verger is off', () => {
    const v = createVerger({ ...options(device(), asyncStore()), facts: () => CAPACITY });
    v.signal({
      type: 'network',
      at: 1,
      transport: 'none',
      validated: false,
      metered: null,
      downKbps: null,
      dataSaver: null,
    });
    expect(v.getSnapshot()?.networkLimit).toBe('offline');
  });
});

describe('verger: loop 2 feeds its findings back to the policy (D4)', () => {
  it('a lever that never relieves strain, episode after episode, is reported to the policy once, and recorded', async () => {
    const d = device();
    const v = createVerger({ ...options(d, asyncStore()), recordEvents: 4000 });
    await v.start();
    v.dispatch({ type: 'app-state', at: d.now(), state: 'active' });
    const window = (averageMs: number, droppedRatio: number) => ({
      startMs: d.now() - 500,
      endMs: d.now(),
      frames: 30,
      averageMs,
      targetMs: 16.67,
      worstMs: averageMs * 2,
      droppedRatio,
    });
    // Three episodes of strain no lever relieves, each followed by calm that gives levels back:
    // a lever with two steps fails at most twice per episode, so the rule needs a second one.
    for (let episode = 0; episode < 3; episode += 1) {
      for (const [count, averageMs, dropped] of [[40, 40, 0.5], [240, 8, 0]] as const) {
        for (let i = 0; i < count; i += 1) {
          d.pass(500);
          v.dispatch({ type: 'interaction', at: d.now() - 1 });
          v.dispatch({ type: 'frame-window', at: d.now(), window: window(averageMs, dropped) });
          await Promise.resolve();
        }
      }
    }
    const findings = (v.recording()?.events ?? []).flatMap((e) =>
      e.type === 'lever-ineffective' ? [`${e.lever} ${e.target}`] : [],
    );
    expect(findings.length).toBeGreaterThan(0);
    expect(new Set(findings).size).toBe(findings.length);
  });
});
