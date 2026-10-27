import { CHAT_SEND_COMMAND } from '@repo/core/logic/schemas/chat-command.schema';
import { afterEach, describe, expect, it } from 'vitest';
import { planMutationReplay } from '../replayPolicy';
import type { QueuedMutation } from '../types';
import { useMutationQueue } from '../useMutationQueue';

const account = '123e4567-e89b-8101-8000-426614174000';
const channel = '123e4567-e89b-8101-8000-426614174002';
function item(id: string, clock: number, overrides: Partial<QueuedMutation> = {}): QueuedMutation {
  return {
    id,
    operationId: '123e4567-e89b-8101-8000-426614174001',
    idempotencyKey: id,
    userId: account,
    name: CHAT_SEND_COMMAND,
    scope: 'chat',
    type: 'CREATE',
    timestamp: clock,
    logicalClock: clock,
    retryCount: 0,
    commandState: 'queued',
    variables: {
      operationId: '123e4567-e89b-8101-8000-426614174001',
      principalId: account,
      channel: { kind: 'group', id: channel },
      content: id,
    },
    ...overrides,
  };
}
afterEach(() => useMutationQueue.getState().clearQueue());

describe('outbox replay admission plan', () => {
  it('waits for the unresolved channel head and chooses its actual backoff deadline', () => {
    const queue = [item('head', 1, { backoffUntil: 4000 }), item('later', 2)];
    expect(planMutationReplay(queue, account, 'live', 1000)).toEqual({
      ready: [],
      nextWakeAt: 4000,
    });
    expect(
      planMutationReplay(queue, account, 'live', 4000).ready.map((command) => command.id),
    ).toEqual(['head']);
    expect(
      planMutationReplay(queue.slice(1), account, 'live', 4000).ready.map((command) => command.id),
    ).toEqual(['later']);
  });
  it('waits for explicit policy resume without scheduling repeated wake-ups', () => {
    const queue = [
      item('chat', 1),
      item('other-capability', 2, { name: 'workspace.layout.patch' }),
    ];
    expect(planMutationReplay(queue, account, 'cached-only', 1000)).toEqual({
      ready: [queue[1]],
      nextWakeAt: null,
    });
  });
  it('leaves authority-paused and conflict lanes blocked while unrelated channels continue', () => {
    const independent = item('independent', 3, {
      variables: {
        operationId: '123e4567-e89b-8101-8000-426614174003',
        principalId: account,
        channel: { kind: 'direct', id: channel },
        content: 'independent',
      },
    });
    const queue = [
      item('paused', 1, { commandState: 'auth_paused' }),
      item('later', 2),
      independent,
    ];
    expect(planMutationReplay(queue, account, 'live', 1000)).toEqual({
      ready: [independent],
      nextWakeAt: null,
    });
  });
  it('uses the later of the lease and backoff and never admits another or missing principal', () => {
    const queue = [
      item('leased', 1, {
        commandState: 'dispatching',
        backoffUntil: 2000,
        lockLeaseExpiresAt: 5000,
      }),
    ];
    expect(planMutationReplay(queue, account, 'live', 1000)).toEqual({
      ready: [],
      nextWakeAt: 5000,
    });
    expect(planMutationReplay(queue, 'different-account', 'live', 6000)).toEqual({
      ready: [],
      nextWakeAt: null,
    });
    expect(planMutationReplay(queue, undefined, 'live', 6000)).toEqual({
      ready: [],
      nextWakeAt: null,
    });
    expect(planMutationReplay(queue, account, 'live', 5000).ready).toEqual(queue);
  });
});
