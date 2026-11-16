import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { coordinationRequestSchema, handleCoordination } from '../coordination.js';
import {
  coordinationChecks,
  filterContextProjection,
  listCoordinationTools,
  runCoordinationCheck,
  runPjcJourney,
} from '../coordinationTools.js';
import { lifecycleRequestSchema, lifecycleStateSchema } from '../lifecycle/model.js';
import { executeLifecycleRequest } from '../lifecycle/runtime.js';
import { readLifecycleIndex, withLifecycleStore } from '../lifecycle/store.js';
import { ROOT_DIR } from '../utils/constants.js';

const legacyCoordinationSchema = z.union([
  coordinationRequestSchema,
  z.strictObject({ action: z.literal('inventory') }),
  z.strictObject({
    action: z.literal('context'),
    journeyId: z
      .string()
      .max(160)
      .regex(/^[a-zA-Z0-9:_.-]+$/),
    scope: z.enum(['local', 'interface', 'full']).optional(),
    targetDomain: z.string().max(160).optional(),
  }),
]);

export const developerCoordinationSchema = z.union([
  legacyCoordinationSchema,
  z.strictObject({ action: z.literal('lifecycle'), request: lifecycleRequestSchema }),
]);

export async function dispatchCoordinationRequest(
  input: unknown,
  options: { root?: string; databasePath?: string } = {},
) {
  const request = developerCoordinationSchema.parse(input);
  return request.action === 'lifecycle'
    ? executeLifecycleRequest(request.request, options)
    : executeCoordinationRequest(request, options);
}

function catalogSources(root: string) {
  const directory = path.join(root, 'packages/core/src/flows/pjc');
  const files = readdirSync(directory)
    .filter((name) => name.endsWith('.json'))
    .map((name) => path.join(directory, name));
  files.push(
    path.join(root, 'scripts/pjc.ts'),
    path.join(root, 'docs/architecture/model/gurudevi.c4'),
    path.join(root, 'apps/sanctuary-api/src/modules/catalog.ts'),
  );
  return files.map((file) => {
    const resolved = realpathSync(file);
    const relative = path.relative(realpathSync(root), resolved);
    if (relative.startsWith('..') || path.isAbsolute(relative))
      throw new Error('Context source escapes workspace');
    return {
      path: relative.replaceAll('\\', '/'),
      sha256: createHash('sha256').update(readFileSync(resolved)).digest('hex'),
    };
  });
}

export function executeCoordinationRequest(
  input: unknown,
  options: { root?: string; databasePath?: string } = {},
) {
  const request = legacyCoordinationSchema.parse(input);
  const root = options.root ?? ROOT_DIR;
  if (request.action === 'inventory')
    return {
      observedAt: new Date().toISOString(),
      tools: listCoordinationTools(root),
      checks: coordinationChecks,
      lifecycles: withLifecycleStore(
        options.databasePath ??
          process.env.COORDINATION_STORE ??
          path.join(root, '.agents/state/coordination.sqlite'),
        (db) => {
          const index = readLifecycleIndex(db);
          return {
            records: index.states.map((input) => {
              const state = lifecycleStateSchema.parse(input);
              return {
                id: state.id,
                goal: state.goal,
                scope: state.scope,
                recordedRevision: state.revision,
                recordedTasks: state.tasks.map((task) => ({
                  id: task.id,
                  role: task.role,
                  status: task.status,
                })),
              };
            }),
            truncated: index.truncated,
            freshness: 'Not evaluated by inventory; retrieve lifecycle status before resuming.',
          };
        },
      ),
    };
  if (request.action === 'context') {
    const before = catalogSources(root);
    const result = runPjcJourney(root, request.journeyId);
    if (!result.ok)
      return { status: 'unavailable', journeyId: request.journeyId, result, sources: before };
    const rawProjection: unknown = JSON.parse(result.stdout);
    const projection = filterContextProjection(rawProjection, {
      scope: request.scope,
      targetDomain: request.targetDomain,
    });
    const after = catalogSources(root);
    return {
      status: JSON.stringify(before) === JSON.stringify(after) ? 'observed' : 'stale',
      journeyId: request.journeyId,
      scope: request.scope ?? 'full',
      ...(request.targetDomain ? { targetDomain: request.targetDomain } : {}),
      projection,
      sources: before,
      coverageGaps: [
        'PJC links are declarations; this reader does not establish execution or semantic correctness.',
        'C4 and capability catalog hashes identify adjacent sources; their relationships are not automatically joined to this journey.',
        'Chat history, external decisions, inaccessible sources and unregistered relationships are not searched by this projection.',
      ],
    };
  }
  return handleCoordination(request, {
    root,
    databasePath:
      options.databasePath ??
      process.env.COORDINATION_STORE ??
      path.join(root, '.agents/state/coordination.sqlite'),
    checks: coordinationChecks,
    procedureRevision: createHash('sha256')
      .update(readFileSync(new URL(import.meta.url)))
      .update(
        readFileSync(
          new URL(
            `../coordinationTools${path.extname(fileURLToPath(import.meta.url))}`,
            import.meta.url,
          ),
        ),
      )
      .update(
        readFileSync(
          new URL(
            `../utils/execution${path.extname(fileURLToPath(import.meta.url))}`,
            import.meta.url,
          ),
        ),
      )
      .update(readFileSync(path.join(root, 'pnpm-lock.yaml')))
      .update(
        JSON.stringify(
          [
            'scripts/pjc.ts',
            'scripts/audit-api-composition.mjs',
            'scripts/check-ui-boundaries.mjs',
            'scripts/lint-new-migrations.mjs',
            'scripts/harmonize-dependencies.mjs',
            'apps/sanctuary-api/scripts/capability-conformance.ts',
          ].map((file) => ({
            path: file,
            sha256: createHash('sha256')
              .update(readFileSync(path.join(root, file)))
              .digest('hex'),
          })),
        ),
      )
      .digest('hex'),
    runCheck: (id) => runCoordinationCheck(root, id),
  });
}
