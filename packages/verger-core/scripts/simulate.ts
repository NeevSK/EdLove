/**
 * Closed-loop comparison on the plant model (P2): every policy arm on every reference phone and
 * session, judged on the plant's truth. G2, model-based: it shows what a policy does to this
 * model of a phone, not to a real one.
 *
 *   pnpm --filter @repo/verger-core simulate
 */
import {
  ACTIVATION_PRESETS,
  compareClosedLoop,
  type ControlMetrics,
  FLOORS_ACTIVATION,
  SIM_PHONES,
  SIM_SESSIONS,
  VERGER_POLICY,
  VERGER_POLICY_P5,
} from '../src/index';
import { SAMPLE_LEVERS } from '../src/__fixtures__/sampleHost';

const ARMS = {
  off: { policy: VERGER_POLICY, activation: FLOORS_ACTIVATION },
  p4: { policy: VERGER_POLICY, activation: ACTIVATION_PRESETS.active },
  p5: { policy: VERGER_POLICY_P5, activation: ACTIVATION_PRESETS.active },
};

const pct = (x: number) => `${(x * 100).toFixed(0)}%`.padStart(5);
const row = (name: string, m: ControlMetrics) =>
  [
    name.padEnd(4),
    pct(m.jankShare),
    pct(m.qualityGivenUp),
    pct(m.qualityWhileJanking),
    m.flapsPerMinute.toFixed(2).padStart(6),
    m.slowReversalsPerMinute.toFixed(2).padStart(5),
    m.thermalFlipsPerMinute.toFixed(2).padStart(6),
    m.thermalChatterPerMinute.toFixed(2).padStart(7),
    `${m.peakTemperatureC.toFixed(1)}`.padStart(6),
    `${(m.hotMs / 1000).toFixed(0)}s`.padStart(6),
    (Number.isFinite(m.settlingMs) ? `${(m.settlingMs / 1000).toFixed(0)}s` : 'never').padStart(6),
  ].join(' ');

for (const [phoneName, phone] of Object.entries(SIM_PHONES)) {
  for (const [sessionName, session] of Object.entries(SIM_SESSIONS)) {
    console.log(`\n${phoneName} · ${sessionName}`);
    console.log('arm   jank  given  w/jank  flaps  slow  heatΔ chatter   peak    hot settle');
    const report = compareClosedLoop({ phone, session, levers: SAMPLE_LEVERS, arms: ARMS });
    for (const [name, metrics] of Object.entries(report)) console.log(row(name, metrics));
  }
}
