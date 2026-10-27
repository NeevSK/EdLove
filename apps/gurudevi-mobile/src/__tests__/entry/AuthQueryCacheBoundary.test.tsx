import { scopedQueryKey } from '@repo/core/lib/clientStateFoundation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  subjectId: 'credential-a',
  token: 'token-a',
  startEventsReceiver: vi.fn((_options: { getAuthToken: () => string }) => vi.fn()),
  setupHermesMemoryShield: vi.fn(() => vi.fn()),
}));
const { accountStore } = await vi.hoisted(async () => {
  const { createStore } = await import('zustand/vanilla');
  return {
    accountStore: createStore<{ user: { id: string } | null }>(() => ({
      user: { id: 'account-a' },
    })),
  };
});
vi.mock('@repo/core', () => ({
  useAuth: () => ({
    session: mocks.subjectId ? { user: { id: mocks.subjectId }, access_token: mocks.token } : null,
  }),
}));
vi.mock('@repo/core/store/useAuthStore', () => ({ useAuthStore: accountStore }));
vi.mock('@repo/core/api/eventsReceiver', () => ({
  startEventsReceiver: mocks.startEventsReceiver,
}));
vi.mock('@repo/core/efficiency', () => ({
  setupHermesMemoryShield: mocks.setupHermesMemoryShield,
}));
vi.mock('@repo/core/logic/runtimeRegistry', () => ({
  coreRuntime: { device: { getTotalMemory: () => null } },
}));
vi.mock('react-native', () => ({
  AppState: { addEventListener: vi.fn(() => ({ remove: vi.fn() })) },
}));

import { AuthQueryCacheBoundary } from '@/entry/AuthQueryCacheBoundary';

let client: QueryClient;
const accountKey = (principalId: string) => scopedQueryKey({ principalId }, ['profile']);
function mount() {
  return render(
    <QueryClientProvider client={client}>
      <AuthQueryCacheBoundary />
    </QueryClientProvider>,
  );
}
beforeEach(() => {
  vi.clearAllMocks();
  accountStore.setState({ user: { id: 'account-a' } });
  mocks.subjectId = 'credential-a';
  mocks.token = 'token-a';
  client = new QueryClient();
  client.setQueryData(accountKey('account-a'), 'A');
  client.setQueryData(accountKey('account-b'), 'B');
});
afterEach(() => {
  cleanup();
  client.clear();
});

describe('canonical account Query boundary', () => {
  it('isolates rapid A to B to A transitions without removing the replacement A query', async () => {
    mount();
    act(() => {
      accountStore.setState({ user: { id: 'account-b' } });
      accountStore.setState({ user: { id: 'account-a' } });
      client.setQueryData(accountKey('account-a'), 'replacement A');
    });
    await Promise.resolve();
    expect(client.getQueryData(accountKey('account-a'))).toBe('replacement A');
    expect(client.getQueryData(accountKey('account-b'))).toBeUndefined();
  });

  it('preserves first-mount data and removes the outgoing account rather than its credential subject', async () => {
    mount();
    expect(client.getQueryData(accountKey('account-a'))).toBe('A');
    const mutation = client
      .getMutationCache()
      .build(client, { mutationKey: ['outbox', 'account-a'] });
    act(() => accountStore.setState({ user: { id: 'account-b' } }));
    await waitFor(() => expect(client.getQueryData(accountKey('account-a'))).toBeUndefined());
    expect(client.getQueryData(accountKey('account-b'))).toBe('B');
    expect(client.getMutationCache().getAll()).toContain(mutation);
  });
  it('disposes the outgoing canonical namespace after sign-out', async () => {
    mount();
    act(() => accountStore.setState({ user: null }));
    await waitFor(() => expect(client.getQueryData(accountKey('account-a'))).toBeUndefined());
    expect(client.getQueryData(accountKey('account-b'))).toBe('B');
  });
  it('preserves account data when credentials rotate and restarts only the credential-owned stream', () => {
    const view = mount();
    mocks.subjectId = 'credential-a-rebound';
    mocks.token = 'new-token';
    view.rerender(
      <QueryClientProvider client={client}>
        <AuthQueryCacheBoundary />
      </QueryClientProvider>,
    );
    expect(client.getQueryData(accountKey('account-a'))).toBe('A');
    expect(mocks.startEventsReceiver).toHaveBeenCalledTimes(2);
    expect(mocks.startEventsReceiver.mock.calls[1]?.[0].getAuthToken()).toBe('new-token');
  });
  it('does not dispose for a same-account profile update and releases its subscription on unmount', async () => {
    const view = mount();
    act(() => accountStore.setState({ user: { id: 'account-a' } }));
    expect(client.getQueryData(accountKey('account-a'))).toBe('A');
    view.unmount();
    act(() => accountStore.setState({ user: null }));
    await Promise.resolve();
    expect(client.getQueryData(accountKey('account-a'))).toBe('A');
  });
});
