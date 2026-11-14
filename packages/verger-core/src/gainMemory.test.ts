import { describe, expect, it } from 'vitest';
import { SAMPLE_LEVERS } from './__fixtures__/sampleHost';
import { DEFAULT_VERGER_CONFIG } from './config';
import {
  classifySession,
  DEFAULT_RECOVERY_CONFIG as R,
  foldSession,
  freshRecord,
  parseMarker,
  parseRecord,
  planLaunch,
  type SessionMarker,
  type VergerRecord,
} from './recovery';
import { createVergerState, snapshotOf } from './reducer';
import { createSessionLedger, type SessionReport } from './session';

/** R6: lever gains measured on a device survive a relaunch, and fade when not measured again. */
const KEY = 'p5:abc:1.0';
const report = (gains?: SessionReport['gains']): SessionReport => ({
  foregroundMs: 600_000,
  evidenceMs: 600_000,
  stressedMs: 0,
  worstThermal: 'nominal',
  worstMemory: 'normal',
  contentionExhausted: false,
  qualityCost: 0,
  pressure: {},
  ...(gains ? { gains } : {}),
});
const marker = (startedAtWall: number, gains?: SessionReport['gains']): SessionMarker => ({
  v: 1,
  key: KEY,
  pid: null,
  startedAtWall,
  phase: 'running',
  foreground: false,
  runtime: 'active',
  rung: 0,
  exercise: false,
  report: report(gains),
});
const fold = (record: VergerRecord, m: SessionMarker, device = 'dev1') =>
  foldSession(record, classifySession(m, null), { key: KEY, device, nowWall: m.startedAtWall + 1_000 }, R).record;

describe('gains across launches (R6)', () => {
  it('a session’s gains join the profile; a lever it did not measure keeps half its samples, then fades', () => {
    let record = fold(freshRecord(KEY, 'dev1', R), marker(1_000, { frosting: { gain: 0.15, samples: 8 } }));
    expect(record.profile.gains).toEqual({ frosting: { gain: 0.15, samples: 8 } });
    record = fold(record, marker(2_000_000, { 'rows-ahead': { gain: 0.1, samples: 4 } }));
    expect(record.profile.gains).toEqual({
      frosting: { gain: 0.15, samples: 4 },
      'rows-ahead': { gain: 0.1, samples: 4 },
    });
    for (let i = 0; i < 3; i += 1) record = fold(record, marker(3_000_000 + i * 1_000_000));
    expect(record.profile.gains?.frosting).toBeUndefined();
  });

  it('a new device build starts over, gains included', () => {
    const record = fold(freshRecord(KEY, 'dev1', R), marker(1_000, { frosting: { gain: 0.15, samples: 8 } }));
    expect(fold(record, marker(2_000_000), 'dev2').profile.gains).toBeUndefined();
  });

  it('every running rung launches with the gains; off, shadow and an exercise launch do not', () => {
    const base = fold(freshRecord(KEY, 'dev1', R), marker(1_000, { frosting: { gain: 0.15, samples: 8 } }));
    for (const rung of [0, 1, 2] as const)
      expect(planLaunch({ ...base, ladder: { ...base.ladder, rung } }, 'active', 0.99, R).gains).toEqual({
        frosting: { gain: 0.15, samples: 8 },
      });
    for (const rung of [3, 4] as const)
      expect(planLaunch({ ...base, ladder: { ...base.ladder, rung } }, 'active', 0.99, R).gains).toEqual({});
    expect(planLaunch(base, 'active', 0, { ...R, exercisePercent: 100 }).gains).toEqual({});
  });

  it('seeded into the reducer at most gainMinSamples strong, for the host’s levers only', () => {
    const state = createVergerState({
      at: 0,
      levers: SAMPLE_LEVERS,
      initialGains: { frosting: { gain: 0.15, samples: 40 }, 'not-a-lever': { gain: 0.5, samples: 9 } },
    });
    expect(state.leverGains).toEqual({ frosting: { gain: 0.15, samples: DEFAULT_VERGER_CONFIG.gainMinSamples } });
  });

  it('the session report carries the gains the session ended with', () => {
    const ledger = createSessionLedger(SAMPLE_LEVERS);
    const state = createVergerState({ at: 0, levers: SAMPLE_LEVERS, initialGains: { frosting: { gain: 0.2, samples: 5 } } });
    ledger.onSnapshot(snapshotOf(state));
    expect(ledger.report(1_000).gains).toEqual({ frosting: { gain: 0.2, samples: DEFAULT_VERGER_CONFIG.gainMinSamples } });
  });

  it('persisted gains are checked strictly: a malformed one makes the record or marker absent', () => {
    const record = fold(freshRecord(KEY, 'dev1', R), marker(1_000, { frosting: { gain: 0.15, samples: 8 } }));
    expect(parseRecord(JSON.stringify(record))).toEqual(record);
    const bad = (gains: unknown) => JSON.stringify({ ...record, profile: { ...record.profile, gains } });
    expect(parseRecord(bad({ frosting: { gain: 2, samples: 1 } }))).toBeNull();
    expect(parseRecord(bad({ frosting: { gain: 0.1, samples: 1.5 } }))).toBeNull();
    expect(parseRecord(bad({ frosting: { gain: 0.1 } }))).toBeNull();
    const m = marker(1_000, { frosting: { gain: 0.15, samples: 8 } });
    expect(parseMarker(JSON.stringify(m))).toEqual(m);
    expect(parseMarker(JSON.stringify({ ...m, report: { ...m.report, gains: { x: { gain: Number.NaN, samples: 1 } } } }))).toBeNull();
    // Records written before R6 have no gains and still read.
    const { gains: _gains, ...older } = record.profile;
    expect(parseRecord(JSON.stringify({ ...record, profile: older }))).not.toBeNull();
  });
});
