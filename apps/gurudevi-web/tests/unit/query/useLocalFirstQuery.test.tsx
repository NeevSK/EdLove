import { useLocalFirstQuery } from '@repo/core/hooks/useLocalFirstQuery';
import { SafeZustandStorage } from '@repo/core/storage-wrapper';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { useTemporalStore } from '@repo/core/store/useTemporalStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const wrapper = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
};

const storageKey = (query: string, user: string) =>
  `${query}:${user}:${useTemporalStore.getState().viewDate}`;

// A signed-in account: only signed-in identities fetch (a guest is local-only).
beforeEach(() => {
  useAuthStore.setState({
    user: { id: 'u1', email: 'teacher@example.test', is_anonymous: false, citizenship: 'CITIZEN' },
  } as Partial<ReturnType<typeof useAuthStore.getState>>);
});

describe('G3 useLocalFirstQuery on TanStack Query', () => {
  it('shows the stored copy at once, then the remote result, and saves it', async () => {
    await SafeZustandStorage.setItem(storageKey('notes', 'u1'), JSON.stringify(['stored']));
    let resolve: (value: string[]) => void = () => {};
    const fetcher = vi.fn(() => new Promise<string[]>((r) => (resolve = r)));

    const { result } = renderHook(
      () => useLocalFirstQuery({ queryKey: 'notes', userId: 'u1', fetcher }),
      { wrapper: wrapper() },
    );
    await waitFor(() => expect(result.current.data).toEqual(['stored']));
    expect(fetcher).toHaveBeenCalledWith('u1', expect.any(String));

    await act(async () => resolve(['remote']));
    await waitFor(() => expect(result.current.data).toEqual(['remote']));
    expect(JSON.parse((await SafeZustandStorage.getItem(storageKey('notes', 'u1'))) ?? 'null')).toEqual(['remote']);
  });

  it('keeps the stored copy when the remote has nothing or fails', async () => {
    await SafeZustandStorage.setItem(storageKey('empty', 'u2'), JSON.stringify(['kept']));
    const { result } = renderHook(
      () => useLocalFirstQuery({ queryKey: 'empty', userId: 'u2', fetcher: async () => null }),
      { wrapper: wrapper() },
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await waitFor(() => expect(result.current.data).toEqual(['kept']));

    await SafeZustandStorage.setItem(storageKey('failing', 'u2'), JSON.stringify(['kept too']));
    const failing = renderHook(
      () =>
        useLocalFirstQuery({
          queryKey: 'failing',
          userId: 'u2',
          fetcher: async () => {
            throw new Error('offline-ish');
          },
        }),
      { wrapper: wrapper() },
    );
    await waitFor(() => expect(failing.result.current.isOffline).toBe(true));
    expect(failing.result.current.data).toEqual(['kept too']);
  });

  it('writes through setData to the cache and the device', async () => {
    const { result } = renderHook(
      () => useLocalFirstQuery<string[]>({ queryKey: 'drafts', userId: 'u3', fetcher: async () => null }),
      { wrapper: wrapper() },
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.setData((previous) => [...(previous ?? []), 'draft']));
    await waitFor(() => expect(result.current.data).toEqual(['draft']));
    expect(JSON.parse((await SafeZustandStorage.getItem(storageKey('drafts', 'u3'))) ?? 'null')).toEqual(['draft']);
  });
});

describe('G3 useLocalFirstQuery for a guest', () => {
  it('reads the guest resolver and never calls the fetcher', async () => {
    useAuthStore.setState({ user: null } as Partial<ReturnType<typeof useAuthStore.getState>>);
    const fetcher = vi.fn(async () => ['cloud']);
    const { result } = renderHook(
      () => useLocalFirstQuery({ queryKey: 'guest', fetcher, guestResolver: () => ['on device'] }),
      { wrapper: wrapper() },
    );
    await waitFor(() => expect(result.current.data).toEqual(['on device']));
    expect(result.current.isAnonymous).toBe(true);
    expect(fetcher).not.toHaveBeenCalled();
  });
});
