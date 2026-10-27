import { chatHistoryQueryKey, useChatMessages } from '@repo/community/hooks/useChatMessages';
import { useChatOutbox } from '@repo/community/hooks/useChatOutbox';
import { type ChatComposerAccess, ChatInput } from '@repo/community/screens/chatPresentation';
import { setActiveAccountId } from '@repo/core/lib/accountScope';
import { useMutationQueue } from '@repo/core/lib/sync/useMutationQueue';
import { useTemporalStore } from '@repo/core/store/useTemporalStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const memory = vi.hoisted(() => {
  const values = new Map<string, string>();
  return {
    values,
    read: vi.fn(async (key: string) => values.get(key)),
    write: vi.fn(async (key: string, value: string) => {
      values.set(key, value);
    }),
    append: vi.fn(async (key: string, value: string) => {
      values.set(key, value);
    }),
  };
});
vi.mock('@repo/core/lib/storage', () => ({
  storage: { getStringAsync: memory.read, setAsync: memory.write },
}));
vi.mock('@repo/core/lib/storageWrapper', () => ({
  SafeZustandStorage: {
    getItem: async (key: string) => memory.values.get(key) ?? null,
    setItem: memory.append,
    removeItem: async (key: string) => {
      memory.values.delete(key);
    },
  },
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@repo/ui/primitives', async () => {
  const { createElement } = await import('react');
  const container = ({ children }: { children?: ReactNode }) =>
    createElement('div', null, children);
  return {
    Box: container,
    HStack: container,
    VStack: container,
    AnimatedView: container,
    Icon: () => null,
    Text: ({ children }: { children?: ReactNode }) => createElement('span', null, children),
    Pressable: ({
      children,
      onPress,
      accessibilityLabel,
    }: {
      children?: ReactNode;
      onPress?: () => void;
      accessibilityLabel?: string;
    }) => createElement('button', { onClick: onPress, 'aria-label': accessibilityLabel }, children),
  };
});
vi.mock('@repo/ui/components/ChatComposer', async () => {
  const { createElement } = await import('react');
  return {
    ChatComposer: (props: {
      value: string;
      onChangeText: (text: string) => void;
      onSend: () => void;
      isSending: boolean;
    }) =>
      createElement(
        'div',
        null,
        createElement('input', {
          'aria-label': 'Message',
          value: props.value,
          onChange: (event: { target: { value: string } }) =>
            props.onChangeText(event.target.value),
        }),
        createElement('button', { disabled: props.isSending, onClick: props.onSend }, 'Send'),
      ),
  };
});
vi.mock('@repo/ui/components/BrandPulse', () => ({ BrandPulse: () => null }));
vi.mock('@repo/ui/components/ErrorState', () => ({ ErrorState: () => null }));
vi.mock('@repo/ui/components/SanctuaryLegendList', () => ({ SanctuaryLegendList: () => null }));
vi.mock('@repo/ui/components/UserAvatar', () => ({ UserAvatar: () => null }));
vi.mock('@repo/ui/icons', () => ({ MessageSquare: () => null }));

const accountA = '123e4567-e89b-8101-8000-426614174000';
const accountB = '123e4567-e89b-8101-8000-426614174009';
const channel = { kind: 'group' as const, id: '123e4567-e89b-8101-8000-426614174002' };
const viewDate = '2026-10-26';
const message = {
  id: 'message-1',
  author_id: accountA,
  content: 'Saved history',
  created_at: new Date('2026-10-26T08:00:00Z'),
};
const historyKey = chatHistoryQueryKey(accountA, channel, viewDate);
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((done, fail) => {
    resolve = done;
    reject = fail;
  });
  return { promise, resolve, reject };
}
function mountClient() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return {
    client,
    wrapper: ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client }, children),
  };
}

describe('chat state with mounted React and substituted storage/network', () => {
  beforeEach(async () => {
    memory.values.clear();
    memory.read.mockReset().mockImplementation(async (key: string) => memory.values.get(key));
    memory.write.mockReset().mockImplementation(async (key: string, value: string) => {
      memory.values.set(key, value);
    });
    memory.append.mockReset().mockImplementation(async (key: string, value: string) => {
      memory.values.set(key, value);
    });
    await useMutationQueue.persist.rehydrate();
    useMutationQueue.getState().clearQueue();
    useMutationQueue.getState().clearDeadLetterQueue();
    useTemporalStore.setState({ readPolicy: 'live' });
    setActiveAccountId(accountA);
  });

  it('restores qualified history after remount without making an offline request', async () => {
    const fetchMessages = vi.fn(async () => [message]);
    const firstClient = mountClient();
    const first = renderHook(
      () =>
        useChatMessages({
          principalId: accountA,
          channel,
          viewDate,
          remoteEnabled: true,
          fetchMessages,
        }),
      firstClient,
    );
    await waitFor(() => expect(first.result.current.data?.[0]?.content).toBe(message.content));
    await waitFor(() => expect(memory.write).toHaveBeenCalled());
    first.unmount();
    firstClient.client.clear();
    const offlineClient = mountClient();
    const offlineFetch = vi.fn(async () => [message]);
    const restored = renderHook(
      () =>
        useChatMessages({
          principalId: accountA,
          channel,
          viewDate,
          remoteEnabled: false,
          fetchMessages: offlineFetch,
        }),
      offlineClient,
    );
    await waitFor(() => expect(restored.result.current.isLoading).toBe(false));
    expect(restored.result.current.data?.[0]?.created_at).toEqual(message.created_at);
    expect(offlineFetch).not.toHaveBeenCalled();
    restored.unmount();
    offlineClient.client.clear();
  });

  it('does not let delayed cache hydration replace a newer remote result', async () => {
    const cacheRead = deferred<string | undefined>();
    memory.read.mockReturnValue(cacheRead.promise);
    const mountedClient = mountClient();
    const view = renderHook(
      () =>
        useChatMessages({
          principalId: accountA,
          channel,
          viewDate,
          remoteEnabled: true,
          fetchMessages: async () => [{ ...message, content: 'New remote result' }],
        }),
      mountedClient,
    );
    await waitFor(() => expect(view.result.current.data?.[0]?.content).toBe('New remote result'));
    await act(async () => {
      cacheRead.resolve(JSON.stringify({ savedAt: 1, data: [message] }));
    });
    await waitFor(() => expect(view.result.current.isLoading).toBe(false));
    expect(view.result.current.data?.[0]?.content).toBe('New remote result');
    view.unmount();
    mountedClient.client.clear();
  });

  it('rejects an old response across A to B to A and never adopts another account cache', async () => {
    const remote = deferred<(typeof message)[]>();
    const mountedClient = mountClient();
    const fetchMessages = vi.fn(() => remote.promise);
    const view = renderHook(
      ({ principalId, enabled }) =>
        useChatMessages({ principalId, channel, viewDate, remoteEnabled: enabled, fetchMessages }),
      { ...mountedClient, initialProps: { principalId: accountA, enabled: true } },
    );
    await waitFor(() => expect(fetchMessages).toHaveBeenCalledTimes(1));
    act(() => {
      setActiveAccountId(accountB);
      view.rerender({ principalId: accountB, enabled: false });
    });
    await waitFor(() => expect(view.result.current.isLoading).toBe(false));
    expect(view.result.current.data).toBeUndefined();
    act(() => {
      setActiveAccountId(accountA);
      view.rerender({ principalId: accountA, enabled: false });
    });
    await act(async () => {
      remote.resolve([message]);
    });
    await waitFor(() => expect(view.result.current.isLoading).toBe(false));
    expect(view.result.current.data).toBeUndefined();
    expect(mountedClient.client.getQueryData(historyKey)).toBeUndefined();
    view.unmount();
    mountedClient.client.clear();
  });

  it('publishes a queued message only after durable acceptance and reuses failed admission identity', async () => {
    const write = deferred<void>();
    memory.append.mockImplementationOnce(() => write.promise);
    const mountedClient = mountClient();
    const view = renderHook(() => useChatOutbox(accountA, channel), mountedClient);
    let pending: Promise<string> | undefined;
    act(() => {
      pending = view.result.current.submit('Keep the draft');
    });
    await waitFor(() => expect(view.result.current.admission.isPending).toBe(true));
    await waitFor(() => expect(useMutationQueue.getState().queue).toHaveLength(1));
    expect(view.result.current.pending).toHaveLength(0);
    await act(async () => {
      write.reject(new Error('storage unavailable'));
      await expect(pending).rejects.toThrow('storage unavailable');
    });
    const original = useMutationQueue.getState().queue[0]?.operationId;
    await act(async () => {
      await view.result.current.submit('Keep the draft');
    });
    expect(useMutationQueue.getState().queue).toHaveLength(1);
    expect(view.result.current.pending).toHaveLength(1);
    expect(view.result.current.pending[0]?.operationId).toBe(original);
    view.unmount();
    mountedClient.client.clear();
  });

  it('keeps the composer draft through failed storage and clears it only after the retry acknowledgement', async () => {
    const firstWrite = deferred<void>();
    const retryWrite = deferred<void>();
    memory.append
      .mockImplementationOnce(() => firstWrite.promise)
      .mockImplementationOnce(() => retryWrite.promise);
    const mountedClient = mountClient();
    function Composer() {
      const outbox = useChatOutbox(accountA, channel);
      return createElement(ChatInput, {
        outbox,
        access: { kind: 'editable' },
        onTyping: () => undefined,
        typingUsers: [],
      });
    }
    const view = render(createElement(Composer), mountedClient);
    const input = view.getByRole('textbox', { name: 'Message' });
    fireEvent.change(input, { target: { value: 'Keep my work' } });
    fireEvent.click(view.getByRole('button', { name: 'Send' }));
    await waitFor(() => expect(useMutationQueue.getState().queue).toHaveLength(1));
    const original = useMutationQueue.getState().queue[0]?.operationId;
    expect(input).toHaveProperty('value', 'Keep my work');
    await act(async () => {
      firstWrite.reject(new Error('storage unavailable'));
    });
    await waitFor(() =>
      expect(view.getByText('Message could not be sent or queued.')).toBeDefined(),
    );
    expect(input).toHaveProperty('value', 'Keep my work');
    fireEvent.click(view.getByRole('button', { name: 'Send' }));
    await waitFor(() =>
      expect(view.getByRole('button', { name: 'Send' })).toHaveProperty('disabled', true),
    );
    expect(input).toHaveProperty('value', 'Keep my work');
    await act(async () => {
      retryWrite.resolve();
    });
    await waitFor(() => expect(input).toHaveProperty('value', ''));
    expect(useMutationQueue.getState().queue).toHaveLength(1);
    expect(useMutationQueue.getState().queue[0]?.operationId).toBe(original);
    view.unmount();
    mountedClient.client.clear();
  });

  it('keeps historical and blocked conversation guards in the real composer tree', () => {
    const mountedClient = mountClient();
    function Composer({ access }: { access: ChatComposerAccess }) {
      const outbox = useChatOutbox(accountA, channel);
      return createElement(ChatInput, {
        outbox,
        access,
        onTyping: () => undefined,
        typingUsers: [],
      });
    }
    const view = render(createElement(Composer, { access: { kind: 'history' } }), mountedClient);
    expect(view.queryByRole('textbox')).toBeNull();
    expect(view.getByText('chat.historicalView')).toBeDefined();
    view.rerender(
      createElement(Composer, { access: { kind: 'blocked', message: 'Conversation paused' } }),
    );
    expect(view.queryByRole('textbox')).toBeNull();
    expect(view.getByText('Conversation paused')).toBeDefined();
    expect(useMutationQueue.getState().queue).toHaveLength(0);
    view.unmount();
    mountedClient.client.clear();
  });
});
