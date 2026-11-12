import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { inspectHierarchyJourney as inspectPublicJourney } from '@repo/core/flows/pjc/hierarchyQuery';
import { validateHierarchy as validatePublicHierarchy } from '@repo/core/flows/pjc/hierarchy';
import { describe, expect, it } from 'vitest';
import { loadCatalogFile } from './catalogLoader';
import { validateHierarchy } from './hierarchy';
import { inspectHierarchyJourney } from './hierarchyQuery';

const catalog = JSON.parse(
  JSON.stringify(loadCatalogFile(path.resolve(import.meta.dirname, 'catalog.v2.json'))),
);

describe('canonical PJC hierarchy', () => {
  it('exposes the platform-neutral hierarchy and journey projection through core flows', () => {
    const checked = validatePublicHierarchy(catalog);
    expect(checked.errors).toEqual([]);
    expect(inspectPublicJourney(checked.catalog!, 'journey:pjc.query')?.intent.id).toBe(
      'intent:pjc.query',
    );
  });
  it('keeps the PJC skill, linked workflows and catalog bindings discoverable', () => {
    const root = path.resolve(import.meta.dirname, '../../../../..');
    const skillPath = path.join(root, '.agents/skills/product-journey-catalog/SKILL.md');
    const skill = readFileSync(skillPath, 'utf8');
    const targets = [...skill.matchAll(/\]\(([^)]+)\)/g)].map((match) => match[1]!);
    expect(targets).toContain('../brownfield-feature-integration/SKILL.md');
    expect(targets).toContain('../user-journey-orchestration/SKILL.md');
    for (const target of targets)
      expect(existsSync(path.resolve(path.dirname(skillPath), target))).toBe(true);
    const guidePath = path.join(root, 'docs/architecture/product-journey-catalog.md');
    const guide = readFileSync(guidePath, 'utf8');
    const localGuideTargets = [...guide.matchAll(/\]\(([^)]+)\)/g)]
      .map((match) => match[1]!)
      .filter((target) => !/^(?:https?:|#)/.test(target));
    expect(localGuideTargets).toContain('production-evidence-governance.md');
    for (const target of localGuideTargets)
      expect(existsSync(path.resolve(path.dirname(guidePath), target.split('#')[0]!))).toBe(true);
    expect(existsSync(path.join(root, 'scripts/pjc.ts'))).toBe(true);
    expect(readFileSync(path.join(root, '.agents/skills/CATALOG.md'), 'utf8')).toContain(
      '`product-journey-catalog`',
    );
    const author = inspectHierarchyJourney(
      validateHierarchy(catalog).catalog!,
      'journey:pjc.catalog',
    );
    expect(author?.journey.bindings.map((binding) => binding.id)).toEqual(
      expect.arrayContaining([
        'binding:pjc.skill',
        'binding:pjc.guide',
        'binding:pjc.cli',
        'binding:pjc.public_api',
        'binding:pjc.tests',
      ]),
    );
    for (const binding of author?.journey.bindings ?? []) {
      if (
        [
          'binding:pjc.skill',
          'binding:pjc.guide',
          'binding:pjc.cli',
          'binding:pjc.public_api',
          'binding:pjc.tests',
        ].includes(binding.id)
      ) {
        expect(binding.reference).toBeTruthy();
        expect(existsSync(path.resolve(root, binding.reference!))).toBe(true);
      }
    }
  });
  it('validates the complete catalog and exposes each operation journey', () => {
    const checked = validateHierarchy(catalog);
    expect(checked.errors).toEqual([]);
    const view = inspectHierarchyJourney(checked.catalog!, 'journey:pjc.catalog');
    expect(view?.feature.id).toBe('feature:pjc.catalog');
    expect(view?.journey.scenarios.map((item) => item.id)).toContain('scenario:pjc.author');
    expect(view?.journey.bindings.map((item) => item.id)).toContain('binding:pjc.cli');
    const query = inspectHierarchyJourney(checked.catalog!, 'journey:pjc.query');
    expect(query?.intent.id).toBe('intent:pjc.query');
    expect(query?.journey.scenarios.map((item) => item.id)).toContain('scenario:pjc.query');
    expect(query?.sharedBindings.map((item) => item.id)).toContain('binding:pjc.cli');
    expect(view?.journey.impacts?.[0]?.id).toBe('impact:pjc.authoring');
    expect(view?.journey.platformDifferences?.[0]?.platform).toBe('tooling');
  });
  it('keeps each catalog operation connected to its own requirement and verification binding', () => {
    const checked = validateHierarchy(catalog);
    expect(checked.errors).toEqual([]);
    for (const [journeyId, scenarioId, requirementId, testBinding] of [
      [
        'journey:pjc.catalog',
        'scenario:pjc.author',
        'requirement:pjc.author_records',
        'binding:pjc.tests',
      ],
      [
        'journey:pjc.query',
        'scenario:pjc.query',
        'requirement:pjc.query_records',
        'binding:pjc.cli_tests',
      ],
      [
        'journey:pjc.trace',
        'scenario:pjc.trace',
        'requirement:pjc.trace_links',
        'binding:pjc.cli_tests',
      ],
      [
        'journey:pjc.validate',
        'scenario:pjc.validate',
        'requirement:pjc.validate_catalog',
        'binding:pjc.cli_tests',
      ],
    ]) {
      const view = inspectHierarchyJourney(checked.catalog!, journeyId!);
      expect(view?.journey.requirements.map((item) => item.id)).toContain(requirementId);
      const scenario = view?.journey.scenarios.find((item) => item.id === scenarioId);
      expect(scenario?.links).toEqual(expect.arrayContaining([requirementId, testBinding]));
      expect(view?.journey.evidence).toEqual([]);
      const path = view?.scenarioPaths.find((item) => item.id === scenarioId);
      expect(path?.requirements.map((item) => item.id)).toContain(requirementId);
      expect(path?.bindings.map((item) => item.id)).toContain(testBinding);
      expect(path?.evidence).toEqual([]);
    }
  });
  it('checks IDs and references on journey impact and platform records', () => {
    const input = structuredClone(catalog);
    const journey = input.features[0].intents[0].journeys[0];
    journey.impacts[0].links.push('binding:missing');
    journey.platformDifferences.push({ ...journey.platformDifferences[0] });
    expect(validateHierarchy(input).errors).toEqual(
      expect.arrayContaining([
        'impact:pjc.authoring: missing reference binding:missing',
        'Duplicate ID: platform:pjc.tooling',
      ]),
    );
  });
  it('rejects unsupported requirement classifications', () => {
    const input = structuredClone(catalog);
    input.features[0].intents[0].journeys[0].requirements[0].classification = 'unrecognized';
    expect(validateHierarchy(input).errors.some((error) => error.includes('classification'))).toBe(
      true,
    );
  });
  it('resolves reverse scenario links and scenario-specific evidence without inferring other requirements', () => {
    const input = structuredClone(catalog);
    const journey = input.features[0].intents[1].journeys[0];
    journey.requirements.push({
      id: 'requirement:pjc.reverse_fixture',
      statement: 'Fixture requirement',
      origin: 'source',
      links: ['scenario:pjc.query'],
    });
    journey.requirements.push({
      id: 'requirement:pjc.unrelated_fixture',
      statement: 'Unrelated requirement',
      origin: 'source',
    });
    journey.evidence.push({
      id: 'evidence:pjc.query_fixture',
      scenario: 'scenario:pjc.query',
      revision: 'fixture',
      environment: 'fixture',
      tier: 'G0',
      result: 'passed',
      substitutions: [],
      limitations: 'Fixture only.',
      reference: 'fixture',
    });
    const checked = validateHierarchy(input);
    expect(checked.errors).toEqual([]);
    const scenario = inspectHierarchyJourney(checked.catalog!, journey.id)?.scenarioPaths[0];
    expect(scenario?.requirements.map((item) => item.id)).toContain(
      'requirement:pjc.reverse_fixture',
    );
    expect(scenario?.requirements.map((item) => item.id)).not.toContain(
      'requirement:pjc.unrelated_fixture',
    );
    expect(scenario?.evidence.map((item) => item.id)).toEqual(['evidence:pjc.query_fixture']);
  });
  it('resolves links on transitions in the scenario path without pulling in other transitions', () => {
    const input = structuredClone(catalog);
    const journey = input.features[0].intents[1].journeys[0];
    journey.transitions[0].links.push('requirement:pjc.path_fixture');
    journey.requirements.push({
      id: 'requirement:pjc.path_fixture',
      statement: 'Path requirement',
      origin: 'source',
      links: ['binding:pjc.cli'],
    });
    journey.requirements.push({
      id: 'requirement:pjc.other_fixture',
      statement: 'Other path',
      origin: 'source',
    });
    journey.transitions.push({
      ...journey.transitions[0],
      id: 'transition:pjc.other_fixture',
      links: ['requirement:pjc.other_fixture'],
    });
    const checked = validateHierarchy(input);
    expect(checked.errors).toEqual([]);
    const scenario = inspectHierarchyJourney(checked.catalog!, journey.id)?.scenarioPaths[0];
    expect(scenario?.requirements.map((item) => item.id)).toContain('requirement:pjc.path_fixture');
    expect(scenario?.requirements.map((item) => item.id)).not.toContain(
      'requirement:pjc.other_fixture',
    );
    expect(scenario?.bindings.map((item) => item.id)).toContain('binding:pjc.cli');
  });
  it('validates observation IDs and source links', () => {
    const input = structuredClone(catalog);
    const observations = input.features[0].intents[0].journeys[0].observations;
    observations[0].links.push('binding:missing');
    observations.push({ ...observations[0] });
    expect(validateHierarchy(input).errors).toEqual(
      expect.arrayContaining([
        'Duplicate ID: observation:pjc.flow_registry',
        'observation:pjc.flow_registry: missing reference binding:missing',
      ]),
    );
  });
  it('resolves bindings that link back to a scenario requirement without including unrelated bindings', () => {
    const input = structuredClone(catalog);
    const journey = input.features[0].intents[1].journeys[0];
    const authority = input.features.find(
      (feature: { id: string }) => feature.id === 'feature:api.foundation',
    ).intents[0].journeys[0];
    journey.transitions[0].links.push('requirement:pjc.reverse_binding_fixture');
    journey.requirements.push({
      id: 'requirement:pjc.reverse_binding_fixture',
      statement: 'Scenario requirement',
      origin: 'source',
    });
    authority.bindings.push(
      {
        id: 'binding:api.reverse_requirement_fixture',
        category: 'api',
        status: 'unknown',
        note: 'Fixture',
        links: ['requirement:pjc.reverse_binding_fixture'],
      },
      {
        id: 'binding:api.unrelated_requirement_fixture',
        category: 'api',
        status: 'unknown',
        note: 'Fixture',
      },
    );
    const checked = validateHierarchy(input);
    expect(checked.errors).toEqual([]);
    const view = inspectHierarchyJourney(checked.catalog!, journey.id);
    expect(view?.sharedBindings.map((binding) => binding.id)).toContain(
      'binding:api.reverse_requirement_fixture',
    );
    expect(view?.scenarioPaths[0].bindings.map((binding) => binding.id)).toContain(
      'binding:api.reverse_requirement_fixture',
    );
    expect(view?.scenarioPaths[0].bindings.map((binding) => binding.id)).not.toContain(
      'binding:api.unrelated_requirement_fixture',
    );
  });
  it('shows the technical authority linked by a shared requirement', () => {
    const checked = validateHierarchy(catalog);
    const view = inspectHierarchyJourney(checked.catalog!, 'journey:school.accept_invitation');
    expect(view?.sharedRequirements.map((item) => item.id)).toContain(
      'requirement:school.authority',
    );
    expect(view?.sharedBindings.map((item) => item.id)).toContain(
      'binding:school.invite_repository',
    );
  });
  it('includes cross-journey requirements and bindings linked to a step in either direction', () => {
    const input = structuredClone(catalog);
    const features = input.features;
    const school = features.find(
      (item: { id: string }) => item.id === 'feature:admin.school_connection',
    );
    const acceptance = school.intents
      .flatMap((intent: { journeys: { id: string }[] }) => intent.journeys)
      .find((journey: { id: string }) => journey.id === 'journey:school.accept_invitation');
    const api = features.find((item: { id: string }) => item.id === 'feature:api.foundation')
      .intents[0].journeys[0];
    acceptance.steps[0].links = ['binding:api.guide', 'requirement:api.shared'];
    api.requirements.push({
      id: 'requirement:api.shared',
      statement: 'Shared authority',
      origin: 'source',
    });
    api.bindings.push({
      id: 'binding:api.reverse',
      category: 'api',
      status: 'unknown',
      note: 'Shared',
      links: [acceptance.steps[0].id],
    });
    const checked = validateHierarchy(input);
    expect(checked.errors).toEqual([]);
    const view = inspectHierarchyJourney(checked.catalog!, acceptance.id);
    expect(view?.sharedRequirements.map((item) => item.id)).toContain('requirement:api.shared');
    expect(view?.sharedBindings.map((item) => item.id)).toEqual(
      expect.arrayContaining(['binding:api.guide', 'binding:api.reverse']),
    );
  });
  it('resolves shared authorities linked through owned requirements, bindings and evidence', () => {
    const input = structuredClone(catalog);
    const owner = input.features[0].intents[0].journeys[0];
    const external = input.features.find(
      (feature: { id: string }) => feature.id === 'feature:api.foundation',
    ).intents[0].journeys[0];
    owner.requirements[0].links.push('requirement:api.from_requirement');
    owner.bindings[0].links.push('binding:api.from_binding');
    owner.evidence.push({
      id: 'evidence:pjc.author_fixture',
      scenario: 'scenario:pjc.author',
      revision: 'fixture',
      environment: 'fixture',
      tier: 'G0',
      result: 'passed',
      substitutions: [],
      limitations: 'Fixture.',
      reference: 'fixture',
      links: ['binding:api.from_evidence'],
    });
    external.requirements.push(
      {
        id: 'requirement:api.from_requirement',
        statement: 'Referenced requirement',
        origin: 'source',
      },
      {
        id: 'requirement:api.reverse',
        statement: 'Reverse reference',
        origin: 'source',
        links: [owner.bindings[0].id],
      },
    );
    external.bindings.push(
      { id: 'binding:api.from_binding', category: 'api', status: 'unknown', note: 'Fixture.' },
      { id: 'binding:api.from_evidence', category: 'api', status: 'unknown', note: 'Fixture.' },
      {
        id: 'binding:api.reverse_owned',
        category: 'api',
        status: 'unknown',
        note: 'Fixture.',
        links: [owner.evidence[0].id],
      },
    );
    const checked = validateHierarchy(input);
    expect(checked.errors).toEqual([]);
    const view = inspectHierarchyJourney(checked.catalog!, owner.id);
    expect(view?.sharedRequirements.map((item) => item.id)).toEqual(
      expect.arrayContaining(['requirement:api.from_requirement', 'requirement:api.reverse']),
    );
    expect(view?.sharedBindings.map((item) => item.id)).toEqual(
      expect.arrayContaining([
        'binding:api.from_binding',
        'binding:api.from_evidence',
        'binding:api.reverse_owned',
      ]),
    );
  });
  it('resolves scenario transitions in order with the connected steps and feedback', () => {
    const checked = validateHierarchy(catalog);
    const view = inspectHierarchyJourney(checked.catalog!, 'journey:school.accept_invitation');
    const path = view?.scenarioPaths.find((item) => item.id === 'scenario:school.accept');
    expect(path?.steps.map((item) => item.transition?.id)).toEqual([
      'transition:school.authenticate',
      'transition:school.lookup',
      'transition:school.accept',
    ]);
    expect(path?.steps[0]?.from?.id).toBe('step:school.receive');
    expect(path?.steps[2]?.to?.id).toBe('step:school.connected');
    expect(path?.steps[1]?.transition?.feedback).toBeTruthy();
    expect(path?.disclaimer).toContain('not evidence of execution');
  });
  it('rejects old versions, duplicate IDs, and dangling references', () => {
    expect(validateHierarchy({ schemaVersion: 1, records: [] }).errors.length).toBeGreaterThan(0);
    const duplicate = structuredClone(catalog);
    duplicate.features.push(duplicate.features[0]);
    expect(validateHierarchy(duplicate).errors).toContain('Duplicate ID: feature:pjc.catalog');
    const dangling = structuredClone(catalog);
    dangling.features[0].links.push('intent:missing');
    expect(validateHierarchy(dangling).errors).toContain(
      'feature:pjc.catalog: missing reference intent:missing',
    );
  });
  it('validates continuity while allowing retry loops', () => {
    const input = structuredClone(catalog);
    const journey = input.features[0].intents[0].journeys[0];
    journey.transitions.push({
      id: 'transition:pjc.loop',
      from: 'step:pjc.start',
      to: 'step:pjc.start',
      action: 'Retry',
      feedback: 'Try again',
    });
    journey.scenarios.push({
      id: 'scenario:pjc.loop',
      title: 'Retry',
      transitions: ['transition:pjc.loop', 'transition:pjc.author'],
      expected: 'Retry and author',
    });
    expect(validateHierarchy(input).errors).toEqual([]);
    journey.scenarios.push({
      id: 'scenario:pjc.disconnected',
      title: 'Invalid',
      transitions: ['transition:pjc.author', 'transition:pjc.author'],
      expected: 'Invalid',
    });
    expect(validateHierarchy(input).errors).toContain(
      'scenario:pjc.disconnected: disconnected path',
    );
  });
  it('requires explicit preconditions for a path starting after journey entry', () => {
    const input = structuredClone(catalog);
    const journey = input.features
      .find((feature: { id: string }) => feature.id === 'feature:admin.school_connection')
      .intents.find((intent: { id: string }) => intent.id === 'intent:school.principal_accept')
      .journeys[0];
    journey.scenarios.push({
      id: 'scenario:school.partial_fixture',
      title: 'Already signed in',
      transitions: ['transition:school.lookup', 'transition:school.accept'],
      expected: 'Connected',
    });
    expect(validateHierarchy(input).errors).toContain(
      'scenario:school.partial_fixture: path does not start at declared step',
    );
    journey.scenarios.at(-1).start = 'step:school.signin';
    expect(validateHierarchy(input).errors).toContain(
      'scenario:school.partial_fixture: partial path requires preconditions',
    );
    journey.scenarios.at(-1).preconditions = ['The user is already signed in.'];
    const checked = validateHierarchy(input);
    expect(checked.errors).toEqual([]);
    const path = inspectHierarchyJourney(checked.catalog!, journey.id)?.scenarioPaths.find(
      (item) => item.id === 'scenario:school.partial_fixture',
    );
    expect(path?.start).toBe('step:school.signin');
    expect(path?.preconditions).toEqual(['The user is already signed in.']);
  });
  it('distinguishes intermediate checkpoints from completed outcomes', () => {
    const input = structuredClone(catalog);
    const journey = input.features
      .find((feature: { id: string }) => feature.id === 'feature:admin.school_connection')
      .intents.find(
        (intent: { id: string }) => intent.id === 'intent:admin.school_connection.legacy',
      ).journeys[0];
    const scenario = journey.scenarios.find(
      (item: { id: string }) => item.id === 'scenario:admin.school_connection.first_visit',
    );
    delete scenario.completion;
    delete scenario.checkpointReason;
    expect(validateHierarchy(input).errors).toContain(
      'scenario:admin.school_connection.first_visit: nonterminal path requires a checkpoint',
    );
    scenario.completion = 'checkpoint';
    expect(validateHierarchy(input).errors).toContain(
      'scenario:admin.school_connection.first_visit: checkpoint requires a reason',
    );
    scenario.checkpointReason = 'The user has not chosen a connection method yet.';
    const checked = validateHierarchy(input);
    expect(checked.errors).toEqual([]);
    const view = inspectHierarchyJourney(checked.catalog!, journey.id)?.scenarioPaths.find(
      (item) => item.id === scenario.id,
    );
    expect(view?.completion).toBe('checkpoint');
    expect(view?.checkpointReason).toBe(scenario.checkpointReason);
  });
});
