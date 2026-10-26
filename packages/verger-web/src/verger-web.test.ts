import {
  createVerger,
  defineHost,
  VERGER_GLOBAL_MOTION,
  type VergerEvent,
} from '@repo/verger-core';
import { observeInputDelay } from '@repo/verger-react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type {
  BrowserBattery,
  BrowserConnection,
  BrowserNavigator,
  BrowserPressureRecord,
} from './browser';
import {
  batteryEventOfBrowser,
  capacityOfBrowser,
  networkEventOfBrowser,
  storageEventOfEstimate,
} from './mapping';
import { browserStore, createVergerBrowserPlatform } from './platform';
import { browserSignals } from './signals';

const GIB = 1024 ** 3;

/** A minimal EventTarget-backed fake, so listeners are real. */
function connection(over: Partial<BrowserConnection>): BrowserConnection {
  return Object.assign(new EventTarget(), over);
}

describe('browser readings as verger events', () => {
  it('device memory and cores are the only facts; the rest stays unknown', () => {
    expect(capacityOfBrowser({ deviceMemory: 4, hardwareConcurrency: 8 })).toMatchObject({
      totalMemoryBytes: 4 * GIB,
      cpuCores: 8,
      sdkInt: null,
      supportsRenderEffect: false,
    });
    expect(capacityOfBrowser({}).totalMemoryBytes).toBeNull();
  });

  it('offline is known; online does not prove the internet is reachable', () => {
    expect(networkEventOfBrowser({ onLine: false }, 1)).toMatchObject({
      transport: 'none',
      validated: false,
    });
    expect(networkEventOfBrowser({ onLine: true }, 1)).toMatchObject({
      transport: null,
      validated: null,
      metered: null,
      downKbps: null,
      dataSaver: null,
    });
  });

  it('Network Information: bandwidth in kbps, Save-Data as the user Data Saver', () => {
    const event = networkEventOfBrowser(
      {
        onLine: true,
        connection: connection({ type: 'cellular', downlink: 0.45, saveData: true }),
      },
      2,
    );
    expect(event).toMatchObject({ transport: 'cellular', downKbps: 450, dataSaver: 'enabled' });
  });

  it('Battery Status: charging is plugged in; a full battery not charging is unknown', () => {
    expect(batteryEventOfBrowser({ level: 0.15, charging: false }, 0)).toMatchObject({
      levelPercent: 15,
      pluggedIn: false,
    });
    expect(batteryEventOfBrowser({ level: 0.5, charging: true }, 0)).toMatchObject({
      pluggedIn: true,
    });
    expect(batteryEventOfBrowser({ level: 1, charging: false }, 0)).toMatchObject({
      pluggedIn: null,
    });
  });
});

describe('storage and input delay from the browser (B4, B7)', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('the storage estimate: what the origin may still write; unknown when either half is missing', () => {
    expect(storageEventOfEstimate({ quota: 1000, usage: 400 }, 3)).toEqual({ type: 'storage', at: 3, freeBytes: 600 });
    expect(storageEventOfEstimate({ quota: 100, usage: 400 }, 3)).toMatchObject({ freeBytes: 0 });
    expect(storageEventOfEstimate({ usage: 400 }, 3)).toMatchObject({ freeBytes: null });
  });

  it('browserSignals reads the estimate at start and on focus', async () => {
    const win = new EventTarget();
    const events: VergerEvent[] = [];
    const nav: BrowserNavigator = { onLine: true, storage: { estimate: async () => ({ quota: 10, usage: 4 }) } };
    const stop = browserSignals({ window: win as Window, navigator: nav }, (e) => events.push(e), () => 1);
    await Promise.resolve();
    await Promise.resolve();
    win.dispatchEvent(new Event('focus'));
    await Promise.resolve();
    await Promise.resolve();
    expect(events.filter((e) => e.type === 'storage')).toHaveLength(2);
    stop();
    win.dispatchEvent(new Event('focus'));
    await Promise.resolve();
    await Promise.resolve();
    expect(events.filter((e) => e.type === 'storage')).toHaveLength(2);
  });

  it('input delay is processingStart minus startTime of Event Timing entries; inert without them', () => {
    type Deliver = (list: { getEntries(): readonly { startTime: number; processingStart?: number }[] }) => void;
    const fake: { deliver: Deliver | null } = { deliver: null };
    const observed: unknown[] = [];
    class FakeObserver {
      static supportedEntryTypes = ['event'];
      constructor(callback: Deliver) {
        fake.deliver = callback;
      }
      observe(options: unknown) {
        observed.push(options);
      }
      disconnect() {
        fake.deliver = null;
      }
    }
    vi.stubGlobal('PerformanceObserver', FakeObserver);
    const delays: number[] = [];
    const stop = observeInputDelay((d) => delays.push(d));
    expect(observed).toEqual([{ type: 'event', durationThreshold: 104 }]);
    fake.deliver?.({ getEntries: () => [{ startTime: 100, processingStart: 250 }, { startTime: 5 }, { startTime: 10, processingStart: 4 }] });
    expect(delays).toEqual([150]);
    stop();
    expect(fake.deliver).toBeNull();
    vi.stubGlobal('PerformanceObserver', class { static supportedEntryTypes = ['longtask']; });
    expect(observeInputDelay(() => {})).toBeTypeOf('function');
  });
});

describe('browserSignals', () => {
  it('reports the network at start and on every change, and stops cleanly', async () => {
    const win = new EventTarget();
    const conn = connection({ downlink: 10 });
    const battery: BrowserBattery = Object.assign(new EventTarget(), {
      level: 0.9,
      charging: false,
    });
    const nav: BrowserNavigator = {
      onLine: true,
      connection: conn,
      getBattery: async () => battery,
    };
    const events: VergerEvent[] = [];
    const stop = browserSignals(
      { window: win as Window, navigator: nav },
      (e) => events.push(e),
      () => 7,
    );
    await Promise.resolve();
    await Promise.resolve();
    expect(events.map((e) => e.type)).toEqual(['network', 'battery']);
    conn.dispatchEvent(new Event('change'));
    battery.dispatchEvent(new Event('levelchange'));
    expect(events.map((e) => e.type)).toEqual(['network', 'battery', 'network', 'battery']);
    stop();
    win.dispatchEvent(new Event('offline'));
    battery.dispatchEvent(new Event('chargingchange'));
    expect(events).toHaveLength(4);
  });

  it('works where the browser has neither Network Information nor Battery Status', () => {
    const events: VergerEvent[] = [];
    const stop = browserSignals(
      { window: new EventTarget() as Window, navigator: { onLine: false } },
      (e) => events.push(e),
      () => 0,
    );
    expect(events).toEqual([expect.objectContaining({ type: 'network', transport: 'none' })]);
    stop();
  });

  /** A fake Compute Pressure observer: records reach `emit`, observe resolves or rejects. */
  function pressureFake(observe: () => Promise<void>) {
    const made: { emit: (records: readonly BrowserPressureRecord[]) => void; disconnected: boolean; options?: unknown }[] = [];
    class FakePressureObserver {
      private readonly entry: (typeof made)[number];
      constructor(callback: (records: readonly BrowserPressureRecord[]) => void) {
        this.entry = { emit: callback, disconnected: false };
        made.push(this.entry);
      }
      observe(_source: 'cpu', options?: { readonly sampleInterval?: number }) {
        this.entry.options = options;
        return observe();
      }
      disconnect() {
        this.entry.disconnected = true;
      }
    }
    return { PressureObserver: FakePressureObserver, made };
  }

  it('compute pressure (R10): the last cpu record of a batch is an event; stop disconnects', () => {
    const { PressureObserver, made } = pressureFake(async () => undefined);
    const events: VergerEvent[] = [];
    const stop = browserSignals(
      { window: new EventTarget() as Window, navigator: { onLine: true }, PressureObserver },
      (e) => events.push(e),
      () => 3,
    );
    const observer = made[0];
    expect(observer?.options).toEqual({ sampleInterval: 2_000 });
    observer?.emit([
      { source: 'cpu', state: 'fair', time: 1 },
      { source: 'cpu', state: 'serious', time: 2 },
    ]);
    observer?.emit([]);
    expect(events.filter((e) => e.type === 'compute-pressure')).toEqual([
      { type: 'compute-pressure', at: 3, state: 'serious' },
    ]);
    stop();
    expect(observer?.disconnected).toBe(true);
    observer?.emit([{ source: 'cpu', state: 'critical', time: 3 }]);
    expect(events.filter((e) => e.type === 'compute-pressure')).toHaveLength(1);
  });

  it('compute pressure refused (no permission, no cpu source) only warns', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { PressureObserver } = pressureFake(() => Promise.reject(new Error('NotAllowedError')));
    const stop = browserSignals(
      { window: new EventTarget() as Window, navigator: { onLine: true }, PressureObserver },
      () => undefined,
      () => 0,
    );
    await Promise.resolve();
    await Promise.resolve();
    expect(warn).toHaveBeenCalledWith('[verger] compute pressure unavailable', expect.any(Error));
    stop();
    warn.mockRestore();
  });
});

describe('verger on the browser platform', () => {
  const HOST = defineHost({ name: 'web-sample', levers: [VERGER_GLOBAL_MOTION] });

  it('a launch runs with nothing native, and browser signals reach the running verger', async () => {
    const data = new Map<string, string>();
    const v = createVerger({
      host: HOST,
      platform: () => createVergerBrowserPlatform({ onLine: true, deviceMemory: 8 }),
      store: browserStore(() => ({
        getItem: (k) => data.get(k) ?? null,
        setItem: (k, value) => void data.set(k, value),
        removeItem: (k) => void data.delete(k),
      })),
      requested: 'active',
      release: 'web-1',
      now: () => 0,
      wallNow: () => 1_000,
    });
    expect((await v.start()).runtime).toBe('active');
    v.signal(networkEventOfBrowser({ onLine: false }, 1));
    expect(v.getSnapshot()?.networkLimit).toBe('offline');
    await v.stop();
  });

  it('a storage that throws keeps verger on its floors', async () => {
    const v = createVerger({
      host: HOST,
      platform: () => createVergerBrowserPlatform({ onLine: true }),
      store: browserStore(() => {
        throw new Error('SecurityError: storage is blocked');
      }),
      requested: 'active',
      release: 'web-1',
      now: () => 0,
    });
    const original = console.error;
    console.error = () => {};
    try {
      expect(await v.start()).toMatchObject({ runtime: 'off', reason: 'store-unreadable' });
    } finally {
      console.error = original;
    }
  });
});
