import { describe, expect, it } from 'vitest';
import { SAMPLE_LEVERS } from './__fixtures__/sampleHost';
import { parseDataLedger } from './dataBudget';
import { createVerger, defineHost, type RuntimePort, type VergerEvent, type VergerStore } from './index';
import { UNKNOWN_CAPACITY } from './reducer';

/** B3.1: the platform's byte counter, folded into the day's ledger and reported as the budget. */
const HOST = defineHost({ name: 'sample', levers: SAMPLE_LEVERS });
const MB = 1024 * 1024;
// 2026-10-25 10:00 in Colombo (UTC+05:30).
const MORNING = Date.UTC(2026, 9, 25, 4, 30);

function harness(allowance?: number, stored?: string) {
  const data = new Map<string, string>(stored ? [['verger:sample:data', stored]] : []);
  const store: VergerStore = {
    get: async (key) => data.get(key) ?? null,
    set: async (key, value) => void data.set(key, value),
    remove: async (key) => void data.delete(key),
  };
  let emit: ((event: VergerEvent) => void) | null = null;
  let wall = MORNING;
  const port: RuntimePort = {
    start(_config, onEvent) {
      emit = onEvent;
      return () => {};
    },
    setRefreshCap: () => {},
    setCpuBoost: () => {},
  };
  const verger = createVerger({
    host: HOST,
    platform: () => ({ readCapacity: () => UNKNOWN_CAPACITY, memorySensing: false, createPort: () => port }),
    store,
    requested: 'active',
    release: '1.0.0',
    now: () => 0,
    wallNow: () => wall,
    utcOffsetMinutes: () => 330,
    scheduler: { setTimeout: () => 0, clearTimeout: () => {} },
    random: () => 0.99,
    ...(allowance === undefined ? {} : { dataAllowanceBytes: allowance }),
  });
  return {
    verger,
    data,
    bytes: (totalBytes: number) => emit?.({ type: 'data-usage', at: 1, totalBytes }),
    pass: (ms: number) => {
      wall += ms;
    },
  };
}

describe('the data ledger (B3.1)', () => {
  it('counts this app’s bytes into the day, spends the allowance, and persists the ledger', async () => {
    const h = harness(50 * MB);
    await h.verger.start();
    expect(h.verger.getSnapshot()?.dataBudget).toBe('unknown');
    h.bytes(400 * MB);
    expect(h.verger.getSnapshot()?.dataBudget).toBe('within');
    h.bytes(440 * MB);
    expect(h.verger.getSnapshot()?.dataBudget).toBe('within');
    h.bytes(460 * MB);
    expect(h.verger.getSnapshot()?.dataBudget).toBe('spent');
    await Promise.resolve();
    expect(parseDataLedger(h.data.get('verger:sample:data') ?? null)).toEqual({
      day: '2026-10-25',
      usedBytes: 60 * MB,
      lastTotal: 460 * MB,
    });
  });

  it('a new local day is fresh again on the next sample, even without new traffic (the heartbeat)', async () => {
    const h = harness(50 * MB);
    await h.verger.start();
    h.bytes(0);
    h.bytes(60 * MB);
    expect(h.verger.getSnapshot()?.dataBudget).toBe('spent');
    h.pass(24 * 3_600_000);
    h.bytes(60 * MB);
    expect(h.verger.getSnapshot()?.dataBudget).toBe('within');
  });

  it('the ledger survives a relaunch; a stored ledger that is malformed is none', async () => {
    const stored = JSON.stringify({ day: '2026-10-25', usedBytes: 49 * MB, lastTotal: 100 * MB });
    const h = harness(50 * MB, stored);
    await h.verger.start();
    // A reboot since: the counter restarted, so its whole total is new traffic.
    h.bytes(2 * MB);
    expect(h.verger.getSnapshot()?.dataBudget).toBe('spent');
    expect(parseDataLedger('{"day":"25-10-2026","usedBytes":1,"lastTotal":1}')).toBeNull();
    expect(parseDataLedger('{"day":"2026-10-25","usedBytes":-1,"lastTotal":1}')).toBeNull();
    expect(parseDataLedger('not json')).toBeNull();
  });

  it('without an allowance (a chair) the budget stays unknown, never a limit; the ledger is kept', async () => {
    const h = harness();
    await h.verger.start();
    h.bytes(10 * MB);
    h.bytes(900 * MB);
    expect(h.verger.getSnapshot()?.dataBudget).toBe('unknown');
    await Promise.resolve();
    expect(parseDataLedger(h.data.get('verger:sample:data') ?? null)?.usedBytes).toBe(890 * MB);
  });

  it('an uncounted platform (negative total) changes nothing', async () => {
    const h = harness(50 * MB);
    await h.verger.start();
    h.bytes(-1);
    expect(h.verger.getSnapshot()?.dataBudget).toBe('unknown');
    expect(h.data.has('verger:sample:data')).toBe(false);
  });
});
