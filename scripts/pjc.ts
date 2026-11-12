import { existsSync, realpathSync } from 'node:fs';
import path from 'node:path';
import {
  findUnregisteredFeatureModules,
  loadCatalogFile,
} from '@repo/core/flows/pjc/catalogLoader.adapter';
import { type PjcHierarchy, validateHierarchy } from '../packages/core/src/flows/pjc/hierarchy';
import { inspectHierarchyJourney } from '../packages/core/src/flows/pjc/hierarchyQuery';

const args = process.argv.slice(2);
const command = args[0];
const option = (name: string) => {
  const i = args.indexOf(name);
  return i < 0 ? undefined : args[i + 1];
};
const root = path.resolve(import.meta.dirname, '..');
const format = option('--format') ?? 'json';
function validateArguments() {
  const optionsByCommand: Record<string, string[]> = {
    tree: ['--depth'],
    list: [
      '--kind',
      '--query',
      '--actor',
      '--status',
      '--maturity',
      '--implementation',
      '--verification',
      '--priority',
      '--context',
      '--platform',
      '--requirement-type',
      '--origin',
      '--target-after',
      '--target-before',
    ],
    inspect: ['--view'],
    journey: [],
    trace: [],
    check: ['--revision', '--journey'],
  };
  if (!command || !Object.hasOwn(optionsByCommand, command))
    throw new Error('Expected one of: tree, list, inspect, journey, trace, check');
  const allowed = new Set(['--file', '--format', ...optionsByCommand[command]!]);
  const seen = new Set<string>();
  let positional = 0;
  for (let i = 1; i < args.length; i++) {
    const arg = args[i]!;
    if (arg.startsWith('--')) {
      if (!allowed.has(arg)) throw new Error(`Unknown option for ${command}: ${arg}`);
      if (seen.has(arg)) throw new Error(`Duplicate option: ${arg}`);
      if (!args[i + 1] || args[i + 1]!.startsWith('--'))
        throw new Error(`Missing value for ${arg}`);
      seen.add(arg);
      i++;
    } else {
      if (i !== 1 || ++positional > 1 || command === 'list' || command === 'check')
        throw new Error(`Unexpected argument: ${arg}`);
    }
  }
  if (['inspect', 'journey', 'trace'].includes(command) && positional !== 1)
    throw new Error(`${command} requires an ID or reference`);
  const choices: Record<string, string[]> = {
    '--format': ['json', 'text', 'markdown'],
    '--depth': ['journeys', 'paths'],
    '--view': ['minimal', 'expanded'],
    '--kind': [
      'feature',
      'intent',
      'journey',
      'step',
      'transition',
      'requirement',
      'binding',
      'impact',
      'observation',
      'platform',
      'scenario',
      'evidence',
    ],
    '--status': [
      'unknown',
      'planned',
      'implemented',
      'verified',
      'proposed',
      'development',
      'available',
      'retiring',
    ],
    '--maturity': ['proposed', 'development', 'available', 'retiring'],
    '--implementation': ['unknown', 'planned', 'partial', 'implemented'],
    '--verification': ['unknown', 'not_started', 'partial', 'verified'],
    '--context': ['setup', 'daily', 'recovery', 'other'],
    '--platform': ['web', 'mobile', 'shared', 'tooling', 'other'],
    '--requirement-type': ['product', 'functional', 'quality', 'constraint'],
    '--origin': ['user', 'source', 'proposal', 'verified'],
  };
  for (const [name, values] of Object.entries(choices)) {
    const value = option(name);
    if (seen.has(name) && !values.includes(value!))
      throw new Error(`Invalid value for ${name}: ${value}`);
  }
  for (const name of ['--target-after', '--target-before']) {
    const value = option(name);
    if (value) {
      const date = new Date(`${value}T00:00:00Z`);
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
        Number.isNaN(date.valueOf()) ||
        date.toISOString().slice(0, 10) !== value
      )
        throw new Error(`Invalid date for ${name}: ${value}`);
    }
  }
  if (
    option('--target-after') &&
    option('--target-before') &&
    option('--target-after')! > option('--target-before')!
  )
    throw new Error('Target date range is reversed');
}
type Indexed = {
  id: string;
  kind: string;
  title: string;
  parent: string | null;
  references: string[];
  value: object;
};
function matchesPlanning(row: Indexed) {
  const record = row.value;
  const planning =
    'planning' in record && typeof record.planning === 'object' && record.planning !== null
      ? record.planning
      : undefined;
  const lifecycle =
    'lifecycle' in record && typeof record.lifecycle === 'object' && record.lifecycle !== null
      ? record.lifecycle
      : undefined;
  const target =
    planning && 'targetDate' in planning
      ? planning.targetDate
      : lifecycle && 'targetDate' in lifecycle
        ? lifecycle.targetDate
        : undefined;
  return (
    (!option('--maturity') ||
      (planning && 'maturity' in planning && planning.maturity === option('--maturity')) ||
      (lifecycle && 'maturity' in lifecycle && lifecycle.maturity === option('--maturity'))) &&
    (!option('--implementation') ||
      (planning &&
        'implementation' in planning &&
        planning.implementation === option('--implementation'))) &&
    (!option('--verification') ||
      (planning &&
        'verification' in planning &&
        planning.verification === option('--verification'))) &&
    (!option('--priority') ||
      (planning && 'priority' in planning && planning.priority === option('--priority')) ||
      (lifecycle && 'priority' in lifecycle && lifecycle.priority === option('--priority'))) &&
    (!option('--origin') || ('origin' in record && record.origin === option('--origin'))) &&
    (!option('--context') || ('context' in record && record.context === option('--context'))) &&
    (!option('--platform') || ('platform' in record && record.platform === option('--platform'))) &&
    (!option('--requirement-type') ||
      (row.kind === 'requirement' &&
        'classification' in record &&
        record.classification === option('--requirement-type'))) &&
    (!option('--target-after') ||
      (typeof target === 'string' && target >= option('--target-after')!)) &&
    (!option('--target-before') ||
      (typeof target === 'string' && target <= option('--target-before')!))
  );
}
function minimal(row: Indexed) {
  const fields = new Set([
    'description',
    'actor',
    'outcome',
    'situation',
    'context',
    'statement',
    'interaction',
    'action',
    'feedback',
    'expected',
    'origin',
    'platform',
    'classification',
    'lifecycle',
    'planning',
    'category',
    'reference',
    'route',
    'status',
    'verifiedRevision',
    'note',
  ]);
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    parent: row.parent,
    references: row.references,
    ...Object.fromEntries(Object.entries(row.value).filter(([key]) => fields.has(key))),
  };
}
function minimalInspection(row: Indexed, rows: Indexed[]) {
  if (row.kind !== 'journey') return minimal(row);
  const parent = rows.find((item) => item.id === row.parent);
  const project = (value: unknown, keys: string[]) =>
    Array.isArray(value)
      ? value.map((item: unknown) =>
          item && typeof item === 'object'
            ? Object.fromEntries(Object.entries(item).filter(([key]) => keys.includes(key)))
            : item,
        )
      : [];
  const value = row.value;
  return {
    ...minimal(row),
    intent: parent ? minimal(parent) : null,
    steps: project('steps' in value ? value.steps : [], ['id', 'title', 'interaction', 'terminal']),
    transitions: project('transitions' in value ? value.transitions : [], [
      'id',
      'from',
      'to',
      'action',
      'feedback',
    ]),
    scenarios: project('scenarios' in value ? value.scenarios : [], [
      'id',
      'title',
      'start',
      'preconditions',
      'completion',
      'checkpointReason',
      'transitions',
      'expected',
    ]),
  };
}
function searchable(row: Indexed) {
  const ownFields = Object.values(row.value).filter(
    (value) =>
      !Array.isArray(value) ||
      !value.some((item) => item !== null && typeof item === 'object' && 'id' in item),
  );
  return JSON.stringify(ownFields).toLowerCase();
}
function index(catalog: PjcHierarchy): Indexed[] {
  const rows: Indexed[] = [];
  const add = (
    kind: string,
    value: { id: string; title?: string; links?: string[] },
    parent: string | null,
    refs: string[] = [],
  ) =>
    rows.push({
      id: value.id,
      kind,
      title: value.title ?? value.id,
      parent,
      references: [...new Set([...refs, ...(value.links ?? [])])].sort(),
      value,
    });
  for (const feature of catalog.features) {
    add('feature', feature, null, feature.sharedIntents ?? []);
    for (const intent of feature.intents) {
      add('intent', intent, feature.id, intent.sharedJourneys ?? []);
      for (const journey of intent.journeys) {
        add('journey', journey, intent.id, [
          journey.entry,
          ...(journey.sharedRequirements ?? []),
          ...(journey.sharedBindings ?? []),
        ]);
        for (const step of journey.steps) add('step', step, journey.id);
        for (const transition of journey.transitions)
          add('transition', transition, journey.id, [transition.from, transition.to]);
        for (const requirement of journey.requirements) add('requirement', requirement, journey.id);
        for (const binding of journey.bindings) add('binding', binding, journey.id);
        for (const impact of journey.impacts ?? []) add('impact', impact, journey.id);
        for (const observation of journey.observations ?? [])
          add('observation', observation, journey.id);
        for (const platform of journey.platformDifferences ?? [])
          add('platform', platform, journey.id);
        for (const scenario of journey.scenarios)
          add('scenario', scenario, journey.id, [
            ...(scenario.start ? [scenario.start] : []),
            ...scenario.transitions,
          ]);
        for (const evidence of journey.evidence)
          add('evidence', evidence, journey.id, [
            evidence.scenario,
            ...(evidence.alternateEvidence ?? []),
          ]);
      }
    }
  }
  return rows.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}
function actorScope(catalog: PjcHierarchy, rows: Indexed[], actor: string) {
  const intents = catalog.features.flatMap((feature) => feature.intents);
  const matching = intents.filter((intent) =>
    intent.actor.toLowerCase().includes(actor.toLowerCase()),
  );
  const matchingIds = new Set(matching.map((intent) => intent.id));
  const journeyIds = new Set(
    matching.flatMap((intent) => [
      ...intent.journeys.map((journey) => journey.id),
      ...(intent.sharedJourneys ?? []),
    ]),
  );
  const scope = new Set([...matchingIds, ...journeyIds]);
  for (const feature of catalog.features)
    if (
      feature.intents.some((intent) => matchingIds.has(intent.id)) ||
      feature.sharedIntents?.some((id) => matchingIds.has(id))
    )
      scope.add(feature.id);
  for (const row of rows) if (row.parent && journeyIds.has(row.parent)) scope.add(row.id);
  for (const id of journeyIds) {
    const view = inspectHierarchyJourney(catalog, id);
    for (const shared of [...(view?.sharedRequirements ?? []), ...(view?.sharedBindings ?? [])])
      scope.add(shared.id);
  }
  return scope;
}
function readable(value: unknown, depth = 0): string {
  const pad = '  '.repeat(depth);
  if (Array.isArray(value))
    return value
      .map((item) =>
        typeof item === 'object' && item !== null
          ? `${pad}-\n${readable(item, depth + 1)}`
          : `${pad}- ${String(item)}`,
      )
      .join('\n');
  if (value && typeof value === 'object')
    return Object.entries(value)
      .map(([key, item]) =>
        typeof item === 'object' && item !== null
          ? `${pad}${key}:\n${readable(item, depth + 1)}`
          : `${pad}${key}: ${String(item)}`,
      )
      .join('\n');
  return `${pad}${String(value)}`;
}
function markdown(value: unknown, depth = 0): string {
  const pad = '  '.repeat(depth);
  const escape = (item: unknown) =>
    String(item)
      .replace(/[\\`*_{}\[\]<>]/g, '\\$&')
      .replace(/\r?\n/g, ' ');
  if (Array.isArray(value)) {
    if (!value.length) return `${pad}- (none)`;
    return value
      .map((item) =>
        item !== null && typeof item === 'object'
          ? `${pad}-\n${markdown(item, depth + 1)}`
          : `${pad}- ${escape(item)}`,
      )
      .join('\n');
  }
  if (value && typeof value === 'object') {
    return Object.entries(value)
      .map(([key, item]) =>
        item !== null && typeof item === 'object'
          ? `${pad}- **${escape(key)}**\n${markdown(item, depth + 1)}`
          : `${pad}- **${escape(key)}:** ${escape(item)}`,
      )
      .join('\n');
  }
  return `${pad}- ${escape(value)}`;
}
function bindingLocation(reference: string | undefined) {
  if (!reference) return 'unknown';
  if (
    /^[a-z][a-z\d+.-]*:/i.test(reference) ||
    path.isAbsolute(reference) ||
    path.win32.isAbsolute(reference)
  )
    return 'unverifiable';
  const resolved = path.resolve(root, reference);
  const outsideRoot = (base: string, target: string) => {
    const relative = path.relative(base, target);
    return relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative);
  };
  if (outsideRoot(root, resolved)) return 'unverifiable';
  try {
    let existing = resolved;
    while (!existsSync(existing)) {
      const parent = path.dirname(existing);
      if (parent === existing) return 'unverifiable';
      existing = parent;
    }
    if (outsideRoot(realpathSync(root), realpathSync(existing))) return 'unverifiable';
    return existsSync(resolved) ? 'present_unverified' : 'missing';
  } catch {
    return 'unverifiable';
  }
}
function report(catalog: PjcHierarchy, revision?: string, unregistered: string[] = []) {
  const gaps: string[] = [];
  const nonImplementation = new Set(['test', 'documentation', 'architecture', 'roadmap']);
  for (const name of unregistered) gaps.push(`${name}: feature module not registered in manifest`);
  const bindings: object[] = [];
  const evidence: object[] = [];
  for (const feature of catalog.features)
    for (const intent of feature.intents)
      for (const journey of intent.journeys) {
        const resolved = inspectHierarchyJourney(catalog, journey.id);
        if (!journey.planning) gaps.push(`${journey.id}: planning status not declared`);
        if (!journey.requirements.length && !resolved?.sharedRequirements.length)
          gaps.push(`${journey.id}: no requirements`);
        for (const requirement of journey.requirements)
          if (!requirement.classification)
            gaps.push(`${requirement.id}: classification not declared`);
        if (
          ![...journey.bindings, ...(resolved?.sharedBindings ?? [])].some(
            (binding) => !nonImplementation.has(binding.category),
          )
        )
          gaps.push(`${journey.id}: no implementation bindings`);
        if (!journey.scenarios.length) gaps.push(`${journey.id}: no scenarios`);
        if (journey.development.mode !== 'greenfield' && !journey.impacts?.length)
          gaps.push(`${journey.id}: impact analysis not recorded`);
        if (journey.development.mode !== 'greenfield' && !journey.observations?.length)
          gaps.push(`${journey.id}: source observations not recorded`);
        if (journey.development.mode !== 'greenfield' && !journey.platformDifferences?.length)
          gaps.push(`${journey.id}: platform analysis not recorded`);
        for (const question of journey.development.openQuestions)
          gaps.push(`${journey.id}: open question: ${question}`);
        for (const edge of journey.transitions)
          if (!journey.scenarios.some((scenario) => scenario.transitions.includes(edge.id)))
            gaps.push(`${edge.id}: no scenario`);
        for (const binding of journey.bindings) {
          if (binding.status !== 'verified') gaps.push(`${binding.id}: binding ${binding.status}`);
          const freshness =
            binding.status !== 'verified'
              ? 'not_declared'
              : !revision || !binding.verifiedRevision
                ? 'unverifiable'
                : binding.verifiedRevision === revision
                  ? 'current_declared'
                  : 'stale';
          if (binding.status === 'verified' && freshness !== 'current_declared')
            gaps.push(`${binding.id}: verification ${freshness}`);
          const location = bindingLocation(binding.reference);
          let route = binding.route ? 'unverifiable' : 'not_declared';
          if (
            binding.route &&
            binding.category === 'web' &&
            binding.reference &&
            location === 'present_unverified'
          ) {
            const prefix = 'apps/gurudevi-web/app/';
            const normalized = binding.reference.replaceAll('\\', '/');
            if (normalized.startsWith(prefix) && /\/page\.[jt]sx?$/.test(normalized)) {
              const derived =
                '/' +
                normalized
                  .slice(prefix.length)
                  .replace(/(?:^|\/)page\.[jt]sx?$/, '')
                  .split('/')
                  .filter((segment) => !/^\(.+\)$/.test(segment))
                  .join('/');
              route = derived.includes('[')
                ? 'unverifiable'
                : derived === binding.route
                  ? 'present_unverified'
                  : 'mismatch';
            }
          }
          if (location !== 'present_unverified') gaps.push(`${binding.id}: reference ${location}`);
          if (route === 'mismatch' || route === 'unverifiable')
            gaps.push(`${binding.id}: route ${route}`);
          bindings.push({
            id: binding.id,
            result: location,
            route,
            freshness,
          });
        }
        for (const scenario of journey.scenarios) {
          const scenarioPath = resolved?.scenarioPaths.find((item) => item.id === scenario.id);
          if (!scenarioPath?.requirements.length)
            gaps.push(`${scenario.id}: no linked requirement`);
          if (!scenarioPath?.bindings.length) gaps.push(`${scenario.id}: no linked binding`);
          else if (
            !scenarioPath.bindings.some((binding) => !nonImplementation.has(binding.category))
          )
            gaps.push(`${scenario.id}: no linked implementation binding`);
          const rows = journey.evidence.filter((item) => item.scenario === scenario.id);
          if (!rows.length) gaps.push(`${scenario.id}: no evidence`);
          const tiers = ['G0', 'G1', 'G2', 'G3', 'G4', 'G5', 'R1'] as const;
          const levels = tiers.map((tier) => {
            const entries = rows.filter((row) => row.tier === tier);
            if (!entries.length) return { tier, status: 'missing' };
            const records = entries.map((entry) => ({
              id: entry.id,
              revision: entry.revision,
              environment: entry.environment,
              result: entry.result,
              substitutions: entry.substitutions,
              limitations: entry.limitations,
              reference: entry.reference,
              rationale: entry.rationale,
              acceptedBy: entry.acceptedBy,
              alternateEvidence: entry.alternateEvidence,
            }));
            if (!revision) return { tier, status: 'unverifiable', records };
            const current = entries.filter((row) => row.revision === revision);
            if (!current.length) return { tier, status: 'stale', records };
            const results = new Set(current.map((row) => row.result));
            const acceptedException = current.some(
              (row) =>
                row.result === 'not_applicable' &&
                row.alternateEvidence?.every((id) =>
                  journey.evidence.some(
                    (alternative) =>
                      alternative.id === id &&
                      alternative.revision === revision &&
                      alternative.result === 'passed',
                  ),
                ),
            );
            return {
              tier,
              records,
              status:
                results.size > 1
                  ? 'conflicting'
                  : current.some((row) => row.result === 'failed')
                    ? 'failed'
                    : current.some((row) => row.result === 'passed')
                      ? 'declared_passed'
                      : acceptedException
                        ? 'declared_not_applicable'
                        : current[0]!.result,
            };
          });
          const firstMissing = levels.findIndex(
            (level) =>
              level.status !== 'declared_passed' && level.status !== 'declared_not_applicable',
          );
          for (const level of levels)
            if (
              level.status !== 'missing' &&
              level.status !== 'declared_passed' &&
              level.status !== 'declared_not_applicable'
            )
              gaps.push(`${scenario.id}: ${level.tier} evidence ${level.status}`);
          evidence.push({
            scenario: scenario.id,
            levels,
            contiguousDeclaredThrough:
              firstMissing < 0 ? 'R1' : firstMissing === 0 ? null : tiers[firstMissing - 1],
            disclaimer:
              'Declared results require independent review of each record, environment, substitutions and applicability.',
          });
        }
      }
  return {
    errors: [],
    gaps: gaps.sort(),
    bindings,
    evidence,
    disclaimer: 'Presence does not establish correct behavior or verified evidence.',
  };
}
try {
  validateArguments();
  const file = option('--file') ?? path.join(root, 'packages/core/src/flows/pjc/catalog.v2.json');
  const checked = (() => {
    try {
      return validateHierarchy(loadCatalogFile(file));
    } catch (error) {
      return {
        catalog: undefined,
        errors: [`Catalog load failed: ${error instanceof Error ? error.message : String(error)}`],
      };
    }
  })();
  let output: unknown;
  if (!checked.catalog || checked.errors.length) {
    output = { errors: checked.errors };
    process.exitCode = 1;
  } else {
    const catalog = checked.catalog;
    const rows = index(catalog);
    if (command === 'check') {
      const unregistered = findUnregisteredFeatureModules(file);
      const full = report(catalog, option('--revision'), unregistered);
      const journeyId = option('--journey');
      if (!journeyId) output = full;
      else {
        const view = inspectHierarchyJourney(catalog, journeyId);
        if (!view) {
          output = { error: `Unknown journey: ${journeyId}` };
          process.exitCode = 2;
        } else {
          const scope = new Set([
            journeyId,
            ...rows.filter((row) => row.parent === journeyId).map((row) => row.id),
            ...view.sharedRequirements.map((item) => item.id),
            ...view.sharedBindings.map((item) => item.id),
          ]);
          const globalGaps = new Set(
            unregistered.map((name) => `${name}: feature module not registered in manifest`),
          );
          output = {
            ...full,
            scope: { journey: journeyId },
            gaps: full.gaps.filter(
              (gap) => globalGaps.has(gap) || [...scope].some((id) => gap.startsWith(`${id}: `)),
            ),
            bindings: full.bindings.filter(
              (item) => 'id' in item && typeof item.id === 'string' && scope.has(item.id),
            ),
            evidence: full.evidence.filter(
              (item) =>
                'scenario' in item && typeof item.scenario === 'string' && scope.has(item.scenario),
            ),
          };
        }
      }
    } else if (command === 'tree') {
      const selected = args[1]?.startsWith('--') ? undefined : args[1];
      const features = catalog.features.filter((feature) => !selected || feature.id === selected);
      if (!features.length) {
        output = { error: `Unknown feature: ${selected ?? ''}` };
        process.exitCode = 2;
      } else {
        const allIntents = catalog.features.flatMap((feature) => feature.intents);
        const allJourneys = allIntents.flatMap((intent) => intent.journeys);
        output = features.map((feature) => ({
          id: feature.id,
          title: feature.title,
          intents: [
            ...feature.intents,
            ...(feature.sharedIntents ?? []).flatMap((id) =>
              allIntents.filter((intent) => intent.id === id),
            ),
          ].map((intent) => ({
            id: intent.id,
            title: intent.title,
            actor: intent.actor,
            journeys: [
              ...intent.journeys,
              ...(intent.sharedJourneys ?? []).flatMap((id) =>
                allJourneys.filter((journey) => journey.id === id),
              ),
            ].map((journey) => ({
              id: journey.id,
              title: journey.title,
              context: journey.context,
              ...(option('--depth') === 'paths'
                ? {
                    entry: journey.entry,
                    steps: journey.steps.map(({ id, title, interaction, terminal }) => ({
                      id,
                      title,
                      interaction,
                      terminal,
                    })),
                    transitions: journey.transitions.map(({ id, from, to, action, feedback }) => ({
                      id,
                      from,
                      to,
                      action,
                      feedback,
                    })),
                    scenarios: journey.scenarios.map(
                      ({
                        id,
                        title,
                        start,
                        preconditions,
                        completion,
                        checkpointReason,
                        transitions,
                        expected,
                      }) => ({
                        id,
                        title,
                        start: start ?? journey.entry,
                        preconditions: preconditions ?? [],
                        completion: completion ?? 'outcome',
                        checkpointReason,
                        transitions,
                        expected,
                      }),
                    ),
                  }
                : {}),
            })),
          })),
        }));
      }
    } else if (command === 'list') {
      const actor = option('--actor');
      const scoped = actor ? actorScope(catalog, rows, actor) : undefined;
      output = rows
        .filter(
          (row) =>
            (!option('--kind') || row.kind === option('--kind')) &&
            matchesPlanning(row) &&
            (!option('--query') || searchable(row).includes(option('--query')!.toLowerCase())) &&
            (!scoped || scoped.has(row.id)) &&
            (!option('--status') ||
              (row.kind === 'binding' &&
                'status' in row.value &&
                row.value.status === option('--status')) ||
              (row.kind === 'feature' &&
                'lifecycle' in row.value &&
                typeof row.value.lifecycle === 'object' &&
                row.value.lifecycle !== null &&
                'maturity' in row.value.lifecycle &&
                row.value.lifecycle.maturity === option('--status'))),
        )
        .map(minimal);
    } else if (command === 'journey') {
      output = inspectHierarchyJourney(catalog, args[1] ?? '');
      if (!output) {
        output = { error: `Unknown journey: ${args[1] ?? ''}` };
        process.exitCode = 2;
      }
    } else if (command === 'inspect' || command === 'trace') {
      const selected = rows.filter(
        (row) =>
          row.id === args[1] ||
          (command === 'trace' && 'reference' in row.value && row.value.reference === args[1]),
      );
      if (!selected.length) {
        output = { error: `Unknown record: ${args[1] ?? ''}` };
        process.exitCode = 2;
      } else {
        const traces = selected.map((row) => {
          const neighbors = new Map(rows.map((item) => [item.id, new Set<string>()]));
          for (const other of rows) {
            for (const target of [...other.references, ...(other.parent ? [other.parent] : [])]) {
              neighbors.get(other.id)?.add(target);
              neighbors.get(target)?.add(other.id);
            }
          }
          const paths = new Map<string, string[]>([[row.id, [row.id]]]);
          const queue = [row.id];
          for (let i = 0; i < queue.length; i++) {
            const current = queue[i]!;
            for (const neighbor of [...(neighbors.get(current) ?? [])].sort()) {
              if (paths.has(neighbor)) continue;
              paths.set(neighbor, [...paths.get(current)!, neighbor]);
              queue.push(neighbor);
            }
          }
          const related = [...paths.keys()].filter((id) => id !== row.id).sort();
          return {
            record: row.value,
            parent: row.parent,
            outgoing: row.references,
            incoming: rows
              .filter((other) => other.references.includes(row.id) || other.parent === row.id)
              .map((other) => other.id),
            related,
            connectionPaths: related.map((id) => ({ id, path: paths.get(id) })),
          };
        });
        if (command === 'trace')
          output = selected.length === 1 && selected[0]!.id === args[1] ? traces[0] : traces;
        else if (option('--view') === 'expanded') {
          const details =
            selected[0]!.kind === 'journey'
              ? inspectHierarchyJourney(catalog, selected[0]!.id)
              : null;
          output = details
            ? {
                ...traces[0],
                journeyContext: {
                  feature: details.feature,
                  intent: details.intent,
                  sharedWith: details.sharedWith,
                  scenarioPaths: details.scenarioPaths,
                  sharedRequirements: details.sharedRequirements,
                  sharedBindings: details.sharedBindings,
                },
              }
            : traces[0];
        } else output = minimalInspection(selected[0]!, rows);
      }
    } else {
      output = {
        error:
          'Usage: pjc tree [FEATURE_ID] | list | inspect ID | journey ID | trace ID | check [--file PATH] [--format json|text|markdown]',
      };
      process.exitCode = 2;
    }
  }
  if (format === 'json') console.log(JSON.stringify(output, null, 2));
  else if (format === 'text') console.log(readable(output));
  else if (format === 'markdown')
    console.log(`# Product and Journey Catalog\n\n${markdown(output)}`);
  else {
    console.error(`Unknown format: ${format}`);
    process.exitCode = 2;
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 2;
}
