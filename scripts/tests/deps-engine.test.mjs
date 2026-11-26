import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  classifyCandidate,
  isExcludedFromReleaseAge,
  parseMinimumReleaseAgeConfig,
  parseTazeJson,
  updateWorkspaceOverrides,
} from '../lib/deps-engine.mjs';

describe('deps-engine', () => {
  it('parses minimumReleaseAge and exclude patterns from pnpm-workspace.yaml', () => {
    const yaml = `
minimumReleaseAge: 1440
minimumReleaseAgeExclude:
  - 'react-native-skia'
  - '@shopify/react-native-skia'
  - '@expo/*'
overrides:
  react: '19.3.1'
`;
    const cfg = parseMinimumReleaseAgeConfig(yaml);
    assert.equal(cfg.minimumReleaseAgeMinutes, 1440);
    assert.deepEqual(cfg.excludePatterns, ['react-native-skia', '@shopify/react-native-skia', '@expo/*']);
    assert.equal(isExcludedFromReleaseAge('@shopify/react-native-skia', cfg.excludePatterns), true);
    assert.equal(isExcludedFromReleaseAge('@expo/agent-cli', cfg.excludePatterns), true);
    assert.equal(isExcludedFromReleaseAge('@biomejs/biome', cfg.excludePatterns), false);
  });

  it('extracts JSON array from noisy taze output', () => {
    const out = 'mise WARN missing node\n[{"name":"edlove","resolved":[]}]\nDone';
    assert.deepEqual(parseTazeJson(out), [{ name: 'edlove', resolved: [] }]);
    assert.deepEqual(parseTazeJson('no json'), []);
  });

  it('classifies candidates across all governance buckets', () => {
    const now = Date.parse('2026-11-25T12:00:00Z');

    assert.equal(
      classifyCandidate({ name: 'aislop', current: '0.22.2', target: '0.23.0', diff: 'minor', provenanceDowngraded: true }).bucket,
      'UNTRUSTED_PROVENANCE'
    );

    assert.equal(
      classifyCandidate({
        name: 'react-native-reanimated',
        current: '4.8.0',
        target: '4.9.0',
        diff: 'minor',
        cohortInfo: { governance: 'SACRED_INVIOLABLE', cohortName: 'Sacred Native' },
      }).bucket,
      'HELD_OR_SACRED'
    );

    assert.equal(
      classifyCandidate({
        name: '@biomejs/biome',
        current: '2.6.8',
        target: '2.6.9',
        diff: 'patch',
        publishedAt: '2026-11-25T06:00:00Z',
        is24hExcluded: false,
        minimumReleaseAgeMinutes: 1440,
        nowMs: now,
      }).bucket,
      'BLOCKED_24H'
    );

    assert.equal(
      classifyCandidate({
        name: 'react-native-skia',
        current: '^3.11.0',
        target: '^3.13.0',
        diff: 'minor',
        publishedAt: '2026-11-25T10:00:00Z',
        is24hExcluded: true,
        cohortInfo: { governance: 'MONOREPO_UNIVERSAL', cohortName: 'Skia' },
        minimumReleaseAgeMinutes: 1440,
        nowMs: now,
      }).bucket,
      'COHORT_SYNC'
    );

    assert.equal(
      classifyCandidate({ name: 'fallow', current: '3.45.0', target: '3.48.0', diff: 'minor', nowMs: now }).bucket,
      'SAFE_PATCH_MINOR'
    );

    assert.equal(
      classifyCandidate({ name: '@babel/traverse', current: '7.29.15', target: '8.1.3', diff: 'major', nowMs: now }).bucket,
      'MAJOR_REVIEW'
    );
  });

  it('updates pnpm-workspace.yaml overrides and npm: aliases without touching allowBuilds', () => {
    const ws = [
      'overrides:',
      "  'react-native-skia': '^3.11.0'",
      "  '@shopify/react-native-skia': 'npm:react-native-skia@^3.11.0'",
      'allowBuilds:',
      "  'react-native-skia': true",
    ].join('\n');

    const updated = updateWorkspaceOverrides(ws, 'react-native-skia', '^3.13.1');
    assert.match(updated, /'react-native-skia': '\^3\.13\.1'/);
    assert.match(updated, /'@shopify\/react-native-skia': 'npm:react-native-skia@\^3\.13\.1'/);
    assert.match(updated, /'react-native-skia': true/);
  });
});
