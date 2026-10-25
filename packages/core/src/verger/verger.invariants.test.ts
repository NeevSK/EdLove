import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import {
  ACTIVATION_PRESETS,
  type ActivationPatch,
  type CapacityFacts,
  type CreateVergerStateOptions,
  checkRun,
  createOutcomeLedger,
  createRuntimeController,
  DEFAULT_VERGER_CONFIG,
  replayRecording,
  type VergerEvent,
  type VergerSnapshot,
  resolveActivation,
  SENSORS,
  type SensorId,
  sensorOf,
  UNKNOWN_CAPACITY,
  type VergerActivation,
  VERGER_POLICY,
  VERGER_POLICY_P5,
  type VergerPolicy,
} from '@repo/verger-core';
import { GURUDEVI_LEVERS } from './gurudeviLevers';

/**
 * Verger's invariants, checked over generated event streams on Gurudevi's real levers and
 * verger's real policy (Property-Based Verification). Example tests show that chosen cases
 * work; these show that no generated stream, device or activation breaks what must always hold.
 * The last block proves the suite is not vacuous: deliberately broken policies must be caught.
 */

const LEVERS = GURUDEVI_LEVERS;
/** Cases per property; raise with VERGER_RUNS for a deep run (nightly, before a release). */
const RUNS = Number(process.env.VERGER_RUNS ?? 300);
const GB = 1024 ** 3;

// ---------------------------------------------------------------------------------------------
// Generators
// ---------------------------------------------------------------------------------------------

const capacityArb: fc.Arbitrary<CapacityFacts> = fc.constantFrom<CapacityFacts>(
  UNKNOWN_CAPACITY,
  {
    ...UNKNOWN_CAPACITY,
    totalMemoryBytes: 2 * GB,
    isLowRamDevice: true,
    sdkInt: 28,
    cpuCores: 4,
    refreshRateHz: 60,
    refreshRatesHz: [60],
  },
  {
    ...UNKNOWN_CAPACITY,
    totalMemoryBytes: 4 * GB,
    isLowRamDevice: false,
    sdkInt: 31,
    cpuCores: 8,
    refreshRateHz: 90,
    refreshRatesHz: [60, 90],
    supportsRenderEffect: true,
    supportsCpuHints: true,
  },
  {
    ...UNKNOWN_CAPACITY,
    totalMemoryBytes: 8 * GB,
    isLowRamDevice: false,
    sdkInt: 34,
    cpuCores: 8,
    refreshRateHz: 120,
    refreshRatesHz: [60, 120],
    supportsRenderEffect: true,
    supportsRuntimeShader: true,
    supportsCpuHints: true,
  },
);

const leverModeArb = fc.constantFrom('apply' as const, 'shadow' as const, 'off' as const);

const patchArb: fc.Arbitrary<ActivationPatch> = fc.record(
  {
    sense: fc.record(
      Object.fromEntries(SENSORS.map((id) => [id, fc.boolean()])) as Record<
        SensorId,
        fc.Arbitrary<boolean>
      >,
      { requiredKeys: [] },
    ),
    decide: fc.constantFrom('static' as const, 'closed-loop' as const),
    reduce: fc.boolean(),
    grow: fc.boolean(),
    hardware: fc.boolean(),
    defaultLever: leverModeArb,
    admission: leverModeArb,
    levers: fc.dictionary(fc.constantFrom(...LEVERS.map((l) => l.id)), leverModeArb, {
      maxKeys: 4,
    }),
  },
  { requiredKeys: [] },
);

const activationArb: fc.Arbitrary<VergerActivation> = fc
  .tuple(fc.constantFrom(...Object.values(ACTIVATION_PRESETS)), patchArb)
  .map(([preset, patch]) => resolveActivation(preset, patch));

/** One event without its time; the stream gives it one. */
type Untimed = DistributiveOmit<VergerEvent, 'at'>;
type DistributiveOmit<T, K extends keyof T> = T extends unknown ? Omit<T, K> : never;

const frameArb: fc.Arbitrary<Untimed> = fc
  .record({
    frames: fc.integer({ min: 0, max: 60 }),
    averageMs: fc.double({ min: 1, max: 80, noNaN: true }),
    extraWorst: fc.double({ min: 0, max: 400, noNaN: true }),
    targetMs: fc.constantFrom(8.33, 11.11, 16.67),
    droppedRatio: fc.double({ min: 0, max: 1, noNaN: true }),
    stages: fc.option(
      fc.record({
        uiMs: fc.double({ min: 0, max: 40, noNaN: true }),
        renderMs: fc.double({ min: 0, max: 40, noNaN: true }),
        gpuMs: fc.double({ min: 0, max: 40, noNaN: true }),
        delayMs: fc.double({ min: 0, max: 40, noNaN: true }),
      }),
      { nil: undefined },
    ),
  })
  .map((f) => ({
    type: 'frame-window' as const,
    // Times are filled in by the stream; a window spans the 500 ms before its event.
    window: {
      startMs: 0,
      endMs: 0,
      frames: f.frames,
      averageMs: f.averageMs,
      targetMs: f.targetMs,
      worstMs: f.averageMs + f.extraWorst,
      droppedRatio: f.droppedRatio,
      ...(f.stages ? { stages: f.stages } : {}),
    },
  }));

const eventArb: fc.Arbitrary<Untimed> = fc.oneof(
  { weight: 4, arbitrary: frameArb },
  {
    weight: 1,
    arbitrary: fc.record({
      type: fc.constant('storage' as const),
      freeBytes: fc.option(fc.integer({ min: 0, max: 8 * 1024 ** 3 }), { nil: null }),
    }),
  },
  {
    weight: 1,
    arbitrary: fc.record({ type: fc.constant('scroll' as const), active: fc.boolean() }),
  },  {
    weight: 1,
    arbitrary: fc.record({
      type: fc.constant('event-loop-lag' as const),
      lagMs: fc.double({ min: 0, max: 2000, noNaN: true }),
    }),
  },
  {
    weight: 1,
    arbitrary: fc.record({
      type: fc.constant('js-heap' as const),
      gcPauseShare: fc.double({ min: 0, max: 1, noNaN: true }),
      allocatedBytes: fc.option(fc.integer({ min: 0, max: 2 ** 31 }), { nil: null }),
    }),
  },  {
    weight: 1,
    arbitrary: fc.record({
      type: fc.constant('input-delay' as const),
      durationMs: fc.double({ min: 0, max: 600, noNaN: true }),
    }),
  },  {
    weight: 1,
    arbitrary: fc.record({
      type: fc.constant('data-budget' as const),
      state: fc.constantFrom('within' as const, 'spent' as const, 'unknown' as const),
    }),
  },
  {
    weight: 2,
    arbitrary: fc.record({
      type: fc.constant('thermal' as const),
      status: fc.option(
        fc.constantFrom(
          'none' as const,
          'light' as const,
          'moderate' as const,
          'severe' as const,
          'critical' as const,
          'emergency' as const,
          'shutdown' as const,
        ),
        { nil: null },
      ),
      headroom: fc.option(fc.double({ min: 0, max: 1.3, noNaN: true }), { nil: null }),
    }),
  },
  {
    weight: 1,
    arbitrary: fc.record({
      type: fc.constant('memory-trim' as const),
      severity: fc.constantFrom('moderate' as const, 'low' as const, 'critical' as const),
    }),
  },
  {
    weight: 1,
    arbitrary: fc.record({
      type: fc.constant('memory-state' as const),
      availableMb: fc.double({ min: 20, max: 4000, noNaN: true }),
      thresholdMb: fc.double({ min: 50, max: 500, noNaN: true }),
      lowMemory: fc.boolean(),
    }),
  },
  {
    weight: 2,
    arbitrary: fc
      .record({
        js: fc.double({ min: 0, max: 1.5, noNaN: true }),
        main: fc.double({ min: 0, max: 1.5, noNaN: true }),
      })
      .map(({ js, main }) => ({
        type: 'thread-load' as const,
        cores: { js, main },
        processCores: js + main,
      })),
  },
  {
    weight: 1,
    arbitrary: fc.record({
      type: fc.constant('long-task' as const),
      durationMs: fc.double({ min: 50, max: 800, noNaN: true }),
    }),
  },
  { weight: 1, arbitrary: fc.record({ type: fc.constant('power' as const), saver: fc.boolean() }) },
  {
    weight: 1,
    arbitrary: fc.record({
      type: fc.constant('battery' as const),
      levelPercent: fc.option(fc.integer({ min: 0, max: 100 }), { nil: null }),
      pluggedIn: fc.option(fc.boolean(), { nil: null }),
      temperatureC: fc.option(fc.double({ min: 15, max: 60, noNaN: true }), { nil: null }),
    }),
  },
  {
    weight: 1,
    arbitrary: fc.record({
      type: fc.constant('network' as const),
      transport: fc.option(
        fc.constantFrom(
          'wifi' as const,
          'cellular' as const,
          'ethernet' as const,
          'other' as const,
          'none' as const,
        ),
        { nil: null },
      ),
      validated: fc.option(fc.boolean(), { nil: null }),
      metered: fc.option(fc.boolean(), { nil: null }),
      downKbps: fc.option(fc.integer({ min: 0, max: 200_000 }), { nil: null }),
      dataSaver: fc.option(
        fc.constantFrom('disabled' as const, 'allowlisted' as const, 'enabled' as const),
        { nil: null },
      ),
    }),
  },
  { weight: 2, arbitrary: fc.constant({ type: 'interaction' as const }) },
  {
    weight: 1,
    arbitrary: fc.record({
      type: fc.constant('app-state' as const),
      state: fc.constantFrom('active' as const, 'inactive' as const, 'background' as const),
    }),
  },
  {
    weight: 1,
    arbitrary: fc.record({
      type: fc.constant('preferences' as const),
      reduceMotion: fc.boolean(),
      fidelity: fc.constantFrom('auto' as const, 'low' as const, 'high' as const),
    }),
  },
  { weight: 2, arbitrary: fc.constant({ type: 'tick' as const }) },
  {
    weight: 1,
    arbitrary: activationArb.map((activation) => ({ type: 'activation' as const, activation })),
  },
);

/** Gives each event a time; gaps range from a frame to over a minute, so timers come due. */
const streamArb = (events: fc.Arbitrary<Untimed> = eventArb, maxLength = 60) =>
  fc.array(fc.tuple(fc.integer({ min: 1, max: 70_000 }), events), { maxLength }).map((steps) => {
    let at = 0;
    return steps.map(([gap, event]) => {
      at += gap;
      return timed(event, at);
    });
  });

function timed(event: Untimed, at: number): VergerEvent {
  if (event.type === 'frame-window')
    return { ...event, at, window: { ...event.window, startMs: at - 500, endMs: at } };
  return { ...event, at } as VergerEvent;
}

// ---------------------------------------------------------------------------------------------
// Running a policy as the controller does: the snapshot is published when outputs change.
// ---------------------------------------------------------------------------------------------

function run(
  policy: VergerPolicy,
  options: CreateVergerStateOptions,
  events: readonly VergerEvent[],
): { snapshots: VergerSnapshot[]; final: VergerSnapshot } {
  let state = policy.create(options);
  const snapshots = [policy.snapshot(state)];
  for (const event of events) {
    const before = policy.outputVersion(state);
    state = policy.reduce(state, event);
    if (policy.outputVersion(state) !== before) snapshots.push(policy.snapshot(state));
  }
  return { snapshots, final: policy.snapshot(state) };
}

const optionsArb = fc
  .tuple(capacityArb, activationArb, fc.boolean())
  .map(([capacity, activation, memorySensing]) => ({
    at: 0,
    levers: LEVERS,
    capacity,
    activation,
    memorySensing,
  }));

const withoutActivation = ({ activation: _, ...rest }: VergerSnapshot) => rest;

// ---------------------------------------------------------------------------------------------
// Properties
// ---------------------------------------------------------------------------------------------

describe('verger invariants (property-based)', { timeout: 60_000 }, () => {
  it('every published snapshot of every generated run keeps every invariant', () => {
    fc.assert(
      fc.property(optionsArb, streamArb(), (options, events) => {
        const { snapshots } = run(VERGER_POLICY, options, events);
        expect(checkRun(snapshots, LEVERS)).toEqual([]);
      }),
      { numRuns: RUNS },
    );
  });

  it('verger-p5 keeps every invariant on every generated run (and its envelope)', () => {
    fc.assert(
      fc.property(optionsArb, streamArb(), (options, events) => {
        const { snapshots } = run(VERGER_POLICY_P5, options, events);
        expect(checkRun(snapshots, LEVERS)).toEqual([]);
        for (const snapshot of snapshots)
          for (const lever of LEVERS) {
            const e = snapshot.envelope[lever.id];
            if (!e) throw new Error(`no envelope for ${lever.id}`);
            expect(e.limit <= e.ceiling && e.ceiling <= e.home && e.home <= e.floor).toBe(true);
          }
      }),
      { numRuns: RUNS },
    );
  });

  it('verger-p5 with loop 2 findings keeps every invariant, and never lowers by pressure a lever proved useless for all it relieves (D4)', () => {
    const findingArb: fc.Arbitrary<Untimed> = fc.record({
      type: fc.constant('lever-ineffective' as const),
      lever: fc.constantFrom(...LEVERS.map((lever) => lever.id)),
      target: fc.constantFrom('gpu' as const, 'cpu' as const, 'memory' as const, 'energy' as const, 'network' as const),
    });
    const mixed = fc.oneof({ weight: 5, arbitrary: eventArb }, { weight: 1, arbitrary: findingArb });
    fc.assert(
      fc.property(
        optionsArb,
        fc.constantFrom(...LEVERS),
        streamArb(mixed, 80),
        (options, useless, events) => {
          const marked: VergerEvent[] = [useless.target, ...(useless.alsoRelieves ?? [])].map(
            (target) => ({ type: 'lever-ineffective', at: 0, lever: useless.id, target }),
          );
          const { snapshots } = run(VERGER_POLICY_P5, options, [...marked, ...events]);
          expect(checkRun(snapshots, LEVERS)).toEqual([]);
          for (const snapshot of snapshots.slice(1)) expect(snapshot.pressure[useless.id] ?? 0).toBe(0);
        },
      ),
      { numRuns: RUNS },
    );
  });

  it('verger-p5 is deterministic', () => {
    fc.assert(
      fc.property(optionsArb, streamArb(), (options, events) => {
        expect(run(VERGER_POLICY_P5, options, events).snapshots).toEqual(
          run(VERGER_POLICY_P5, options, events).snapshots,
        );
      }),
    );
  });

  it('a session recording replays to exactly the snapshots the controller published (D1)', () => {
    fc.assert(
      fc.property(
        optionsArb,
        streamArb(),
        fc.constantFrom(VERGER_POLICY, VERGER_POLICY_P5),
        (options, events, policy) => {
          let at = 0;
          const controller = createRuntimeController({
            port: { start: () => () => {}, setRefreshCap: () => {}, setCpuBoost: () => {} },
            capacity: options.capacity,
            levers: LEVERS,
            mode: 'active',
            config: DEFAULT_VERGER_CONFIG,
            now: () => at,
            scheduler: { setTimeout: () => 0, clearTimeout: () => {} },
            memorySensing: options.memorySensing,
            activation: options.activation,
            policy,
            recordEvents: 1000,
          });
          const published = [controller.getSnapshot()];
          controller.subscribe(() => published.push(controller.getSnapshot()));
          controller.start();
          for (const event of events) {
            at = event.at;
            controller.dispatch(event);
          }
          const recording = controller.recording();
          if (!recording) throw new Error('recording was asked for');
          expect(recording.dropped).toBe(0);
          expect(replayRecording(recording, policy).snapshots).toEqual(published);
        },
      ),
      { numRuns: RUNS },
    );
  });

  it('determinism: the same events give the same snapshots, every time', () => {
    fc.assert(
      fc.property(optionsArb, streamArb(), (options, events) => {
        expect(run(VERGER_POLICY, options, events).snapshots).toEqual(
          run(VERGER_POLICY, options, events).snapshots,
        );
      }),
    );
  });

  it('time-shift: moving the whole session later changes no decision', () => {
    fc.assert(
      fc.property(
        optionsArb,
        streamArb(),
        fc.integer({ min: 1, max: 1e9 }),
        (options, events, k) => {
          const base = run(VERGER_POLICY, options, events).snapshots;
          const shifted = run(
            VERGER_POLICY,
            { ...options, at: options.at + k },
            events.map((event) =>
              event.type === 'frame-window'
                ? {
                    ...event,
                    at: event.at + k,
                    window: {
                      ...event.window,
                      startMs: event.window.startMs + k,
                      endMs: event.window.endMs + k,
                    },
                  }
                : { ...event, at: event.at + k },
            ),
          ).snapshots;
          const strip = (s: VergerSnapshot) => ({ ...withoutActivation(s), at: 0 });
          expect(shifted.map(strip)).toEqual(base.map(strip));
        },
      ),
    );
  });

  it('a deaf sensor: its readings make the same difference as no readings at all', () => {
    const steady = activationArb.filter(Boolean);
    fc.assert(
      fc.property(
        optionsArb,
        steady,
        fc.constantFrom(...SENSORS),
        streamArb(eventArb.filter((e) => e.type !== 'activation')),
        (options, activation, sensor, events) => {
          const deaf = { ...activation, sense: { ...activation.sense, [sensor]: false } };
          const hearing = { ...activation, sense: { ...activation.sense, [sensor]: true } };
          // A sensor's readings include every witness of what it senses: battery temperature is
          // a heat reading (the fallback below Android 10), so deafening heat removes it too.
          const heardNothing = events.map(
            (event): VergerEvent =>
              sensorOf(event) === sensor
                ? { type: 'tick', at: event.at }
                : sensor === 'thermal' && event.type === 'battery'
                  ? { ...event, temperatureC: null }
                  : event,
          );
          // Memory sensing is a platform fact the deaf sensor must not claim.
          const memorySensing = sensor === 'memory' ? false : options.memorySensing;
          const a = run(
            VERGER_POLICY,
            { ...options, activation: deaf, memorySensing },
            events,
          ).final;
          const b = run(
            VERGER_POLICY,
            { ...options, activation: hearing, memorySensing },
            heardNothing,
          ).final;
          // The raw battery temperature stays the power sensor's fact; what a deaf heat sensor
          // must not do is derive heat from it, which `thermal` and `thermalSource` show.
          const comparable = (snap: VergerSnapshot) => {
            const rest = withoutActivation(snap);
            return sensor === 'thermal'
              ? { ...rest, battery: { ...rest.battery, temperatureC: null } }
              : rest;
          };
          expect(comparable(a)).toEqual(comparable(b));
        },
      ),
      {
        // Found by this property: battery temperature is a heat reading.
        examples: [
          [
            {
              at: 0,
              levers: LEVERS,
              capacity: UNKNOWN_CAPACITY,
              activation: ACTIVATION_PRESETS.active,
              memorySensing: false,
            },
            ACTIVATION_PRESETS.active,
            'thermal' as SensorId,
            [{ type: 'battery', at: 1, levelPercent: null, pluggedIn: null, temperatureC: 15 }],
          ],
        ],
      },
    );
  });

  it('without sensor readings, nothing is lowered by pressure: no guessing', () => {
    const appOnly = eventArb.filter((e) => sensorOf({ ...e, at: 0 } as VergerEvent) === null);
    fc.assert(
      fc.property(optionsArb, streamArb(appOnly), (options, events) => {
        for (const snapshot of run(VERGER_POLICY, options, events).snapshots)
          expect(snapshot.pressure).toEqual({});
      }),
    );
  });

  it('no permanent degradation: once the phone is calm, every step of pressure is given back', () => {
    fc.assert(
      fc.property(optionsArb, streamArb(), (options, events) => {
        let at = events.at(-1)?.at ?? 0;
        const next = (gap: number) => {
          at += gap;
          return at;
        };
        const calm: VergerEvent[] = [
          { type: 'activation', at: next(1), activation: ACTIVATION_PRESETS.lab },
          { type: 'app-state', at: next(1), state: 'active' },
          { type: 'preferences', at: next(1), reduceMotion: false, fidelity: 'auto' },
          { type: 'power', at: next(1), saver: false },
          { type: 'thermal', at: next(1), status: 'none', headroom: 0.3 },
          {
            type: 'memory-state',
            at: next(1),
            availableMb: 3000,
            thresholdMb: 200,
            lowMemory: false,
          },
          { type: 'thread-load', at: next(1), cores: { js: 0.1, main: 0.1 }, processCores: 0.2 },
        ];
        const steps = LEVERS.reduce((sum, lever) => sum + lever.maxLevel, 0) + 2;
        for (let i = 0; i < steps; i += 1) {
          calm.push({ type: 'interaction', at: next(70_000) });
          const end = next(500);
          calm.push({
            type: 'frame-window',
            at: end,
            window: {
              startMs: end - 500,
              endMs: end,
              frames: 30,
              averageMs: 8,
              targetMs: 16.67,
              worstMs: 10,
              droppedRatio: 0,
            },
          });
          calm.push({ type: 'tick', at: next(1) });
        }
        const { final } = run(VERGER_POLICY, options, [...events, ...calm]);
        expect(final.pressure).toEqual({});
        expect(final.priorHeld).toEqual({});
        expect(final.contentionExhausted).toBe(false);
      }),
      { numRuns: 60 },
    );
  });

  it('no lever is lowered by pressure for an account that is not strained (ADR D5.2)', () => {
    fc.assert(
      fc.property(optionsArb, streamArb(), (options, events) => {
        const ledger = createOutcomeLedger({ levers: LEVERS, capacity: options.capacity });
        for (const snapshot of run(VERGER_POLICY, options, events).snapshots)
          ledger.observe(snapshot);
        const blind = ledger
          .records()
          .filter((r) => r.direction === 'compress' && r.verdict === 'unjudged');
        expect(blind.map((r) => `${r.lever}: ${r.reason}`)).toEqual([]);
      }),
      {
        numRuns: RUNS,
        // Found by this property: main-thread contention lowers a motion lever, which relieves CPU;
        // and with motion levers already at their floor (low fidelity), it must not fall through
        // to a GPU-only lever.
        examples: [
          [
            {
              at: 0,
              levers: LEVERS,
              capacity: UNKNOWN_CAPACITY,
              activation: ACTIVATION_PRESETS.active,
              memorySensing: false,
            },
            [
              { type: 'thread-load', at: 1, cores: { js: 0, main: 0.9 }, processCores: 0.9 },
              { type: 'preferences', at: 2_001, reduceMotion: false, fidelity: 'low' },
            ],
          ],
          [
            {
              at: 0,
              levers: LEVERS,
              capacity: UNKNOWN_CAPACITY,
              activation: ACTIVATION_PRESETS.active,
              memorySensing: false,
            },
            [
              { type: 'thread-load', at: 1, cores: { js: 0, main: 0.9 }, processCores: 0.9 },
              { type: 'tick', at: 2_001 },
            ],
          ],
        ],
      },
    );
  });
});

// ---------------------------------------------------------------------------------------------
// The suite must catch broken policies, or it proves nothing.
// ---------------------------------------------------------------------------------------------

const mutant = (name: string, snapshot: (s: VergerSnapshot) => VergerSnapshot): VergerPolicy => ({
  ...VERGER_POLICY,
  id: name,
  snapshot: (state, at) => snapshot(VERGER_POLICY.snapshot(state as never, at)),
});

const firstLever = LEVERS[0]?.id ?? 'refresh-rate';

/** Breaks verger-p5's envelope, lever by lever, where it has a ceiling to break. */
const p5Mutant = (
  name: string,
  edit: (s: VergerSnapshot, id: string, ceiling: number) => VergerSnapshot,
): VergerPolicy => ({
  ...VERGER_POLICY_P5,
  id: name,
  snapshot: (state, at) => {
    let s = VERGER_POLICY_P5.snapshot(state as never, at);
    for (const [id, e] of Object.entries(s.envelope)) if (e.ceiling > 0) s = edit(s, id, e.ceiling);
    return s;
  },
});

const MUTANTS: readonly VergerPolicy[] = [
  mutant('ignores-off', (s) =>
    s.activation.levers[firstLever] === 'off'
      ? { ...s, levels: { ...s.levels, [firstLever]: 1 } }
      : s,
  ),
  mutant('out-of-range', (s) => ({ ...s, levels: { ...s.levels, [firstLever]: 99 } })),
  mutant('hardware-leak', (s) => ({ ...s, refreshCapHz: 60 })),
  mutant('deaf-leak', (s) => ({ ...s, thermal: 'hot' })),
  mutant('shadow-applies', (s) => ({ ...s, levels: s.proposedLevels })),
  p5Mutant('p5-expands-past-ceiling', (s, id, ceiling) => ({
    ...s,
    levels: { ...s.levels, [id]: ceiling - 1 },
    proposedLevels: { ...s.proposedLevels, [id]: ceiling - 1 },
  })),
  p5Mutant('p5-envelope-lies', (s, id) => {
    const e = s.envelope[id];
    return e ? { ...s, envelope: { ...s.envelope, [id]: { ...e, limit: 0, ceiling: 0 } } } : s;
  }),
  p5Mutant('p5-envelope-unordered', (s, id, ceiling) => {
    const e = s.envelope[id];
    return e ? { ...s, envelope: { ...s.envelope, [id]: { ...e, home: ceiling - 1 } } } : s;
  }),
];

describe('the invariant suite catches broken policies (mutation check)', {
  timeout: 60_000,
}, () => {
  for (const broken of MUTANTS) {
    it(`catches ${broken.id}`, () => {
      const result = fc.check(
        fc.property(optionsArb, streamArb(), (options, events) => {
          const { snapshots } = run(broken, options, events);
          return checkRun(snapshots, LEVERS).length === 0;
        }),
        { numRuns: RUNS },
      );
      expect(result.failed).toBe(true);
    });
  }

  it('catches a nondeterministic policy', () => {
    let flip = 0;
    const noisy = mutant('noisy', (s) => ({ ...s, optionalConcurrency: (flip += 1) % 2 }));
    const result = fc.check(
      fc.property(optionsArb, streamArb(), (options, events) => {
        const a = run(noisy, options, events).snapshots;
        const b = run(noisy, options, events).snapshots;
        return JSON.stringify(a) === JSON.stringify(b);
      }),
    );
    expect(result.failed).toBe(true);
  });
});
