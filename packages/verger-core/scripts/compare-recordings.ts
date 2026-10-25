/**
 * Loop 3 (D5): replays recorded sessions (JSON from `Verger.recording()`, exported by the dev
 * lab) through verger-p4, verger-p5 and the floors alone (verger off), and prints strain,
 * quality given up and moves per policy. Its output is evidence for Naveen's choice of release
 * preset and default policy; it decides nothing itself. Open loop: every policy sees the
 * recorded disturbances, so it compares decisions, not their effects (see `comparePolicies`).
 *
 *   pnpm --filter @repo/verger-core compare <recording.json>...
 */
import { readFileSync } from 'node:fs';
import {
  comparePolicies,
  FLOORS_ACTIVATION,
  type PolicyReport,
  VERGER_POLICY,
  VERGER_POLICY_P5,
  type VergerPolicy,
  type VergerRecording,
} from '../src/index';

const FLOORS_ONLY: VergerPolicy = {
  ...VERGER_POLICY,
  id: 'verger-floors',
  create: (options) => VERGER_POLICY.create({ ...options, activation: FLOORS_ACTIVATION }),
};
const POLICIES = { off: FLOORS_ONLY, p4: VERGER_POLICY, p5: VERGER_POLICY_P5 };

function isRecording(value: unknown): value is VergerRecording {
  if (typeof value !== 'object' || value === null) return false;
  const r = value as Record<string, unknown>;
  return typeof r.policyVersion === 'number' && Array.isArray(r.events) && typeof r.options === 'object' && r.options !== null;
}

const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
// The floors sense no frames, memory or heat, so their strain reads zero: deaf, not calm.
const row = (name: string, r: PolicyReport) =>
  [name.padEnd(4), (name === 'off' ? 'deaf' : `${(r.strainMs / 1000).toFixed(1)}s`).padStart(8), pct(r.qualityGivenUp).padStart(7), pct(r.qualityGivenUpCalm).padStart(7), pct(r.worstQuality).padStart(7), String(r.moves).padStart(6)].join('  ');

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error('usage: compare-recordings <recording.json>...');
  process.exit(2);
}
let failed = false;
for (const file of files) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    console.error(`${file}: unreadable (${error instanceof Error ? error.message : String(error)})`);
    failed = true;
    continue;
  }
  if (!isRecording(parsed)) {
    console.error(`${file}: not a verger recording`);
    failed = true;
    continue;
  }
  const report = comparePolicies(parsed.options, parsed.events, POLICIES);
  console.log(`\n${file}: ${parsed.events.length} events, recorded under policy ${parsed.policyVersion}${parsed.dropped > 0 ? `, ${parsed.dropped} dropped (session cut short)` : ''}`);
  console.log('      strain  given up  calm   worst   moves');
  for (const [name, r] of Object.entries(report)) console.log(row(name, r));
}
process.exit(failed ? 1 : 0);
