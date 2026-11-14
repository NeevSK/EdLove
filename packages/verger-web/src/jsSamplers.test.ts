import { observeEventLoopLag, observeJsHeap } from '@repo/verger-react';
import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('event-loop lag sampler', () => {
  it('reports each window’s worst lateness; a stall on the JS thread shows as lag', () => {
    vi.useFakeTimers();
    let clock = 0;
    const now = () => clock;
    const lags: number[] = [];
    const stop = observeEventLoopLag((lag) => lags.push(lag), () => false, now, 500, 2000);
    // Four on-time ticks: a window with no lag.
    for (let i = 0; i < 4; i += 1) {
      clock += 500;
      vi.advanceTimersByTime(500);
    }
    expect(lags).toEqual([0]);
    // The thread is busy for 300 ms past a tick's due time.
    clock += 800;
    vi.advanceTimersByTime(500);
    for (let i = 0; i < 3; i += 1) {
      clock += 500;
      vi.advanceTimersByTime(500);
    }
    expect(lags.at(-1)).toBe(300);
    stop();
  });

  it('measures nothing while hidden, nor on the first tick back', () => {
    vi.useFakeTimers();
    let clock = 0;
    let hidden = true;
    const lags: number[] = [];
    const stop = observeEventLoopLag((lag) => lags.push(lag), () => hidden, () => clock, 500, 1000);
    // A throttled background timer fires 60 s late.
    clock += 60_000;
    vi.advanceTimersByTime(500);
    hidden = false;
    clock += 5_000; // the first tick back is late too
    vi.advanceTimersByTime(500);
    for (let i = 0; i < 3; i += 1) {
      clock += 500;
      vi.advanceTimersByTime(500);
    }
    expect(lags).toEqual([0]);
    stop();
  });
});

describe('Hermes GC sampler', () => {
  it('reports the share of wall time in GC pauses (js_gcTime is in seconds)', () => {
    vi.useFakeTimers();
    let clock = 0;
    let gcSeconds = 1;
    vi.stubGlobal('HermesInternal', {
      getInstrumentedStats: () => ({ js_gcTime: gcSeconds, js_allocatedBytes: 4_000_000 }),
    });
    const samples: [number, number | null][] = [];
    const stop = observeJsHeap((share, bytes) => samples.push([share, bytes]), () => false, () => clock, 10_000);
    gcSeconds += 0.5; // 500 ms of pauses in 10 s
    clock += 10_000;
    vi.advanceTimersByTime(10_000);
    expect(samples).toEqual([[0.05, 4_000_000]]);
    stop();
  });

  it('is inert off Hermes', () => {
    vi.useFakeTimers();
    const samples: number[] = [];
    const stop = observeJsHeap((share) => samples.push(share), () => false, () => 0, 10);
    vi.advanceTimersByTime(100);
    expect(samples).toEqual([]);
    stop();
  });
});
