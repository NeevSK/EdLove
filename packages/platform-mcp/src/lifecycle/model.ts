import { z } from 'zod';

const id = z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,159}$/);
const text = z.string().trim().min(1).max(4000);
export const roleSchema = z.enum([
  'product',
  'ux',
  'visual-motion',
  'architecture',
  'dependencies',
  'implementation',
  'verification',
]);
export const artifactKindSchema = z.enum([
  'analysis',
  'requirement',
  'invariant',
  'experience',
  'visual-motion',
  'architecture',
  'dependency',
  'scenario',
  'implementation',
  'verification',
  'decision',
  'manual-evidence',
  'finding',
]);
export const refSchema = z.strictObject({ id, version: z.number().int().positive() });
const strings = z.array(text).max(100);
const dimension = z.strictObject({
  applicability: z.enum(['applies', 'not-applicable', 'unknown']),
  reason: text,
  sources: strings,
});
export const dimensionNames = [
  'ux',
  'screens',
  'state',
  'errors',
  'feedback',
  'motion',
  'accessibility',
  'data',
  'api',
  'database',
  'dependencies',
  'security',
  'offline',
  'reuse',
] as const;
const dimensions = z.strictObject(
  Object.fromEntries(dimensionNames.map((name) => [name, dimension])),
);
export const contentSchema = z.discriminatedUnion('kind', [
  z.strictObject({
    kind: z.literal('analysis'),
    requestKind: z.enum(['feature', 'defect', 'investigation', 'refactor']),
    dimensions,
    reuse: strings,
    openQuestions: strings,
  }),
  z.strictObject({
    kind: z.literal('requirement'),
    statement: text,
    classification: z.enum(['product', 'functional', 'quality', 'constraint']),
    acceptance: strings.min(1),
    origin: z.enum(['proposal', 'source']),
    authorityRefs: strings,
    unresolved: strings,
  }),
  z.strictObject({
    kind: z.literal('invariant'),
    statement: text,
    scope: strings.min(1),
    violations: strings.min(1),
    verification: text,
  }),
  z.strictObject({
    kind: z.literal('experience'),
    screens: z.array(z.strictObject({ id, route: text, states: strings.min(1) })).min(1),
    stateAxes: z.array(z.strictObject({ id, states: strings.min(1) })),
    transitions: z
      .array(
        z.strictObject({
          id,
          screenId: id,
          from: text,
          to: text,
          event: text,
          guard: text,
          effects: strings,
          feedback: text,
          recovery: text,
          motionRef: text,
        }),
      )
      .min(1),
    journeys: z
      .array(
        z.strictObject({
          id,
          actor: text,
          entryTransition: id,
          transitionIds: z.array(id).min(1),
          outcome: text,
        }),
      )
      .min(1),
    motionRequirements: z.array(
      z.strictObject({ id, trigger: text, reducedMotion: text, cancellation: text }),
    ),
    accessibility: strings,
    combinations: z.array(
      z.strictObject({
        when: z.array(z.strictObject({ axisId: id, state: text })).min(1),
        must: strings.min(1),
      }),
    ),
  }),
  z.strictObject({
    kind: z.literal('visual-motion'),
    visual: text,
    motion: text,
    reducedMotion: text,
    cancellation: text,
  }),
  z.strictObject({
    kind: z.literal('architecture'),
    components: z.array(z.strictObject({ id, owner: text, reference: text })).min(1),
    flows: z.array(
      z.strictObject({
        from: id,
        to: id,
        operation: text,
        direction: z.enum(['command', 'query', 'event', 'response']),
        contractRef: text,
        failure: text,
      }),
    ),
    data: z.array(
      z.strictObject({ entity: text, owner: text, schemaRef: text, constraints: strings }),
    ),
    boundaries: strings,
  }),
  z.strictObject({
    kind: z.literal('dependency'),
    packages: z
      .array(
        z.strictObject({
          name: text,
          declared: text,
          resolved: text,
          installed: text,
          upstream: text,
          compatibility: text,
          evidenceRefs: strings,
        }),
      )
      .min(1),
  }),
  z.strictObject({
    kind: z.literal('scenario'),
    preconditions: strings,
    actions: strings.min(1),
    expected: strings.min(1),
  }),
  z.strictObject({
    kind: z.literal('implementation'),
    files: z.array(z.strictObject({ path: text, change: text, evidenceRef: text })).min(1),
    limitations: strings,
  }),
  z.strictObject({
    kind: z.literal('verification'),
    outcome: z.enum(['passed', 'failed', 'inconclusive']),
    observationIds: z.array(id),
    scenarioRefs: z.array(refSchema),
    manualEvidenceRefs: z.array(refSchema),
    limitations: strings,
  }),
  z.strictObject({
    kind: z.literal('finding'),
    claim: text,
    classification: z.enum(['observed', 'inferred', 'unresolved']),
    evidenceRefs: z.array(refSchema),
    limitations: strings,
  }),
  z.strictObject({
    kind: z.literal('manual-evidence'),
    claim: text,
    method: text,
    scope: text,
    result: z.enum(['supported', 'rejected', 'inconclusive']),
    limitations: strings,
  }),
  z.strictObject({
    kind: z.literal('decision'),
    statement: text,
    status: z.enum(['proposal', 'source']),
    authorityRefs: strings,
    unresolved: strings,
  }),
]);
export const artifactInputSchema = z.strictObject({
  id,
  scope: text,
  authorId: id,
  sourcePaths: strings,
  dependsOn: z.array(refSchema).max(100),
  content: contentSchema,
});
const artifactSchema = artifactInputSchema.extend({
  version: z.number().int().positive(),
  observedAt: z.iso.datetime(),
  sourceSnapshots: z.array(
    z.strictObject({ path: text, sha256: z.string().regex(/^[a-f0-9]{64}$/) }),
  ),
  procedureRevision: text,
});
const actorSchema = z.strictObject({ id, roles: z.array(roleSchema).min(1) });
const taskSchema = z.strictObject({
  id,
  title: text,
  scope: text,
  role: roleSchema,
  expected: z.array(artifactKindSchema).min(1),
  requires: z.array(id),
  toolNeeds: z.array(id),
  parent: id.optional(),
  outputs: z.array(refSchema),
  consumed: z.array(refSchema),
  submittedBy: id.optional(),
  status: z.enum(['open', 'submitted', 'accepted', 'returned']),
});
const reviewSchema = z.strictObject({
  taskId: id,
  actorId: id,
  outcome: z.enum(['accept', 'return']),
  findings: strings,
  refs: z.array(refSchema),
  observedAt: z.iso.datetime(),
});
const toolDecisionSchema = z.strictObject({
  taskId: id,
  toolId: id,
  decision: z.enum(['tool', 'manual', 'unavailable', 'checker-gap']),
  evidence: z.array(refSchema),
  actorId: id,
});
const toolRunSchema = z.strictObject({
  operationId: id,
  taskId: id,
  toolId: id,
  inputRefs: z.array(refSchema),
  state: z.enum(['pending', 'finished', 'stale']),
  observedAt: z.iso.datetime(),
  finishedAt: z.iso.datetime().optional(),
  result: z
    .strictObject({
      ok: z.boolean(),
      stdout: z.string(),
      stderr: z.string(),
      exitCode: z.number().nullable(),
      error: z.string().optional(),
    })
    .optional(),
});
export const lifecycleStateSchema = z.strictObject({
  id,
  goal: text,
  scope: z.enum(['feature', 'shared']),
  actors: z.array(actorSchema),
  sources: z.array(z.strictObject({ path: text, sha256: z.string().regex(/^[a-f0-9]{64}$/) })),
  unassessedSources: z.array(text).optional(),
  externalRefs: z.array(z.strictObject({ system: z.enum(['PJC', 'C4', 'API', 'doc']), ref: text })),
  revision: z.number().int().nonnegative(),
  procedureRevision: text,
  createdAt: z.iso.datetime(),
  artifacts: z.array(artifactSchema),
  tasks: z.array(taskSchema),
  reviews: z.array(reviewSchema),
  toolDecisions: z.array(toolDecisionSchema),
  toolRuns: z.array(toolRunSchema),
  analysisRef: refSchema.optional(),
});
const base = { id, operationId: id, expectedRevision: z.number().int().nonnegative() };
export const lifecycleRequestSchema = z.discriminatedUnion('action', [
  z.strictObject({
    action: z.literal('create'),
    ...base,
    goal: text,
    scope: z.enum(['feature', 'shared']),
    actors: z.array(actorSchema).min(1),
    sourcePaths: strings.min(1),
    externalRefs: z.array(
      z.strictObject({ system: z.enum(['PJC', 'C4', 'API', 'doc']), ref: text }),
    ),
  }),
  z.strictObject({ action: z.literal('status'), id }),
  z.strictObject({ action: z.literal('history'), id }),
  z.strictObject({ action: z.literal('impact'), id }),
  z.strictObject({ action: z.literal('context'), id, taskId: id.optional() }),
  z.strictObject({ action: z.literal('publish'), ...base, artifact: artifactInputSchema }),
  z.strictObject({ action: z.literal('refresh-sources'), ...base }),
  z.strictObject({ action: z.literal('register-source'), ...base, sourcePath: text }),
  z.strictObject({ action: z.literal('register-actor'), ...base, actor: actorSchema }),
  z.strictObject({ action: z.literal('plan'), ...base, analysisRef: refSchema }),
  z.strictObject({
    action: z.literal('refine'),
    ...base,
    taskId: id,
    subtasks: z
      .array(
        z.strictObject({
          id,
          title: text,
          role: roleSchema.optional(),
          expected: z.array(artifactKindSchema).min(1).optional(),
          toolNeeds: z.array(id).optional(),
          requires: z.array(id).optional(),
        }),
      )
      .min(1)
      .max(20),
  }),
  z.strictObject({
    action: z.literal('submit'),
    ...base,
    taskId: id,
    actorId: id,
    outputs: z.array(refSchema).min(1),
  }),
  z.strictObject({
    action: z.literal('review'),
    ...base,
    taskId: id,
    actorId: id,
    outcome: z.enum(['accept', 'return']),
    findings: strings,
    refs: z.array(refSchema),
  }),
  z.strictObject({
    action: z.literal('tool-decision'),
    ...base,
    taskId: id,
    toolId: id,
    actorId: id,
    decision: z.enum(['tool', 'manual', 'unavailable', 'checker-gap']),
    evidence: z.array(refSchema),
  }),
  z.strictObject({ action: z.literal('run-tool'), ...base, taskId: id, toolId: id, actorId: id }),
]);
export type LifecycleState = z.infer<typeof lifecycleStateSchema>;
export type LifecycleRequest = z.infer<typeof lifecycleRequestSchema>;
export type LifecycleCreate = Extract<LifecycleRequest, { action: 'create' }>;
export type LifecycleMutation = Exclude<
  LifecycleRequest,
  { action: 'create' | 'status' | 'history' | 'impact' | 'context' | 'run-tool' }
>;
export type ToolRequest = Extract<LifecycleRequest, { action: 'run-tool' }>;
export type ArtifactRef = z.infer<typeof refSchema>;
