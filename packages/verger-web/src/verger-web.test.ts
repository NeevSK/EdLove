import {
  createVerger,
  defineHost,
  VERGER_GLOBAL_MOTION,
  type VergerEvent,
} from '@repo/verger-core';
import { describe, expect, it } from 'vitest';
import type { BrowserBattery, BrowserConnection, BrowserNavigator } from './browser';
import { batteryEventOfBrowser, capacityOfBrowser, networkEventOfBrowser } from './mapping';
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
