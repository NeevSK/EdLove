import { describe, expect, it } from 'vitest';
import { bestPassing, capabilityTag, type EvidenceRecord, parseVitestReport } from './evidence';

const report = {
  startTime: Date.parse('2026-11-08T10:00:00Z'),
  testResults: [
    {
      name: '/repo/src/a.test.ts',
      assertionResults: [
        {
          ancestorTitles: [`bonds ${capabilityTag('identity.createInitialBond')}`],
          title: 'returns the existing bond on retry',
          status: 'passed',
        },
        {
          ancestorTitles: ['transport'],
          title: `serves identity ${capabilityTag('identity.session', 'identity.scopes')}`,
          status: 'failed',
        },
        {
          ancestorTitles: ['untagged'],
          title: 'proves nothing about a capability',
          status: 'passed',
        },
      ],
    },
  ],
};

const record = (over: Partial<EvidenceRecord>): EvidenceRecord => ({
  capability: 'identity.entry',
  level: 'G1',
  passed: true,
  test: 't',
  run: 'r',
  at: '2026-11-08T10:00:00.000Z',
  ...over,
});

describe('capability evidence', () => {
  it('reads one record per tagged test and capability, from describe or test titles', () => {
    expect(parseVitestReport('unit', 'G1', report)).toEqual([
      {
        capability: 'identity.createInitialBond',
        level: 'G1',
        passed: true,
        test: `bonds ${capabilityTag('identity.createInitialBond')} > returns the existing bond on retry`,
        run: 'unit',
        at: '2026-11-08T10:00:00.000Z',
      },
      expect.objectContaining({ capability: 'identity.session', passed: false }),
      expect.objectContaining({ capability: 'identity.scopes', passed: false }),
    ]);
  });

  it('refuses a report that is not a Vitest JSON report', () => {
    expect(() => parseVitestReport('unit', 'G1', { tests: [] })).toThrow();
  });

  it('never counts a failed run, even one at a higher level', () => {
    const records = [record({ level: 'G1' }), record({ level: 'G2', passed: false })];
    expect(bestPassing(records, 'identity.entry')?.level).toBe('G1');
  });

  it('picks the highest passing level, and the latest at that level', () => {
    const records = [
      record({ level: 'G1', at: '2026-11-09T00:00:00.000Z' }),
      record({ level: 'G2', at: '2026-11-01T00:00:00.000Z', run: 'old' }),
      record({ level: 'G2', at: '2026-11-05T00:00:00.000Z', run: 'new' }),
    ];
    expect(bestPassing(records, 'identity.entry')).toMatchObject({ level: 'G2', run: 'new' });
  });

  it('has nothing for a capability no passing test names', () => {
    expect(bestPassing([record({ passed: false })], 'identity.entry')).toBeUndefined();
    expect(bestPassing([record({})], 'identity.session')).toBeUndefined();
  });
});
