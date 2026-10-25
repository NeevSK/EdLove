import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import {
  type CapacityFacts,
  createVerger,
  DEFAULT_RECOVERY_CONFIG,
  type ExitReason,
  type ExitRecord,
  type LaunchPlan,
  type RuntimePort,
  defineHost,
  type VergerHost,
  type VergerPlatform,
  type VergerStore,
} from '@repo/verger-core';
import { GURUDEVI_HOST } from './host';

/**
 * The recovery ladder and the crash-only launch, checked against a model (stateful,
 * model-based testing). One simulated phone lives through random sequences of whole process
 * lifetimes: clean exits, crashes, ANRs, kills for memory while visible or hidden, deaths while
 * verger's native side starts, unreadable and unwritable storage, a corrupted record, new
 * releases and the kill switch.
 *
 * The oracle is the ladder as the ADR states it (D12), not the code: two failures within 24 h
 * step down one rung; clean sessions of 30 s or more in the foreground step back up, three at
 * first, doubled per relapse; a death while starting goes straight to rung 4; rung 4 is left
 * only by a new release; a visible kill for memory moves nothing; sessions with verger off
 * prove nothing. On top, the fail-closed invariants: no native call after a death in starting
 * or on rung 4, nothing native when storage cannot be read, no hardware call without hardware.
 */

const HOUR = 3_600_000;
const config = DEFAULT_RECOVERY_CONFIG;

const CAPACITY: CapacityFacts = {
  totalMemoryBytes: 4 * 1024 ** 3,
  isLowRamDevice: false,
  memoryClassMb: 256,
  sdkInt: 33,
  cpuCores: 8,
  refreshRateHz: 90,
  supportsRenderEffect: true,
  supportsRuntimeShader: true,
  refreshRatesHz: [60, 90],
  supportsCpuHints: true,
  buildFingerprint: 'vendor/model:13/TQ3A/1:user/release-keys',
};

// ---------------------------------------------------------------------------------------------
// The simulated phone: one store and one exit history that outlive every process.
// ---------------------------------------------------------------------------------------------

function phone() {
  const data = new Map<string, string>();
  const exits: ExitRecord[] = [];
  let wall = 1_000_000;
  let mono = 0;
  let pid = 100;
  let dead = false;
  let failRead = false;
  let failWrite = false;
  let dieInStart = false;
  const calls: string[] = [];

  const store: VergerStore = {
    get: async (key) => {
      if (failRead) throw new Error('store unreadable');
      return data.get(key) ?? null;
    },
    set: async (key, value) => {
      if (failWrite) throw new Error('store unwritable');
      if (!dead) data.set(key, value);
    },
    remove: async (key) => {
      if (failWrite) throw new Error('store unwritable');
      if (!dead) data.delete(key);
    },
  };

  const platform = (): VergerPlatform => {
    calls.push('native:platform');
    const processId = pid;
    return {
      readCapacity: () => {
        calls.push('native:capacity');
        return CAPACITY;
      },
      readExits: (since) => {
        calls.push('native:exits');
        return exits.filter((e) => e.atWallMs >= since);
      },
      readProcessId: () => processId,
      memorySensing: true,
      createPort(): RuntimePort {
        calls.push('native:port');
        return {
          start() {
            calls.push('native:start');
            if (dieInStart) {
              // The process dies inside native start: nothing written from here lands.
              dead = true;
              throw new Error('process killed during native start');
            }
            return () => calls.push('native:stop');
          },
          setRefreshCap: (hz) => calls.push(`hardware:refresh:${hz}`),
          setCpuBoost: (on) => calls.push(`hardware:boost:${on}`),
        };
      },
    };
  };

  return {
    data,
    calls,
    platform,
    store,
    now: () => mono,
    wallNow: () => wall,
    pass(ms: number) {
      wall += ms;
      mono += ms;
    },
    /** A new process: a new pid, a fresh monotonic clock, writes land again. */
    newProcess() {
      pid += 1;
      mono = 0;
      dead = false;
      calls.length = 0;
    },
    exitWith(reason: ExitReason, foreground: boolean) {
      exits.push({ reason, pid, atWallMs: wall, foreground });
    },
    set faults(f: { read?: boolean; write?: boolean; dieInStart?: boolean }) {
      failRead = f.read ?? false;
      failWrite = f.write ?? false;
      dieInStart = f.dieInStart ?? false;
    },
  };
}

/** Lets pending store writes land, as an idle event loop would. */
const settle = async () => {
  for (let i = 0; i < 10; i += 1) await Promise.resolve();
};

const noTimers = { setTimeout: () => 0, clearTimeout: () => {} };

// ---------------------------------------------------------------------------------------------
// Steps: each is one process lifetime.
// ---------------------------------------------------------------------------------------------

type SessionEnd =
  | 'stop'
  | 'crash'
  | 'native-crash'
  | 'anr'
  | 'excessive-resource'
  | 'killed-for-memory-visible'
  | 'killed-for-memory-hidden'
  | 'user-closed'
  | 'died-visible-no-record'
  | 'died-hidden-no-record';

type Step =
  | { kind: 'session'; end: SessionEnd; foregroundMs: number; gapMs: number }
  | { kind: 'die-in-start'; gapMs: number }
  | { kind: 'store-unreadable'; gapMs: number }
  | { kind: 'store-unwritable'; gapMs: number }
  | { kind: 'record-corrupted'; gapMs: number }
  | { kind: 'new-release'; gapMs: number }
  | { kind: 'kill-switch'; gapMs: number };

const gapArb = fc.integer({ min: 1, max: 30 }).map((h) => h * HOUR);
const stepArb: fc.Arbitrary<Step> = fc.oneof(
  {
    weight: 10,
    arbitrary: fc.record({
      kind: fc.constant('session' as const),
      end: fc.constantFrom<SessionEnd>(
        'stop',
        'crash',
        'native-crash',
        'anr',
        'excessive-resource',
        'killed-for-memory-visible',
        'killed-for-memory-hidden',
        'user-closed',
        'died-visible-no-record',
        'died-hidden-no-record',
      ),
      foregroundMs: fc.constantFrom(5_000, 45_000, 300_000),
      gapMs: gapArb,
    }),
  },
  {
    weight: 1,
    arbitrary: fc.record({ kind: fc.constant('die-in-start' as const), gapMs: gapArb }),
  },
  {
    weight: 1,
    arbitrary: fc.record({ kind: fc.constant('store-unreadable' as const), gapMs: gapArb }),
  },
  {
    weight: 1,
    arbitrary: fc.record({ kind: fc.constant('store-unwritable' as const), gapMs: gapArb }),
  },
  {
    weight: 1,
    arbitrary: fc.record({ kind: fc.constant('record-corrupted' as const), gapMs: gapArb }),
  },
  { weight: 1, arbitrary: fc.record({ kind: fc.constant('new-release' as const), gapMs: gapArb }) },
  { weight: 1, arbitrary: fc.record({ kind: fc.constant('kill-switch' as const), gapMs: gapArb }) },
);

// ---------------------------------------------------------------------------------------------
// The model: the ladder as ADR D12 states it.
// ---------------------------------------------------------------------------------------------

type Outcome = 'clean' | 'failure' | 'neutral' | 'boot-failure' | 'none';

interface Model {
  rung: 0 | 1 | 2 | 3 | 4;
  failures: number[];
  clean: number;
  relapses: number;
  /** The rung the last launch ran on, as its session marker records it. */
  lastRung: 0 | 1 | 2 | 3 | 4;
  /** How the last process that ran verger ended, still to be folded at the next launch. */
  pending: { outcome: Outcome; foregroundMs: number; wall: number } | null;
}

const fresh = (): Model => ({
  rung: 0,
  lastRung: 0,
  failures: [],
  clean: 0,
  relapses: 0,
  pending: null,
});

function outcomeOf(end: SessionEnd): Outcome {
  switch (end) {
    case 'crash':
    case 'native-crash':
    case 'anr':
    case 'excessive-resource':
    case 'died-visible-no-record':
      return 'failure';
    case 'killed-for-memory-visible':
      return 'neutral';
    default:
      return 'clean';
  }
}

/** Folds the pending session into the ladder at a launch at `wall`. */
function fold(model: Model, wall: number): void {
  const p = model.pending;
  model.pending = null;
  if (!p || p.outcome === 'none' || p.outcome === 'neutral') return;
  if (p.outcome === 'boot-failure') {
    model.rung = 4;
    model.failures = [];
    model.clean = 0;
    model.relapses += 1;
    return;
  }
  if (p.outcome === 'failure') {
    const recent = model.failures.filter((t) => wall - t < config.failureWindowMs);
    recent.push(wall);
    model.clean = 0;
    if (recent.length >= config.failuresToEscalate) {
      model.rung = Math.min(4, model.rung + 1) as Model['rung'];
      model.failures = [];
      model.relapses += 1;
    } else model.failures = recent;
    return;
  }
  if (p.foregroundMs < config.minEvidenceForegroundMs) return;
  const needed =
    config.cleanToRecover *
    2 ** Math.min(Math.max(0, model.relapses - 1), config.maxRelapseDoublings);
  model.clean += 1;
  if (model.rung > 0 && model.rung < 4 && model.clean >= needed) {
    model.rung = (model.rung - 1) as Model['rung'];
    model.clean = 0;
  }
}

// ---------------------------------------------------------------------------------------------
// Running one step against the real launch.
// ---------------------------------------------------------------------------------------------

interface Observed {
  plan: LaunchPlan | null;
  calls: string[];
}

async function live(
  p: ReturnType<typeof phone>,
  release: string,
  step: Step,
  host: VergerHost,
): Promise<Observed> {
  p.newProcess();
  const killSwitch = step.kind === 'kill-switch';
  const verger = createVerger({
    host,
    platform: p.platform,
    store: p.store,
    requested: 'active',
    release,
    now: p.now,
    wallNow: p.wallNow,
    scheduler: noTimers,
    random: () => 0.99,
    ...(killSwitch
      ? {
          assignment: {
            key: 'k',
            arm: 'control' as const,
            bucket: 0,
            mode: 'shadow' as const,
            runtime: 'off' as const,
            reason: 'kill-switch' as const,
          },
        }
      : {}),
  });
  const plan = await verger.start();
  await settle();
  const calls = [...p.calls];
  if (step.kind !== 'session') return { plan, calls };

  p.pass(step.foregroundMs);
  switch (step.end) {
    case 'stop':
      await verger.stop();
      break;
    case 'killed-for-memory-hidden':
    case 'user-closed':
    case 'died-hidden-no-record':
      verger.dispatch({ type: 'app-state', at: p.now(), state: 'background' });
      await settle();
      if (step.end === 'killed-for-memory-hidden') p.exitWith('low-memory', false);
      if (step.end === 'user-closed') p.exitWith('user', false);
      break;
    case 'killed-for-memory-visible':
      p.exitWith('low-memory', true);
      break;
    case 'died-visible-no-record':
      break;
    default:
      p.exitWith(step.end, true);
  }
  await settle();
  return { plan, calls: [...calls, ...p.calls.slice(calls.length)] };
}

/**
 * What the model expects the launch to do, and what it leaves pending. Returns the expected
 * rung, or null where the launch must stay off without judging anything.
 */
function expectedRung(
  model: Model,
  step: Step,
  wall: number,
  releaseChanged: boolean,
): number | null {
  if (step.kind === 'kill-switch' || step.kind === 'store-unreadable') return null;
  // A new release starts the ladder over; the last session, under the old one, moves nothing.
  if (releaseChanged) Object.assign(model, fresh());
  if (step.kind === 'store-unwritable') return null;
  if (step.kind === 'record-corrupted') {
    // Guarded start (ADR D12.1): at least shadow, one relapse, then the last session is folded.
    // The rung the last session ran on survives in its marker; an unreadable record never
    // lifts a phone above it (found by this test: rung 4 could fall back to 3).
    model.rung = Math.max(3, model.lastRung) as Model['rung'];
    model.failures = [];
    model.clean = 0;
    model.relapses = 1;
  }
  fold(model, wall);
  return model.rung;
}

/** What the generated runs reached, so a pass is known not to be vacuous. */
const seen = new Set<string>();

describe('the recovery ladder against its model (stateful, model-based)', {
  timeout: 120_000,
}, () => {
  it('every launch lands on the rung the ADR says, and fails closed', async () => {
    await fc.assert(ladderProperty(GURUDEVI_HOST), {
      numRuns: 200,
      // Counterexamples this test found, pinned so they run first, every time.
      examples: [
        // Rung 4 after a death in native start; a corrupt record must not lift it to rung 3.
        [
          [
            { kind: 'die-in-start', gapMs: HOUR },
            { kind: 'session', end: 'stop', foregroundMs: 5_000, gapMs: HOUR },
            { kind: 'record-corrupted', gapMs: HOUR },
          ],
        ],
      ],
    });
    // Every rung, recovery, and every kind of fault was reached by some run.
    for (const reached of [
      'rung-0',
      'rung-1',
      'rung-2',
      'rung-3',
      'rung-4',
      'recovered',
      'die-in-start',
      'record-corrupted',
    ])
      expect([...seen]).toContain(reached);
  });

  it('is not vacuous: a ladder that recovers faster than the ADR says is caught', async () => {
    const hasty = defineHost({
      name: 'gurudevi',
      levers: GURUDEVI_HOST.levers,
      recovery: { cleanToRecover: 2 },
    });
    const result = await fc.check(ladderProperty(hasty), {
      numRuns: 200,
      // Pinned so the check never depends on random search finding it: two crashes in an hour
      // step down; two clean sessions recover the hasty ladder, where the ADR needs three.
      examples: [
        [
          [
            { kind: 'session', end: 'crash', foregroundMs: 45_000, gapMs: HOUR },
            { kind: 'session', end: 'crash', foregroundMs: 45_000, gapMs: HOUR },
            { kind: 'session', end: 'stop', foregroundMs: 45_000, gapMs: HOUR },
            { kind: 'session', end: 'stop', foregroundMs: 45_000, gapMs: HOUR },
            { kind: 'session', end: 'stop', foregroundMs: 45_000, gapMs: HOUR },
          ],
        ],
      ],
    });
    expect(result.failed).toBe(true);
  });

  it('is not vacuous: a ladder that tolerates more failures than the ADR says is caught', async () => {
    const lenient = defineHost({
      name: 'gurudevi',
      levers: GURUDEVI_HOST.levers,
      recovery: { failuresToEscalate: 3 },
    });
    const result = await fc.check(ladderProperty(lenient), {
      numRuns: 200,
      // Pinned: two crashes in an hour must step down; the lenient ladder waits for a third.
      examples: [
        [
          [
            { kind: 'session', end: 'crash', foregroundMs: 45_000, gapMs: HOUR },
            { kind: 'session', end: 'crash', foregroundMs: 45_000, gapMs: HOUR },
            { kind: 'session', end: 'stop', foregroundMs: 45_000, gapMs: HOUR },
          ],
        ],
      ],
    });
    expect(result.failed).toBe(true);
  });
});

function ladderProperty(host: VergerHost) {
  return fc.asyncProperty(fc.array(stepArb, { minLength: 1, maxLength: 40 }), async (steps) => {
    const p = phone();
    const model = fresh();
    let release = '1.0.0';
    let releaseChanged = false;

    for (const step of steps) {
      p.pass(step.gapMs);
      if (step.kind === 'new-release') {
        release = `1.0.${Number(release.split('.')[2]) + 1}`;
        releaseChanged = true;
        continue;
      }
      if (step.kind === 'record-corrupted') p.data.set('verger:gurudevi:record', '{"v":1,"key":');
      p.faults = {
        read: step.kind === 'store-unreadable',
        write: step.kind === 'store-unwritable',
        dieInStart: step.kind === 'die-in-start',
      };
      const before = model.rung;
      const expected = expectedRung(model, step, p.wallNow(), releaseChanged);
      if (expected !== null) releaseChanged = false;
      const { plan, calls } = await live(p, release, step, host);
      p.faults = {};
      const native = calls.filter((c) => c.startsWith('native:'));
      const hardware = calls.filter((c) => c.startsWith('hardware:'));

      if (expected === null) {
        // Kill switch, unreadable or unwritable storage: off, and nothing native at all.
        expect(plan?.runtime, `${step.kind}`).toBe('off');
        expect(native, `${step.kind}`).toEqual([]);
        // Nothing was judged: the previous session stays pending for the next launch.
        continue;
      }
      expect(plan?.rung, `rung after ${JSON.stringify(step)}`).toBe(expected);
      seen.add(`rung-${expected}`);
      // The marker this launch leaves records the rung it ran on.
      model.lastRung = expected as Model['rung'];
      if (expected < before && !releaseChanged && step.kind !== 'record-corrupted')
        seen.add('recovered');
      if (step.kind !== 'session') seen.add(step.kind);
      if (expected === 4) {
        expect(plan?.runtime).toBe('off');
        expect(
          native.filter(
            (c) => c !== 'native:platform' && c !== 'native:capacity' && c !== 'native:exits',
          ),
        ).toEqual([]);
      }
      if (plan && !plan.hardware) expect(hardware).toEqual([]);

      // What this process leaves for the next launch to judge.
      if (plan?.runtime === 'off') {
        // Verger stayed off: no native start to die in, and an off session proves nothing.
        model.pending = null;
      } else if (step.kind === 'die-in-start') {
        model.pending = { outcome: 'boot-failure', foregroundMs: 0, wall: p.wallNow() };
      } else if (step.kind === 'session') {
        model.pending = {
          outcome: outcomeOf(step.end),
          foregroundMs: step.foregroundMs,
          wall: p.wallNow(),
        };
      } else {
        // The harness abandons this process while visible and with no exit record: per the
        // ADR that is a death while visible, a failure.
        model.pending = { outcome: 'failure', foregroundMs: 0, wall: p.wallNow() };
      }
    }
  });
}
