import { describe, expect, it } from 'vitest';
import {
  assertWorkspaceLayoutMutationCompleted,
  buildWorkspaceLayoutPatchQueuedMutation,
  prepareWorkspaceLayoutPatchMutation,
  WORKSPACE_LAYOUT_PATCH_MUTATION_NAME,
  WorkspaceLayoutConflictError,
} from './outbox';

describe('workspace layout outbox command', () => {
  it('turns authoritative conflict receipts into non-retryable errors', () => {
    try {
      assertWorkspaceLayoutMutationCompleted(
        {
          operationId: '00000000-0000-4000-8000-000000000002',
          status: 'conflict',
          conflictReason: 'PATCH_GROUP_CONFLICT',
          conflictingGroups: ['appearance'],
          conflictFetchReference: { workspaceId: 'self', layoutTarget: 'web' },
        },
        '00000000-0000-4000-8000-000000000002',
      );
      throw new Error('Expected conflict');
    } catch (error) {
      expect(error).toBeInstanceOf(WorkspaceLayoutConflictError);
      expect(error).toMatchObject({
        conflictReason: 'PATCH_GROUP_CONFLICT',
        conflictingGroups: ['appearance'],
        conflictFetchReference: { workspaceId: 'self', layoutTarget: 'web' },
      });
    }
  });

  it('queues a named-group patch with its base revision and fresh mutation name', () => {
    const input = {
      userId: '00000000-0000-4000-8000-000000000001',
      workspaceId: 'self',
      layoutTarget: 'web' as const,
      operationId: '00000000-0000-4000-8000-000000000002',
      idempotencyKey: 'a'.repeat(64),
      inputHash: 'b'.repeat(64),
      baseRevision: 4,
      changes: {
        groups: {
          baseHash: 'c'.repeat(64),
          value: ['focus'],
        },
      },
    };
    expect(buildWorkspaceLayoutPatchQueuedMutation(input)).toEqual({
      type: 'UPDATE',
      scope: 'workspace-layout:00000000-0000-4000-8000-000000000001:self:web',
      name: WORKSPACE_LAYOUT_PATCH_MUTATION_NAME,
      variables: { input },
      userId: input.userId,
      operationId: input.operationId,
      idempotencyKey: input.idempotencyKey,
      inputHash: input.inputHash,
      clientRevision: input.baseRevision,
      commandState: 'queued',
    });
  });

  it('prepares a canonical patch hash independently of the operation identity', async () => {
    const input = {
      userId: '00000000-0000-4000-8000-000000000001',
      workspaceId: 'self',
      layoutTarget: 'web' as const,
      baseRevision: 4,
      changes: {
        groups: {
          baseHash: 'c'.repeat(64),
          value: ['focus'],
        },
      },
    };
    const prepared = await prepareWorkspaceLayoutPatchMutation(input);
    const repeated = await prepareWorkspaceLayoutPatchMutation(input);
    expect(prepared.operationId).toMatch(/^[0-9a-f-]{36}$/);
    expect(prepared.idempotencyKey).toMatch(/^[0-9a-f]{64}$/);
    expect(prepared.inputHash).toMatch(/^[0-9a-f]{64}$/);
    expect(repeated.inputHash).toBe(prepared.inputHash);
    expect(repeated.idempotencyKey).toBe(prepared.idempotencyKey);
    expect(repeated.operationId).not.toBe(prepared.operationId);
  });
});
