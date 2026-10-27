import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getLayout: vi.fn(),
  upsertWorkspaceLayout: vi.fn(),
  getItem: vi.fn(),
  setItem: vi.fn(),
  setStorageItemDurably: vi.fn(),
  patchWorkspaceLayout: vi.fn(),
  addToQueue: vi.fn(),
}));

vi.mock('react-native', () => ({
  Platform: { OS: 'ios' },
  useWindowDimensions: () => ({ width: 390, height: 844 }),
}));

vi.mock('@repo/core/api/workspaceLayout', () => ({
  workspaceLayoutAPI: {
    getWorkspaceLayout: mocks.getLayout,
    upsertWorkspaceLayout: mocks.upsertWorkspaceLayout,
  },
}));

vi.mock('@repo/core/api/orpcClient', () => ({
  orpcClient: { sync: { patchWorkspaceLayout: mocks.patchWorkspaceLayout } },
}));

vi.mock('@repo/core/lib/storageWrapper', () => ({
  SafeZustandStorage: { getItem: mocks.getItem, setItem: mocks.setItem, removeItem: vi.fn() },
  setStorageItemDurably: mocks.setStorageItemDurably,
}));
vi.mock('@repo/core/lib/storage', () => ({
  storage: { setAsync: mocks.setStorageItemDurably },
}));

vi.mock('@repo/core/lib/sync/useMutationQueue', () => ({
  useMutationQueue: (selector: (state: { addToQueue: typeof mocks.addToQueue }) => unknown) =>
    selector({ addToQueue: mocks.addToQueue }),
}));

import { useWorkspaceLayoutSync } from '@repo/core/native/useWorkspaceLayoutSync';

const userId = '11111111-1111-4111-8111-111111111111';
const surfaces: [] = [];

function remoteLayout() {
  return {
    id: 'layout-row',
    user_id: userId,
    workspace_id: 'self',
    layout_target: 'mobile' as const,
    order: ['journal'],
    hidden: [],
    pinned: [],
    zone_by_surface: { journal: 'today' },
    is_default: false,
    surface_metadata: {
      __workspaceAppearance: { preset: 'default', motion: 'off' },
      __workspaceGroupOrder: ['wellbeing'],
    },
    layout_version: 2,
    revision: 4,
    last_operation_id: null,
    created_at: '2026-10-10T00:00:00.000Z',
    updated_at: '2026-10-10T00:00:00.000Z',
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((done, fail) => {
    resolve = done;
    reject = fail;
  });
  return { promise, resolve, reject };
}

describe('native workspace layout sync lifecycle', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    });
    mocks.getItem.mockResolvedValue(null);
    mocks.setItem.mockResolvedValue(undefined);
    mocks.setStorageItemDurably.mockResolvedValue(undefined);
    mocks.getLayout.mockResolvedValue(null);
    mocks.upsertWorkspaceLayout.mockResolvedValue(remoteLayout());
    mocks.patchWorkspaceLayout.mockImplementation(({ body }: { body: { operationId: string } }) =>
      Promise.resolve({ status: 'completed', operationId: body.operationId, serverRevision: 5 }),
    );
    mocks.addToQueue.mockResolvedValue(undefined);
  });

  afterEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('adopts initial pins into one local durable owner and toggles from the current session value', async () => {
    const pinSurfaces = ['journal', 'mood'].map((surfaceId, defaultOrder) => ({
      surfaceId,
      workspaceId: 'self',
      capabilityKey: surfaceId,
      ownerPackage: 'core' as const,
      defaultZone: 'work' as const,
      defaultOrder,
    }));
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children);
    const view = renderHook(
      () =>
        useWorkspaceLayoutSync({
          workspaceId: 'self',
          userId,
          surfaces: pinSurfaces,
          initialPinnedSurfaceIds: pinSurfaces.map((surface) => surface.surfaceId),
          enableRemoteSync: false,
        }),
      { wrapper },
    );
    await waitFor(() => expect(view.result.current.isHydrated).toBe(true));
    act(() => view.result.current.toggleSurfacePinned('journal'));
    expect(view.result.current.layout?.pinned).toEqual(['mood']);
    expect(view.result.current.layout?.isDefault).toBe(false);
    await waitFor(() => expect(mocks.setItem).toHaveBeenCalled());
    expect(JSON.parse(mocks.setItem.mock.calls.at(-1)![1]).pinned).toEqual(['mood']);
    const toggle = view.result.current.toggleSurfacePinned;
    act(() => {
      toggle('mood');
      toggle('mood');
    });
    expect(view.result.current.layout?.pinned).toEqual(['mood']);
    expect(mocks.patchWorkspaceLayout).not.toHaveBeenCalled();
  });

  it('does not seed legacy pins over a saved remote empty layout with a historical default flag', async () => {
    mocks.getLayout.mockResolvedValue({ ...remoteLayout(), is_default: true });
    const pinSurfaces = ['journal', 'mood'].map((surfaceId, defaultOrder) => ({
      surfaceId,
      workspaceId: 'self',
      capabilityKey: surfaceId,
      ownerPackage: 'core' as const,
      defaultZone: 'work' as const,
      defaultOrder,
    }));
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children);
    const view = renderHook(
      () =>
        useWorkspaceLayoutSync({
          workspaceId: 'self',
          userId,
          surfaces: pinSurfaces,
          initialPinnedSurfaceIds: pinSurfaces.map((surface) => surface.surfaceId),
        }),
      { wrapper },
    );
    await waitFor(() => expect(view.result.current.isInitialLayout).toBe(false));
    expect(view.result.current.layout?.pinned).toEqual([]);
    act(() => view.result.current.toggleSurfacePinned('mood'));
    expect(view.result.current.layout?.pinned).toEqual(['mood']);
  });

  it('retains every other legacy pin when removing one from an initial set above the new cap', async () => {
    const pinSurfaces = ['journal', 'mood', 'sleep'].map((surfaceId, defaultOrder) => ({
      surfaceId,
      workspaceId: 'self',
      capabilityKey: surfaceId,
      ownerPackage: 'core' as const,
      defaultZone: 'work' as const,
      defaultOrder,
    }));
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children);
    const view = renderHook(
      () =>
        useWorkspaceLayoutSync({
          workspaceId: 'self',
          userId,
          surfaces: pinSurfaces,
          initialPinnedSurfaceIds: pinSurfaces.map((surface) => surface.surfaceId),
          enableRemoteSync: false,
        }),
      { wrapper },
    );
    await waitFor(() => expect(view.result.current.isHydrated).toBe(true));
    act(() => view.result.current.toggleSurfacePinned('journal'));
    expect(view.result.current.layout?.pinned).toEqual(['mood', 'sleep']);
  });

  it('does not resurrect initial pins after the final customized pin is removed and restored', async () => {
    const pinSurfaces = (['journal', 'mood'] as const).map((surfaceId, defaultOrder) => ({
      surfaceId,
      workspaceId: 'self',
      capabilityKey: surfaceId,
      ownerPackage: 'core' as const,
      defaultZone: 'work' as const,
      defaultOrder,
    }));
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children);
    const view = renderHook(
      () =>
        useWorkspaceLayoutSync<'journal' | 'mood'>({
          workspaceId: 'self',
          userId,
          surfaces: pinSurfaces,
          initialPinnedSurfaceIds: ['journal'],
          enableRemoteSync: false,
        }),
      { wrapper },
    );
    await waitFor(() => expect(view.result.current.isHydrated).toBe(true));
    act(() => view.result.current.toggleSurfacePinned('journal'));
    expect(view.result.current.layout?.pinned).toEqual([]);
    await waitFor(() => expect(mocks.setItem).toHaveBeenCalled());
    const saved = mocks.setItem.mock.calls.at(-1)![1] as string;
    view.unmount();
    mocks.getItem.mockImplementation(async (key: string) =>
      key.startsWith('workspace-layout-intent:') ? null : saved,
    );
    const restored = renderHook(
      () =>
        useWorkspaceLayoutSync<'journal' | 'mood'>({
          workspaceId: 'self',
          userId,
          surfaces: pinSurfaces,
          initialPinnedSurfaceIds: ['journal'],
          enableRemoteSync: false,
        }),
      { wrapper },
    );
    await waitFor(() => expect(restored.result.current.isHydrated).toBe(true));
    expect(restored.result.current.layout?.pinned).toEqual([]);
    act(() => restored.result.current.toggleSurfacePinned('mood'));
    expect(restored.result.current.layout?.pinned).toEqual(['mood']);
  });

  it('retains a local appearance edit made while the target read is pending', async () => {
    const targetRead = deferred<ReturnType<typeof remoteLayout> | null>();
    mocks.getLayout.mockImplementation((_userId: string, _workspaceId: string, target: string) =>
      target === 'mobile' ? targetRead.promise : Promise.resolve(null),
    );

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children);
    const { result } = renderHook(
      () =>
        useWorkspaceLayoutSync({
          workspaceId: 'self',
          userId,
          surfaces,
          platform: 'native',
          screenClass: 'compact',
        }),
      { wrapper },
    );

    act(() => result.current.setAppearance({ preset: 'night', motion: 'off' }));
    targetRead.resolve(remoteLayout());
    await waitFor(() => expect(result.current.isHydrated).toBe(true));
    expect(result.current.layout?.appearance?.preset).toBe('night');

    await act(async () => {
      await result.current.reapplyLocalChanges();
    });

    expect(mocks.patchWorkspaceLayout).toHaveBeenCalledTimes(1);
    expect(
      mocks.patchWorkspaceLayout.mock.calls[0]?.[0].body.changes.appearance?.value,
    ).toMatchObject({
      preset: 'night',
      motion: 'off',
    });
    await waitFor(() => expect(mocks.setItem).toHaveBeenCalled());
    expect(
      mocks.setItem.mock.calls.some(([, value]) => {
        const parsed: unknown = JSON.parse(value);
        return (
          typeof parsed === 'object' &&
          parsed !== null &&
          'appearance' in parsed &&
          typeof parsed.appearance === 'object' &&
          parsed.appearance !== null &&
          'preset' in parsed.appearance &&
          parsed.appearance.preset === 'night'
        );
      }),
    ).toBe(true);
  });

  it('reapplies a newer local cache only for groups that differ from the remote layout', async () => {
    mocks.getItem.mockImplementation(async (key: string) =>
      key.startsWith('workspace-layout:')
        ? JSON.stringify({
            workspaceId: 'self',
            userId,
            order: ['journal'],
            hidden: [],
            pinned: [],
            zoneBySurface: { journal: 'today' },
            groupOrder: ['wellbeing'],
            isDefault: false,
            surfaceMetadata: {
              __workspaceAppearance: { preset: 'night', motion: 'off' },
              __workspaceGroupOrder: ['wellbeing'],
            },
            appearance: { preset: 'night', motion: 'off' },
            revision: 4,
            updatedAt: '2026-10-11T00:00:00.000Z',
          })
        : null,
    );
    mocks.getLayout.mockResolvedValue(remoteLayout());

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children);
    const { result } = renderHook(
      () =>
        useWorkspaceLayoutSync({
          workspaceId: 'self',
          userId,
          surfaces,
          platform: 'native',
          screenClass: 'compact',
        }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isHydrated).toBe(true));
    await waitFor(() => expect(mocks.patchWorkspaceLayout).toHaveBeenCalledTimes(1), {
      timeout: 3_000,
    });

    const changes = mocks.patchWorkspaceLayout.mock.calls[0]?.[0].body.changes;
    expect(changes).toHaveProperty('appearance');
    expect(changes).not.toHaveProperty('arrangement');
    expect(changes).not.toHaveProperty('groups');
  });

  it('persists a second group edit made while the first patch is in flight', async () => {
    const firstPatch = deferred<{
      status: 'completed';
      operationId: string;
      serverRevision: number;
    }>();
    mocks.getLayout.mockResolvedValue(remoteLayout());
    mocks.patchWorkspaceLayout
      .mockImplementationOnce(() => firstPatch.promise)
      .mockImplementationOnce(({ body }: { body: { operationId: string } }) =>
        Promise.resolve({
          status: 'completed',
          operationId: body.operationId,
          serverRevision: 6,
        }),
      );

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children);
    const { result } = renderHook(
      () =>
        useWorkspaceLayoutSync({
          workspaceId: 'self',
          userId,
          surfaces,
          platform: 'native',
          screenClass: 'compact',
        }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.isHydrated).toBe(true));

    act(() => result.current.setAppearance({ preset: 'night', motion: 'off' }));
    await waitFor(() => expect(mocks.patchWorkspaceLayout).toHaveBeenCalledTimes(1), {
      timeout: 3_000,
    });
    const firstOperationId = mocks.patchWorkspaceLayout.mock.calls[0]?.[0].body.operationId;

    act(() => result.current.setGroupOrder(['wellbeing', 'research']));
    await act(async () => {
      firstPatch.resolve({
        status: 'completed',
        operationId: firstOperationId,
        serverRevision: 5,
      });
      await firstPatch.promise;
    });

    await waitFor(() => expect(mocks.patchWorkspaceLayout).toHaveBeenCalledTimes(2), {
      timeout: 3_000,
    });
    const secondPatchBody = mocks.patchWorkspaceLayout.mock.calls[1]?.[0].body;
    expect(secondPatchBody?.baseRevision).toBe(5);
    expect(secondPatchBody?.changes.groups?.value).toEqual(['wellbeing', 'research']);
  }, 10_000);

  it('waits for outbox acceptance after retries and keeps a trailing edit locally durable', async () => {
    const firstAttempt = deferred<{
      status: 'completed';
      operationId: string;
      serverRevision: number;
    }>();
    const queueWrite = deferred<void>();
    mocks.getLayout.mockResolvedValue(remoteLayout());
    mocks.patchWorkspaceLayout
      .mockImplementationOnce(() => firstAttempt.promise)
      .mockRejectedValue(new TypeError('network unavailable'));
    mocks.addToQueue.mockReturnValue(queueWrite.promise);
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children);
    const { result } = renderHook(
      () =>
        useWorkspaceLayoutSync({
          workspaceId: 'self',
          userId,
          surfaces,
          platform: 'native',
          screenClass: 'compact',
        }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.isHydrated).toBe(true));

    act(() => result.current.setAppearance({ preset: 'night', motion: 'off' }));
    await waitFor(() => expect(mocks.patchWorkspaceLayout).toHaveBeenCalledTimes(1), {
      timeout: 3_000,
    });
    act(() => result.current.setGroupOrder(['wellbeing', 'research']));
    await new Promise((resolve) => setTimeout(resolve, 1_250));
    expect(mocks.patchWorkspaceLayout).toHaveBeenCalledTimes(1);

    act(() => firstAttempt.reject(new TypeError('network unavailable')));
    await waitFor(() => expect(mocks.addToQueue).toHaveBeenCalledTimes(1), {
      timeout: 3_000,
    });
    expect(mocks.patchWorkspaceLayout).toHaveBeenCalledTimes(4);
    expect(result.current.isSyncing).toBe(true);
    expect(result.current.syncError).toBeNull();

    await act(async () => {
      queueWrite.resolve(undefined);
      await queueWrite.promise;
    });
    await waitFor(() => expect(result.current.syncError).toBeInstanceOf(Error));
    expect(mocks.addToQueue.mock.calls[0]?.[0].variables.input.changes).toHaveProperty(
      'appearance',
    );
    expect(mocks.addToQueue.mock.calls[0]?.[0].variables.input.changes).not.toHaveProperty(
      'groups',
    );

    await waitFor(() => expect(mocks.setItem).toHaveBeenCalled());
    expect(
      mocks.setItem.mock.calls.some(([, value]) => {
        const parsed: unknown = JSON.parse(value);
        return (
          typeof parsed === 'object' &&
          parsed !== null &&
          'groupOrder' in parsed &&
          Array.isArray(parsed.groupOrder) &&
          parsed.groupOrder.includes('research')
        );
      }),
    ).toBe(true);
  }, 10_000);

  it('surfaces failure when a retryable patch cannot enter the outbox', async () => {
    mocks.getLayout.mockResolvedValue(remoteLayout());
    mocks.patchWorkspaceLayout.mockRejectedValue(new TypeError('network unavailable'));
    mocks.addToQueue.mockRejectedValue(new Error('offline queue unavailable'));
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children);
    const { result } = renderHook(
      () =>
        useWorkspaceLayoutSync({
          workspaceId: 'self',
          userId,
          surfaces,
          platform: 'native',
          screenClass: 'compact',
        }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.isHydrated).toBe(true));

    act(() => result.current.setAppearance({ preset: 'night', motion: 'off' }));
    await waitFor(
      () => expect(result.current.syncError?.message).toBe('offline queue unavailable'),
      { timeout: 5_000 },
    );
    expect(mocks.patchWorkspaceLayout).toHaveBeenCalledTimes(4);
    expect(mocks.addToQueue).toHaveBeenCalledTimes(1);
  }, 10_000);

  it('reuses the acknowledged pending patch after a response-loss remount', async () => {
    let intentRecord: string | null = null;
    mocks.setStorageItemDurably.mockImplementation(async (_key: string, value: string) => {
      const parsed = JSON.parse(value) as { pendingPatch?: unknown };
      if (parsed.pendingPatch) intentRecord = value;
    });
    mocks.getLayout.mockResolvedValue(remoteLayout());
    mocks.patchWorkspaceLayout.mockRejectedValue(new TypeError('response lost'));

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children);
    const first = renderHook(
      () =>
        useWorkspaceLayoutSync({
          workspaceId: 'self',
          userId,
          surfaces,
          platform: 'native',
          screenClass: 'compact',
        }),
      { wrapper },
    );
    await waitFor(() => expect(first.result.current.isHydrated).toBe(true));
    act(() => first.result.current.setAppearance({ preset: 'night', motion: 'off' }));
    await waitFor(() => expect(intentRecord).not.toBeNull(), { timeout: 5_000 });
    const pending = JSON.parse(intentRecord!) as { pendingPatch: { operationId: string } };

    first.unmount();
    mocks.getItem.mockImplementation(async (key: string) =>
      key.startsWith('workspace-layout-intent:') ? intentRecord : null,
    );
    mocks.patchWorkspaceLayout.mockImplementation(({ body }: { body: { operationId: string } }) =>
      Promise.resolve({ status: 'completed', operationId: body.operationId, serverRevision: 5 }),
    );

    const second = renderHook(
      () =>
        useWorkspaceLayoutSync({
          workspaceId: 'self',
          userId,
          surfaces,
          platform: 'native',
          screenClass: 'compact',
        }),
      { wrapper },
    );
    await waitFor(() => expect(second.result.current.isHydrated).toBe(true));
    await waitFor(() => expect(mocks.patchWorkspaceLayout).toHaveBeenCalled(), {
      timeout: 5_000,
    });
    expect(mocks.patchWorkspaceLayout.mock.calls.at(-1)?.[0].body.operationId).toBe(
      pending.pendingPatch.operationId,
    );
  }, 15_000);

  it('does not dispatch when the acknowledged intent write fails', async () => {
    mocks.getLayout.mockResolvedValue(remoteLayout());
    mocks.setStorageItemDurably.mockRejectedValue(new Error('storage quota exceeded'));

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children);
    const { result } = renderHook(
      () =>
        useWorkspaceLayoutSync({
          workspaceId: 'self',
          userId,
          surfaces,
          platform: 'native',
          screenClass: 'compact',
        }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.isHydrated).toBe(true));
    mocks.patchWorkspaceLayout.mockClear();
    act(() => result.current.setAppearance({ preset: 'night', motion: 'off' }));
    await waitFor(() => expect(result.current.syncError?.message).toBe('storage quota exceeded'), {
      timeout: 5_000,
    });
    expect(mocks.patchWorkspaceLayout).not.toHaveBeenCalled();
  }, 10_000);
});
