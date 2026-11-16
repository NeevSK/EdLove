import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  coordinationChecks,
  filterContextProjection,
  listCoordinationTools,
  runCoordinationCheck,
  runPjcJourney,
  runPjcJourneyContext,
} from './coordinationTools.js';

const temporaryRoots: string[] = [];

function makePjcFixture(): string {
  const root = mkdtempSync(path.join(os.tmpdir(), 'coordination-tools-'));
  temporaryRoots.push(root);
  mkdirSync(path.join(root, 'node_modules', 'tsx'), { recursive: true });
  mkdirSync(path.join(root, 'scripts'), { recursive: true });
  writeFileSync(path.join(root, 'package.json'), '{}');
  writeFileSync(
    path.join(root, 'node_modules', 'tsx', 'package.json'),
    JSON.stringify({ bin: { tsx: 'cli.mjs' } }),
  );
  writeFileSync(
    path.join(root, 'node_modules', 'tsx', 'cli.mjs'),
    'console.log(JSON.stringify(process.argv.slice(2)))',
  );
  writeFileSync(path.join(root, 'scripts', 'pjc.ts'), '');
  return root;
}

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe('coordination tool inventory and checks', () => {
  it('declares impacts for every fixed check and keeps security review unavailable', () => {
    const checks = new Map(coordinationChecks.map((check) => [check.id, check]));
    expect(checks.get('pjc-check')?.impacts).toContain('product');
    expect(checks.get('c4-validate')?.impacts).toEqual(['architecture', 'integration']);
    expect(checks.get('api-composition')?.impacts).toContain('api');
    expect(checks.get('api-conformance')?.impacts).toContain('api');
    expect(checks.get('ui-boundaries')?.impacts).toEqual(['web', 'native']);
    expect(checks.get('sql-migrations')?.impacts).toContain('database');
    expect(checks.get('dependency-cohorts')?.impacts).toContain('dependencies');
    expect(checks.get('security-review')?.impacts).toContain('security');
    expect(runCoordinationCheck(process.cwd(), 'security-review')).toMatchObject({
      ok: false,
      exitCode: null,
      error: 'Security review is blocked because a scoped scan adapter is not implemented.',
    });
  });

  it('returns bounded live version probes with an observation time and explicit blocked security state', {
    timeout: 60000,
  }, () => {
    const inventory = listCoordinationTools(process.cwd());
    expect(inventory.map((tool) => tool.id)).toContain('likec4');
    expect(inventory.map((tool) => tool.id)).toContain('rg');
    const likec4 = inventory.find((tool) => tool.id === 'likec4');
    const spectral = inventory.find((tool) => tool.id === 'spectral');
    const squawk = inventory.find((tool) => tool.id === 'squawk');
    expect(likec4).toMatchObject({ availability: 'available', version: '1.60.0' });
    expect(spectral).toMatchObject({ availability: 'available', version: '6.17.1' });
    expect(squawk).toMatchObject({ availability: 'available', version: '2.72.0' });
    const k6 = inventory.find((tool) => tool.id === 'k6');
    if (k6?.availability === 'available') expect(k6.version).not.toBe('3.0');
    expect(inventory.find((tool) => tool.id === 'security-review')).toMatchObject({
      availability: 'blocked',
      version: null,
      capability: 'discovery-only',
    });
    for (const tool of inventory) {
      expect(Number.isNaN(Date.parse(tool.observedAt))).toBe(false);
      expect(['available', 'unavailable', 'blocked']).toContain(tool.availability);
    }
  });

  it('rejects unknown checks without launching a command', () => {
    expect(runCoordinationCheck(process.cwd(), 'not-allowlisted')).toMatchObject({
      ok: false,
      stdout: '',
      exitCode: null,
      error: 'Unknown or unavailable check: not-allowlisted',
    });
  });

  it('runs the PJC journey command through the package bin with a validated journey ID', () => {
    const root = makePjcFixture();
    const result = runPjcJourney(root, 'journey:sample-1');
    expect(result).toMatchObject({ ok: true, exitCode: 0 });
    expect(JSON.parse(result.stdout)).toEqual([
      '--tsconfig',
      'packages/core/tsconfig.json',
      'scripts/pjc.ts',
      'journey',
      'journey:sample-1',
      '--format',
      'json',
    ]);
  });

  it('rejects malformed PJC journey IDs before resolving tools or launching a process', () => {
    expect(runPjcJourney('missing-root', '../outside')).toMatchObject({
      ok: false,
      stdout: '',
      stderr: 'Invalid journey ID',
      exitCode: null,
      error: 'Invalid journey ID',
    });
  });

  it('accepts dotted PJC journey IDs used by the catalog', () => {
    const root = makePjcFixture();
    const result = runPjcJourney(root, 'journey:api.secure_operations');
    expect(result.ok).toBe(true);
    expect(JSON.parse(result.stdout)).toContain('journey:api.secure_operations');
  });

  it('filters context projection according to H2 Information Bottleneck scopes', () => {
    const sampleProjection = {
      feature: { id: 'feature:auth', title: 'Authentication' },
      intent: { id: 'intent:auth', title: 'Secure auth' },
      journey: {
        id: 'journey:auth.login',
        title: 'User Login',
        situation: 'User logging in',
        preconditions: ['Valid DB connection'],
        entry: 'step:enter_credentials',
        development: {
          invariants: ['API requests must be authenticated', 'UI must show loading'],
          integrationPoints: [
            'apps/sanctuary-api/src/auth.ts',
            'apps/gurudevi-mobile/src/Login.tsx',
          ],
        },
        steps: [
          { id: 'step:enter_credentials', title: 'Credentials', terminal: false },
          { id: 'step:verify_jwt', title: 'Verify JWT in API', terminal: true },
        ],
      },
      scenarios: [
        {
          id: 'scen:1',
          title: 'Happy path',
          scenario: 'User logs in',
          tier: 'G1',
          result: 'passed',
          heavyLogs: 'lots of raw log output',
        },
      ],
      sharedRequirements: ['Req1', 'Req2'],
      sharedBindings: ['Binding1'],
    };

    // 1. Local scope: isolates invariants, integration points, entry step, drops broad scenarios and bindings
    const local = filterContextProjection(sampleProjection, { scope: 'local' });
    expect(local).toHaveProperty('invariants');
    expect(local).toHaveProperty('integrationPoints');
    expect(local).toHaveProperty('entry', 'step:enter_credentials');
    expect(local).not.toHaveProperty('scenarios');
    expect(local).not.toHaveProperty('sharedRequirements');
    expect(local.bottleneck).toMatchObject({
      scope: 'local',
      compressed: true,
      policy: expect.stringContaining('H2 Information Bottleneck'),
    });

    // 2. Interface scope: retains boundary interfaces and scenario summaries, drops raw heavy logs
    const iface = filterContextProjection(sampleProjection, { scope: 'interface' });
    expect(iface).toHaveProperty('feature');
    expect(iface).toHaveProperty('intent');
    expect(iface).toHaveProperty('scenarios');
    const scen = (iface.scenarios as Record<string, unknown>[])[0];
    expect(scen).toMatchObject({ id: 'scen:1', title: 'Happy path', tier: 'G1', result: 'passed' });
    expect(scen).not.toHaveProperty('heavyLogs');
    expect(iface.bottleneck).toMatchObject({
      scope: 'interface',
      compressed: true,
    });

    // 3. Domain conditioning (Y): targetDomain: 'api'
    const domainFiltered = filterContextProjection(sampleProjection, {
      scope: 'local',
      targetDomain: 'api',
    });
    expect(domainFiltered.integrationPoints).toEqual(['apps/sanctuary-api/src/auth.ts']);
    expect(domainFiltered.invariants).toEqual(['API requests must be authenticated']);
    expect(domainFiltered.bottleneck).toMatchObject({
      targetDomain: 'api',
      relevanceTarget: 'domain:api',
    });
  });

  it('runs PJC journey and returns context projection with information bottleneck annotation', () => {
    const root = makePjcFixture();
    // Return structured json from the mock tsx script
    writeFileSync(
      path.join(root, 'node_modules', 'tsx', 'cli.mjs'),
      `console.log(JSON.stringify({
        feature: { id: "f:1", title: "Test" },
        journey: {
          id: "journey:test",
          title: "Test Journey",
          development: { invariants: ["Inv1"], integrationPoints: ["src/api.ts"] },
          steps: []
        }
      }))`,
    );

    const res = runPjcJourneyContext(root, 'journey:test', { scope: 'local' });
    expect(res.ok).toBe(true);
    expect(res.scope).toBe('local');
    expect(res.projection?.bottleneck).toMatchObject({
      scope: 'local',
      compressed: true,
    });
  });
});
