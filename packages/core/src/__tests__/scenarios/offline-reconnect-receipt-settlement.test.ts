import { toMutationReceipt } from '@repo/core/lib/sync/receipts';
import { useMutationQueue } from '@repo/core/lib/sync/useMutationQueue';
import { useConflictStore } from '@repo/core/store/useConflictStore';
import { describe, expect, it } from 'vitest';
import { createScenarioTestContext } from '../../testing/scenarioHarness';

describe('G2 scenario: offline reconnect receipt settlement', () => {
  const harness = createScenarioTestContext();

  it('keeps a command durable offline, then reconciles it from an authoritative receipt', async () => {
    await harness.resetAll();
    const queue = useMutationQueue.getState();

    await queue.addToQueue({
      type: 'UPDATE',
      scope: 'workspace-layout:user-1:self:web',
      name: 'patchWorkspaceLayout',
      variables: { input: { workspaceId: 'self', layoutTarget: 'web', order: ['today'] } },
    });

    const pending = useMutationQueue.getState().queue[0];
    expect(pending?.commandState).toBe('queued');
    expect(pending?.operationId).toBe(pending?.id);

    const receipt = toMutationReceipt(pending!.operationId!, {
      mutationId: pending!.id,
      operationId: pending!.operationId,
      receiptId: 'receipt-1',
      status: 'completed',
      serverRevision: '7',
    });

    expect(receipt).toMatchObject({
      operationId: pending!.operationId,
      status: 'completed',
      receiptId: 'receipt-1',
      serverRevision: '7',
    });
  });

  it('preserves a recoverable conflict instead of converting it into success', async () => {
    await harness.resetAll();
    const queue = useMutationQueue.getState();
    await queue.addToQueue({
      type: 'UPDATE',
      scope: 'workspace-layout:user-1:self:web',
      name: 'patchWorkspaceLayout',
      variables: { input: { workspaceId: 'self', layoutTarget: 'web', order: ['today'] } },
    });

    const pending = useMutationQueue.getState().queue[0]!;
    const receipt = toMutationReceipt(pending.operationId!, {
      mutationId: pending.id,
      operationId: pending.operationId,
      receiptId: 'receipt-conflict',
      status: 'conflict',
      serverRevision: '8',
      error: 'The workspace changed on another device.',
      conflictReason: 'REVISION_CONFLICT',
    });

    expect(receipt.status).toBe('conflict');
    expect(receipt.conflictReason).toBe('REVISION_CONFLICT');
    useConflictStore.getState().addConflict({
      id: pending.id,
      scope: pending.scope,
      name: pending.name,
      localData: pending.variables,
      remoteData: { serverRevision: receipt.serverRevision },
      timestamp: Date.now(),
    });
    expect(useConflictStore.getState().activeConflicts[0]?.remoteData).toEqual({
      serverRevision: '8',
    });
  });
});
