import {
  generateIdempotencyKey,
  getConsistentIdempotencyKey,
} from '@repo/core/lib/sync/idempotency';
import type { QueuedMutation } from '@repo/core/lib/sync/types';
import { uuidv7 } from '@repo/core/logic/utils/uuid';
import type {
  WorkspaceLayoutPatch,
  WorkspaceLayoutPatchGroup,
} from '@repo/core/logic/workspace/layoutPatch';

export const WORKSPACE_LAYOUT_PATCH_MUTATION_NAME = 'patchWorkspaceLayout';
type QueuedMutationInput = Omit<
  QueuedMutation,
  'id' | 'timestamp' | 'retryCount' | 'idempotencyKey'
> & { idempotencyKey?: string };

export class WorkspaceLayoutConflictError extends Error {
  readonly code = 409;
  readonly conflictReason: string;
  readonly conflictingGroups: WorkspaceLayoutPatchGroup[];
  readonly conflictFetchReference?: {
    workspaceId: string;
    layoutTarget: 'shared' | 'web' | 'mobile';
  };

  constructor(
    reason: string,
    conflictingGroups: Array<'arrangement' | 'appearance' | 'groups'> = [],
    conflictFetchReference?: { workspaceId: string; layoutTarget: 'shared' | 'web' | 'mobile' },
  ) {
    super('Workspace layout changed on another device.');
    this.name = 'WorkspaceLayoutConflictError';
    this.conflictReason = reason;
    this.conflictingGroups = conflictingGroups;
    this.conflictFetchReference = conflictFetchReference;
  }
}

export function assertWorkspaceLayoutMutationCompleted(
  value: unknown,
  operationId: string,
): { operationId: string; serverRevision?: number } {
  if (!value || typeof value !== 'object') {
    throw new Error('Workspace mutation returned an invalid receipt.');
  }
  const receipt = value as {
    operationId?: unknown;
    status?: unknown;
    serverRevision?: unknown;
    conflictReason?: unknown;
    conflictingGroups?: unknown;
    conflictFetchReference?: unknown;
    error?: unknown;
  };
  if (receipt.operationId !== operationId) {
    throw new Error('Workspace mutation receipt belongs to a different operation.');
  }
  if (receipt.status === 'conflict') {
    const conflictingGroups = Array.isArray(receipt.conflictingGroups)
      ? receipt.conflictingGroups.filter(
          (group): group is 'arrangement' | 'appearance' | 'groups' =>
            group === 'arrangement' || group === 'appearance' || group === 'groups',
        )
      : [];
    const reference =
      receipt.conflictFetchReference && typeof receipt.conflictFetchReference === 'object'
        ? (receipt.conflictFetchReference as {
            workspaceId?: unknown;
            layoutTarget?: unknown;
          })
        : undefined;
    throw new WorkspaceLayoutConflictError(
      typeof receipt.conflictReason === 'string' ? receipt.conflictReason : 'REVISION_CONFLICT',
      conflictingGroups,
      reference &&
        typeof reference.workspaceId === 'string' &&
        (reference.layoutTarget === 'shared' ||
          reference.layoutTarget === 'web' ||
          reference.layoutTarget === 'mobile')
        ? { workspaceId: reference.workspaceId, layoutTarget: reference.layoutTarget }
        : undefined,
    );
  }
  if (receipt.status !== 'completed') {
    throw new Error(
      typeof receipt.error === 'string' ? receipt.error : 'Workspace mutation failed.',
    );
  }
  return {
    operationId,
    ...(typeof receipt.serverRevision === 'number'
      ? { serverRevision: receipt.serverRevision }
      : {}),
  };
}

export async function prepareWorkspaceLayoutPatchMutation(
  input: Omit<WorkspaceLayoutPatch, 'operationId' | 'idempotencyKey' | 'inputHash'>,
): Promise<WorkspaceLayoutPatch> {
  const operationId = uuidv7();
  const scope = `workspace-layout:${input.userId}:${input.workspaceId}:${input.layoutTarget}`;
  const idempotencyKey = await generateIdempotencyKey(
    scope,
    WORKSPACE_LAYOUT_PATCH_MUTATION_NAME,
    input,
    input.userId,
  );
  const inputHash = await getConsistentIdempotencyKey(
    {
      workspaceId: input.workspaceId,
      layoutTarget: input.layoutTarget,
      baseRevision: input.baseRevision,
      changes: input.changes,
    },
    'workspace-layout-patch-v1',
  );
  return { ...input, operationId, idempotencyKey, inputHash };
}

export function buildWorkspaceLayoutPatchQueuedMutation(
  input: WorkspaceLayoutPatch,
): QueuedMutationInput {
  return {
    type: 'UPDATE',
    scope: `workspace-layout:${input.userId}:${input.workspaceId}:${input.layoutTarget}`,
    name: WORKSPACE_LAYOUT_PATCH_MUTATION_NAME,
    variables: { input },
    userId: input.userId,
    operationId: input.operationId,
    idempotencyKey: input.idempotencyKey,
    inputHash: input.inputHash,
    clientRevision: input.baseRevision,
    commandState: 'queued',
  };
}
