import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, rmdirSync, unlinkSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadCatalogFile } from './catalogLoader.adapter';

const root = path.resolve(process.cwd(), '../..');
const runner = path.join(root, 'node_modules/tsx/dist/cli.mjs');
const args = [
  '--tsconfig',
  path.join(root, 'packages/core/tsconfig.json'),
  path.join(root, 'scripts/pjc.ts'),
];
const run = (...more: string[]) =>
  execFileSync(process.execPath, [runner, ...args, ...more], { cwd: root, encoding: 'utf8' });

describe('PJC CLI', () => {
  it('shows a separate journey for each catalog operation', () => {
    const tree = JSON.parse(run('tree', 'feature:pjc.catalog'));
    expect(tree).toHaveLength(1);
    expect(tree[0].intents).toHaveLength(4);
    expect(
      tree[0].intents.map((intent: { journeys: { id: string }[] }) => intent.journeys[0].id),
    ).toEqual([
      'journey:pjc.catalog',
      'journey:pjc.query',
      'journey:pjc.trace',
      'journey:pjc.validate',
    ]);
  });
  it('shows journey steps and ordered scenario transitions at path depth', () => {
    const tree = JSON.parse(run('tree', 'feature:admin.school_connection', '--depth', 'paths'));
    const intent = tree[0].intents.find(
      (item: { id: string }) => item.id === 'intent:school.principal_accept',
    );
    const journey = intent.journeys.find(
      (item: { id: string }) => item.id === 'journey:school.accept_invitation',
    );
    expect(journey.entry).toBe('step:school.receive');
    expect(journey.steps.map((item: { id: string }) => item.id)).toContain('step:school.confirm');
    expect(
      journey.scenarios.find((item: { id: string }) => item.id === 'scenario:school.accept')
        .transitions,
    ).toEqual([
      'transition:school.authenticate',
      'transition:school.lookup',
      'transition:school.accept',
    ]);
    expect(
      journey.transitions.find((item: { id: string }) => item.id === 'transition:school.lookup')
        .feedback,
    ).toBeTruthy();
  }, 20000);
  it('lists all features when tree begins with an option', () => {
    const tree = JSON.parse(run('tree', '--format', 'json'));
    expect(tree.map((feature: { id: string }) => feature.id)).toContain('feature:pjc.catalog');
  });
  it('queries the self journey', () => {
    const view = JSON.parse(run('journey', 'journey:pjc.query'));
    expect(view.intent.id).toBe('intent:pjc.query');
    expect(view.sharedBindings.map((binding: { id: string }) => binding.id)).toContain(
      'binding:pjc.cli',
    );
  });
  it('includes a reverse-linked requirement binding in journey checks', () => {
    const directory = mkdtempSync(path.join(os.tmpdir(), 'pjc-test-'));
    const fixture = path.join(directory, 'catalog.json');
    try {
      const current = JSON.parse(
        JSON.stringify(
          loadCatalogFile(path.join(root, 'packages/core/src/flows/pjc/catalog.v2.json')),
        ),
      );
      const journey = current.features[0].intents[1].journeys[0];
      const owner = current.features[0].intents[0].journeys[0];
      const scenario = journey.scenarios[0];
      scenario.links = ['requirement:pjc.query_records'];
      journey.transitions.forEach((transition: { links?: string[] }) => {
        transition.links = [];
      });
      const requirement = journey.requirements.find(
        (item: { id: string }) => item.id === 'requirement:pjc.query_records',
      );
      requirement.links = [];
      owner.bindings.push({
        id: 'binding:pjc.reverse_requirement_cli',
        category: 'tool',
        status: 'unknown',
        note: 'Fixture.',
        links: ['requirement:pjc.query_records'],
      });
      writeFileSync(fixture, JSON.stringify(current));
      const report = JSON.parse(run('check', '--file', fixture, '--journey', journey.id));
      expect(report.bindings.map((item: { id: string }) => item.id)).toContain(
        'binding:pjc.reverse_requirement_cli',
      );
      expect(report.gaps).not.toContain(`${scenario.id}: no linked binding`);
      expect(report.gaps).not.toContain(`${scenario.id}: no linked implementation binding`);
    } finally {
      unlinkSync(fixture);
      rmdirSync(directory);
    }
  }, 20000);
  it('filters the self intents', () => {
    expect(JSON.parse(run('list', '--kind', 'intent', '--query', 'intent:pjc.')).length).toBe(4);
  });
  it('queries requirement classification and reports missing classifications', () => {
    const rows = JSON.parse(
      run(
        'list',
        '--kind',
        'requirement',
        '--requirement-type',
        'functional',
        '--actor',
        'product contributor',
      ),
    );
    expect(rows.map((row: { id: string }) => row.id)).toContain('requirement:pjc.query_records');
    expect(
      rows.every((row: { classification: string }) => row.classification === 'functional'),
    ).toBe(true);
    const gaps = JSON.parse(run('check', '--journey', 'journey:school.accept_invitation')).gaps;
    expect(gaps).toContain('requirement:school.authority: classification not declared');
  }, 20000);
  it('finds actor journeys and their shared authorities', () => {
    const journeys = JSON.parse(run('list', '--kind', 'journey', '--actor', 'principal'));
    expect(journeys.map((item: { id: string }) => item.id)).toContain(
      'journey:school.accept_invitation',
    );
    expect(journeys.map((item: { id: string }) => item.id)).not.toContain(
      'journey:classroom.teacher_first_workspace.legacy',
    );
    const bindings = JSON.parse(run('list', '--kind', 'binding', '--actor', 'principal'));
    expect(bindings.map((item: { id: string }) => item.id)).toContain(
      'binding:school.invite_repository',
    );
  }, 20000);
  it('includes a journey explicitly shared with a matching actor', () => {
    const directory = mkdtempSync(path.join(os.tmpdir(), 'pjc-test-'));
    const fixture = path.join(directory, 'catalog.json');
    try {
      const current = JSON.parse(
        JSON.stringify(
          loadCatalogFile(path.join(root, 'packages/core/src/flows/pjc/catalog.v2.json')),
        ),
      );
      const feature = current.features.find(
        (item: { id: string }) => item.id === 'feature:classroom.teacher_first_workspace',
      );
      feature.intents[0].sharedJourneys.push('journey:school.accept_invitation');
      writeFileSync(fixture, JSON.stringify(current));
      const journeys = JSON.parse(
        run('list', '--kind', 'journey', '--actor', 'teacher', '--file', fixture),
      );
      expect(journeys.map((item: { id: string }) => item.id)).toContain(
        'journey:school.accept_invitation',
      );
    } finally {
      unlinkSync(fixture);
      rmdirSync(directory);
    }
  }, 20000);
  it('searches record content without treating child records as parent text', () => {
    const bindings = JSON.parse(run('list', '--kind', 'binding', '--query', 'scripts/pjc.ts'));
    expect(bindings.map((item: { id: string }) => item.id)).toContain('binding:pjc.cli');
    const impacts = JSON.parse(run('list', '--kind', 'impact', '--query', 'relationship indexing'));
    expect(impacts.map((item: { id: string }) => item.id)).toContain('impact:pjc.trace');
    const features = JSON.parse(
      run('list', '--kind', 'feature', '--query', 'relationship indexing'),
    );
    expect(features).toEqual([]);
  }, 20000);
  it('lists and traces structured brownfield records', () => {
    const impacts = JSON.parse(run('list', '--kind', 'impact'));
    expect(impacts.map((item: { id: string }) => item.id)).toContain('impact:pjc.authoring');
    const platform = JSON.parse(run('trace', 'platform:pjc.tooling'));
    expect(platform.parent).toBe('journey:pjc.catalog');
    expect(platform.outgoing).toContain('binding:pjc.cli');
    const platforms = JSON.parse(run('list', '--kind', 'platform', '--platform', 'tooling'));
    expect(platforms.map((item: { id: string }) => item.id)).toContain('platform:pjc.tooling');
    expect(JSON.parse(run('check')).gaps).toContain(
      'journey:school.accept_invitation: impact analysis not recorded',
    );
  }, 20000);
  it('lists and traces brownfield observations with provenance', () => {
    const rows = JSON.parse(run('list', '--kind', 'observation', '--query', 'existing flowdag'));
    expect(rows.map((item: { id: string }) => item.id)).toContain('observation:pjc.flow_registry');
    const trace = JSON.parse(run('trace', 'observation:pjc.flow_registry'));
    expect(trace.record.origin).toBe('source');
    expect(trace.outgoing).toContain('binding:pjc.flow_registry');
    expect(JSON.parse(run('check')).gaps).toContain(
      'journey:school.accept_invitation: source observations not recorded',
    );
  }, 20000);
  it('filters records by declared origin without inferring verification', () => {
    const records = JSON.parse(run('list', '--origin', 'source', '--kind', 'observation'));
    expect(records.map((item: { id: string }) => item.id)).toContain(
      'observation:pjc.flow_registry',
    );
    expect(records.every((item: { origin: string }) => item.origin === 'source')).toBe(true);
    const invalid = spawnSync(process.execPath, [runner, ...args, 'list', '--origin', 'assumed'], {
      cwd: root,
      encoding: 'utf8',
    });
    expect(invalid.status).toBe(2);
  }, 20000);
  it('filters independent journey planning dimensions', () => {
    const directory = mkdtempSync(path.join(os.tmpdir(), 'pjc-test-'));
    const fixture = path.join(directory, 'catalog.json');
    try {
      const current = JSON.parse(
        JSON.stringify(
          loadCatalogFile(path.join(root, 'packages/core/src/flows/pjc/catalog.v2.json')),
        ),
      );
      current.features[0].intents[1].journeys[0].planning = {
        maturity: 'development',
        implementation: 'partial',
        verification: 'not_started',
        priority: 'P1',
      };
      writeFileSync(fixture, JSON.stringify(current));
      const rows = JSON.parse(
        run(
          'list',
          '--file',
          fixture,
          '--kind',
          'journey',
          '--maturity',
          'development',
          '--implementation',
          'partial',
          '--verification',
          'not_started',
          '--priority',
          'P1',
          '--context',
          'daily',
        ),
      );
      expect(rows.map((row: { id: string }) => row.id)).toEqual(['journey:pjc.query']);
      expect(rows[0].planning.implementation).toBe('partial');
      expect(
        JSON.parse(
          run(
            'list',
            '--file',
            fixture,
            '--kind',
            'journey',
            '--implementation',
            'implemented',
            '--priority',
            'P1',
          ),
        ),
      ).toEqual([]);
    } finally {
      unlinkSync(fixture);
      rmdirSync(directory);
    }
  }, 20000);
  it('filters target dates inclusively and rejects invalid date ranges', () => {
    const directory = mkdtempSync(path.join(os.tmpdir(), 'pjc-test-'));
    const fixture = path.join(directory, 'catalog.json');
    try {
      const catalog = JSON.parse(
        JSON.stringify(
          loadCatalogFile(path.join(root, 'packages/core/src/flows/pjc/catalog.v2.json')),
        ),
      );
      catalog.features[0].intents[1].journeys[0].planning.targetDate = '2026-12-01';
      writeFileSync(fixture, JSON.stringify(catalog));
      const rows = JSON.parse(
        run(
          'list',
          '--kind',
          'journey',
          '--file',
          fixture,
          '--target-after',
          '2026-12-01',
          '--target-before',
          '2026-12-01',
        ),
      );
      expect(rows.map((row: { id: string }) => row.id)).toEqual(['journey:pjc.query']);
      expect(rows[0].planning.targetDate).toBe('2026-12-01');
      for (const bad of [
        ['--target-before', '2026-02-30'],
        ['--target-after', '2026-12-02', '--target-before', '2026-12-01'],
      ]) {
        const result = spawnSync(process.execPath, [runner, ...args, 'list', ...bad], {
          cwd: root,
          encoding: 'utf8',
        });
        expect(result.status).toBe(2);
      }
    } finally {
      unlinkSync(fixture);
      rmdirSync(directory);
    }
  }, 20000);
  it('keeps minimal inspection concise', () => {
    const minimal = JSON.parse(run('inspect', 'feature:pjc.catalog'));
    expect(minimal.value).toBeUndefined();
  });
  it('shows user intent, steps and feedback in a minimal journey view', () => {
    const minimal = JSON.parse(
      run('inspect', 'journey:school.accept_invitation', '--view', 'minimal'),
    );
    expect(minimal.intent.actor).toBe('principal');
    expect(minimal.situation).toContain('invitation');
    expect(minimal.outcome).toContain('school');
    expect(minimal.steps.map((step: { id: string }) => step.id)).toContain('step:school.confirm');
    expect(
      minimal.transitions.find((edge: { id: string }) => edge.id === 'transition:school.lookup')
        .feedback,
    ).toBeTruthy();
    expect(
      minimal.scenarios.find((scenario: { id: string }) => scenario.id === 'scenario:school.accept')
        .transitions,
    ).toEqual([
      'transition:school.authenticate',
      'transition:school.lookup',
      'transition:school.accept',
    ]);
    expect(minimal.development).toBeUndefined();
  });
  it('generates minimal and expanded views from the same canonical journey', () => {
    const source = JSON.parse(
      JSON.stringify(
        loadCatalogFile(path.join(root, 'packages/core/src/flows/pjc/catalog.v2.json')),
      ),
    );
    const feature = source.features.find(
      (item: { id: string }) => item.id === 'feature:admin.school_connection',
    );
    const intent = feature.intents.find(
      (item: { id: string }) => item.id === 'intent:school.principal_accept',
    );
    const canonical = intent.journeys.find(
      (item: { id: string }) => item.id === 'journey:school.accept_invitation',
    );
    const minimal = JSON.parse(run('inspect', canonical.id, '--view', 'minimal'));
    const expanded = JSON.parse(run('inspect', canonical.id, '--view', 'expanded'));
    const markdown = run('inspect', canonical.id, '--view', 'minimal', '--format', 'markdown');
    expect(expanded.record).toEqual(canonical);
    expect(expanded.journeyContext.intent.actor).toBe(intent.actor);
    expect(
      expanded.journeyContext.sharedRequirements.map((item: { id: string }) => item.id),
    ).toContain('requirement:school.authority');
    expect(expanded.journeyContext.sharedBindings.map((item: { id: string }) => item.id)).toContain(
      'binding:school.invite_repository',
    );
    expect(
      expanded.journeyContext.scenarioPaths
        .find((item: { id: string }) => item.id === 'scenario:school.accept')
        .steps.map((item: { transition: { id: string } }) => item.transition.id),
    ).toEqual(
      canonical.scenarios.find((item: { id: string }) => item.id === 'scenario:school.accept')
        .transitions,
    );
    expect(minimal.intent.actor).toBe(intent.actor);
    expect(minimal.situation).toBe(canonical.situation);
    expect(minimal.outcome).toBe(canonical.outcome);
    expect(minimal.steps).toEqual(
      canonical.steps.map(
        (step: { id: string; title: string; interaction: string; terminal: boolean }) => ({
          id: step.id,
          title: step.title,
          interaction: step.interaction,
          terminal: step.terminal,
        }),
      ),
    );
    expect(
      minimal.scenarios.map((scenario: { transitions: string[] }) => scenario.transitions),
    ).toEqual(
      canonical.scenarios.map((scenario: { transitions: string[] }) => scenario.transitions),
    );
    expect(markdown).toContain(canonical.situation);
    expect(markdown).toContain(canonical.outcome);
  }, 20000);
  it('exposes declared partial-path starts and preconditions', () => {
    const directory = mkdtempSync(path.join(os.tmpdir(), 'pjc-test-'));
    const fixture = path.join(directory, 'catalog.json');
    try {
      const source = JSON.parse(
        JSON.stringify(
          loadCatalogFile(path.join(root, 'packages/core/src/flows/pjc/catalog.v2.json')),
        ),
      );
      const journey = source.features
        .find((feature: { id: string }) => feature.id === 'feature:admin.school_connection')
        .intents.find((intent: { id: string }) => intent.id === 'intent:school.principal_accept')
        .journeys[0];
      journey.scenarios.push({
        id: 'scenario:school.partial_fixture',
        title: 'Already signed in',
        start: 'step:school.signin',
        preconditions: ['The user is already signed in.'],
        transitions: ['transition:school.lookup', 'transition:school.accept'],
        expected: 'Connected',
      });
      writeFileSync(fixture, JSON.stringify(source));
      const view = JSON.parse(run('inspect', journey.id, '--file', fixture));
      const scenario = view.scenarios.find(
        (item: { id: string }) => item.id === 'scenario:school.partial_fixture',
      );
      expect(scenario.start).toBe('step:school.signin');
      expect(scenario.preconditions).toEqual(['The user is already signed in.']);
      const trace = JSON.parse(run('trace', scenario.id, '--file', fixture));
      expect(trace.outgoing).toContain('step:school.signin');
    } finally {
      unlinkSync(fixture);
      rmdirSync(directory);
    }
  }, 20000);
  it('lists records deterministically', () => {
    expect(run('list', '--kind', 'feature')).toBe(run('list', '--kind', 'feature'));
    const rows = JSON.parse(run('list'));
    const ids = rows.map((row: { id: string }) => row.id);
    expect(ids).toEqual([...ids].sort());
  });
  it('traces IDs and implementation references', () => {
    expect(JSON.parse(run('trace', 'binding:pjc.cli')).incoming).toContain('transition:pjc.query');
    expect(JSON.parse(run('trace', 'scripts/pjc.ts'))[0].related).toContain('intent:pjc.query');
  });
  it('explains how related records connect to the selected journey', () => {
    const trace = JSON.parse(run('trace', 'journey:pjc.query'));
    const direct = trace.connectionPaths.find(
      (item: { id: string }) => item.id === 'binding:pjc.cli',
    );
    const sibling = trace.connectionPaths.find(
      (item: { id: string }) => item.id === 'journey:pjc.trace',
    );
    expect(direct.path).toEqual(['journey:pjc.query', 'binding:pjc.cli']);
    expect(sibling.path[0]).toBe('journey:pjc.query');
    expect(sibling.path.at(-1)).toBe('journey:pjc.trace');
    expect(sibling.path.length).toBeGreaterThan(2);
  });
  it('generates expanded Markdown from the self catalog', () => {
    const output = run(
      'inspect',
      'feature:pjc.catalog',
      '--view',
      'expanded',
      '--format',
      'markdown',
    );
    expect(output).toContain('# Product and Journey Catalog');
    expect(output).toContain('- **record**');
    expect(output).toContain('- **title:** Product and Journey Catalog');
  });
  it('retains absent evidence in gap reports', () => {
    expect(JSON.parse(run('check')).gaps).toContain('scenario:pjc.query: no evidence');
  });
  it('distinguishes scenario-specific links from journey-wide authorities', () => {
    const linked = JSON.parse(run('check', '--journey', 'journey:pjc.query'));
    expect(linked.gaps).not.toContain('scenario:pjc.query: no linked requirement');
    expect(linked.gaps).not.toContain('scenario:pjc.query: no linked binding');
    expect(linked.gaps).toContain('scenario:pjc.query: no evidence');
    const unlinked = JSON.parse(run('check', '--journey', 'journey:school.accept_invitation'));
    expect(unlinked.gaps).toContain('scenario:school.accept: no linked requirement');
    expect(unlinked.gaps).toContain('scenario:school.accept: no linked binding');
  }, 20000);
  it('does not treat test or documentation links as implementation bindings', () => {
    const directory = mkdtempSync(path.join(os.tmpdir(), 'pjc-test-'));
    const fixture = path.join(directory, 'catalog.json');
    try {
      const catalog = JSON.parse(
        JSON.stringify(
          loadCatalogFile(path.join(root, 'packages/core/src/flows/pjc/catalog.v2.json')),
        ),
      );
      const journey = catalog.features[0].intents[1].journeys[0];
      journey.sharedBindings = [];
      journey.sharedRequirements = [];
      journey.observations = [];
      journey.impacts = [];
      journey.platformDifferences = [];
      journey.transitions[0].links = [];
      journey.requirements[0].links = ['binding:pjc.cli_tests'];
      journey.scenarios[0].links = ['requirement:pjc.query_records', 'binding:pjc.cli_tests'];
      writeFileSync(fixture, JSON.stringify(catalog));
      const report = JSON.parse(run('check', '--file', fixture, '--journey', journey.id));
      expect(report.gaps).toContain('journey:pjc.query: no implementation bindings');
      expect(report.gaps).toContain('scenario:pjc.query: no linked implementation binding');
      expect(report.gaps).not.toContain('scenario:pjc.query: no linked binding');
    } finally {
      unlinkSync(fixture);
      rmdirSync(directory);
    }
  }, 20000);
  it('reports one journey including shared authorities without unrelated scenarios', () => {
    const report = JSON.parse(run('check', '--journey', 'journey:school.accept_invitation'));
    expect(report.scope.journey).toBe('journey:school.accept_invitation');
    expect(report.bindings.map((item: { id: string }) => item.id)).toContain(
      'binding:school.invite_repository',
    );
    expect(report.gaps).toContain('scenario:school.accept: no evidence');
    expect(report.gaps).not.toContain('scenario:pjc.query: no evidence');
    expect(report.evidence.map((item: { scenario: string }) => item.scenario)).toEqual(
      expect.arrayContaining(['scenario:school.accept', 'scenario:school.invalid']),
    );
    expect(report.evidence.map((item: { scenario: string }) => item.scenario)).not.toContain(
      'scenario:pjc.query',
    );
    const missing = spawnSync(
      process.execPath,
      [runner, ...args, 'check', '--journey', 'journey:missing'],
      { cwd: root, encoding: 'utf8' },
    );
    expect(missing.status).toBe(2);
  }, 20000);
  it('validates the entire catalog before producing a scoped report', () => {
    const directory = mkdtempSync(path.join(os.tmpdir(), 'pjc-test-'));
    const fixture = path.join(directory, 'catalog.json');
    try {
      const source = JSON.parse(
        JSON.stringify(
          loadCatalogFile(path.join(root, 'packages/core/src/flows/pjc/catalog.v2.json')),
        ),
      );
      source.features[0].links.push('intent:missing');
      writeFileSync(fixture, JSON.stringify(source));
      const result = spawnSync(
        process.execPath,
        [
          runner,
          ...args,
          'check',
          '--journey',
          'journey:school.accept_invitation',
          '--file',
          fixture,
        ],
        { cwd: root, encoding: 'utf8' },
      );
      expect(result.status).toBe(1);
      expect(JSON.parse(result.stdout).errors).toContain(
        'feature:pjc.catalog: missing reference intent:missing',
      );
    } finally {
      unlinkSync(fixture);
      rmdirSync(directory);
    }
  }, 20000);
  it('reports feature modules omitted from a manifest', () => {
    const directory = mkdtempSync(path.join(os.tmpdir(), 'pjc-test-'));
    const manifest = path.join(directory, 'manifest.json');
    const registered = path.join(directory, 'registered.json');
    const orphan = path.join(directory, 'orphan.json');
    try {
      const catalog = loadCatalogFile(
        path.join(root, 'packages/core/src/flows/pjc/catalog.v2.json'),
      ) as { features: object[] };
      writeFileSync(registered, JSON.stringify(catalog.features[0]));
      writeFileSync(orphan, JSON.stringify({ id: 'feature:unregistered' }));
      writeFileSync(manifest, JSON.stringify({ schemaVersion: 2, modules: ['registered.json'] }));
      expect(JSON.parse(run('check', '--file', manifest)).gaps).toContain(
        'orphan.json: feature module not registered in manifest',
      );
    } finally {
      unlinkSync(orphan);
      unlinkSync(registered);
      unlinkSync(manifest);
      rmdirSync(directory);
    }
  }, 20000);
  it('recognizes resolved shared bindings in gap reports', () => {
    const view = JSON.parse(run('journey', 'journey:school.accept_invitation'));
    expect(view.sharedBindings.length).toBeGreaterThan(0);
    expect(JSON.parse(run('check')).gaps).not.toContain(
      'journey:school.accept_invitation: no implementation bindings',
    );
  }, 20000);
  it('exposes API infrastructure without promoting its bindings to production evidence', () => {
    const api = JSON.parse(run('journey', 'journey:api.execute'));
    expect(api.journey.development.mode).toBe('brownfield');
    const report = JSON.parse(run('check', '--journey', 'journey:api.execute'));
    for (const scenario of report.evidence) {
      expect(scenario.contiguousDeclaredThrough).toBeNull();
      for (const level of scenario.levels)
        expect(['missing', 'unverifiable']).toContain(level.status);
    }
  }, 20000);
  it('exposes the teacher first-day journey without asserting implementation', () => {
    const teacher = JSON.parse(
      run('inspect', 'journey:classroom.teacher_first_workspace.legacy', '--view', 'expanded'),
    );
    expect(teacher.record.development.mode).toBe('brownfield');
  });
  it('exposes the principal first-day invariant', () => {
    const principal = JSON.parse(
      run('inspect', 'journey:admin.school_connection.legacy', '--view', 'expanded'),
    );
    expect(principal.record.development.invariants.join(' ')).toContain(
      'never a personal principal workspace',
    );
  });
  it('reports planned teacher web binding', () => {
    const report = JSON.parse(run('check'));
    expect(report.gaps).toContain(
      'binding:classroom.teacher_first_workspace.web-0: binding planned',
    );
  });
  it('shows a binding path, declared status and limitation in the compact list', () => {
    const rows = JSON.parse(
      run(
        'list',
        '--kind',
        'binding',
        '--query',
        'binding:classroom.teacher_first_workspace.web-0',
      ),
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      category: 'web',
      status: 'planned',
      reference: 'apps/gurudevi-web/app/(sanctuary)/workspace/page.tsx',
    });
    expect(rows[0].note).toBeTruthy();
  });
  it('rejects the old catalog format', () => {
    const directory = mkdtempSync(path.join(os.tmpdir(), 'pjc-test-'));
    const fixture = path.join(directory, 'invalid.json');
    try {
      writeFileSync(fixture, JSON.stringify({ schemaVersion: 1, records: [] }));
      const invalid = spawnSync(process.execPath, [runner, ...args, 'check', '--file', fixture], {
        cwd: root,
        encoding: 'utf8',
      });
      expect(invalid.status).toBe(1);
      expect(JSON.parse(invalid.stdout).errors.length).toBeGreaterThan(0);
    } finally {
      unlinkSync(fixture);
      rmdirSync(directory);
    }
  });
  it('reports malformed catalog files as catalog errors', () => {
    const directory = mkdtempSync(path.join(os.tmpdir(), 'pjc-test-'));
    const fixture = path.join(directory, 'invalid.json');
    try {
      for (const contents of [
        '{ invalid JSON',
        JSON.stringify({ schemaVersion: 2, modules: ['missing.json'] }),
      ]) {
        writeFileSync(fixture, contents);
        const invalid = spawnSync(process.execPath, [runner, ...args, 'check', '--file', fixture], {
          cwd: root,
          encoding: 'utf8',
        });
        expect(invalid.status).toBe(1);
        expect(JSON.parse(invalid.stdout).errors[0]).toContain('Catalog load failed:');
      }
    } finally {
      unlinkSync(fixture);
      rmdirSync(directory);
    }
  }, 20000);
  it('reports wrong static routes', () => {
    const directory = mkdtempSync(path.join(os.tmpdir(), 'pjc-test-'));
    const fixture = path.join(directory, 'catalog.json');
    try {
      const current = JSON.parse(
        JSON.stringify(
          loadCatalogFile(path.join(root, 'packages/core/src/flows/pjc/catalog.v2.json')),
        ),
      );
      current.features[0].intents[0].journeys[0].bindings.push({
        id: 'binding:pjc.route',
        title: 'Existing route',
        category: 'web',
        status: 'implemented',
        reference: 'apps/gurudevi-web/app/(sanctuary)/workspace/page.tsx',
        route: '/wrong',
        note: 'A test fixture.',
      });
      current.features[0].intents[0].journeys[0].bindings.push({
        id: 'binding:pjc.root_route',
        category: 'web',
        status: 'implemented',
        reference: 'apps/gurudevi-web/app/(marketing)/page.tsx',
        route: '/',
        note: 'A test fixture.',
      });
      writeFileSync(fixture, JSON.stringify(current));
      const checked = JSON.parse(run('check', '--file', fixture));
      expect(
        checked.bindings.find((binding: { id: string }) => binding.id === 'binding:pjc.route')
          .route,
      ).toBe('mismatch');
      expect(checked.gaps).toContain('binding:pjc.route: route mismatch');
      expect(
        checked.bindings.find((binding: { id: string }) => binding.id === 'binding:pjc.root_route')
          .route,
      ).toBe('present_unverified');
    } finally {
      unlinkSync(fixture);
      rmdirSync(directory);
    }
  });
  it('distinguishes external, absent, missing and present binding references', () => {
    const directory = mkdtempSync(path.join(os.tmpdir(), 'pjc-test-'));
    const fixture = path.join(directory, 'catalog.json');
    try {
      const current = JSON.parse(
        JSON.stringify(
          loadCatalogFile(path.join(root, 'packages/core/src/flows/pjc/catalog.v2.json')),
        ),
      );
      const bindings = current.features[0].intents[0].journeys[0].bindings;
      for (const [name, reference] of [
        ['external', 'https://example.org/document'],
        ['escaped', '../outside.txt'],
        ['missing', '..pjc-missing-file'],
        ['present', 'scripts/pjc.ts'],
        ['unknown', undefined],
      ]) {
        bindings.push({
          id: `binding:pjc.${name}`,
          category: 'documentation',
          status: 'unknown',
          note: 'Fixture.',
          reference,
        });
      }
      writeFileSync(fixture, JSON.stringify(current));
      const checked = JSON.parse(run('check', '--file', fixture));
      const result = (name: string) =>
        checked.bindings.find((binding: { id: string }) => binding.id === `binding:pjc.${name}`)
          .result;
      expect(result('external')).toBe('unverifiable');
      expect(result('escaped')).toBe('unverifiable');
      expect(result('missing')).toBe('missing');
      expect(result('present')).toBe('present_unverified');
      expect(result('unknown')).toBe('unknown');
      expect(checked.gaps).toEqual(
        expect.arrayContaining([
          'binding:pjc.external: reference unverifiable',
          'binding:pjc.missing: reference missing',
          'binding:pjc.unknown: reference unknown',
        ]),
      );
      expect(checked.gaps).not.toContain('binding:pjc.present: reference present_unverified');
    } finally {
      unlinkSync(fixture);
      rmdirSync(directory);
    }
  }, 20000);
  it('reports stale evidence without promoting it', () => {
    const directory = mkdtempSync(path.join(os.tmpdir(), 'pjc-test-'));
    const fixture = path.join(directory, 'catalog.json');
    try {
      const current = JSON.parse(
        JSON.stringify(
          loadCatalogFile(path.join(root, 'packages/core/src/flows/pjc/catalog.v2.json')),
        ),
      );
      current.features[0].intents[1].journeys[0].evidence.push({
        id: 'evidence:pjc.query',
        scenario: 'scenario:pjc.query',
        revision: 'old',
        environment: 'fixture',
        tier: 'G4',
        result: 'passed',
        substitutions: [],
        limitations: 'Not production.',
        reference: 'reports/example.json',
      });
      writeFileSync(fixture, JSON.stringify(current));
      const evidence = JSON.parse(
        run('check', '--file', fixture, '--revision', 'new'),
      ).evidence.find((item: { scenario: string }) => item.scenario === 'scenario:pjc.query');
      expect(evidence.levels.find((level: { tier: string }) => level.tier === 'G4').status).toBe(
        'stale',
      );
      expect(evidence.contiguousDeclaredThrough).toBeNull();
    } finally {
      unlinkSync(fixture);
      rmdirSync(directory);
    }
  });
  it('stops declared progression when current evidence results conflict', () => {
    const directory = mkdtempSync(path.join(os.tmpdir(), 'pjc-test-'));
    const fixture = path.join(directory, 'catalog.json');
    try {
      const catalog = JSON.parse(
        JSON.stringify(
          loadCatalogFile(path.join(root, 'packages/core/src/flows/pjc/catalog.v2.json')),
        ),
      );
      const evidence = catalog.features[0].intents[1].journeys[0].evidence;
      const base = {
        scenario: 'scenario:pjc.query',
        revision: 'rev',
        environment: 'fixture',
        tier: 'G0',
        substitutions: [],
        limitations: 'Fixture only.',
        reference: 'fixture',
      };
      evidence.push(
        { ...base, id: 'evidence:pjc.passed_fixture', result: 'passed' },
        { ...base, id: 'evidence:pjc.blocked_fixture', result: 'blocked' },
      );
      writeFileSync(fixture, JSON.stringify(catalog));
      const report = JSON.parse(
        run('check', '--file', fixture, '--revision', 'rev', '--journey', 'journey:pjc.query'),
      );
      const scenario = report.evidence.find(
        (item: { scenario: string }) => item.scenario === 'scenario:pjc.query',
      );
      expect(scenario.levels[0].status).toBe('conflicting');
      expect(report.gaps).toContain('scenario:pjc.query: G0 evidence conflicting');
      expect(scenario.levels[0].records).toHaveLength(2);
      expect(scenario.contiguousDeclaredThrough).toBeNull();
    } finally {
      unlinkSync(fixture);
      rmdirSync(directory);
    }
  }, 20000);
  it('reports binding verification freshness separately from file presence', () => {
    const directory = mkdtempSync(path.join(os.tmpdir(), 'pjc-test-'));
    const fixture = path.join(directory, 'catalog.json');
    try {
      const current = JSON.parse(
        JSON.stringify(
          loadCatalogFile(path.join(root, 'packages/core/src/flows/pjc/catalog.v2.json')),
        ),
      );
      const binding = current.features[0].intents[0].journeys[0].bindings.find(
        (item: { id: string }) => item.id === 'binding:pjc.cli',
      );
      binding.status = 'verified';
      binding.verifiedRevision = 'old';
      writeFileSync(fixture, JSON.stringify(current));
      const report = JSON.parse(run('check', '--file', fixture, '--revision', 'new'));
      const result = report.bindings.find((item: { id: string }) => item.id === binding.id);
      expect(result.result).toBe('present_unverified');
      expect(result.freshness).toBe('stale');
      expect(report.gaps).toContain('binding:pjc.cli: verification stale');
      const same = JSON.parse(run('check', '--file', fixture, '--revision', 'old'));
      expect(same.bindings.find((item: { id: string }) => item.id === binding.id).freshness).toBe(
        'current_declared',
      );
      const noRevision = JSON.parse(run('check', '--file', fixture));
      expect(
        noRevision.bindings.find((item: { id: string }) => item.id === binding.id).freshness,
      ).toBe('unverifiable');
      delete binding.verifiedRevision;
      writeFileSync(fixture, JSON.stringify(current));
      const missingDeclaration = JSON.parse(run('check', '--file', fixture, '--revision', 'old'));
      expect(
        missingDeclaration.bindings.find((item: { id: string }) => item.id === binding.id)
          .freshness,
      ).toBe('unverifiable');
    } finally {
      unlinkSync(fixture);
      rmdirSync(directory);
    }
  }, 30000);
  it('only includes declared exceptions with current passing alternate evidence', () => {
    const directory = mkdtempSync(path.join(os.tmpdir(), 'pjc-test-'));
    const fixture = path.join(directory, 'catalog.json');
    try {
      const current = JSON.parse(
        JSON.stringify(
          loadCatalogFile(path.join(root, 'packages/core/src/flows/pjc/catalog.v2.json')),
        ),
      );
      const base = {
        scenario: 'scenario:pjc.query',
        revision: 'current',
        environment: 'fixture',
        substitutions: [],
        limitations: 'Declarations only.',
        reference: 'reports/example.json',
      };
      current.features[0].intents[1].journeys[0].evidence.push(
        { ...base, id: 'evidence:pjc.g0', tier: 'G0', result: 'passed' },
        {
          ...base,
          id: 'evidence:pjc.g1',
          tier: 'G1',
          result: 'not_applicable',
          rationale: 'No boundary runtime exists.',
          acceptedBy: 'owner',
          alternateEvidence: ['evidence:pjc.g2'],
        },
        { ...base, id: 'evidence:pjc.g2', tier: 'G2', result: 'passed' },
        {
          ...base,
          id: 'evidence:pjc.g0_other',
          tier: 'G0',
          result: 'passed',
          environment: 'another environment',
          substitutions: ['test double'],
        },
      );
      writeFileSync(fixture, JSON.stringify(current));
      const report = JSON.parse(run('check', '--file', fixture, '--revision', 'current'));
      const evidence = report.evidence.find(
        (item: { scenario: string }) => item.scenario === 'scenario:pjc.query',
      );
      expect(evidence.levels[1].status).toBe('declared_not_applicable');
      expect(evidence.levels[1].records[0]).toMatchObject({
        acceptedBy: 'owner',
        rationale: 'No boundary runtime exists.',
        alternateEvidence: ['evidence:pjc.g2'],
      });
      expect(evidence.contiguousDeclaredThrough).toBe('G2');
      expect(evidence.levels[0].records).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'evidence:pjc.g0',
            environment: 'fixture',
            substitutions: [],
          }),
          expect.objectContaining({
            id: 'evidence:pjc.g0_other',
            environment: 'another environment',
            substitutions: ['test double'],
          }),
        ]),
      );
      expect(evidence.disclaimer).toContain('applicability');
      current.features[0].intents[1].journeys[0].evidence[2].revision = 'old';
      writeFileSync(fixture, JSON.stringify(current));
      const stale = JSON.parse(
        run('check', '--file', fixture, '--revision', 'current'),
      ).evidence.find((item: { scenario: string }) => item.scenario === 'scenario:pjc.query');
      expect(stale.contiguousDeclaredThrough).toBe('G0');
    } finally {
      unlinkSync(fixture);
      rmdirSync(directory);
    }
  }, 20000);
  it('rejects unknown IDs', () => {
    const unknown = spawnSync(process.execPath, [runner, ...args, 'inspect', 'feature:missing'], {
      cwd: root,
      encoding: 'utf8',
    });
    expect(unknown.status).toBe(2);
  });
  it('rejects malformed options instead of silently changing the query', () => {
    for (const bad of [
      ['list', '--knd', 'intent'],
      ['list', '--kind'],
      ['list', '--kind', 'unknown'],
      ['inspect', 'feature:pjc.catalog', '--view', 'expaned'],
      ['check', '--format', 'json', '--format', 'text'],
      ['check', 'unexpected'],
    ]) {
      const result = spawnSync(process.execPath, [runner, ...args, ...bad], {
        cwd: root,
        encoding: 'utf8',
      });
      expect(result.status).toBe(2);
      expect(result.stderr).toBeTruthy();
    }
  }, 30000);
});
