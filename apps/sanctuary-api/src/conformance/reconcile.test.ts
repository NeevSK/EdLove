import { describe, expect, it } from 'vitest';
import type { CapabilityManifest } from '../modules/catalog';
import type { Card } from './cards.adapter';
import type { EvidenceRecord } from './evidence';
import { type ReconcileInput, reconcile } from './reconcile';

const cap: CapabilityManifest = {
  name: 'identity.entry',
  module: 'identity',
  kind: 'query',
  channels: ['app'],
  assurance: 'session',
  status: 'admitted',
  requiredEvidence: 'G2',
};

const card: Card = {
  module: 'identity',
  path: 'p.md',
  status: 'admitted',
  commands: [],
  queries: ['identity.entry'],
};
const proof: EvidenceRecord = {
  capability: 'identity.entry',
  level: 'G2',
  passed: true,
  test: 't',
  run: 'db',
  at: '2026-11-08T10:00:00.000Z',
};

const conformant = (): ReconcileInput => ({
  capabilities: [cap],
  contractPaths: ['identity.entry'],
  implementedPaths: ['identity.entry'],
  cards: { identity: card },
  docDrift: [],
  evidence: [proof],
  consumers: [
    { capability: 'identity.entry', client: 'web', channel: 'app', file: 'f.ts', line: 1 },
  ],
  channelRuns: [{ capability: 'identity.entry', channel: 'app', passed: true }],
  changedAt: { 'identity.entry': '2026-11-01T00:00:00.000Z' },
  policy: { 'identity.entry': 'n/a' },
});

const gapsFor = (input: ReconcileInput, name = 'identity.entry') =>
  reconcile(input).find((r) => r.capability === name)?.gaps;

describe('reconcile', () => {
  it('finds no gap in a conformant capability', () => {
    expect(gapsFor(conformant())).toEqual([]);
  });

  it.each<[string, (i: ReconcileInput) => void, string[]]>([
    [
      'no card',
      (i) => {
        i.cards = {};
      },
      ['INTENT_NO_CARD'],
    ],
    [
      'card does not list it',
      (i) => {
        i.cards.identity = { ...card, queries: [] };
      },
      ['INTENT_UNLISTED'],
    ],
    [
      'listed under the wrong kind',
      (i) => {
        i.cards.identity = { ...card, queries: [], commands: ['identity.entry'] };
      },
      ['INTENT_UNLISTED'],
    ],
    [
      'card still a draft',
      (i) => {
        i.cards.identity = { ...card, status: 'draft' };
      },
      ['INTENT_UNCONFIRMED'],
    ],
    [
      'not in the contract',
      (i) => {
        i.contractPaths = [];
        i.implementedPaths = [];
      },
      ['SYMBOL_NO_CONTRACT'],
    ],
    [
      'a document disagrees',
      (i) => {
        i.docDrift = [{ doc: 'd.md', line: 3, module: 'identity', problem: 'x' }];
      },
      ['DOC_DRIFT'],
    ],
    [
      'no handler',
      (i) => {
        i.implementedPaths = [];
      },
      ['CODE_NO_HANDLER'],
    ],
    [
      'policy missing',
      (i) => {
        i.policy['identity.entry'] = false;
      },
      ['CODE_NO_POLICY'],
    ],
    [
      'no evidence',
      (i) => {
        i.evidence = [];
      },
      ['PRACTICE_NO_EVIDENCE'],
    ],
    [
      'only failed evidence',
      (i) => {
        i.evidence = [{ ...proof, passed: false }];
      },
      ['PRACTICE_NO_EVIDENCE'],
    ],
    [
      'evidence below the bar',
      (i) => {
        i.evidence = [{ ...proof, level: 'G1' }];
      },
      ['PRACTICE_BELOW_BAR'],
    ],
    [
      'evidence older than the code',
      (i) => {
        i.changedAt['identity.entry'] = '2026-11-09T00:00:00.000Z';
      },
      ['PRACTICE_STALE'],
    ],
    [
      'nobody calls it',
      (i) => {
        i.consumers = [];
      },
      ['PRACTICE_NO_CONSUMER'],
    ],
    [
      'channel open but unproven',
      (i) => {
        i.channelRuns = [];
      },
      ['CHANNEL_UNPROVEN'],
    ],
  ])('raises exactly the right gap when %s', (_case, mutate, expected) => {
    const input = conformant();
    mutate(input);
    expect(gapsFor(input)).toEqual(expected);
  });

  it('reports a renamed procedure as both undeclared and missing, never as a match', () => {
    const input = conformant();
    input.contractPaths = ['identity.readEntry'];
    input.implementedPaths = ['identity.readEntry'];
    expect(gapsFor(input)).toContain('SYMBOL_NO_CONTRACT');
    expect(gapsFor(input, 'identity.readEntry')).toEqual(['SYMBOL_UNDECLARED']);
  });

  it('reports a card capability that is decided but not built', () => {
    const input = conformant();
    input.cards.identity = { ...card, commands: ['identity.rename'] };
    expect(gapsFor(input, 'identity.rename')).toEqual(['INTENT_ONLY']);
  });

  it('leaves policy unmeasured rather than passing it', () => {
    const input = conformant();
    input.policy['identity.entry'] = 'unmeasured';
    const row = reconcile(input)[0];
    expect(row?.gaps).toEqual([]);
    expect(row?.code.policy).toBe('unmeasured');
  });
});
