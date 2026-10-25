import { describe, expect, it } from 'vitest';
import { SAMPLE_LEVERS } from './__fixtures__/sampleHost';
import { DEFAULT_VERGER_CONFIG } from './config';
import { defineHost } from './host';
import { labConfigure, labReport, labTune } from './lab';
import { UNKNOWN_CAPACITY } from './reducer';
import { createVerger } from './verger';

function lab() {
  let clock = 0;
  const host = defineHost({ name: 'lab', levers: SAMPLE_LEVERS });
  const verger = createVerger({
    host,
    platform: () => ({
      readCapacity: () => UNKNOWN_CAPACITY,
      memorySensing: false,
      createPort: () => ({ start: () => () => {}, setRefreshCap: () => {}, setCpuBoost: () => {} }),
    }),
    requested: 'active',
    release: '1',
    now: () => clock,
    recordEvents: 100,
  });
  return { verger, host, pass: (ms: number) => (clock += ms) };
}

describe('the dev lab model (D2)', () => {
  it('reports the floors before start and the whole stage while running', async () => {
    const { verger, host, pass } = lab();
    const before = labReport(verger, host.levers);
    expect(before).toMatchObject({ running: false, activation: null, outcomes: null, selfCost: null, recorded: null });
    expect(before.snapshot).not.toBeNull();
    await verger.start();
    pass(10);
    verger.dispatch({ type: 'interaction', at: 10 });
    const report = labReport(verger, host.levers);
    expect(report.running).toBe(true);
    expect(report.levers.map((l) => l.id)).toEqual(host.levers.map((l) => l.id));
    for (const l of report.levers) expect(l.limit <= l.ceiling && l.ceiling <= l.home && l.home <= l.floor).toBe(true);
    expect(report.accounts?.gpu.state).toBeDefined();
    expect(report.selfCost?.events).toBeGreaterThan(0);
    expect(report.recorded).toBeGreaterThan(0);
    expect(report.outcomeTotals).toMatchObject({ relieved: 0 });
  });

  it('configure: applies a valid patch live, refuses a malformed one whole and says why', async () => {
    const { verger, host } = lab();
    expect(labConfigure(verger, host.levers, '{"grow":false}')).toMatchObject({ ok: false, error: 'verger is not running' });
    await verger.start();
    expect(labConfigure(verger, host.levers, '{"grow":false}')).toMatchObject({ ok: true });
    expect(verger.activation?.grow).toBe(false);
    expect(labConfigure(verger, host.levers, '{"levers":{"nope":"off"}}')).toMatchObject({ ok: false, error: expect.stringMatching(/unknown lever/) });
    expect(labConfigure(verger, host.levers, '{grow')).toMatchObject({ ok: false, error: expect.stringMatching(/^not JSON/) });
    expect(verger.activation?.grow).toBe(false);
    expect(labConfigure(verger, host.levers, '')).toMatchObject({ ok: true, patch: null });
    expect(verger.activation?.grow).toBe(true);
  });

  it('tune: validates the whole config before anything changes', async () => {
    const { verger } = lab();
    await verger.start();
    expect(labTune(verger, DEFAULT_VERGER_CONFIG, '{"upgradeAfterMs":2000}')).toEqual({ ok: true });
    expect(labTune(verger, DEFAULT_VERGER_CONFIG, '{"upgradeAfterMs":999999}')).toMatchObject({ ok: false, error: expect.stringMatching(/below/) });
    expect(labTune(verger, DEFAULT_VERGER_CONFIG, '{"noSuch":1}')).toMatchObject({ ok: false, error: expect.stringMatching(/unknown threshold/) });
    expect(labTune(verger, DEFAULT_VERGER_CONFIG, '{"upgradeAfterMs":"x"}')).toMatchObject({ ok: false });
    expect(labTune(verger, DEFAULT_VERGER_CONFIG, '[1]')).toMatchObject({ ok: false });
    expect(labTune(verger, DEFAULT_VERGER_CONFIG, '')).toEqual({ ok: true });
  });
});
