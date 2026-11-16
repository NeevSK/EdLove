import { describe, expect, it } from 'vitest';
import {
  applyLifecycleMutation,
  beginToolRun,
  createLifecycle,
  evaluateArtifact,
  evaluateLifecycleState,
  finishToolRun,
  projectLifecycle,
} from './evaluate.js';
import { dimensionNames, lifecycleRequestSchema } from './model.js';

const now = '2026-11-11T00:00:00.000Z';
const context = { now, changedSources: [], procedureRevision: 'v1' };
const create = lifecycleRequestSchema.parse({
  action: 'create',
  id: 'work',
  operationId: 'create',
  expectedRevision: 0,
  goal: 'Feature',
  scope: 'feature',
  actors: [
    { id: 'author', roles: ['product', 'ux', 'implementation'] },
    { id: 'reviewer', roles: ['verification'] },
  ],
  sourcePaths: ['source'],
  externalRefs: [],
});
if (create.action !== 'create') throw new Error('fixture');
const dimensions = Object.fromEntries(
  dimensionNames.map((name) => [
    name,
    {
      applicability: name === 'ux' ? 'applies' : 'not-applicable',
      reason: 'Scoped',
      sources: ['source'],
    },
  ]),
);
function start() {
  if (create.action !== 'create') throw new Error('fixture');
  return createLifecycle(create, [{ path: 'source', sha256: 'a'.repeat(64) }], now, 'v1');
}
function mutate(state: ReturnType<typeof start>, input: object) {
  const request = lifecycleRequestSchema.parse({
    id: 'work',
    operationId: `op${state.revision}`,
    expectedRevision: state.revision,
    ...input,
  });
  if (
    request.action === 'create' ||
    request.action === 'status' ||
    request.action === 'history' ||
    request.action === 'impact' ||
    request.action === 'context' ||
    request.action === 'run-tool'
  )
    throw new Error('fixture');
  return applyLifecycleMutation(state, request, context);
}
function planned() {
  let state = start();
  state = mutate(state, {
    action: 'publish',
    artifact: {
      id: 'analysis',
      scope: 'feature',
      authorId: 'author',
      sourcePaths: ['source'],
      dependsOn: [],
      content: {
        kind: 'analysis',
        requestKind: 'feature',
        dimensions,
        reuse: [],
        openQuestions: [],
      },
    },
  });
  return mutate(state, { action: 'plan', analysisRef: { id: 'analysis', version: 1 } });
}
describe('lifecycle evaluator', () => {
  it('plans investigation and refactor differently', () => {
    function byKind(kind: 'investigation' | 'refactor') {
      let state = start();
      state = mutate(state, {
        action: 'publish',
        artifact: {
          id: 'analysis',
          scope: 'feature',
          authorId: 'author',
          sourcePaths: ['source'],
          dependsOn: [],
          content: {
            kind: 'analysis',
            requestKind: kind,
            dimensions,
            reuse: [],
            openQuestions: [],
          },
        },
      });
      return mutate(state, { action: 'plan', analysisRef: { id: 'analysis', version: 1 } });
    }
    const investigation = byKind('investigation');
    expect(investigation.tasks.some((task) => task.role === 'implementation')).toBe(false);
    expect(investigation.tasks.find((task) => task.id === 'product')?.expected).toEqual([
      'finding',
      'scenario',
    ]);
    expect(investigation.tasks.find((task) => task.id === 'verification')?.requires).toEqual([
      'product',
      'ux',
    ]);
    expect(() =>
      mutate(investigation, {
        action: 'publish',
        artifact: {
          id: 'code',
          scope: 'feature',
          authorId: 'author',
          sourcePaths: ['source'],
          dependsOn: [],
          content: {
            kind: 'implementation',
            files: [{ path: 'x', change: 'x', evidenceRef: 'x' }],
            limitations: [],
          },
        },
      }),
    ).toThrow('investigation_has_no_implementation');
    const refactor = byKind('refactor');
    expect(refactor.tasks.find((task) => task.id === 'product')?.expected).toEqual([
      'invariant',
      'scenario',
    ]);
    expect(refactor.tasks.some((task) => task.role === 'implementation')).toBe(true);
  });
  it('plans role obligations and preserves them through refinement', () => {
    const state = planned();
    expect(state.tasks.map((task) => task.role)).toEqual([
      'product',
      'ux',
      'implementation',
      'verification',
    ]);
    const refined = mutate(state, {
      action: 'refine',
      taskId: 'product',
      subtasks: [{ id: 'product-sub', title: 'Clarify acceptance' }],
    });
    expect(refined.tasks.find((task) => task.id === 'product-sub')).toMatchObject({
      title: 'Clarify acceptance',
      expected: ['requirement', 'invariant', 'scenario'],
      toolNeeds: ['pjc-check'],
    });
  });
  it('rejects fake observations and incomplete experience references', () => {
    const state = planned();
    expect(() =>
      mutate(state, {
        action: 'publish',
        artifact: {
          id: 'verify',
          scope: 'feature',
          authorId: 'author',
          sourcePaths: ['source'],
          dependsOn: [],
          content: {
            kind: 'verification',
            outcome: 'passed',
            observationIds: ['fabricated'],
            scenarioRefs: [],
            manualEvidenceRefs: [],
            limitations: [],
          },
        },
      }),
    ).toThrow('observation_not_found');
    expect(() =>
      mutate(state, {
        action: 'publish',
        artifact: {
          id: 'ux',
          scope: 'feature',
          authorId: 'author',
          sourcePaths: ['source'],
          dependsOn: [],
          content: {
            kind: 'experience',
            screens: [{ id: 'screen', route: '/', states: ['idle'] }],
            stateAxes: [],
            transitions: [
              {
                id: 't',
                screenId: 'screen',
                from: 'idle',
                to: 'missing',
                event: 'tap',
                guard: 'none',
                effects: [],
                feedback: 'shown',
                recovery: 'retry',
                motionRef: 'none',
              },
            ],
            journeys: [
              {
                id: 'j',
                actor: 'user',
                entryTransition: 't',
                transitionIds: ['t'],
                outcome: 'done',
              },
            ],
            motionRequirements: [],
            accessibility: [],
            combinations: [],
          },
        },
      }),
    ).toThrow('invalid_transition');
  });
  it('refines across roles without weakening obligations or introducing sibling dependencies', () => {
    const before = planned();
    const parent = before.tasks.find((task) => task.id === 'ux');
    const state = mutate(before, {
      action: 'refine',
      taskId: 'ux',
      subtasks: [
        {
          id: 'adapter',
          title: 'Build checker adapter',
          role: 'implementation',
          expected: ['implementation'],
          toolNeeds: [],
        },
        { id: 'inspect', title: 'Inspect behavior' },
      ],
    });
    const current = state.tasks.find((task) => task.id === 'ux');
    expect(current?.expected).toEqual(parent?.expected);
    expect(current?.toolNeeds).toEqual(parent?.toolNeeds);
    expect(current?.requires).toEqual(['product', 'adapter', 'inspect']);
    expect(state.tasks.find((task) => task.id === 'adapter')).toMatchObject({
      role: 'implementation',
      expected: ['implementation'],
      requires: ['product'],
      toolNeeds: [],
    });
    expect(state.tasks.find((task) => task.id === 'inspect')?.requires).toEqual(['product']);
    expect(
      projectLifecycle(state, [], 'v1').tasks.find((task) => task.id === 'adapter')?.packet,
    ).toMatchObject({ toolNeeds: [], consumed: [{ id: 'analysis', version: 1 }] });
    expect(() =>
      mutate(before, {
        action: 'refine',
        taskId: 'ux',
        subtasks: [
          { id: 'a', title: 'A', requires: ['b'] },
          { id: 'b', title: 'B', requires: ['a'] },
        ],
      }),
    ).toThrow('task_cycle');
    expect(() =>
      mutate(before, {
        action: 'refine',
        taskId: 'ux',
        subtasks: [{ id: 'a', title: 'A', requires: ['ux'] }],
      }),
    ).toThrow('task_cycle');
    expect(() =>
      mutate(before, {
        action: 'refine',
        taskId: 'ux',
        subtasks: [{ id: 'a', title: 'A', requires: ['absent'] }],
      }),
    ).toThrow('task_not_found');
  });
  it('routes applicable API and motion work to the required tasks and checks', () => {
    let state = start();
    const scoped = {
      ...dimensions,
      api: { applicability: 'applies', reason: 'API', sources: ['source'] },
      motion: { applicability: 'applies', reason: 'Motion', sources: ['source'] },
    };
    state = mutate(state, {
      action: 'publish',
      artifact: {
        id: 'analysis',
        scope: 'feature',
        authorId: 'author',
        sourcePaths: ['source'],
        dependsOn: [],
        content: {
          kind: 'analysis',
          requestKind: 'feature',
          dimensions: scoped,
          reuse: [],
          openQuestions: [],
        },
      },
    });
    state = mutate(state, { action: 'plan', analysisRef: { id: 'analysis', version: 1 } });
    expect(state.tasks.find((task) => task.id === 'visual-motion')?.requires).toContain('ux');
    expect(state.tasks.find((task) => task.id === 'architecture')?.toolNeeds).toEqual(
      expect.arrayContaining(['api-composition', 'api-conformance']),
    );
  });
  it('rejects ordinary artifacts as manual evidence and prevents waiving registered checks', () => {
    let state = planned();
    state = mutate(state, {
      action: 'publish',
      artifact: {
        id: 'req',
        scope: 'feature',
        authorId: 'author',
        sourcePaths: ['source'],
        dependsOn: [{ id: 'analysis', version: 1 }],
        content: {
          kind: 'requirement',
          statement: 'x',
          classification: 'functional',
          acceptance: ['x'],
          origin: 'proposal',
          authorityRefs: [],
          unresolved: [],
        },
      },
    });
    expect(() =>
      mutate(state, {
        action: 'tool-decision',
        taskId: 'implementation',
        actorId: 'author',
        toolId: 'feature-behavior',
        decision: 'manual',
        evidence: [{ id: 'req', version: 1 }],
      }),
    ).toThrow('manual_evidence_required');
    expect(() =>
      mutate(state, {
        action: 'tool-decision',
        taskId: 'product',
        actorId: 'author',
        toolId: 'pjc-check',
        decision: 'manual',
        evidence: [{ id: 'req', version: 1 }],
      }),
    ).toThrow('mandatory_check_cannot_be_waived');
  });
  it('requires observed tool evidence and independent review before handing off exact outputs', () => {
    let state = planned();
    const dependsOn = [{ id: 'analysis', version: 1 }];
    const publish = (id: string, content: object) => {
      state = mutate(state, {
        action: 'publish',
        artifact: {
          id,
          scope: 'feature',
          authorId: 'author',
          sourcePaths: ['source'],
          dependsOn,
          content,
        },
      });
    };
    publish('req', {
      kind: 'requirement',
      statement: 'Offer action',
      classification: 'functional',
      acceptance: ['visible'],
      origin: 'proposal',
      authorityRefs: [],
      unresolved: [],
    });
    publish('inv', {
      kind: 'invariant',
      statement: 'Retain input',
      scope: ['feature'],
      violations: ['lost input'],
      verification: 'inspect',
    });
    publish('scenario', {
      kind: 'scenario',
      preconditions: [],
      actions: ['act'],
      expected: ['visible'],
    });
    state = mutate(state, {
      action: 'submit',
      taskId: 'product',
      actorId: 'author',
      outputs: [
        { id: 'req', version: 1 },
        { id: 'inv', version: 1 },
        { id: 'scenario', version: 1 },
      ],
    });
    expect(() =>
      mutate(state, {
        action: 'review',
        taskId: 'product',
        actorId: 'reviewer',
        outcome: 'accept',
        findings: [],
        refs: [],
      }),
    ).toThrow('tool_obligation_unmet');
    expect(() =>
      mutate(state, {
        action: 'review',
        taskId: 'product',
        actorId: 'author',
        outcome: 'accept',
        findings: [],
        refs: [],
      }),
    ).toThrow('independent_reviewer_required');
    expect(projectLifecycle(state, [], 'v1').readyTasks).not.toContain('ux');
    state = mutate(state, {
      action: 'review',
      taskId: 'product',
      actorId: 'reviewer',
      outcome: 'return',
      findings: ['Run check'],
      refs: [],
    });
    state = mutate(state, {
      action: 'tool-decision',
      taskId: 'product',
      actorId: 'author',
      toolId: 'pjc-check',
      decision: 'tool',
      evidence: [],
    });
    const run = lifecycleRequestSchema.parse({
      action: 'run-tool',
      id: 'work',
      operationId: 'real-run',
      expectedRevision: state.revision,
      taskId: 'product',
      actorId: 'author',
      toolId: 'pjc-check',
    });
    if (run.action !== 'run-tool') throw new Error('fixture');
    state = beginToolRun(state, run, context);
    state = finishToolRun(
      state,
      'real-run',
      { ok: true, stdout: '', stderr: '', exitCode: 0 },
      context,
    );
    state = mutate(state, {
      action: 'submit',
      taskId: 'product',
      actorId: 'author',
      outputs: [
        { id: 'req', version: 1 },
        { id: 'inv', version: 1 },
        { id: 'scenario', version: 1 },
      ],
    });
    state = mutate(state, {
      action: 'review',
      taskId: 'product',
      actorId: 'reviewer',
      outcome: 'accept',
      findings: [],
      refs: [],
    });
    const ux = projectLifecycle(state, [], 'v1').tasks.find((task) => task.id === 'ux');
    expect(ux?.packet.consumed.map((artifact) => artifact?.id)).toEqual([
      'analysis',
      'req',
      'inv',
      'scenario',
    ]);
  });
  it('registers an unassessed source without changing previous snapshots', () => {
    let state = planned();
    const request = lifecycleRequestSchema.parse({
      action: 'register-source',
      id: 'work',
      operationId: 'register',
      expectedRevision: state.revision,
      sourcePath: 'new-source',
    });
    if (request.action !== 'register-source') throw new Error('fixture');
    const prior = { path: 'source', sha256: 'a'.repeat(64) };
    const added = { path: 'new-source', sha256: 'b'.repeat(64) };
    expect(() =>
      applyLifecycleMutation(state, request, {
        ...context,
        sources: [{ ...prior, sha256: 'c'.repeat(64) }, added],
      }),
    ).toThrow('invalid_registration_sources');
    state = applyLifecycleMutation(state, request, { ...context, sources: [prior, added] });
    expect(projectLifecycle(state, [], 'v1').blockers).toContain('unassessed_source:new-source');
    expect(projectLifecycle(state, [], 'v1').staleArtifacts).not.toContain('analysis@1');
    const duplicate = { ...request, expectedRevision: state.revision, operationId: 'duplicate' };
    expect(() =>
      applyLifecycleMutation(state, duplicate, { ...context, sources: [prior, added] }),
    ).toThrow('duplicate_source');
    state = mutate(state, {
      action: 'publish',
      artifact: {
        id: 'analysis',
        scope: 'feature',
        authorId: 'author',
        sourcePaths: ['source', 'new-source'],
        dependsOn: [],
        content: {
          kind: 'analysis',
          requestKind: 'feature',
          dimensions,
          reuse: [],
          openQuestions: [],
        },
      },
    });
    expect(projectLifecycle(state, [], 'v1').blockers).not.toContain(
      'unassessed_source:new-source',
    );
    expect(projectLifecycle(state, [], 'v1').staleArtifacts).toContain('analysis@1');
  });
  it('retains stale history after refresh while an independent branch remains current', () => {
    const request = { ...create, sourcePaths: ['source', 'other'] };
    let state = createLifecycle(
      request,
      [
        { path: 'source', sha256: 'a'.repeat(64) },
        { path: 'other', sha256: 'b'.repeat(64) },
      ],
      now,
      'v1',
    );
    state = mutate(state, {
      action: 'publish',
      artifact: {
        id: 'first',
        scope: 'feature',
        authorId: 'author',
        sourcePaths: ['source'],
        dependsOn: [],
        content: {
          kind: 'invariant',
          statement: 'one',
          scope: ['feature'],
          violations: ['bad'],
          verification: 'check',
        },
      },
    });
    state = mutate(state, {
      action: 'publish',
      artifact: {
        id: 'dependent',
        scope: 'feature',
        authorId: 'author',
        sourcePaths: [],
        dependsOn: [{ id: 'first', version: 1 }],
        content: {
          kind: 'invariant',
          statement: 'two',
          scope: ['feature'],
          violations: ['bad'],
          verification: 'check',
        },
      },
    });
    state = mutate(state, {
      action: 'publish',
      artifact: {
        id: 'independent',
        scope: 'feature',
        authorId: 'author',
        sourcePaths: ['other'],
        dependsOn: [],
        content: {
          kind: 'invariant',
          statement: 'three',
          scope: ['feature'],
          violations: ['bad'],
          verification: 'check',
        },
      },
    });
    const refresh = lifecycleRequestSchema.parse({
      action: 'refresh-sources',
      id: 'work',
      operationId: 'refresh',
      expectedRevision: state.revision,
    });
    if (refresh.action !== 'refresh-sources') throw new Error('fixture');
    state = applyLifecycleMutation(state, refresh, {
      ...context,
      changedSources: ['source'],
      sources: [
        { path: 'source', sha256: 'c'.repeat(64) },
        { path: 'other', sha256: 'b'.repeat(64) },
      ],
    });
    expect(projectLifecycle(state, [], 'v1').staleArtifacts.sort()).toEqual([
      'dependent@1',
      'first@1',
    ]);
    state = mutate(state, {
      action: 'publish',
      artifact: {
        id: 'first',
        scope: 'feature',
        authorId: 'author',
        sourcePaths: ['source'],
        dependsOn: [],
        content: {
          kind: 'invariant',
          statement: 'reconsidered',
          scope: ['feature'],
          violations: ['bad'],
          verification: 'check',
        },
      },
    });
    expect(projectLifecycle(state, [], 'v1').staleArtifacts.sort()).toEqual([
      'dependent@1',
      'first@1',
    ]);
  });
  it('rejects undefined experience axes and motion references', () => {
    const state = planned();
    const content = {
      kind: 'experience',
      screens: [{ id: 'screen', route: '/', states: ['idle'] }],
      stateAxes: [{ id: 'network', states: ['online'] }],
      transitions: [
        {
          id: 't',
          screenId: 'screen',
          from: 'idle',
          to: 'idle',
          event: 'tap',
          guard: 'none',
          effects: [],
          feedback: 'shown',
          recovery: 'retry',
          motionRef: 'none',
        },
      ],
      journeys: [
        { id: 'j', actor: 'user', entryTransition: 't', transitionIds: ['t'], outcome: 'done' },
      ],
      motionRequirements: [],
      accessibility: [],
      combinations: [{ when: [{ axisId: 'network', state: 'offline' }], must: ['show retry'] }],
    };
    const artifact = {
      id: 'ux',
      scope: 'feature',
      authorId: 'author',
      sourcePaths: ['source'],
      dependsOn: [],
      content,
    };
    expect(() => mutate(state, { action: 'publish', artifact })).toThrow('invalid_state_axis');
    expect(() =>
      mutate(state, {
        action: 'publish',
        artifact: {
          ...artifact,
          content: {
            ...content,
            combinations: [],
            transitions: [{ ...content.transitions[0], motionRef: 'unknown-motion' }],
          },
        },
      }),
    ).toThrow('invalid_motion_ref');
  });
  it('preserves failed observations but never accepts them as a passing verification', () => {
    let state = planned();
    state = mutate(state, {
      action: 'tool-decision',
      taskId: 'product',
      actorId: 'author',
      toolId: 'pjc-check',
      decision: 'tool',
      evidence: [],
    });
    const run = lifecycleRequestSchema.parse({
      action: 'run-tool',
      id: 'work',
      operationId: 'failure',
      expectedRevision: state.revision,
      taskId: 'product',
      actorId: 'author',
      toolId: 'pjc-check',
    });
    if (run.action !== 'run-tool') throw new Error('fixture');
    state = beginToolRun(state, run, context);
    state = finishToolRun(
      state,
      'failure',
      { ok: false, stdout: '', stderr: 'failed', exitCode: 1 },
      context,
    );
    const artifact = {
      id: 'verification',
      scope: 'feature',
      authorId: 'author',
      sourcePaths: ['source'],
      dependsOn: [],
      content: {
        kind: 'verification',
        outcome: 'passed',
        observationIds: ['failure'],
        scenarioRefs: [],
        manualEvidenceRefs: [],
        limitations: [],
      },
    };
    expect(() => mutate(state, { action: 'publish', artifact })).toThrow(
      'verification_pass_evidence_invalid',
    );
    state = mutate(state, {
      action: 'publish',
      artifact: { ...artifact, content: { ...artifact.content, outcome: 'failed' } },
    });
    expect(projectLifecycle(state, [], 'v1').blockers).toContain(
      'verification:verification:failed',
    );
  });
  it('keeps refinement and security obligations after an analysis revision', () => {
    let state = start();
    const original = {
      ...dimensions,
      security: { applicability: 'applies', reason: 'Relevant', sources: ['source'] },
    };
    const artifact = {
      id: 'analysis',
      scope: 'feature',
      authorId: 'author',
      sourcePaths: ['source'],
      dependsOn: [],
      content: {
        kind: 'analysis',
        requestKind: 'feature',
        dimensions: original,
        reuse: [],
        openQuestions: [],
      },
    };
    state = mutate(state, { action: 'publish', artifact });
    state = mutate(state, { action: 'plan', analysisRef: { id: 'analysis', version: 1 } });
    state = mutate(state, {
      action: 'refine',
      taskId: 'architecture',
      subtasks: [{ id: 'security-sub', title: 'Inspect security' }],
    });
    state = mutate(state, {
      action: 'publish',
      artifact: { ...artifact, content: { ...artifact.content, dimensions } },
    });
    state = mutate(state, { action: 'plan', analysisRef: { id: 'analysis', version: 2 } });
    expect(state.tasks.find((task) => task.id === 'architecture')?.toolNeeds).toContain(
      'security-review',
    );
    expect(state.tasks.find((task) => task.id === 'architecture')?.requires).toContain(
      'security-sub',
    );
    expect(state.tasks.find((task) => task.id === 'security-sub')?.title).toBe('Inspect security');
  });
  it('rejects invented tool runs and invalidates downstream sources', () => {
    let state = planned();
    const request = lifecycleRequestSchema.parse({
      action: 'run-tool',
      id: 'work',
      operationId: 'run',
      expectedRevision: state.revision,
      taskId: 'product',
      actorId: 'author',
      toolId: 'pjc-check',
    });
    if (request.action !== 'run-tool') throw new Error('fixture');
    expect(() => beginToolRun(state, request, context)).toThrow('tool_decision_required');
    state = mutate(state, {
      action: 'tool-decision',
      taskId: 'product',
      actorId: 'author',
      toolId: 'pjc-check',
      decision: 'tool',
      evidence: [],
    });
    const running = beginToolRun(state, { ...request, expectedRevision: state.revision }, context);
    expect(running.toolRuns[0]?.state).toBe('pending');
    const finished = finishToolRun(
      running,
      'run',
      { ok: true, stdout: '', stderr: '', exitCode: 0 },
      context,
    );
    expect(finished.toolRuns[0]).toMatchObject({ state: 'finished', finishedAt: now });
    expect(projectLifecycle(finished, ['source'], 'v1').readyTasks).toEqual([]);
  });

  it('evaluates H4 EVSI satisficing rules for artifacts and lifecycle states', () => {
    // 1. Evaluate individual artifacts
    const unresolvedArtifact = {
      id: 'req-1',
      version: 1,
      scope: 'feature' as const,
      authorId: 'author',
      sourcePaths: ['source'],
      dependsOn: [],
      content: {
        kind: 'requirement' as const,
        statement: 'Test requirement',
        classification: 'functional' as const,
        origin: 'proposal' as const,
        acceptance: ['must work'],
        authorityRefs: [],
        unresolved: ['clarify retry semantics'],
      },
      createdAt: now,
      observedAt: now,
      procedureRevision: 'v1',
      sourceSnapshots: [{ path: 'source', sha256: 'a'.repeat(64) }],
    };
    const evalUnresolved = evaluateArtifact(unresolvedArtifact);
    expect(evalUnresolved.satisficed).toBe(false);
    expect(evalUnresolved.unresolved).toContain('artifact:req-1:clarify retry semantics');
    expect(evalUnresolved.satisficingReason).toBeUndefined();

    const resolvedArtifact = {
      ...unresolvedArtifact,
      content: {
        ...unresolvedArtifact.content,
        unresolved: [],
      },
    };
    const evalResolved = evaluateArtifact(resolvedArtifact);
    expect(evalResolved.satisficed).toBe(true);
    expect(evalResolved.unresolved).toHaveLength(0);
    expect(evalResolved.satisficingReason).toBe(
      'EVSI_MET: All critical invariants and acceptance criteria satisfied; additional review cycles yield negligible expected value of information',
    );

    // 2. Evaluate lifecycle state when pending / open
    const state = planned();
    const evalPending = evaluateLifecycleState(state, [], 'v1');
    expect(evalPending.satisficed).toBe(false);
    expect(evalPending.readiness).toBe('blocked');
    expect(evalPending.satisficingReason).toBeUndefined();

    // 3. Satisficing when state is fully accepted and review-ready
    // Synthesize a state where tasks are all accepted and no blockers exist
    const completedState = {
      ...state,
      tasks: state.tasks.map((t) => ({
        ...t,
        status: 'accepted' as const,
        effectiveStatus: 'accepted' as const,
      })),
      toolDecisions: state.tasks.flatMap((t) =>
        t.toolNeeds.map((tool) => ({
          taskId: t.id,
          toolId: tool,
          decision: 'tool' as const,
          evidence: [],
          actorId: 'author',
        })),
      ),
      toolRuns: state.tasks.flatMap((t) =>
        t.toolNeeds.map((tool) => ({
          operationId: `op-${t.id}-${tool}`,
          taskId: t.id,
          toolId: tool,
          inputRefs: [{ id: 'analysis', version: 1 }],
          state: 'finished' as const,
          observedAt: now,
          finishedAt: now,
          result: { ok: true, stdout: '', stderr: '', exitCode: 0 },
        })),
      ),
    };
    const evalCompleted = evaluateLifecycleState(completedState, [], 'v1');
    expect(evalCompleted.blockers).toEqual([]);
    expect(evalCompleted.readiness).toBe('review-ready');
    expect(evalCompleted.satisficed).toBe(true);
    expect(evalCompleted.satisficingReason).toBe(
      'EVSI_MET: All critical invariants and acceptance criteria satisfied; additional review cycles yield negligible expected value of information',
    );
  });
});
