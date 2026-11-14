import type { WorkspaceLayoutPatch } from '@repo/core/logic/workspace/layoutPatch';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const transport = vi.hoisted(() => vi.fn());
vi.mock('@repo/core/api/orpcClient', () => ({
  orpcClient: { sync: { patchWorkspaceLayout: transport } },
}));

import { submitWorkspaceLayoutPatch } from './workspaceLayoutPatch';

const patch: WorkspaceLayoutPatch = {
  userId: '11111111-1111-8111-8111-111111111111',
  workspaceId: 'self',
  layoutTarget: 'mobile',
  operationId: '11111111-1111-7111-8111-111111111112',
  idempotencyKey: '11111111-1111-7111-8111-111111111112',
  inputHash: 'a'.repeat(64),
  baseRevision: 4,
  changes: { groups: { baseHash: 'b'.repeat(64), value: ['research'] } },
};

describe('workspace patch receipt admission', () => {
  beforeEach(() => transport.mockReset());

  it('accepts the matching committed receipt', async () => {
    transport.mockResolvedValue({
      status: 'completed',
      operationId: patch.operationId,
      serverRevision: 5,
    });
    await expect(submitWorkspaceLayoutPatch(patch)).resolves.toMatchObject({ serverRevision: 5 });
    expect(transport).toHaveBeenCalledWith({ body: patch });
  });

  it.each([
    { status: 'completed', operationId: 'another-operation', serverRevision: 5 },
    { status: 'completed', operationId: patch.operationId, serverRevision: 3 },
  ])('rejects an inconsistent receipt', async (result) => {
    transport.mockResolvedValue(result);
    await expect(submitWorkspaceLayoutPatch(patch)).rejects.toThrow('does not match');
  });

  it('keeps server conflict distinct from completion and transient transport failure', async () => {
    transport.mockResolvedValue({
      status: 'conflict',
      conflictReason: 'Arrangement changed remotely.',
    });
    await expect(submitWorkspaceLayoutPatch(patch)).rejects.toMatchObject({
      status: 409,
      message: 'Arrangement changed remotely.',
    });
  });
});
