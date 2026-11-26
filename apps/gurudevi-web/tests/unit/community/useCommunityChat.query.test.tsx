import { useMutationQueue } from '@repo/core/lib/sync/mutationQueue.store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadDurableChat, saveDurableChat, useCommunityChat } from '../../../lib/hooks/useCommunityChat';

const addToQueue = vi.fn(async () => undefined);

function wrapperWith(client: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

beforeEach(() => {
  addToQueue.mockClear();
  vi.spyOn(useMutationQueue, 'getState').mockReturnValue({
    ...useMutationQueue.getState(),
    addToQueue,
  });
  saveDurableChat('thread-a', [
    { id: 'a1', senderName: 'A', senderInitials: 'A', text: 'first in A', time: '', isSelf: false, status: 'sent' },
  ]);
  saveDurableChat('thread-b', [
    { id: 'b1', senderName: 'B', senderInitials: 'B', text: 'first in B', time: '', isSelf: false, status: 'sent' },
  ]);
});

describe('G3 useCommunityChat as a local query', () => {
  it('reads a thread at once and switches threads without an effect', () => {
    const wrapper = wrapperWith(new QueryClient());
    const { result, rerender } = renderHook(({ id }) => useCommunityChat(id), {
      wrapper,
      initialProps: { id: 'thread-a' },
    });
    expect(result.current.messages.map((m) => m.text)).toEqual(['first in A']);
    rerender({ id: 'thread-b' });
    expect(result.current.messages.map((m) => m.text)).toEqual(['first in B']);
  });

  it('persists, updates every reader of the thread and queues the send', async () => {
    const wrapper = wrapperWith(new QueryClient());
    const first = renderHook(() => useCommunityChat('thread-a', 'Nimal Perera'), { wrapper });
    const second = renderHook(() => useCommunityChat('thread-a'), { wrapper });

    await act(async () => {
      await first.result.current.sendMessage('  hello  ');
    });

    await waitFor(() => expect(second.result.current.messages.at(-1)?.text).toBe('hello'));
    expect(first.result.current.messages.at(-1)).toMatchObject({ text: 'hello', senderInitials: 'NP' });
    expect(loadDurableChat('thread-a').at(-1)?.text).toBe('hello');
    expect(addToQueue).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'sendChatMessage', scope: 'community' }),
    );
  });

  it('keeps an ephemeral thread in memory only', async () => {
    const wrapper = wrapperWith(new QueryClient());
    const { result } = renderHook(() => useCommunityChat('thread-a', 'You', { isEphemeral: true }), {
      wrapper,
    });
    await act(async () => {
      await result.current.sendMessage('off the record');
    });
    await waitFor(() => expect(result.current.messages.at(-1)?.text).toBe('off the record'));
    expect(loadDurableChat('thread-a').map((m) => m.text)).not.toContain('off the record');
    expect(addToQueue).not.toHaveBeenCalled();
  });
});
