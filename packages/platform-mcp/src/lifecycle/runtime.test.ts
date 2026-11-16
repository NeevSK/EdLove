import { appendFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { runCoordinationCheck } from '../coordinationTools.js';
import {
  analysisArtifact,
  createLifecycleFixture,
  createRequest,
  type LifecycleFixture,
  productArtifacts,
} from './fixtures.js';
import { executeLifecycleRequest } from './runtime.js';

const fixtures: LifecycleFixture[] = [];
function fixture(files?: Record<string, string>) {
  const value = createLifecycleFixture(files);
  fixtures.push(value);
  return value;
}
afterEach(() => {
  for (const value of fixtures.splice(0)) value.dispose();
});

function runner(value: LifecycleFixture, runCheck?: typeof runCoordinationCheck) {
  return (request: unknown) =>
    executeLifecycleRequest(request, {
      root: value.root,
      databasePath: value.databasePath,
      procedureRevision: 'fixture-v1',
      ...(runCheck ? { runCheck } : {}),
    });
}

async function planned(value: LifecycleFixture) {
  const run = runner(value);
  let response = await run(createRequest(value, 'assistant-feature'));
  response = await run({
    action: 'publish',
    id: response.state.id,
    operationId: 'analysis-publish',
    expectedRevision: response.state.revision,
    artifact: analysisArtifact(value.sourcePaths[0] ?? ''),
  });
  const analysis = response.state.artifacts.find((artifact) => artifact.id === 'analysis');
  if (!analysis) throw new Error('analysis fixture failed to publish');
  response = await run({
    action: 'plan',
    id: response.state.id,
    operationId: 'plan',
    expectedRevision: response.state.revision,
    analysisRef: { id: analysis.id, version: analysis.version },
  });
  return { run, response };
}

describe('feature lifecycle runtime', () => {
  it('creates persistent lifecycle state and returns deterministic role packets from plan', async () => {
    const value = fixture();
    const { run, response } = await planned(value);
    const reopened = await runner(value)({ action: 'status', id: response.state.id });
    expect(reopened.state.revision).toBe(response.state.revision);
    expect(response.graphTrace).toEqual(['recover', 'apply', 'project']);
    expect(response.packets.map((packet) => packet.taskId)).toContain('product');
    const product = response.packets.find((packet) => packet.taskId === 'product');
    expect(product?.expectedArtifactKinds).toEqual(['requirement', 'invariant', 'scenario']);
    expect(product?.inputs.map((input) => input?.id)).toContain('analysis');
    const context = await run({ action: 'context', id: response.state.id, taskId: 'product' });
    expect(context.packets).toEqual(
      response.packets.filter((packet) => packet.taskId === 'product'),
    );
  });

  it('refinement retains the parent output and check obligations in the role handoff', async () => {
    const value = fixture();
    const response = (await planned(value)).response;
    const refined = await responseRun(value, {
      action: 'refine',
      id: response.state.id,
      operationId: 'refine-product',
      expectedRevision: response.state.revision,
      taskId: 'product',
      subtasks: [{ id: 'product-copy', title: 'Review user-facing language' }],
    });
    const parent = refined.state.tasks.find((task) => task.id === 'product');
    const child = refined.state.tasks.find((task) => task.id === 'product-copy');
    expect(parent?.expected).toEqual(child?.expected);
    expect(parent?.toolNeeds).toEqual(child?.toolNeeds);
    expect(parent?.requires).toContain('product-copy');
  });

  it('makes create retries idempotent and rejects stale revision writes', async () => {
    const value = fixture();
    const run = runner(value);
    const create = createRequest(value, 'idempotent-feature');
    const first = await run(create);
    const replay = await run(create);
    expect(replay.duplicate).toBe(true);
    expect(replay.state).toEqual(first.state);
    const update = await run({
      action: 'register-actor',
      id: first.state.id,
      operationId: 'first-write',
      expectedRevision: 0,
      actor: { id: 'late-agent', roles: ['ux'] },
    });
    await expect(
      run({
        action: 'register-actor',
        id: first.state.id,
        operationId: 'stale-write',
        expectedRevision: 0,
        actor: { id: 'other-agent', roles: ['ux'] },
      }),
    ).rejects.toThrow('revision_conflict');
    expect(
      (await run({ action: 'status', id: first.state.id })).state.actors.some(
        (actor) => actor.id === 'other-agent',
      ),
    ).toBe(false);
    expect(update.state.actors.some((actor) => actor.id === 'late-agent')).toBe(true);
  });

  it('records tool intent, executes once, preserves observations, and projects the graph trace', async () => {
    const value = fixture();
    let invocations = 0;
    const success = () => {
      invocations += 1;
      return { ok: true, stdout: '{"ok":true}', stderr: '', exitCode: 0 };
    };
    const run = runner(value, success);
    let response = await run(createRequest(value, 'tool-feature'));
    response = await run({
      action: 'publish',
      id: response.state.id,
      operationId: 'analysis',
      expectedRevision: response.state.revision,
      artifact: analysisArtifact(value.sourcePaths[0] ?? ''),
    });
    const analysis = response.state.artifacts.find((item) => item.id === 'analysis');
    if (!analysis) throw new Error('missing analysis');
    response = await run({
      action: 'plan',
      id: response.state.id,
      operationId: 'plan',
      expectedRevision: response.state.revision,
      analysisRef: { id: analysis.id, version: analysis.version },
    });
    response = await run({
      action: 'tool-decision',
      id: response.state.id,
      operationId: 'decide',
      expectedRevision: response.state.revision,
      taskId: 'product',
      toolId: 'pjc-check',
      actorId: 'product-agent',
      decision: 'tool',
      evidence: [],
    });
    const runRequest = {
      action: 'run-tool',
      id: response.state.id,
      operationId: 'observe-pjc',
      expectedRevision: response.state.revision,
      taskId: 'product',
      toolId: 'pjc-check',
      actorId: 'product-agent',
    };
    const executed = await run(runRequest);
    const replay = await run(runRequest);
    expect(executed.graphTrace).toEqual([
      'recover',
      'begin_tool',
      'execute_tool',
      'finish_tool',
      'project',
    ]);
    expect(executed.state.toolRuns[0]?.result?.stdout).toBe('{"ok":true}');
    expect(replay.duplicate).toBe(true);
    expect(invocations).toBe(1);
    const history = await run({ action: 'history', id: response.state.id });
    expect(history.history?.map((entry) => entry.revision)).toEqual([0, 1, 2, 3, 4]);
  });

  it('retains a pending operation after a process error and does not replay the external check', async () => {
    const value = fixture();
    let invocations = 0;
    const run = runner(value, () => {
      invocations += 1;
      throw new Error('simulated host interruption');
    });
    let response = await run(createRequest(value, 'interrupted-feature'));
    response = await run({
      action: 'publish',
      id: response.state.id,
      operationId: 'analysis',
      expectedRevision: response.state.revision,
      artifact: analysisArtifact(value.sourcePaths[0] ?? ''),
    });
    const analysis = response.state.artifacts.find((item) => item.id === 'analysis');
    if (!analysis) throw new Error('missing analysis');
    response = await run({
      action: 'plan',
      id: response.state.id,
      operationId: 'plan',
      expectedRevision: response.state.revision,
      analysisRef: { id: analysis.id, version: analysis.version },
    });
    response = await run({
      action: 'tool-decision',
      id: response.state.id,
      operationId: 'decide',
      expectedRevision: response.state.revision,
      taskId: 'product',
      toolId: 'pjc-check',
      actorId: 'product-agent',
      decision: 'tool',
      evidence: [],
    });
    const request = {
      action: 'run-tool',
      id: response.state.id,
      operationId: 'interrupted-check',
      expectedRevision: response.state.revision,
      taskId: 'product',
      toolId: 'pjc-check',
      actorId: 'product-agent',
    };
    await expect(run(request)).rejects.toThrow('simulated host interruption');
    const recovered = await runner(value)(request);
    expect(recovered.duplicate).toBe(true);
    expect(recovered.state.toolRuns.at(-1)?.state).toBe('pending');
    expect(invocations).toBe(1);
  });

  it('invalidates source-derived work on refresh and requires fresh classification', async () => {
    const value = fixture();
    let response = (await planned(value)).response;
    const sourcePath = value.sourcePaths[0];
    if (!sourcePath) throw new Error('missing fixture source');
    appendFileSync(path.join(value.root, sourcePath), 'Changed source.\n');
    response = await responseRun(value, { action: 'status', id: response.state.id });
    expect(response.projection.blockers).toContain(`changed_source:${sourcePath}`);
    const refreshed = await responseRun(value, {
      action: 'refresh-sources',
      id: response.state.id,
      operationId: 'refresh',
      expectedRevision: response.state.revision,
    });
    expect(refreshed.projection.staleArtifacts).toContain('analysis@1');
    expect(refreshed.projection.readiness).toBe('blocked');
    expect(refreshed.projection.staleArtifacts).toContain('analysis@1');
  });

  it('does not let missing or unavailable tools satisfy an accepted task', async () => {
    const value = fixture();
    let response = (await planned(value)).response;
    response = await responseRun(value, {
      action: 'tool-decision',
      id: response.state.id,
      operationId: 'gap',
      expectedRevision: response.state.revision,
      taskId: 'product',
      toolId: 'pjc-check',
      actorId: 'product-agent',
      decision: 'checker-gap',
      evidence: [],
    });
    const artifacts = productArtifacts(
      value.sourcePaths[0] ?? '',
      response.state.analysisRef ?? { id: 'analysis', version: 1 },
    );
    for (const artifact of artifacts)
      response = await responseRun(value, {
        action: 'publish',
        id: response.state.id,
        operationId: `publish-${artifact.id}`,
        expectedRevision: response.state.revision,
        artifact,
      });
    const refs = artifacts.map((artifact) => ({ id: artifact.id, version: 1 }));
    response = await responseRun(value, {
      action: 'submit',
      id: response.state.id,
      operationId: 'submit',
      expectedRevision: response.state.revision,
      taskId: 'product',
      actorId: 'product-agent',
      outputs: refs,
    });
    await expect(
      responseRun(value, {
        action: 'review',
        id: response.state.id,
        operationId: 'accept',
        expectedRevision: response.state.revision,
        taskId: 'product',
        actorId: 'verifier',
        outcome: 'accept',
        findings: [],
        refs,
      }),
    ).rejects.toThrow('tool_obligation_unmet');
  });

  it('requires independent review and refuses fabricated observations', async () => {
    const value = fixture();
    let response = await planned(value).then((result) => result.response);
    const analysis = response.state.analysisRef;
    if (!analysis) throw new Error('missing analysis');
    const artifacts = productArtifacts(value.sourcePaths[0] ?? '', analysis);
    for (const artifact of artifacts)
      response = await responseRun(value, {
        action: 'publish',
        id: response.state.id,
        operationId: `publish-${artifact.id}`,
        expectedRevision: response.state.revision,
        artifact,
      });
    const refs = artifacts.map((artifact) => ({ id: artifact.id, version: 1 }));
    response = await responseRun(value, {
      action: 'submit',
      id: response.state.id,
      operationId: 'submit',
      expectedRevision: response.state.revision,
      taskId: 'product',
      actorId: 'product-agent',
      outputs: refs,
    });
    await expect(
      responseRun(value, {
        action: 'review',
        id: response.state.id,
        operationId: 'same-author-review',
        expectedRevision: response.state.revision,
        taskId: 'product',
        actorId: 'product-agent',
        outcome: 'accept',
        findings: [],
        refs,
      }),
    ).rejects.toThrow('independent_reviewer_required');
    const verification = {
      id: 'verification',
      scope: 'Evidence check',
      authorId: 'verifier',
      sourcePaths: [value.sourcePaths[0] ?? ''],
      dependsOn: refs,
      content: {
        kind: 'verification',
        observationIds: ['invented-observation'],
        scenarioRefs: [{ id: 'scenario', version: 1 }],
        manualEvidenceRefs: [],
        outcome: 'passed',
        limitations: [],
      },
    };
    await expect(
      responseRun(value, {
        action: 'publish',
        id: response.state.id,
        operationId: 'forged-verification',
        expectedRevision: response.state.revision,
        artifact: verification,
      }),
    ).rejects.toThrow('observation_not_found');
  });

  it('does not allow typed manual evidence to waive an executable required check', async () => {
    const value = fixture();
    let response = (await planned(value)).response;
    const analysis = response.state.analysisRef;
    if (!analysis) throw new Error('missing analysis');
    const evidence = {
      id: 'manual-evidence',
      scope: 'Local review',
      authorId: 'product-agent',
      sourcePaths: [value.sourcePaths[0] ?? ''],
      dependsOn: [analysis],
      content: {
        kind: 'manual-evidence',
        claim: 'The requirement is understood.',
        method: 'Read the feature description.',
        scope: 'Product task',
        result: 'supported',
        limitations: ['Not an automated check.'],
      },
    };
    response = await responseRun(value, {
      action: 'publish',
      id: response.state.id,
      operationId: 'manual-proof',
      expectedRevision: response.state.revision,
      artifact: evidence,
    });
    await expect(
      responseRun(value, {
        action: 'tool-decision',
        id: response.state.id,
        operationId: 'waive-pjc',
        expectedRevision: response.state.revision,
        taskId: 'product',
        toolId: 'pjc-check',
        actorId: 'product-agent',
        decision: 'manual',
        evidence: [{ id: 'manual-evidence', version: 1 }],
      }),
    ).rejects.toThrow('mandatory_check_cannot_be_waived');
  });

  it('runs the allowlisted C4 validator against the real architecture model', {
    timeout: 30000,
  }, async () => {
    const source = 'docs/architecture/model/gurudevi.c4';
    const value = fixture({ [source]: 'fixture source fingerprint only' });
    const run = (request: unknown) =>
      executeLifecycleRequest(request, {
        root: 'C:/x',
        databasePath: value.databasePath,
        procedureRevision: 'fixture-v1',
        runCheck: () => ({ ok: true, stdout: 'fixture PJC observation', stderr: '', exitCode: 0 }),
      });
    let response = await run(createRequest(value, 'actual-c4-feature'));
    response = await run({
      action: 'publish',
      id: response.state.id,
      operationId: 'analysis',
      expectedRevision: response.state.revision,
      artifact: analysisArtifact(source),
    });
    const analysis = response.state.artifacts.find((item) => item.id === 'analysis');
    if (!analysis) throw new Error('missing analysis');
    response = await run({
      action: 'plan',
      id: response.state.id,
      operationId: 'plan',
      expectedRevision: response.state.revision,
      analysisRef: { id: analysis.id, version: analysis.version },
    });
    response = await run({
      action: 'tool-decision',
      id: response.state.id,
      operationId: 'pjc-decision',
      expectedRevision: response.state.revision,
      taskId: 'product',
      toolId: 'pjc-check',
      actorId: 'product-agent',
      decision: 'tool',
      evidence: [],
    });
    response = await run({
      action: 'run-tool',
      id: response.state.id,
      operationId: 'pjc-observation',
      expectedRevision: response.state.revision,
      taskId: 'product',
      toolId: 'pjc-check',
      actorId: 'product-agent',
    });
    const artifacts = productArtifacts(source, { id: analysis.id, version: analysis.version });
    for (const artifact of artifacts)
      response = await run({
        action: 'publish',
        id: response.state.id,
        operationId: `product-${artifact.id}`,
        expectedRevision: response.state.revision,
        artifact,
      });
    const outputRefs = artifacts.map((artifact) => ({ id: artifact.id, version: 1 }));
    response = await run({
      action: 'submit',
      id: response.state.id,
      operationId: 'submit-product',
      expectedRevision: response.state.revision,
      taskId: 'product',
      actorId: 'product-agent',
      outputs: outputRefs,
    });
    response = await run({
      action: 'review',
      id: response.state.id,
      operationId: 'review-product',
      expectedRevision: response.state.revision,
      taskId: 'product',
      actorId: 'verifier',
      outcome: 'accept',
      findings: [],
      refs: outputRefs,
    });
    response = await run({
      action: 'tool-decision',
      id: response.state.id,
      operationId: 'c4-decision',
      expectedRevision: response.state.revision,
      taskId: 'architecture',
      toolId: 'c4-validate',
      actorId: 'architecture-agent',
      decision: 'tool',
      evidence: [],
    });
    const checked = await executeLifecycleRequest(
      {
        action: 'run-tool',
        id: response.state.id,
        operationId: 'actual-c4-observation',
        expectedRevision: response.state.revision,
        taskId: 'architecture',
        toolId: 'c4-validate',
        actorId: 'architecture-agent',
      },
      { root: 'C:/x', databasePath: value.databasePath, procedureRevision: 'fixture-v1' },
    );
    expect(checked.state.toolRuns.at(-1)?.result?.exitCode).toBe(0);
    expect(checked.state.toolRuns.at(-1)?.result?.error).toBeUndefined();
  });
});

async function responseRun(value: LifecycleFixture, request: unknown) {
  return runner(value)(request);
}
