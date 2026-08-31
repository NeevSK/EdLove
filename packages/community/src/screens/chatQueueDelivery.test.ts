import { describe, expect, it, vi } from 'vitest';

import { deliverQueuedMessages } from './chatQueueDelivery';

describe('deliverQueuedMessages', () => {
  it('delivers every queued message in FIFO order after reconnection', async () => {
    const send = vi.fn(async (content: string) => ({ id: content }));

    const result = await deliverQueuedMessages(['first', 'second', 'third'], send);

    expect(send.mock.calls.map(([content]) => content)).toEqual(['first', 'second', 'third']);
    expect(result).toEqual({
      status: 'delivered',
      deliveredCount: 3,
      remainingMessages: [],
    });
  });

  it('keeps the failed message and every later message for a truthful retry', async () => {
    const failure = new Error('Connection interrupted');
    const send = vi.fn(async (content: string) => {
      if (content === 'second') throw failure;
      return { id: content };
    });

    const result = await deliverQueuedMessages(['first', 'second', 'third'], send);

    expect(send.mock.calls.map(([content]) => content)).toEqual(['first', 'second']);
    expect(result).toEqual({
      status: 'stopped',
      deliveredCount: 1,
      remainingMessages: ['second', 'third'],
      error: failure,
    });
  });
});
