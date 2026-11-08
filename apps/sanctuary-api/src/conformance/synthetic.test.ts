// Synthetic capabilities prove the mechanism holds for many modules, kinds, depths and channels,
// without admitting any product rule. Nothing here reaches the router or the catalog.
import { describe, expect, it } from 'vitest';
import type { CapabilityManifest } from '../modules/catalog';
import type { EvidenceRecord } from './evidence';
import { type ReconcileInput, reconcile } from './reconcile';

type Module = CapabilityManifest['module'];
// Real catalog names, used only as labels for synthetic capabilities in this test.
const alpha: Module = 'wellbeing.mood';
const beta: Module = 'learning.assignments';
const gamma: Module = 'ops.attendance';

const cap = (
  module: Module,
  short: string,
  kind: 'query' | 'command',
  channels: CapabilityManifest['channels'] = ['app'],
): CapabilityManifest => ({
  name: `${module}.${short}`,
  module,
  kind,
  channels,
  assurance: 'session',
  status: 'admitted',
  requiredEvidence: 'G2',
});

const proof = (
  capability: string,
  level: EvidenceRecord['level'],
  passed = true,
): EvidenceRecord => ({
  capability,
  level,
  passed,
  test: 't',
  run: 'r',
  at: '2026-11-08T10:00:00.000Z',
});

const synthetic = (): ReconcileInput => {
  const caps = [
    cap(alpha, 'read', 'query', ['app', 'bots']),
    cap(alpha, 'write', 'command'),
    cap(beta, 'list', 'query', ['app', 'bots']),
    cap(beta, 'submit', 'command'),
    cap(gamma, 'record', 'command'),
    cap(gamma, 'summary', 'query'),
  ];
  const names = caps.map((c) => c.name);
  return {
    capabilities: caps,
    contractPaths: names,
    implementedPaths: names.filter((n) => !n.endsWith('summary')),
    cards: {
      [alpha]: {
        module: alpha,
        path: 'a.md',
        status: 'admitted',
        commands: [`${alpha}.write`],
        queries: [`${alpha}.read`],
      },
      [beta]: {
        module: beta,
        path: 'b.md',
        status: 'draft',
        commands: [`${beta}.submit`],
        queries: [`${beta}.list`],
      },
    },
    docDrift: [],
    evidence: [
      proof(`${alpha}.read`, 'G2'),
      proof(`${alpha}.write`, 'G2'),
      proof(`${beta}.list`, 'G1'),
      proof(`${beta}.submit`, 'G3', false),
    ],
    consumers: names
      .slice(0, 4)
      .map((capability) => ({ capability, client: 'web', channel: 'app', file: 'f.ts', line: 1 })),
    channelRuns: names.flatMap((capability) => [
      { capability, channel: 'app' as const, passed: true },
      ...(capability.endsWith('.read')
        ? [{ capability, channel: 'bots' as const, passed: true }]
        : []),
    ]),
    changedAt: {},
    policy: Object.fromEntries(names.map((n) => [n, true])),
  };
};

describe('synthetic capabilities across modules, kinds and channels', () => {
  it('gives each capability exactly its own gaps', () => {
    const gaps = Object.fromEntries(reconcile(synthetic()).map((r) => [r.capability, r.gaps]));
    expect(gaps).toEqual({
      [`${alpha}.read`]: [],
      [`${alpha}.write`]: [],
      [`${beta}.list`]: ['INTENT_UNCONFIRMED', 'PRACTICE_BELOW_BAR', 'CHANNEL_UNPROVEN'],
      [`${beta}.submit`]: ['INTENT_UNCONFIRMED', 'PRACTICE_NO_EVIDENCE'],
      [`${gamma}.record`]: ['INTENT_NO_CARD', 'PRACTICE_NO_EVIDENCE', 'PRACTICE_NO_CONSUMER'],
      [`${gamma}.summary`]: [
        'INTENT_NO_CARD',
        'CODE_NO_HANDLER',
        'PRACTICE_NO_EVIDENCE',
        'PRACTICE_NO_CONSUMER',
      ],
    });
  });

  it('changes only the new row when a seventh capability is added', () => {
    const before = reconcile(synthetic());
    const input = synthetic();
    const added = cap(alpha, 'archive', 'command');
    input.capabilities = [...input.capabilities, added];
    const after = reconcile(input);
    expect(after.filter((r) => r.capability !== added.name)).toEqual(before);
    expect(after.find((r) => r.capability === added.name)?.gaps).toContain('SYMBOL_NO_CONTRACT');
  });

  it('reconciles a catalog of 400 capabilities quickly (a regression bound, not a performance claim)', () => {
    const input = synthetic();
    const many = Array.from({ length: 400 }, (_, i) =>
      cap(beta, `c${i}`, i % 2 ? 'query' : 'command'),
    );
    input.capabilities = many;
    input.cards = {};
    input.contractPaths = many.map((c) => c.name);
    input.implementedPaths = input.contractPaths;
    const started = performance.now();
    const rows = reconcile(input);
    expect(rows).toHaveLength(400);
    expect(performance.now() - started).toBeLessThan(1000);
  });
});
