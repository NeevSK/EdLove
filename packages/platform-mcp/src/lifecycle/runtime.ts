import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Annotation, END, START, StateGraph } from '@langchain/langgraph';
import { z } from 'zod';
import { fingerprint } from '../coordination.js';
import { transaction } from '../coordinationStore.js';
import { coordinationChecks, runCoordinationCheck } from '../coordinationTools.js';
import { ROOT_DIR } from '../utils/constants.js';
import {
  applyLifecycleMutation,
  beginToolRun,
  createLifecycle,
  finishToolRun,
  projectLifecycle,
} from './evaluate.js';
import {
  artifactInputSchema,
  type LifecycleState,
  lifecycleRequestSchema,
  lifecycleStateSchema,
} from './model.js';
import {
  finishLifecycleOperation,
  readLifecycle,
  readLifecycleHistory,
  readLifecycleIndex,
  readLifecycleOperation,
  withLifecycleStore,
  writeLifecycle,
  writeLifecycleOperation,
} from './store.js';

type Options = {
  root?: string;
  databasePath?: string;
  procedureRevision?: string;
  runCheck?: typeof runCoordinationCheck;
};
const GraphState = Annotation.Root({
  snapshot: Annotation<LifecycleState | null>({
    reducer: (_prior, next) => next,
    default: () => null,
  }),
  duplicate: Annotation<boolean>({ reducer: (_prior, next) => next, default: () => false }),
  result: Annotation<ReturnType<typeof runCoordinationCheck> | null>({
    reducer: (_prior, next) => next,
    default: () => null,
  }),
  projection: Annotation<ReturnType<typeof projectLifecycle> | null>({
    reducer: (_prior, next) => next,
    default: () => null,
  }),
  trace: Annotation<string[]>({ reducer: (prior, next) => [...prior, ...next], default: () => [] }),
});

function runtimeRevision() {
  const extension = path.extname(fileURLToPath(import.meta.url));
  const files = [
    './model',
    './evaluate',
    './store',
    './runtime',
    '../coordination',
    '../coordinationStore',
    '../coordinationTools',
    '../utils/execution',
  ];
  const hash = createHash('sha256');
  for (const file of files)
    hash.update(readFileSync(new URL(`${file}${extension}`, import.meta.url)));
  hash.update(readFileSync(path.join(ROOT_DIR, 'pnpm-lock.yaml')));
  return hash.digest('hex');
}

function changedSources(state: LifecycleState, root: string) {
  return state.sources
    .filter((source) => {
      try {
        return fingerprint(root, source.path) !== source.sha256;
      } catch {
        return true;
      }
    })
    .map((source) => source.path);
}

export async function executeLifecycleRequest(input: unknown, options: Options = {}) {
  const request = lifecycleRequestSchema.parse(input);
  const root = options.root ?? ROOT_DIR;
  const databasePath =
    options.databasePath ??
    process.env.COORDINATION_STORE ??
    path.join(root, '.agents/state/coordination.sqlite');
  const procedureRevision = options.procedureRevision ?? runtimeRevision();
  const payload = JSON.stringify(request);
  const context = (state: LifecycleState) => ({
    now: new Date().toISOString(),
    changedSources: changedSources(state, root),
    procedureRevision,
    ...(request.action === 'refresh-sources'
      ? {
          sources: state.sources.map((source) => ({
            path: source.path,
            sha256: fingerprint(root, source.path),
          })),
        }
      : request.action === 'register-source'
        ? {
            sources: [
              ...state.sources,
              { path: request.sourcePath, sha256: fingerprint(root, request.sourcePath) },
            ],
          }
        : {}),
  });
  const operation = 'operationId' in request ? request : null;

  function previous(db: Parameters<typeof readLifecycleOperation>[0]) {
    if (!operation) return null;
    const existing = readLifecycleOperation(db, request.id, operation.operationId);
    if (!existing) return null;
    if (existing.payload !== payload) throw new Error('operation_id_conflict');
    return lifecycleStateSchema.parse(existing.result);
  }

  function commitAction(beginTool: boolean) {
    if (!operation) throw new Error('mutation_required');
    return withLifecycleStore(databasePath, (db) =>
      transaction(db, () => {
        const duplicate = previous(db);
        if (duplicate) return { snapshot: duplicate, duplicate: true };
        let next: LifecycleState;
        let expectedRevision: number | null;
        if (request.action === 'create') {
          if (request.expectedRevision !== 0) throw new Error('revision_conflict');
          const sources = request.sourcePaths.map((source) => ({
            path: source,
            sha256: fingerprint(root, source),
          }));
          next = createLifecycle(request, sources, new Date().toISOString(), procedureRevision);
          expectedRevision = null;
        } else {
          const current = lifecycleStateSchema.parse(readLifecycle(db, request.id));
          if (current.revision !== operation.expectedRevision) throw new Error('revision_conflict');
          expectedRevision = current.revision;
          if (request.action === 'run-tool' && beginTool)
            next = beginToolRun(current, request, context(current));
          else if (
            request.action !== 'run-tool' &&
            request.action !== 'status' &&
            request.action !== 'history' &&
            request.action !== 'context' &&
            request.action !== 'impact'
          )
            next = applyLifecycleMutation(current, request, context(current));
          else throw new Error('invalid_graph_action');
        }
        writeLifecycle(db, {
          id: request.id,
          state: next,
          revision: next.revision,
          expectedRevision,
        });
        writeLifecycleOperation(db, {
          id: request.id,
          operationId: operation.operationId,
          payload,
          result: next,
          revision: next.revision,
          createdAt: new Date().toISOString(),
        });
        return { snapshot: next, duplicate: false };
      }),
    );
  }

  const graph = new StateGraph(GraphState)
    .addNode('recover', () => {
      const stored = withLifecycleStore(databasePath, (db) => {
        const duplicate = previous(db);
        if (duplicate) return { snapshot: duplicate, duplicate: true };
        return {
          snapshot:
            request.action === 'create'
              ? null
              : lifecycleStateSchema.parse(readLifecycle(db, request.id)),
          duplicate: false,
        };
      });
      return { ...stored, trace: ['recover'] };
    })
    .addNode('apply', () => ({ ...commitAction(false), trace: ['apply'] }))
    .addNode('begin_tool', () => ({ ...commitAction(true), trace: ['begin_tool'] }))
    .addNode('execute_tool', () => {
      if (request.action !== 'run-tool') throw new Error('invalid_graph_action');
      if (!coordinationChecks.some((check) => check.id === request.toolId)) {
        return {
          result: {
            ok: false,
            stdout: '',
            stderr: 'No executable adapter for requested tool',
            exitCode: null,
            error: 'tool_unavailable',
          },
          trace: ['execute_tool'],
        };
      }
      const result = (options.runCheck ?? runCoordinationCheck)(root, request.toolId);
      return { result, trace: ['execute_tool'] };
    })
    .addNode('finish_tool', (state) => {
      if (request.action !== 'run-tool' || !state.result)
        throw new Error('missing_tool_observation');
      const result = state.result;
      const snapshot = withLifecycleStore(databasePath, (db) =>
        transaction(db, () => {
          const current = lifecycleStateSchema.parse(readLifecycle(db, request.id));
          const next = finishToolRun(current, request.operationId, result, context(current));
          writeLifecycle(db, {
            id: request.id,
            state: next,
            revision: next.revision,
            expectedRevision: current.revision,
          });
          finishLifecycleOperation(db, request.id, request.operationId, next);
          return next;
        }),
      );
      return { snapshot, trace: ['finish_tool'] };
    })
    .addNode('project', (state) => {
      if (!state.snapshot) throw new Error('missing_lifecycle_snapshot');
      return {
        projection: projectLifecycle(
          state.snapshot,
          changedSources(state.snapshot, root),
          procedureRevision,
        ),
        trace: ['project'],
      };
    })
    .addEdge(START, 'recover')
    .addConditionalEdges('recover', (state) =>
      state.duplicate || !operation
        ? 'project'
        : request.action === 'run-tool'
          ? 'begin_tool'
          : 'apply',
    )
    .addConditionalEdges('begin_tool', (state) => (state.duplicate ? 'project' : 'execute_tool'))
    .addEdge('execute_tool', 'finish_tool')
    .addEdge('finish_tool', 'project')
    .addEdge('apply', 'project')
    .addEdge('project', END)
    .compile();
  const result = await graph.invoke({});
  if (!result.snapshot || !result.projection) throw new Error('incomplete_lifecycle_graph');
  const needsPackets =
    request.action === 'context' || request.action === 'create' || request.action === 'plan';
  const selectedTasks = result.projection.tasks.filter((task) =>
    request.action === 'context' && request.taskId
      ? task.id === request.taskId
      : result.projection?.readyTasks.includes(task.id),
  );
  if (request.action === 'context' && request.taskId && selectedTasks.length === 0)
    throw new Error('task_not_found');
  const packets = (needsPackets ? selectedTasks : []).map((task) => ({
    taskId: task.id,
    role: task.role,
    title: task.title,
    scope: task.scope,
    status: task.effectiveStatus,
    expectedArtifactKinds: task.expected,
    ready: result.projection?.readyTasks.includes(task.id) ?? false,
    inputs: task.packet.consumed,
    toolNeeds: task.packet.toolNeeds,
    toolDecisions: task.packet.decisions,
    previousOutputs: result.snapshot?.artifacts.filter((artifact) =>
      task.outputs.some((ref) => ref.id === artifact.id && ref.version === artifact.version),
    ),
    reviews: result.snapshot?.reviews.filter((review) => review.taskId === task.id),
    expectedRevision: result.snapshot?.revision,
    sourceSnapshots: result.snapshot?.sources,
    externalAuthorities: result.snapshot?.externalRefs,
    actorClaims: result.snapshot?.actors.filter((actor) => actor.roles.includes(task.role)),
    toolAdapters: task.toolNeeds.map((toolId) => ({
      toolId,
      registration:
        coordinationChecks.some((check) => check.id === toolId) && toolId !== 'security-review'
          ? 'registered-not-probed'
          : 'missing',
      missingToolActions: [
        'record-checker-gap',
        'supply-scoped-manual-evidence-for-independent-review',
        'implement-and-verify-adapter',
      ],
    })),
    executor: 'codex-host',
    instructions:
      'Read the pinned inputs. Preserve unresolved policy. Publish typed proposed artifacts with exact upstream dependencies, then submit for a separate local review. Tool availability is not successful verification. This packet does not authorize product policy, deployment, external messaging or deletion.',
  }));
  const history =
    request.action === 'history'
      ? withLifecycleStore(databasePath, (db) => readLifecycleHistory(db, request.id))
      : undefined;
  const impact =
    request.action === 'impact'
      ? withLifecycleStore(databasePath, (db) => {
          const index = readLifecycleIndex(db);
          const currentSources = new Set(result.snapshot?.sources.map((source) => source.path));
          return {
            affected: index.states
              .map((input) => lifecycleStateSchema.parse(input))
              .filter((state) => state.id !== request.id)
              .flatMap((state) => {
                const sharedSources = state.sources
                  .filter((source) => currentSources.has(source.path))
                  .map((source) => source.path);
                if (!sharedSources.length) return [];
                const projection = projectLifecycle(
                  state,
                  changedSources(state, root),
                  procedureRevision,
                );
                return [
                  {
                    id: state.id,
                    sharedSources,
                    staleArtifacts: projection.staleArtifacts,
                    readiness: projection.readiness,
                  },
                ];
              }),
            truncated: index.truncated,
            limits:
              'Only lifecycles in this local store and their declared source paths are considered. Shared paths are possible impacts, not proof of semantic dependence; unregistered dependencies remain unknown.',
          };
        })
      : undefined;
  const intakePacket =
    needsPackets && !result.snapshot.analysisRef
      ? {
          taskId: 'classification',
          role: 'product',
          expectedArtifactKinds: ['analysis'],
          goal: result.snapshot.goal,
          scope: result.snapshot.scope,
          sourceSnapshots: result.snapshot.sources,
          externalAuthorities: result.snapshot.externalRefs,
          availableActors: result.snapshot.actors,
          expectedRevision: result.snapshot.revision,
          executor: 'codex-host',
          instructions:
            'Investigate the source records, classify the request and assess every required dimension. Mark unknowns explicitly; justify exclusions. Publish an analysis proposal. Do not invent accepted requirements or claim tool execution. The plan action then produces applicable role tasks.',
        }
      : null;
  return {
    state: result.snapshot,
    projection: result.projection,
    packets,
    intakePacket,
    ...(needsPackets ? { artifactSchema: z.toJSONSchema(artifactInputSchema) } : {}),
    duplicate: result.duplicate,
    graphTrace: result.trace,
    ...(history ? { history } : {}),
    ...(impact ? { impact } : {}),
    limits:
      'LangGraph executes validated lifecycle operations; SQLite commits provide restart recovery. Model reasoning runs through the Codex host, not a configured autonomous model provider. Local actor claims are not authentication.',
  };
}

export type LifecycleResponse = Awaited<ReturnType<typeof executeLifecycleRequest>>;
