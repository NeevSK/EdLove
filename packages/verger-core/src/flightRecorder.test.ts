import { describe, expect, it } from 'vitest';
import { SAMPLE_LEVERS } from './__fixtures__/sampleHost';
import { createFlightRecorder, FLIGHT_RECORDER_SIZE, flightLine } from './flightRecorder';
import { createVergerState, reduceVerger, snapshotOf } from './reducer';
import type { VergerSnapshot } from './types';

describe('flightRecorder', () => {
  it('respects default ring size and retains newest entries FIFO', () => {
    const recorder = createFlightRecorder(0, 3);
    recorder.note('line-1');
    recorder.note('line-2');
    recorder.note('line-3');
    expect(recorder.lines()).toEqual(['line-1', 'line-2', 'line-3']);

    recorder.note('line-4');
    expect(recorder.lines()).toEqual(['line-2', 'line-3', 'line-4']);
  });

  it('interleaves note and record entries in order', () => {
    const state = createVergerState({ at: 1_000, levers: SAMPLE_LEVERS });
    const snap = snapshotOf(state);
    const recorder = createFlightRecorder(0, 5);

    recorder.note('START');
    recorder.record(snap);
    recorder.note('END');

    const lines = recorder.lines();
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe('START');
    expect(lines[1]).toContain('|');
    expect(lines[2]).toBe('END');
  });

  it('caps at FLIGHT_RECORDER_SIZE by default', () => {
    const recorder = createFlightRecorder(0);
    for (let i = 0; i < FLIGHT_RECORDER_SIZE + 10; i++) {
      recorder.note(`entry-${i}`);
    }
    const lines = recorder.lines();
    expect(lines).toHaveLength(FLIGHT_RECORDER_SIZE);
    expect(lines[0]).toBe('entry-10');
    expect(lines[FLIGHT_RECORDER_SIZE - 1]).toBe(`entry-${FLIGHT_RECORDER_SIZE + 9}`);
  });

  it('lines() returns a defensive shallow copy', () => {
    const recorder = createFlightRecorder(0);
    recorder.note('immutable-test');
    const copy = recorder.lines() as string[];
    copy.push('injected');
    expect(recorder.lines()).toHaveLength(1);
  });

  it('flightLine formats without screen attribution when screen is null', () => {
    const state = createVergerState({ at: 2_500, levers: SAMPLE_LEVERS });
    const snap = snapshotOf(state);
    expect(snap.screen).toBeNull();

    const line = flightLine(snap, 0);
    const parts = line.split('|');
    // seconds|action|frame|thermal|memory|visibility|contention|cap|boost|motion|reason|levels
    expect(parts[0]).toBe('2.5');
    expect(parts[1]).toBe(snap.lastAction);
    expect(parts[10]).not.toContain('[');
  });

  it('flightLine formats with screen attribution when screen is announced', () => {
    let state = createVergerState({ at: 1_000, levers: SAMPLE_LEVERS });
    state = reduceVerger(state, { type: 'screen', at: 1_200, name: 'workspace' });
    const snap = snapshotOf(state);
    expect(snap.screen).toBe('workspace');

    const line = flightLine(snap, 0);
    const parts = line.split('|');
    expect(parts[0]).toBe('1.2');
    expect(parts[10]).toMatch(/\[workspace\]$/);
  });

  it('flightLine formats lowered levels sorted alphabetically', () => {
    const baseSnap = snapshotOf(createVergerState({ at: 5_000, levers: SAMPLE_LEVERS }));
    const snapWithLevels: VergerSnapshot = {
      ...baseSnap,
      proposedLevels: {
        'rows-ahead': 2,
        sparkle: 1,
        frosting: 2,
      },
      contention: 'main',
      contentionExhausted: true,
      cpuBoost: true,
      globalReducedMotion: true,
      refreshCapHz: 60,
    };

    const line = flightLine(snapWithLevels, 0);
    const parts = line.split('|');
    expect(parts[6]).toBe('main!');
    expect(parts[7]).toBe('60');
    expect(parts[8]).toBe('B');
    expect(parts[9]).toBe('M');
    expect(parts[11]).toBe('frosting=2,rows-ahead=2,sparkle=1');
  });
});
