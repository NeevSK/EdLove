import { describe, expect, it } from 'vitest';
import { SAMPLE_LEVERS } from './__fixtures__/sampleHost';
import {
  classifySession,
  createVergerState,
  createSessionLedger,
  DEFAULT_RECOVERY_CONFIG as R,
  type ExitRecord,
  foldSession,
  freshRecord,
  parseMarker,
  parseRecord,
  planLaunch,
  qualityCost,
  reduceVerger,
  type SessionMarker,
  type SessionReport,
  snapshotOf,
  staticFloors,
  type VergerRecord,
} from './index';

const KEY = 'p4:abc:1.0';
const HOUR = 3_600_000;

const calm: SessionReport = {
  foregroundMs: 10 * 60_000,
  evidenceMs: 10 * 60_000,
  stressedMs: 0,
  worstThermal: 'nominal',
  worstMemory: 'normal',
  contentionExhausted: false,
  qualityCost: 0,
  pressure: {},
};

const marker = (overrides: Partial<SessionMarker> = {}): SessionMarker => ({
  v: 1,
  key: KEY,
  pid: null,
  startedAtWall: 1_000,
  phase: 'running',
  foreground: false,
  runtime: 'active',
  rung: 0,
  exercise: false,
  report: calm,
  ...overrides,
});

const crash = (at: number, reason: ExitRecord['reason'] = 'crash'): ExitRecord => ({
  reason,
  atWallMs: at,
  foreground: true,
});

function fold(
  record: VergerRecord,
  m: SessionMarker | null,
  exits: ExitRecord[] | null,
  nowWall: number,
  device: string | null = 'dev1',
) {
  // Each simulated session gets its own start time: a marker is folded only once.
  const own = m && m.startedAtWall === 1_000 ? { ...m, startedAtWall: nowWall - 500 } : m;
  return foldSession(record, classifySession(own, exits), { key: KEY, device, nowWall }, R).record;
}

describe('judging how the last session ended', () => {
  it('takes the first exit after the session started, not an older or later one', () => {
    const exits = [
      crash(500),
      { reason: 'low-memory' as const, atWallMs: 2_000, foreground: false },
      crash(9_000),
    ];
    const outcome = classifySession(marker(), exits);
    expect(outcome).toMatchObject({ kind: 'clean', exit: 'low-memory' });
  });

  it('counts a crash, a native crash, an ANR and excessive resource use as failures', () => {
    for (const reason of ['crash', 'native-crash', 'anr', 'excessive-resource'] as const) {
      expect(classifySession(marker(), [crash(2_000, reason)])).toMatchObject({
        kind: 'failure',
        cause: reason,
      });
    }
  });

  it('without an exit record, a visible death is a failure and a hidden one is not', () => {
    expect(classifySession(marker({ foreground: true }), null)).toMatchObject({
      kind: 'failure',
      cause: 'unclean',
    });
    expect(classifySession(marker({ foreground: false }), null)).toMatchObject({ kind: 'clean' });
    expect(classifySession(marker({ foreground: true }), [])).toMatchObject({
      kind: 'failure',
      cause: 'unclean',
    });
  });

  it('marks a death before the native side was up as a boot failure', () => {
    expect(classifySession(marker({ phase: 'starting', foreground: true }), null)).toMatchObject({
      kind: 'failure',
      boot: true,
    });
    // ...unless the platform says the system ended it: then it is strain, not blame.
    expect(
      classifySession(marker({ phase: 'starting' }), [
        { reason: 'low-memory', atWallMs: 2_000, foreground: true },
      ]),
    ).toMatchObject({ kind: 'neutral' });
  });

  it('a clean stop is clean whatever the exits say', () => {
    expect(classifySession(marker({ phase: 'stopped' }), [crash(2_000)])).toMatchObject({
      kind: 'clean',
    });
  });
});

describe('the recovery ladder', () => {
  it('steps down one rung at the restart intensity, not on the first failure', () => {
    let record = freshRecord(KEY, 'dev1', R);
    record = fold(record, marker(), [crash(2_000)], 2_000);
    expect(record.ladder.rung).toBe(0);
    record = fold(record, marker({ startedAtWall: 3_000 }), [crash(4_000)], 4_000);
    expect(record.ladder.rung).toBe(1);
  });

  it('forgets failures older than the window', () => {
    let record = freshRecord(KEY, 'dev1', R);
    record = fold(record, marker(), [crash(2_000)], 2_000);
    record = fold(
      record,
      marker({ startedAtWall: 25 * HOUR }),
      [crash(25 * HOUR + 1)],
      25 * HOUR + 1,
    );
    expect(record.ladder.rung).toBe(0);
    expect(record.ladder.failures).toHaveLength(1);
  });

  it('goes straight to off on a boot failure, and off is not left by waiting', () => {
    let record = freshRecord(KEY, 'dev1', R);
    record = fold(record, marker({ phase: 'starting', foreground: true }), null, 2_000);
    expect(record.ladder.rung).toBe(4);
    expect(planLaunch(record, 'active', 0.5, R)).toMatchObject({ runtime: 'off', rung: 4 });
    for (let i = 0; i < 20; i += 1)
      record = fold(record, marker({ runtime: 'off', rung: 4 }), null, 3_000 + i);
    expect(record.ladder.rung).toBe(4);
  });

  it('a new policy or release starts the ladder over but keeps what was learned about the device', () => {
    let record = freshRecord(KEY, 'dev1', R);
    record = fold(record, marker({ phase: 'starting', foreground: true }), null, 2_000);
    record = { ...record, profile: { ...record.profile, prior: { 'rows-ahead': 1 } } };
    const next = foldSession(
      record,
      { kind: 'none' },
      { key: 'p5:abc:1.1', device: 'dev1', nowWall: 5_000 },
      R,
    ).record;
    expect(next.ladder.rung).toBe(0);
    expect(next.profile.prior).toEqual({ 'rows-ahead': 1 });
  });

  it('climbs back one rung per run of clean sessions, more slowly after each relapse', () => {
    let record: VergerRecord = {
      ...freshRecord(KEY, 'dev1', R),
      ladder: { rung: 2, failures: [], clean: 0, relapses: 1 },
    };
    for (let i = 0; i < R.cleanToRecover - 1; i += 1)
      record = fold(record, marker({ rung: 2 }), null, 10_000 + i);
    expect(record.ladder.rung).toBe(2);
    record = fold(record, marker({ rung: 2 }), null, 20_000);
    expect(record.ladder.rung).toBe(1);

    record = { ...record, ladder: { ...record.ladder, rung: 2, relapses: 2 } };
    for (let i = 0; i < R.cleanToRecover; i += 1)
      record = fold(record, marker({ rung: 2 }), null, 30_000 + i);
    expect(record.ladder.rung).toBe(2); // needs twice as many now
    for (let i = 0; i < R.cleanToRecover; i += 1)
      record = fold(record, marker({ rung: 2 }), null, 40_000 + i);
    expect(record.ladder.rung).toBe(1);
  });

  it('ignores sessions verger did not run in, and sessions too short to show anything', () => {
    const start = {
      ...freshRecord(KEY, 'dev1', R),
      ladder: { rung: 2 as const, failures: [], clean: 0, relapses: 1 },
    };
    expect(fold(start, marker({ runtime: 'off', foreground: true }), null, 2_000).ladder).toEqual(
      start.ladder,
    );
    const short = marker({ report: { ...calm, foregroundMs: 5_000 } });
    expect(fold(start, short, null, 2_000).ladder.clean).toBe(0);
  });

  it('each rung removes one more suspect', () => {
    const at = (rung: 0 | 1 | 2 | 3) => ({
      ...freshRecord(KEY, 'dev1', R),
      ladder: { rung, failures: [], clean: 0, relapses: 0 },
      profile: { device: 'dev1', trust: 1, grant: 2, proving: 0, prior: { 'rows-ahead': 1.4 } },
    });
    expect(planLaunch(at(0), 'active', 0.9, R)).toMatchObject({
      runtime: 'active',
      hardware: true,
      grant: 2,
      prior: { 'rows-ahead': 1 },
    });
    expect(planLaunch(at(1), 'active', 0.9, R)).toMatchObject({
      runtime: 'active',
      hardware: true,
      grant: 0,
      prior: {},
    });
    expect(planLaunch(at(2), 'active', 0.9, R)).toMatchObject({
      runtime: 'active',
      hardware: false,
    });
    expect(planLaunch(at(3), 'active', 0.9, R)).toMatchObject({
      runtime: 'shadow',
      hardware: false,
    });
    // The request is a ceiling the ladder only lowers.
    expect(planLaunch(at(0), 'shadow', 0.9, R).runtime).toBe('shadow');
  });

  it('exercises degraded paths on a configured share of healthy launches', () => {
    const config = { ...R, exercisePercent: 10 };
    const record = freshRecord(KEY, 'dev1', config);
    expect(planLaunch(record, 'active', 0.05, config)).toMatchObject({
      exercise: true,
      hardware: false,
    });
    expect(planLaunch(record, 'active', 0.5, config)).toMatchObject({
      exercise: false,
      hardware: true,
    });
    expect(planLaunch(record, 'shadow', 0.05, config).exercise).toBe(false);
  });
});

describe('trust and growth', () => {
  it('trust halves on a failure and grows a little per clean session', () => {
    let record = freshRecord(KEY, 'dev1', R);
    record = fold(record, marker(), null, 2_000);
    expect(record.profile.trust).toBeCloseTo(0.6);
    record = fold(record, marker({ foreground: true }), null, 3_000);
    expect(record.profile.trust).toBeCloseTo(0.3);
  });

  it('grows one step after proving sessions at high trust, and gives it back at once on strain', () => {
    let record: VergerRecord = {
      ...freshRecord(KEY, 'dev1', R),
      profile: { device: 'dev1', trust: 0.9, grant: 0, proving: 0, prior: {} },
    };
    for (let i = 0; i < R.provingSessionsToGrow; i += 1)
      record = fold(record, marker(), null, 10_000 + i);
    expect(record.profile.grant).toBe(1);
    record = fold(record, marker({ report: { ...calm, worstThermal: 'hot' } }), null, 20_000);
    expect(record.profile.grant).toBe(0);
  });

  it('does not grow at low trust, in shadow, on a lower rung or in an exercise session', () => {
    const fresh = freshRecord(KEY, 'dev1', R);
    const low: VergerRecord = { ...fresh, profile: { ...fresh.profile, trust: 0.2 } };
    let record = low;
    for (let i = 0; i < 3; i += 1) record = fold(record, marker(), null, 10_000 + i);
    expect(record.profile.grant).toBe(0);
    const high: VergerRecord = { ...low, profile: { ...low.profile, trust: 1 } };
    for (const m of [
      marker({ runtime: 'shadow' }),
      marker({ rung: 1 }),
      marker({ exercise: true }),
    ]) {
      let r = high;
      for (let i = 0; i < 5; i += 1) r = fold(r, m, null, 10_000 + i);
      expect(r.profile.grant).toBe(0);
    }
  });

  it('learns a starting point from where the loop held levers, and relearns after a system update', () => {
    let record: VergerRecord = {
      ...freshRecord(KEY, 'dev1', R),
      profile: { device: 'dev1', trust: 0.9, grant: 0, proving: 0, prior: {} },
    };
    const held = marker({ report: { ...calm, pressure: { 'rows-ahead': 2 } } });
    record = fold(record, held, null, 10_000);
    record = fold(record, held, null, 11_000);
    expect(record.profile.prior['rows-ahead']).toBeCloseTo(1.5);
    expect(planLaunch(record, 'active', 0.9, R).prior).toEqual({ 'rows-ahead': 1 });
    const updated = fold(record, marker(), null, 12_000, 'dev2');
    // A fresh profile for the new build, credited with the clean session that revealed it.
    expect(updated.profile).toMatchObject({
      device: 'dev2',
      trust: R.trustInitial + R.trustPerCleanSession,
      prior: {},
      grant: 0,
    });
  });

  it('a granted device gets its capacity floors back in the reducer', () => {
    const capacity = {
      totalMemoryBytes: 2 * 1024 ** 3,
      isLowRamDevice: false,
      memoryClassMb: 192,
      sdkInt: 33,
      cpuCores: 8,
      refreshRateHz: 60,
      supportsRenderEffect: true,
      supportsRuntimeShader: true,
      refreshRatesHz: [60],
      supportsCpuHints: false,
    };
    const floors = (grant: number) =>
      staticFloors(
        createVergerState({ at: 0, capacity, levers: SAMPLE_LEVERS, capacityGrant: grant }),
      );
    expect(floors(0)).toMatchObject({ sparkle: 2, 'rows-ahead': 1 });
    expect(floors(1)).toMatchObject({ sparkle: 2 });
    expect(floors(1)['rows-ahead'] ?? 0).toBe(0);
    expect(floors(2).sparkle ?? 0).toBe(0);
  });

  it('a starting point enters the stack, so the closed loop gives it back like its own decreases', () => {
    const state = createVergerState({
      at: 0,
      levers: SAMPLE_LEVERS,
      initialPressure: { 'rows-ahead': 1, frosting: 1, 'global-motion': 1 },
    });
    expect(state.pressure).toEqual({ 'rows-ahead': 1, frosting: 1 }); // containment lever excluded
    expect(state.stack[state.stack.length - 1]).toBe('frosting'); // most visible first back
    // Held, not chosen: the profile does not learn from its own starting point.
    expect(snapshotOf(state).priorHeld).toEqual({ 'rows-ahead': 1, frosting: 1 });
    expect(snapshotOf(state).pressure).toEqual({});
  });

  it('hardware off holds every hardware output at the system default', () => {
    const capacity = {
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
    };
    const on = snapshotOf(createVergerState({ at: 0, capacity, levers: SAMPLE_LEVERS }), 20_000);
    const off = snapshotOf(
      createVergerState({ at: 0, capacity, levers: SAMPLE_LEVERS, hardware: false }),
      20_000,
    );
    expect(on.refreshCapHz).toBe(60); // idle cap
    expect(off.refreshCapHz).toBeNull();
    expect(off.cpuBoost).toBe(false);
  });
});

describe('measurement', () => {
  it('quality cost weighs levels by visual impact', () => {
    const levers = SAMPLE_LEVERS.filter((l) => l.id === 'sparkle' || l.id === 'frosting');
    expect(qualityCost({}, levers)).toBe(0);
    expect(qualityCost({ sparkle: 2, frosting: 2 }, levers)).toBe(1);
    expect(qualityCost({ frosting: 2 }, levers)).toBeCloseTo(2 / 3);
  });

  it('the session ledger counts only foreground time', () => {
    const ledger = createSessionLedger(SAMPLE_LEVERS);
    const base = snapshotOf(createVergerState({ at: 0, levers: SAMPLE_LEVERS }));
    ledger.onSnapshot({ ...base, at: 0, frameState: 'stressed' });
    ledger.onSnapshot({ ...base, at: 1_000, visibility: 'background' });
    ledger.onSnapshot({ ...base, at: 5_000 });
    const report = ledger.report(6_000);
    expect(report.foregroundMs).toBe(2_000);
    expect(report.stressedMs).toBe(1_000);
  });
});

describe('persistence is strict', () => {
  it('round-trips a record and a marker', () => {
    const record = freshRecord(KEY, 'dev1', R);
    expect(parseRecord(JSON.stringify(record))).toEqual(record);
    expect(parseMarker(JSON.stringify(marker()))).toEqual(marker());
  });

  it('treats anything malformed as absent', () => {
    for (const text of [
      null,
      '',
      '{',
      '[]',
      '{"v":2}',
      JSON.stringify({ ...freshRecord(KEY, null, R), ladder: { rung: 7 } }),
    ]) {
      expect(parseRecord(text)).toBeNull();
    }
    expect(parseMarker(JSON.stringify({ ...marker(), phase: 'flying' }))).toBeNull();
    expect(parseMarker(JSON.stringify({ ...marker(), report: { foregroundMs: -1 } }))).toBeNull();
    expect(
      parseRecord(
        JSON.stringify({
          ...freshRecord(KEY, null, R),
          profile: { ...freshRecord(KEY, null, R).profile, trust: Number.NaN },
        }),
      ),
    ).toBeNull();
  });
});

describe('review fixes', () => {
  it('charges a session only with its own process exit when both sides carry a pid', () => {
    const mine = marker({ pid: 42 });
    const exits: ExitRecord[] = [
      { reason: 'crash', atWallMs: 2_000, foreground: true, pid: 7 }, // another process
      { reason: 'low-memory', atWallMs: 3_000, foreground: false, pid: 42 },
    ];
    expect(classifySession(mine, exits)).toMatchObject({ kind: 'clean', exit: 'low-memory' });
    // No exit of its own: falls back to the marker (hidden, so clean).
    expect(classifySession(mine, [exits[0] as ExitRecord])).toMatchObject({
      kind: 'clean',
      exit: null,
    });
  });

  it('a visible kill for memory is strain: no clean credit, no trust, growth given back', () => {
    const start: VergerRecord = {
      ...freshRecord(KEY, 'dev1', R),
      ladder: { rung: 1, failures: [], clean: 0, relapses: 1 },
      profile: { device: 'dev1', trust: 0.7, grant: 1, proving: 2, prior: {} },
    };
    let record = start;
    for (let i = 0; i < 5; i += 1) {
      record = fold(
        record,
        marker({ startedAtWall: 10_000 + i * 10 }),
        [{ reason: 'low-memory', atWallMs: 10_001 + i * 10, foreground: true }],
        10_005 + i * 10,
      );
    }
    expect(record.ladder).toEqual(start.ladder);
    expect(record.profile).toMatchObject({ trust: 0.7, grant: 0, proving: 0 });
  });

  it('never counts the same session twice', () => {
    const m = marker({ startedAtWall: 5_000, foreground: true });
    let record = freshRecord(KEY, 'dev1', R);
    record = foldSession(
      record,
      classifySession(m, null),
      { key: KEY, device: 'dev1', nowWall: 6_000 },
      R,
    ).record;
    record = foldSession(
      record,
      classifySession(m, null),
      { key: KEY, device: 'dev1', nowWall: 7_000 },
      R,
    ).record;
    expect(record.ladder.failures).toHaveLength(1);
  });

  it('the closed loop gives a starting point back once frames are calm, and learns nothing from it on a still screen', () => {
    const window = (at: number, averageMs: number) => ({
      type: 'frame-window' as const,
      at,
      window: {
        startMs: at - 500,
        endMs: at,
        frames: 30,
        averageMs,
        targetMs: 16.7,
        worstMs: averageMs + 1,
        droppedRatio: 0,
      },
    });
    let state = createVergerState({
      at: 0,
      levers: SAMPLE_LEVERS,
      initialPressure: { 'rows-ahead': 1 },
    });
    const ledger = createSessionLedger(SAMPLE_LEVERS);
    ledger.onSnapshot(snapshotOf(state));
    // A still screen for a minute: nothing drawn, so nothing learned.
    state = reduceVerger(state, { type: 'tick', at: 60_000 });
    ledger.onSnapshot(snapshotOf(state));
    expect(ledger.report(60_000)).toMatchObject({ evidenceMs: 0, pressure: {} });
    // Calm frames: the loop gives the starting point back.
    for (let at = 60_500; at <= 80_000; at += 500) {
      state = reduceVerger(state, { type: 'interaction', at });
      state = reduceVerger(state, window(at, 8));
    }
    expect(snapshotOf(state).priorHeld).toEqual({});
    expect(snapshotOf(state).levels['rows-ahead'] ?? 0).toBe(0);
  });
});
