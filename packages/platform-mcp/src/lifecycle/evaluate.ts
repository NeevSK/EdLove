import { coordinationChecks } from '../coordinationTools.js';
import {
  type ArtifactRef,
  type LifecycleCreate,
  type LifecycleMutation,
  type LifecycleState,
  lifecycleStateSchema,
  type ToolRequest,
} from './model.js';

type Context = {
  now: string;
  changedSources: string[];
  procedureRevision: string;
  sources?: { path: string; sha256: string }[];
};
type Task = LifecycleState['tasks'][number];
const key = (ref: ArtifactRef) => `${ref.id}@${ref.version}`;
const findArtifact = (state: LifecycleState, ref: ArtifactRef) =>
  state.artifacts.find((item) => item.id === ref.id && item.version === ref.version);
const actorHas = (state: LifecycleState, actorId: string, role: Task['role']) =>
  state.actors.some((actor) => actor.id === actorId && actor.roles.includes(role));
function taskOf(state: LifecycleState, id: string) {
  const task = state.tasks.find((item) => item.id === id);
  if (!task) throw new Error('task_not_found');
  return task;
}
function inputRefs(state: LifecycleState, task: Task): ArtifactRef[] {
  return [
    ...(state.analysisRef ? [state.analysisRef] : []),
    ...task.requires.flatMap((id) => taskOf(state, id).outputs),
  ];
}
function matchingRun(state: LifecycleState, task: Task, tool: string) {
  const expected = inputRefs(state, task).map(key).sort().join('|');
  const run = [...state.toolRuns]
    .reverse()
    .find((item) => item.taskId === task.id && item.toolId === tool);
  return (
    !!run &&
    run.state === 'finished' &&
    run.result?.ok === true &&
    run.result.exitCode === 0 &&
    !run.result.error &&
    run.inputRefs.map(key).sort().join('|') === expected
  );
}
function manualValid(
  state: LifecycleState,
  task: Task,
  decision: LifecycleState['toolDecisions'][number],
  stale: Set<string>,
) {
  const inputs = inputRefs(state, task);
  return (
    decision.evidence.length > 0 &&
    decision.evidence.every((ref) => {
      const artifact = findArtifact(state, ref);
      return (
        !!artifact &&
        !stale.has(key(ref)) &&
        artifact.content.kind === 'manual-evidence' &&
        artifact.content.result === 'supported' &&
        artifact.authorId === decision.actorId &&
        artifact.sourcePaths.length > 0 &&
        inputs.every((input) =>
          artifact.dependsOn.some((dependency) => key(dependency) === key(input)),
        )
      );
    })
  );
}
function artifactsFor(state: LifecycleState, refs: ArtifactRef[]) {
  return refs.map((ref) => {
    const artifact = findArtifact(state, ref);
    if (!artifact) throw new Error('artifact_not_found');
    return artifact;
  });
}
export function createLifecycle(
  request: LifecycleCreate,
  sources: { path: string; sha256: string }[],
  now: string,
  procedureRevision: string,
): LifecycleState {
  if (request.expectedRevision !== 0) throw new Error('revision_conflict');
  if (
    new Set(request.actors.map((actor) => actor.id)).size !== request.actors.length ||
    new Set(request.sourcePaths).size !== request.sourcePaths.length ||
    request.sourcePaths.length !== sources.length ||
    request.sourcePaths.some((item) => !sources.some((source) => source.path === item))
  )
    throw new Error('invalid_creation_sources');
  return lifecycleStateSchema.parse({
    id: request.id,
    goal: request.goal,
    scope: request.scope,
    actors: request.actors,
    sources,
    externalRefs: request.externalRefs,
    revision: 0,
    procedureRevision,
    createdAt: now,
    artifacts: [],
    tasks: [],
    reviews: [],
    toolDecisions: [],
    toolRuns: [],
  });
}
function staleSet(state: LifecycleState, changedSources: string[]) {
  const stale = new Set<string>();
  for (const artifact of state.artifacts) {
    const newer = state.artifacts.some(
      (other) => other.id === artifact.id && other.version > artifact.version,
    );
    if (
      newer ||
      artifact.procedureRevision !== state.procedureRevision ||
      artifact.sourceSnapshots.some(
        (snapshot) =>
          changedSources.includes(snapshot.path) ||
          state.sources.find((source) => source.path === snapshot.path)?.sha256 !== snapshot.sha256,
      )
    )
      stale.add(key(artifact));
  }
  let changed = true;
  while (changed) {
    changed = false;
    for (const artifact of state.artifacts) {
      const k = key(artifact);
      if (!stale.has(k) && artifact.dependsOn.some((ref) => stale.has(key(ref)))) {
        stale.add(k);
        changed = true;
      }
    }
  }
  return stale;
}
export function projectLifecycle(
  state: LifecycleState,
  changedSources: string[],
  procedureRevision: string,
) {
  const stale = staleSet(state, changedSources);
  const analysis = state.analysisRef && findArtifact(state, state.analysisRef);
  const unknownDimensions =
    analysis?.content.kind === 'analysis'
      ? Object.entries(analysis.content.dimensions)
          .filter(([, value]) => value.applicability === 'unknown')
          .map(([name]) => name)
      : [];
  const procedureChanged = state.procedureRevision !== procedureRevision;
  const effective = state.tasks.map((task) => {
    const invalidManual = task.toolNeeds.some((tool) => {
      const decision = [...state.toolDecisions]
        .reverse()
        .find((entry) => entry.taskId === task.id && entry.toolId === tool);
      if (decision?.decision === 'manual' && !manualValid(state, task, decision, stale))
        return true;
      return (
        task.status === 'accepted' &&
        (!decision ||
          decision.decision === 'unavailable' ||
          decision.decision === 'checker-gap' ||
          (decision.decision === 'tool' && !matchingRun(state, task, tool)))
      );
    });
    const invalid =
      invalidManual ||
      task.outputs.some((ref) => stale.has(key(ref))) ||
      task.consumed.some((ref) => stale.has(key(ref))) ||
      (state.analysisRef && stale.has(key(state.analysisRef)));
    return {
      ...task,
      effectiveStatus: invalid ? 'stale' : task.status,
      packet: {
        consumed: inputRefs(state, task).map((ref) => findArtifact(state, ref)),
        toolNeeds: task.toolNeeds,
        decisions: state.toolDecisions.filter((item) => item.taskId === task.id),
      },
    };
  });
  let propagated = true;
  while (propagated) {
    propagated = false;
    for (const task of effective) {
      if (
        task.effectiveStatus !== 'stale' &&
        task.requires.some((id) => {
          const upstream = effective.find((item) => item.id === id);
          return (
            upstream?.effectiveStatus === 'stale' ||
            ((task.status === 'accepted' || task.status === 'submitted') &&
              upstream?.effectiveStatus !== 'accepted')
          );
        })
      ) {
        task.effectiveStatus = 'stale';
        propagated = true;
      }
    }
  }
  const unassignedRoles = [
    ...new Set(
      effective
        .filter((task) => !state.actors.some((actor) => actor.roles.includes(task.role)))
        .map((task) => task.role),
    ),
  ];
  const readyTasks = effective
    .filter((task) => !unassignedRoles.includes(task.role))
    .filter(
      (task) =>
        task.effectiveStatus === 'open' ||
        task.effectiveStatus === 'returned' ||
        task.effectiveStatus === 'stale',
    )
    .filter((task) =>
      task.requires.every(
        (id) => effective.find((item) => item.id === id)?.effectiveStatus === 'accepted',
      ),
    )
    .map((task) => task.id);
  const unresolvedArtifacts = state.artifacts
    .filter((artifact) => !stale.has(key(artifact)))
    .flatMap((artifact) => {
      const content = artifact.content;
      if (content.kind === 'decision' || content.kind === 'requirement')
        return content.unresolved.map((item) => `artifact:${artifact.id}:${item}`);
      if (content.kind === 'finding' && content.classification === 'unresolved')
        return [`finding:${artifact.id}:unresolved`];
      if (content.kind === 'verification' && content.outcome !== 'passed')
        return [`verification:${artifact.id}:${content.outcome}`];
      if (content.kind === 'dependency')
        return content.packages
          .filter((item) =>
            [item.declared, item.resolved, item.installed, item.upstream, item.compatibility].some(
              (value) => value.toLowerCase() === 'unknown',
            ),
          )
          .map((item) => `dependency:${item.name}:unknown`);
      return [];
    });
  const blockers = [
    ...unresolvedArtifacts,
    ...(state.unassessedSources ?? []).map((source) => `unassessed_source:${source}`),
    ...unassignedRoles.map((role) => `unassigned_role:${role}`),
    ...(procedureChanged ? ['procedure_changed'] : []),
    ...changedSources.map((source) => `changed_source:${source}`),
    ...unknownDimensions.map((name) => `unknown_dimension:${name}`),
    ...(analysis?.content.kind === 'analysis'
      ? analysis.content.openQuestions.map((item) => `open_question:${item}`)
      : ['analysis_missing']),
    ...effective
      .filter((task) => task.effectiveStatus !== 'accepted')
      .map((task) => `task:${task.id}:${task.effectiveStatus}`),
    ...effective.flatMap((task) =>
      task.toolNeeds.flatMap((tool) => {
        const decision = [...state.toolDecisions]
          .reverse()
          .find((item) => item.taskId === task.id && item.toolId === tool);
        if (!decision) return [`tool:${task.id}:${tool}:undecided`];
        if (decision.decision === 'unavailable' || decision.decision === 'checker-gap')
          return [`tool:${task.id}:${tool}:${decision.decision}`];
        if (decision.decision === 'manual' && !manualValid(state, task, decision, stale))
          return [`tool:${task.id}:${tool}:stale-manual-evidence`];
        if (decision.decision === 'tool' && !matchingRun(state, task, tool))
          return [`tool:${task.id}:${tool}:unverified`];
        return [];
      }),
    ),
  ];
  const satisficed =
    blockers.length === 0 &&
    effective.length > 0 &&
    effective.every((task) => task.effectiveStatus === 'accepted');

  return {
    tasks: effective,
    readyTasks: procedureChanged || changedSources.length ? [] : readyTasks,
    blockers,
    staleArtifacts: [...stale],
    readiness: blockers.length ? 'blocked' : 'review-ready',
    procedureChanged,
    unknownDimensions,
    satisficed,
    satisficingReason: satisficed
      ? 'EVSI_MET: All critical invariants and acceptance criteria satisfied; additional review cycles yield negligible expected value of information'
      : undefined,
    limitation: 'Local actor roles are claims, not authenticated authority or product completion.',
  };
}

export function evaluateArtifact(
  artifact: LifecycleState['artifacts'][number],
  _state?: LifecycleState,
): {
  valid: boolean;
  unresolved: string[];
  satisficed: boolean;
  satisficingReason?: string;
} {
  const content = artifact.content;
  const unresolved: string[] = [];
  if (content.kind === 'decision' || content.kind === 'requirement') {
    unresolved.push(...content.unresolved.map((item) => `artifact:${artifact.id}:${item}`));
  } else if (content.kind === 'finding' && content.classification === 'unresolved') {
    unresolved.push(`finding:${artifact.id}:unresolved`);
  } else if (content.kind === 'verification' && content.outcome !== 'passed') {
    unresolved.push(`verification:${artifact.id}:${content.outcome}`);
  } else if (content.kind === 'dependency') {
    const unknownPkgs = content.packages.filter((item) =>
      [item.declared, item.resolved, item.installed, item.upstream, item.compatibility].some(
        (value) => value.toLowerCase() === 'unknown',
      ),
    );
    unresolved.push(...unknownPkgs.map((item) => `dependency:${item.name}:unknown`));
  }
  const isSatisficed = unresolved.length === 0;
  return {
    valid: unresolved.length === 0,
    unresolved,
    satisficed: isSatisficed,
    satisficingReason: isSatisficed
      ? 'EVSI_MET: All critical invariants and acceptance criteria satisfied; additional review cycles yield negligible expected value of information'
      : undefined,
  };
}

export function evaluateLifecycleState(
  state: LifecycleState,
  changedSources: string[] = [],
  procedureRevision: string = state.procedureRevision,
) {
  const projection = projectLifecycle(state, changedSources, procedureRevision);
  const satisficed =
    projection.blockers.length === 0 &&
    projection.readiness === 'review-ready' &&
    projection.tasks.length > 0 &&
    projection.tasks.every((task) => task.effectiveStatus === 'accepted');

  return {
    ...projection,
    satisficed,
    satisficingReason: satisficed
      ? 'EVSI_MET: All critical invariants and acceptance criteria satisfied; additional review cycles yield negligible expected value of information'
      : undefined,
  };
}
function plan(state: LifecycleState, ref: ArtifactRef): Task[] {
  const artifact = findArtifact(state, ref);
  if (!artifact || artifact.content.kind !== 'analysis') throw new Error('analysis_required');
  const dimensions = artifact.content.dimensions;
  const applies = (...names: (keyof typeof dimensions)[]) =>
    names.some((name) => dimensions[name]?.applicability !== 'not-applicable');
  const tasks: Task[] = [];
  function add(
    id: string,
    role: Task['role'],
    expected: Task['expected'],
    requires: string[],
    toolNeeds: string[],
  ) {
    tasks.push({
      id,
      title: id,
      scope: state.scope,
      role,
      expected,
      requires,
      toolNeeds,
      outputs: [],
      consumed: [],
      status: 'open',
    });
  }
  const kind = artifact.content.requestKind;
  add(
    'product',
    'product',
    kind === 'investigation'
      ? ['finding', 'scenario']
      : kind === 'refactor'
        ? ['invariant', 'scenario']
        : ['requirement', 'invariant', 'scenario'],
    [],
    ['pjc-check'],
  );
  if (applies('ux', 'screens', 'state', 'errors', 'feedback', 'accessibility'))
    add('ux', 'ux', ['experience'], ['product'], ['feature-behavior']);
  if (applies('motion'))
    add(
      'visual-motion',
      'visual-motion',
      ['visual-motion'],
      tasks.some((task) => task.id === 'ux') ? ['product', 'ux'] : ['product'],
      ['motion-review'],
    );
  if (applies('data', 'api', 'database', 'security', 'offline', 'reuse')) {
    const needs = ['c4-validate'];
    if (applies('api')) needs.push('api-composition', 'api-conformance');
    if (applies('database')) needs.push('sql-migrations');
    if (applies('security')) needs.push('security-review');
    if (applies('data')) needs.push('data-behavior');
    if (applies('offline')) needs.push('offline-recovery');
    if (applies('reuse')) needs.push('reuse-impact');
    add('architecture', 'architecture', ['architecture'], ['product'], needs);
  }
  if (applies('dependencies'))
    add(
      'dependencies',
      'dependencies',
      ['dependency'],
      ['product'],
      ['dependency-cohorts', 'dependency-freshness'],
    );
  if (kind !== 'investigation')
    add(
      'implementation',
      'implementation',
      ['implementation'],
      tasks.map((task) => task.id),
      ['feature-behavior'],
    );
  add(
    'verification',
    'verification',
    ['verification'],
    kind === 'investigation' ? tasks.map((task) => task.id) : ['implementation'],
    ['feature-behavior'],
  );
  return tasks;
}
export function applyLifecycleMutation(
  state: LifecycleState,
  request: LifecycleMutation,
  context: Context,
): LifecycleState {
  if (request.id !== state.id || request.expectedRevision !== state.revision)
    throw new Error('revision_conflict');
  if (
    request.action !== 'refresh-sources' &&
    (context.procedureRevision !== state.procedureRevision || context.changedSources.length)
  )
    throw new Error('stale_lifecycle');
  const next = structuredClone(state);
  switch (request.action) {
    case 'register-source': {
      if (next.sources.some((source) => source.path === request.sourcePath))
        throw new Error('duplicate_source');
      if (
        next.sources.length >= 100 ||
        !context.sources ||
        context.sources.length !== next.sources.length + 1 ||
        new Set(context.sources.map((source) => source.path)).size !== context.sources.length ||
        !context.sources.some((source) => source.path === request.sourcePath) ||
        next.sources.some(
          (source) =>
            !context.sources?.some(
              (current) => current.path === source.path && current.sha256 === source.sha256,
            ),
        )
      )
        throw new Error('invalid_registration_sources');
      next.sources = context.sources;
      next.unassessedSources = [...(next.unassessedSources ?? []), request.sourcePath];
      break;
    }
    case 'refresh-sources': {
      if (
        !context.sources ||
        context.sources.length !== next.sources.length ||
        new Set(context.sources.map((source) => source.path)).size !== next.sources.length ||
        next.sources.some(
          (source) => !context.sources?.some((current) => current.path === source.path),
        )
      )
        throw new Error('invalid_refresh_sources');
      next.sources = context.sources;
      next.procedureRevision = context.procedureRevision;
      break;
    }
    case 'register-actor': {
      if (next.actors.some((actor) => actor.id === request.actor.id))
        throw new Error('duplicate_actor');
      next.actors.push(request.actor);
      break;
    }
    case 'publish': {
      const item = request.artifact;
      const activeAnalysis = next.analysisRef ? findArtifact(next, next.analysisRef) : undefined;
      if (
        item.content.kind === 'implementation' &&
        activeAnalysis?.content.kind === 'analysis' &&
        activeAnalysis.content.requestKind === 'investigation'
      )
        throw new Error('investigation_has_no_implementation');
      if (!next.actors.some((actor) => actor.id === item.authorId))
        throw new Error('unknown_actor');
      if (
        ((item.content.kind === 'requirement' && item.content.origin === 'source') ||
          (item.content.kind === 'decision' && item.content.status === 'source')) &&
        !item.content.authorityRefs.length
      )
        throw new Error('authority_reference_required');
      if (
        item.content.kind === 'analysis' &&
        Object.values(item.content.dimensions).some(
          (dimension) =>
            !dimension.sources.length ||
            dimension.sources.some((source) => !item.sourcePaths.includes(source)),
        )
      )
        throw new Error('dimension_source_required');
      if (item.content.kind === 'experience') {
        const { screens, transitions, journeys, stateAxes, motionRequirements, combinations } =
          item.content;
        if (
          [screens, transitions, journeys, stateAxes, motionRequirements].some(
            (rows) => new Set(rows.map((row) => row.id)).size !== rows.length,
          )
        )
          throw new Error('duplicate_experience_id');
        if (
          transitions.some((transition) => {
            const screen = screens.find((entry) => entry.id === transition.screenId);
            return (
              !screen ||
              !screen.states.includes(transition.from) ||
              !screen.states.includes(transition.to)
            );
          })
        )
          throw new Error('invalid_transition');
        if (
          transitions.some(
            (transition) =>
              transition.motionRef !== 'none' &&
              !motionRequirements.some((motion) => motion.id === transition.motionRef),
          )
        )
          throw new Error('invalid_motion_ref');
        if (
          combinations.some((combination) =>
            combination.when.some(
              (condition) =>
                !stateAxes.some(
                  (axis) => axis.id === condition.axisId && axis.states.includes(condition.state),
                ),
            ),
          )
        )
          throw new Error('invalid_state_axis');
        if (
          journeys.some(
            (journey) =>
              !journey.transitionIds.includes(journey.entryTransition) ||
              journey.transitionIds.some(
                (id) => !transitions.some((transition) => transition.id === id),
              ),
          )
        )
          throw new Error('invalid_journey');
      }
      if (item.content.kind === 'architecture') {
        const components = item.content.components;
        if (
          new Set(components.map((component) => component.id)).size !== components.length ||
          item.content.flows.some(
            (flow) =>
              !components.some((component) => component.id === flow.from) ||
              !components.some((component) => component.id === flow.to),
          )
        )
          throw new Error('invalid_architecture_flow');
      }
      if (item.content.kind === 'finding') {
        artifactsFor(next, item.content.evidenceRefs);
        if (item.content.classification === 'observed' && !item.content.evidenceRefs.length)
          throw new Error('finding_evidence_required');
      }
      if (item.content.kind === 'verification') {
        const content = item.content;
        if (!content.observationIds.length && !content.manualEvidenceRefs.length)
          throw new Error('verification_evidence_required');
        if (
          content.observationIds.some(
            (id) =>
              !next.toolRuns.some((run) => run.operationId === id && run.state === 'finished'),
          )
        )
          throw new Error('observation_not_found');
        if (
          artifactsFor(next, content.scenarioRefs).some(
            (artifact) => artifact.content.kind !== 'scenario',
          )
        )
          throw new Error('scenario_required');
        const manual = artifactsFor(next, content.manualEvidenceRefs);
        if (
          content.outcome === 'passed' &&
          (content.observationIds.some((id) => {
            const run = next.toolRuns.find((entry) => entry.operationId === id);
            return (
              !run ||
              run.state !== 'finished' ||
              !run.result?.ok ||
              run.result.exitCode !== 0 ||
              !!run.result.error ||
              run.inputRefs.some((ref) => staleSet(next, []).has(key(ref)))
            );
          }) ||
            manual.some(
              (artifact) =>
                artifact.content.kind !== 'manual-evidence' ||
                artifact.content.result !== 'supported' ||
                staleSet(next, []).has(key(artifact)),
            ))
        )
          throw new Error('verification_pass_evidence_invalid');
      }
      if (item.sourcePaths.some((path) => !next.sources.some((source) => source.path === path)))
        throw new Error('unknown_source');
      artifactsFor(next, item.dependsOn);
      if (item.dependsOn.some((ref) => staleSet(next, []).has(key(ref))))
        throw new Error('stale_dependency');
      const visits = [...item.dependsOn];
      const seen = new Set<string>();
      while (visits.length) {
        const ref = visits.pop();
        if (!ref || seen.has(key(ref))) continue;
        seen.add(key(ref));
        if (ref.id === item.id) throw new Error('artifact_cycle');
        const ancestor = findArtifact(next, ref);
        if (ancestor) visits.push(...ancestor.dependsOn);
      }
      const version =
        Math.max(
          0,
          ...next.artifacts
            .filter((artifact) => artifact.id === item.id)
            .map((artifact) => artifact.version),
        ) + 1;
      const previous = next.artifacts.find((artifact) => artifact.id === item.id);
      if (previous && previous.content.kind !== item.content.kind)
        throw new Error('artifact_kind_conflict');
      if (previous && previous.scope !== item.scope) throw new Error('artifact_scope_conflict');
      next.artifacts.push({
        ...item,
        version,
        observedAt: context.now,
        sourceSnapshots: next.sources.filter((source) => item.sourcePaths.includes(source.path)),
        procedureRevision: next.procedureRevision,
      });
      if (item.content.kind === 'analysis') {
        next.unassessedSources = (next.unassessedSources ?? []).filter(
          (source) => !item.sourcePaths.includes(source),
        );
      }
      break;
    }
    case 'plan':
      if (
        next.tasks.length &&
        (!next.analysisRef || !staleSet(next, []).has(key(next.analysisRef)))
      )
        throw new Error('already_planned');
      else {
        if (staleSet(next, []).has(key(request.analysisRef))) throw new Error('stale_analysis');
        const fresh = plan(next, request.analysisRef);
        const old = next.tasks;
        if (
          old.some((task) => task.role === 'implementation') &&
          !fresh.some((task) => task.role === 'implementation')
        )
          throw new Error('request_kind_conflicts_with_prior_obligations');
        const merged = fresh.map((task) => {
          const previous = old.find((entry) => entry.id === task.id);
          if (!previous) return task;
          if (previous.role !== task.role) throw new Error('task_role_conflict');
          return {
            ...task,
            title: previous.title,
            expected: [...new Set([...previous.expected, ...task.expected])],
            toolNeeds: [...new Set([...previous.toolNeeds, ...task.toolNeeds])],
            requires: [...new Set([...previous.requires, ...task.requires])],
          };
        });
        for (const previous of old)
          if (!merged.some((task) => task.id === previous.id))
            merged.push({
              ...previous,
              outputs: [],
              consumed: [],
              submittedBy: undefined,
              status: 'open',
            });
        next.tasks = merged;
        next.analysisRef = request.analysisRef;
      }
      break;
    case 'refine': {
      const parent = taskOf(next, request.taskId);
      if (parent.status !== 'open' && parent.status !== 'returned')
        throw new Error('task_not_open');
      const initialRequires = [...parent.requires];
      const ids = request.subtasks.map((sub) => sub.id);
      if (
        new Set(ids).size !== ids.length ||
        ids.some((id) => next.tasks.some((task) => task.id === id))
      )
        throw new Error('duplicate_task');
      for (const sub of request.subtasks) {
        next.tasks.push({
          id: sub.id,
          title: sub.title,
          scope: parent.scope,
          role: sub.role ?? parent.role,
          expected: sub.expected ?? [...parent.expected],
          requires: [...new Set([...initialRequires, ...(sub.requires ?? [])])],
          toolNeeds: sub.toolNeeds ?? [...parent.toolNeeds],
          parent: parent.id,
          outputs: [],
          consumed: [],
          status: 'open',
        });
      }
      parent.requires.push(...ids);
      const visited = new Set<string>();
      const active = new Set<string>();
      function visit(id: string) {
        if (active.has(id)) throw new Error('task_cycle');
        if (visited.has(id)) return;
        const task = next.tasks.find((item) => item.id === id);
        if (!task) throw new Error('task_not_found');
        active.add(id);
        for (const dependency of task.requires) visit(dependency);
        active.delete(id);
        visited.add(id);
      }
      for (const task of next.tasks) visit(task.id);
      break;
    }
    case 'submit': {
      const task = taskOf(next, request.taskId);
      if (!actorHas(next, request.actorId, task.role)) throw new Error('role_mismatch');
      const projection = projectLifecycle(next, [], context.procedureRevision);
      if (!projection.readyTasks.includes(task.id)) throw new Error('missing_prerequisite');
      const outputs = artifactsFor(next, request.outputs);
      if (
        task.expected.some((kind) => !outputs.some((item) => item.content.kind === kind)) ||
        outputs.some((item) => item.authorId !== request.actorId)
      )
        throw new Error('output_obligation');
      const inputs = inputRefs(next, task);
      if (
        outputs.some((item) =>
          inputs.some((ref) => !item.dependsOn.some((dependency) => key(dependency) === key(ref))),
        )
      )
        throw new Error('output_dependencies_required');
      if (outputs.some((item) => staleSet(next, []).has(key(item))))
        throw new Error('stale_output');
      task.outputs = request.outputs;
      task.consumed = task.requires.flatMap((id) => taskOf(next, id).outputs);
      if (next.analysisRef) task.consumed.push(next.analysisRef);
      task.submittedBy = request.actorId;
      task.status = 'submitted';
      break;
    }
    case 'review': {
      const task = taskOf(next, request.taskId);
      if (
        task.status !== 'submitted' ||
        projectLifecycle(next, [], context.procedureRevision).tasks.find(
          (item) => item.id === task.id,
        )?.effectiveStatus !== 'submitted' ||
        !actorHas(next, request.actorId, 'verification') ||
        task.submittedBy === request.actorId
      )
        throw new Error('independent_reviewer_required');
      artifactsFor(next, request.refs);
      if (
        request.outcome === 'accept' &&
        task.toolNeeds.some((tool) => {
          const decision = [...next.toolDecisions]
            .reverse()
            .find((item) => item.taskId === task.id && item.toolId === tool);
          if (
            !decision ||
            decision.decision === 'unavailable' ||
            decision.decision === 'checker-gap'
          )
            return true;
          if (decision.decision === 'manual')
            return (
              decision.actorId === request.actorId ||
              !manualValid(next, task, decision, staleSet(next, []))
            );
          return !matchingRun(next, task, tool);
        })
      )
        throw new Error('tool_obligation_unmet');
      if (request.outcome === 'return' && !request.findings.length)
        throw new Error('findings_required');
      next.reviews.push({
        taskId: task.id,
        actorId: request.actorId,
        outcome: request.outcome,
        findings: request.findings,
        refs: request.refs,
        observedAt: context.now,
      });
      task.status = request.outcome === 'accept' ? 'accepted' : 'returned';
      break;
    }
    case 'tool-decision': {
      const task = taskOf(next, request.taskId);
      if (!actorHas(next, request.actorId, task.role) || !task.toolNeeds.includes(request.toolId))
        throw new Error('invalid_tool_decision');
      artifactsFor(next, request.evidence);
      if (request.evidence.some((ref) => staleSet(next, []).has(key(ref))))
        throw new Error('stale_evidence');
      if (request.decision === 'manual') {
        if (coordinationChecks.some((check) => check.id === request.toolId))
          throw new Error('mandatory_check_cannot_be_waived');
        const inputs = inputRefs(next, task);
        const evidence = artifactsFor(next, request.evidence);
        if (
          !evidence.length ||
          evidence.some(
            (artifact) =>
              artifact.content.kind !== 'manual-evidence' ||
              artifact.content.result !== 'supported' ||
              artifact.authorId !== request.actorId ||
              !artifact.sourcePaths.length ||
              inputs.some(
                (ref) => !artifact.dependsOn.some((dependency) => key(dependency) === key(ref)),
              ),
          )
        )
          throw new Error('manual_evidence_required');
      }
      next.toolDecisions.push({
        taskId: task.id,
        toolId: request.toolId,
        decision: request.decision,
        evidence: request.evidence,
        actorId: request.actorId,
      });
      break;
    }
  }
  next.revision++;
  return lifecycleStateSchema.parse(next);
}
export function beginToolRun(
  state: LifecycleState,
  request: ToolRequest,
  context: Context,
): LifecycleState {
  if (
    request.id !== state.id ||
    request.expectedRevision !== state.revision ||
    context.changedSources.length ||
    context.procedureRevision !== state.procedureRevision
  )
    throw new Error('stale_lifecycle');
  const task = taskOf(state, request.taskId);
  if (!coordinationChecks.some((check) => check.id === request.toolId))
    throw new Error('tool_not_allowlisted');
  if (
    !actorHas(state, request.actorId, task.role) ||
    !task.toolNeeds.includes(request.toolId) ||
    !projectLifecycle(state, [], context.procedureRevision).readyTasks.includes(task.id)
  )
    throw new Error('invalid_tool_run');
  if (
    [...state.toolDecisions]
      .reverse()
      .find((item) => item.taskId === task.id && item.toolId === request.toolId)?.decision !==
    'tool'
  )
    throw new Error('tool_decision_required');
  const next = structuredClone(state);
  next.toolRuns.push({
    operationId: request.operationId,
    taskId: request.taskId,
    toolId: request.toolId,
    inputRefs: inputRefs(state, task),
    state: 'pending',
    observedAt: context.now,
  });
  next.revision++;
  return lifecycleStateSchema.parse(next);
}
export function finishToolRun(
  state: LifecycleState,
  operationId: string,
  result: { ok: boolean; stdout: string; stderr: string; exitCode: number | null; error?: string },
  context: Context,
): LifecycleState {
  const next = structuredClone(state);
  const run = next.toolRuns.find((item) => item.operationId === operationId);
  if (!run || run.state !== 'pending') throw new Error('tool_run_not_pending');
  run.state =
    context.changedSources.length || context.procedureRevision !== state.procedureRevision
      ? 'stale'
      : 'finished';
  run.finishedAt = context.now;
  run.result = result;
  next.revision++;
  return lifecycleStateSchema.parse(next);
}
