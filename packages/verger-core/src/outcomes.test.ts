import { describe, expect, it } from 'vitest';
import { SAMPLE_LEVERS } from './__fixtures__/sampleHost';
import { createVergerState, reduceVerger, snapshotOf } from './reducer';
import { accountsRelievedBy } from './demand';
import { createOutcomeLedger, type MoveRecord, outcomeAttributes, verdictLine } from './outcomes';
import type { CapacityFacts, VergerEvent, VergerSnapshot } from './types';

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
};

const BASE = snapshotOf(
  createVergerState({ at: 0, levers: SAMPLE_LEVERS, capacity: CAPACITY, memorySensing: true }),
);

/** A published snapshot: only what the ledger reads is varied. */
const snap = (at: number, over: Partial<VergerSnapshot> = {}): VergerSnapshot => ({
  ...BASE,
  at,
  thermal: 'nominal',
  ...over,
});
const lowered = (id: string, level: number, byPressure = true): Partial<VergerSnapshot> => ({
  levels: { ...BASE.levels, [id]: level },
  pressure: byPressure ? { [id]: level } : {},
});

const ledger = () => createOutcomeLedger({ levers: SAMPLE_LEVERS, capacity: CAPACITY });

describe('outcome ledger: compress', () => {
  it('a compress that eases its account is relieved, with agility from the strain onset', () => {
    const l = ledger();
    l.observe(snap(0));
    l.observe(snap(1_000, { thermal: 'hot', ...lowered('frosting', 1) }));
    l.observe(snap(4_000, { thermal: 'nominal', ...lowered('frosting', 1) }));
    const [move] = l.records();
    expect(move).toMatchObject({
      lever: 'frosting',
      direction: 'compress',
      cause: 'pressure',
      verdict: 'relieved',
      judgedAt: 4_000,
      agilityMs: 3_000,
    });
    expect(move?.accounts.thermal).toBe('overdrawn');
    expect(move?.qualityDelta).toBeGreaterThan(0);
  });

  it('a strain that began before the move counts from its onset', () => {
    const l = ledger();
    l.observe(snap(0, { thermal: 'warm' }));
    l.observe(snap(2_000, { thermal: 'warm', ...lowered('frosting', 1) }));
    l.observe(snap(3_000, { thermal: 'nominal', ...lowered('frosting', 1) }));
    expect(l.records()[0]?.agilityMs).toBe(3_000);
  });

  it('one that does not ease it within the window is not relieved, as of the deadline', () => {
    const l = ledger();
    l.observe(snap(0));
    l.observe(snap(1_000, { thermal: 'hot', ...lowered('frosting', 1) }));
    // Heat relief has the judge window plus the thermal dwell (P4): 1 s + 5 s + 20 s.
    l.settle(26_500);
    expect(l.records()[0]).toMatchObject({ verdict: 'not-relieved', judgedAt: 26_000 });
    // Relief after the deadline is too late to count.
    l.observe(snap(27_000, { thermal: 'nominal', ...lowered('frosting', 1) }));
    expect(l.records()[0]?.verdict).toBe('not-relieved');
  });

  it('a lowering a gesture held back is still credited to the loop when released', () => {
    const l = ledger();
    l.observe(snap(0));
    // The loop decided at 1 s (pressure), the gesture held the level until 2.5 s (invariant 7).
    l.observe(snap(1_000, { thermal: 'hot', pressure: { frosting: 1 } }));
    l.observe(snap(2_500, { thermal: 'hot', ...lowered('frosting', 1) }));
    expect(l.records()[0]).toMatchObject({ lever: 'frosting', direction: 'compress', cause: 'pressure', at: 2_500 });
  });

  it('a level that changes because its lever was switched from shadow to apply is the switch\u2019s move', () => {
    const l = ledger();
    const shadowed = { ...BASE.activation, defaultLever: 'shadow' as const };
    l.observe(snap(0, { activation: shadowed, pressure: { frosting: 1 } }));
    l.observe(snap(1_000, { ...lowered('frosting', 1) }));
    expect(l.records()).toEqual([]);
    expect(l.summary().levers.frosting?.floorMoves).toBe(1);
  });

  it('a compress with no strained account it relieves is unjudged, not credited', () => {
    const l = ledger();
    l.observe(snap(0));
    // Memory strained, but frosting relieves gpu, cpu and heat, not memory.
    l.observe(snap(1_000, { memory: 'low', ...lowered('frosting', 1) }));
    expect(l.records()[0]?.verdict).toBe('unjudged');
  });

  it('two levers lowered for one strain are both credited when it eases (joint attribution)', () => {
    const l = ledger();
    l.observe(snap(0));
    l.observe(snap(1_000, { thermal: 'hot', ...lowered('frosting', 1) }));
    l.observe(
      snap(2_000, {
        thermal: 'hot',
        levels: { ...BASE.levels, frosting: 1, 'rows-ahead': 1 },
        pressure: { frosting: 1, 'rows-ahead': 1 },
      }),
    );
    l.observe(
      snap(3_000, {
        thermal: 'nominal',
        levels: { ...BASE.levels, frosting: 1, 'rows-ahead': 1 },
        pressure: { frosting: 1, 'rows-ahead': 1 },
      }),
    );
    expect(l.records().map((r) => [r.lever, r.verdict])).toEqual([
      ['frosting', 'relieved'],
      ['rows-ahead', 'relieved'],
    ]);
  });
});

describe('outcome ledger: expand', () => {
  const afterRelief = () => {
    const l = ledger();
    l.observe(snap(0));
    l.observe(snap(1_000, { thermal: 'hot', ...lowered('frosting', 1) }));
    l.observe(snap(2_000, { thermal: 'nominal', ...lowered('frosting', 1) }));
    l.observe(snap(10_000)); // raised back by pressure
    return l;
  };

  it('an expand that lasts the hold window held', () => {
    const l = afterRelief();
    l.settle(20_000);
    expect(l.records()[1]).toMatchObject({
      direction: 'expand',
      verdict: 'held',
      judgedAt: 20_000,
    });
  });

  it('an expand pushed back by pressure within the window was withdrawn', () => {
    const l = afterRelief();
    l.observe(snap(12_000, { thermal: 'hot', ...lowered('frosting', 1) }));
    expect(l.records()[1]).toMatchObject({ direction: 'expand', verdict: 'withdrawn' });
    expect(l.summary().levers.frosting).toMatchObject({ relieved: 1, withdrawn: 1 });
  });
});

describe('outcome ledger: what it does not judge', () => {
  it('moves made by floors (settings, visibility, idleness) are counted, never judged', () => {
    const l = ledger();
    l.observe(snap(0));
    l.observe(snap(1_000, { powerSaver: true, ...lowered('sparkle', 2, false) }));
    expect(l.records()).toEqual([]);
    expect(l.summary().levers.sparkle?.floorMoves).toBe(1);
  });

  it('stays bounded, dropping the oldest judged record first', () => {
    const l = createOutcomeLedger({ levers: SAMPLE_LEVERS, capacity: CAPACITY, maxRecords: 3 });
    l.observe(snap(0));
    for (let i = 1; i <= 6; i += 1) {
      l.observe(snap(i * 1_000, { memory: 'low', ...lowered('frosting', i % 2) }));
    }
    expect(l.records()).toHaveLength(3);
  });

  it('every lever relieves heat if it relieves compute or energy', () => {
    const frosting = SAMPLE_LEVERS.find((lever) => lever.id === 'frosting');
    const cache = SAMPLE_LEVERS.find((lever) => lever.id === 'photo-cache');
    expect(frosting && accountsRelievedBy(frosting)).toEqual(['gpu', 'thermal']);
    expect(cache && accountsRelievedBy(cache)).toEqual(['memory']);
  });
});

describe('outcome ledger on the real policy', () => {
  it('judges verger-p4 cooling the phone: heat lowers a lever, cooling relieves it', () => {
    const l = ledger();
    let state = createVergerState({
      at: 0,
      levers: SAMPLE_LEVERS,
      capacity: CAPACITY,
      memorySensing: true,
    });
    l.observe(snapshotOf(state));
    const events: VergerEvent[] = [
      { type: 'interaction', at: 100 },
      { type: 'thermal', at: 1_000, status: 'severe', headroom: 0.97 },
      { type: 'thermal', at: 3_500, status: 'none', headroom: 0.5 },
      // Heat steps down only after the thermal dwell (P4): cool from 3.5 s, nominal at 23.5 s.
      { type: 'tick', at: 23_500 },
    ];
    for (const event of events) {
      const version = state.version;
      state = reduceVerger(state, event);
      // As the controller does: the ledger sees each published change.
      if (state.version !== version) l.observe(snapshotOf(state));
    }
    const compresses = l.records().filter((r) => r.direction === 'compress');
    expect(compresses.length).toBeGreaterThan(0);
    for (const move of compresses) {
      expect(move.verdict).toBe('relieved');
      expect(move.agilityMs).toBe(22_500);
    }
  });
});

describe('outcome ledger in a running verger', () => {
  it('every launch keeps one; it reads null while verger is not running', async () => {
    const { createVerger } = await import('./verger');
    const { defineHost } = await import('./host');
    const host = defineHost({ name: 'sample', levers: SAMPLE_LEVERS });
    let clock = 0;
    let send: (event: VergerEvent) => void = () => {};
    const verger = createVerger({
      host,
      requested: 'active',
      release: '1',
      now: () => clock,
      platform: () => ({
        readCapacity: () => CAPACITY,
        memorySensing: true,
        createPort: () => ({
          start: (_config, onEvent) => {
            send = onEvent;
            return () => {};
          },
          setRefreshCap: () => {},
          setCpuBoost: () => {},
        }),
      }),
    });
    expect(verger.outcomes()).toBeNull();
    await verger.start();
    clock = 1_000;
    send({ type: 'thermal', at: 1_000, status: 'severe', headroom: 0.97 });
    clock = 3_000;
    send({ type: 'thermal', at: 3_000, status: 'none', headroom: 0.5 });
    clock = 23_000;
    send({ type: 'tick', at: 23_000 });
    const report = verger.outcomes();
    expect(report?.records.length).toBeGreaterThan(0);
    expect(report?.records.every((r) => r.verdict === 'relieved')).toBe(true);
    await verger.stop();
    expect(verger.outcomes()).toBeNull();
  });
});

describe('stage 5 into the record: windows, verdict lines, telemetry', () => {
  it('the judge window comes from config; an explicit option still wins', () => {
    // Both the judge window and the thermal dwell come from config: 1 s + 2 s + 1 s.
    const config = { outcomeJudgeWindowMs: 2_000, thermalDwellMs: 1_000 };
    const fromConfig = createOutcomeLedger({ levers: SAMPLE_LEVERS, capacity: CAPACITY, config });
    fromConfig.observe(snap(0));
    fromConfig.observe(snap(1_000, { thermal: 'hot', ...lowered('frosting', 1) }));
    fromConfig.settle(4_500);
    expect(fromConfig.records()[0]).toMatchObject({ verdict: 'not-relieved', judgedAt: 4_000 });
    const explicit = createOutcomeLedger({ levers: SAMPLE_LEVERS, capacity: CAPACITY, judgeWindowMs: 8_000, config });
    explicit.observe(snap(0));
    explicit.observe(snap(1_000, { thermal: 'hot', ...lowered('frosting', 1) }));
    explicit.settle(4_500);
    expect(explicit.records()[0]?.verdict).toBe('pending');
  });

  it('reports each verdict once, as it is reached; a failing observer changes nothing', () => {
    const judged: MoveRecord[] = [];
    const l = createOutcomeLedger({ levers: SAMPLE_LEVERS, capacity: CAPACITY, onJudged: (r) => judged.push(r) });
    l.observe(snap(0));
    l.observe(snap(1_000, { thermal: 'hot', ...lowered('frosting', 1) }));
    expect(judged).toEqual([]);
    l.observe(snap(4_000, { thermal: 'nominal', ...lowered('frosting', 1) }));
    l.settle(20_000);
    expect(judged.map((r) => r.verdict)).toEqual(['relieved']);
    const [move] = judged;
    if (!move) throw new Error('no verdict');
    expect(verdictLine(move, 0)).toBe(`4|judged|frosting|relieved|${Object.keys(move.accounts).sort().join(',')}`);
    const throwing = createOutcomeLedger({ levers: SAMPLE_LEVERS, capacity: CAPACITY, onJudged: () => { throw new Error('observer'); } });
    throwing.observe(snap(0));
    throwing.observe(snap(1_000, { thermal: 'hot', ...lowered('frosting', 1) }));
    throwing.observe(snap(4_000, { thermal: 'nominal', ...lowered('frosting', 1) }));
    expect(throwing.records()[0]?.verdict).toBe('relieved');
  });

  it('telemetry attributes: totals, agility and the lever that failed most, first among equals', () => {
    const blank = { relieved: 0, notRelieved: 0, unjudged: 0, held: 0, withdrawn: 0, floorMoves: 0, agilityCount: 0, agilityTotalMs: 0, agilityWorstMs: 0 };
    expect(
      outcomeAttributes({
        pending: 1,
        levers: {
          sparkle: { ...blank, notRelieved: 2, relieved: 1, agilityCount: 1, agilityTotalMs: 900, agilityWorstMs: 900 },
          frosting: { ...blank, notRelieved: 2, held: 3, agilityCount: 1, agilityTotalMs: 300, agilityWorstMs: 300 },
        },
      }),
    ).toEqual({
      relieved: 1,
      not_relieved: 4,
      unjudged: 0,
      held: 3,
      withdrawn: 0,
      floor_moves: 0,
      pending: 1,
      agility_mean_ms: 600,
      agility_worst_ms: 900,
      worst_lever: 'frosting',
    });
    expect(outcomeAttributes({ pending: 0, levers: {} }).worst_lever).toBe('-');
  });
});
