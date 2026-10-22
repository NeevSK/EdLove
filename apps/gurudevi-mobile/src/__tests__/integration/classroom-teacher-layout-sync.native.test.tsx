import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi, waitFor } from 'vitest';

const mocks = vi.hoisted(() => ({
  getLayout: vi.fn(),
  getItem: vi.fn(),
  setStorageItemDurably: vi.fn(),
  patchWorkspaceLayout: vi.fn(),
  addToQueue: vi.fn(),
  intent: null as string | null,
  platformOS: 'ios',
  windowWidth: 390,
}));

vi.mock('react-native', () => ({
  Platform: {
    get OS() {
      return mocks.platformOS;
    },
  },
  useWindowDimensions: () => ({ width: mocks.windowWidth, height: 844 }),
}));
vi.mock('@repo/core/api/client', () => ({
  api: {
    assignments: { getAll: vi.fn().mockResolvedValue([]) },
    lessons: { getAll: vi.fn().mockResolvedValue([]) },
    lessonMaterials: { getAll: vi.fn().mockResolvedValue([]) },
    teacherInsights: { listStudentObservations: vi.fn().mockResolvedValue([]) },
    classroomNotes: { getAll: vi.fn().mockResolvedValue([]) },
  },
}));
vi.mock('@repo/core/api/orpcClient', () => ({
  orpcClient: { sync: { patchWorkspaceLayout: mocks.patchWorkspaceLayout } },
}));
vi.mock('@repo/core/api/workspaceLayout', () => ({
  workspaceLayoutAPI: { getWorkspaceLayout: mocks.getLayout },
}));
vi.mock('@repo/core/hooks', () => ({
  useTeacherClassroom: () => ({ students: [], loading: false }),
}));
vi.mock('@repo/core/logic', () => ({
  useStore: (selector: (state: { user: { id: string } }) => unknown) =>
    selector({ user: { id: '11111111-1111-4111-8111-111111111111' } }),
}));
vi.mock('@repo/core/lib/storageWrapper', () => ({
  SafeZustandStorage: { getItem: mocks.getItem },
  setStorageItemDurably: mocks.setStorageItemDurably,
}));
vi.mock('@repo/core/lib/sync/useMutationQueue', () => ({
  useMutationQueue: (selector: (state: { addToQueue: typeof mocks.addToQueue }) => unknown) =>
    selector({ addToQueue: mocks.addToQueue }),
}));

import { useTeacherClassroomWorkspaceData } from '@repo/classroom/workspace/useTeacherClassroomWorkspaceData';

const userId = '11111111-1111-4111-8111-111111111111';

function remoteLayout() {
  return {
    id: 'classroom-layout',
    user_id: userId,
    workspace_id: 'classroom-1',
    layout_target: 'mobile' as const,
    order: ['attendance', 'assignments'],
    hidden: [],
    pinned: [],
    zone_by_surface: {},
    is_default: true,
    surface_metadata: {},
    layout_version: 2,
    revision: 4,
    last_operation_id: null,
    created_at: '2026-10-10T00:00:00.000Z',
    updated_at: '2026-10-10T00:00:00.000Z',
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

describe('Classroom teacher layout sync lifecycle', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    mocks.platformOS = 'ios';
    mocks.windowWidth = 390;
    queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    });
    mocks.intent = null;
    mocks.getItem.mockImplementation(async () => mocks.intent);
    mocks.getLayout.mockResolvedValue(remoteLayout());
    mocks.setStorageItemDurably.mockImplementation(async (_key: string, value: string) => {
      mocks.intent = value;
    });
    mocks.patchWorkspaceLayout.mockImplementation(async ({ body }) => ({
      status: 'completed',
      operationId: body.operationId,
      serverRevision: 5,
    }));
    mocks.addToQueue.mockResolvedValue(undefined);
  });

  afterEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  function wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }

  it('durably writes the exact intent before sending a named patch', async () => {
    const { result } = renderHook(() => useTeacherClassroomWorkspaceData('classroom-1'), {
      wrapper,
    });
    await waitFor(() => expect(result.current.layout?.revision).toBe(4));

    await act(async () => result.current.updateLayout(['assignments', 'attendance']));

    expect(mocks.setStorageItemDurably).toHaveBeenCalled();
    const stored = mocks.setStorageItemDurably.mock.calls
      .map(([, value]) => JSON.parse(value))
      .find((value) => value.pendingPatch) as {
      version: number;
      dirtyGroups: string[];
      pendingPatch?: { operationId: string; changes: Record<string, unknown> };
    };
    expect(stored.version).toBe(2);
    expect(stored.dirtyGroups).toContain('arrangement');
    expect(stored.pendingPatch?.changes).toHaveProperty('arrangement');
    expect(mocks.patchWorkspaceLayout).toHaveBeenCalledWith({ body: stored.pendingPatch });
    expect(mocks.setStorageItemDurably.mock.invocationCallOrder[1]).toBeLessThan(
      mocks.patchWorkspaceLayout.mock.invocationCallOrder[0],
    );
  });

  it('does not send the patch when acknowledged local storage rejects', async () => {
    mocks.setStorageItemDurably.mockRejectedValue(new Error('storage unavailable'));
    const { result } = renderHook(() => useTeacherClassroomWorkspaceData('classroom-1'), {
      wrapper,
    });
    await waitFor(() => expect(result.current.layout?.revision).toBe(4));

    await expect(
      act(async () => result.current.updateLayout(['assignments', 'attendance'])),
    ).rejects.toThrow('storage unavailable');
    expect(mocks.patchWorkspaceLayout).not.toHaveBeenCalled();
  });

  it('keeps the browser target when the shared hook runs in an Expo web surface', async () => {
    mocks.platformOS = 'web';
    mocks.windowWidth = 1280;
    const { result } = renderHook(() => useTeacherClassroomWorkspaceData('classroom-1'), {
      wrapper,
    });
    await waitFor(() => expect(result.current.layout?.revision).toBe(4));

    await act(async () => result.current.updateLayout(['assignments', 'attendance']));

    expect(mocks.patchWorkspaceLayout.mock.calls[0]?.[0].body.layoutTarget).toBe('web');
    expect(mocks.setStorageItemDurably.mock.calls[0]?.[0]).toBe(
      `workspace-layout-intent:classroom-1:web:${userId}`,
    );
  });

  it('uses the mobile target for a compact Expo web surface', async () => {
    mocks.platformOS = 'web';
    mocks.windowWidth = 390;
    const { result } = renderHook(() => useTeacherClassroomWorkspaceData('classroom-1'), {
      wrapper,
    });
    await waitFor(() => expect(result.current.layout?.revision).toBe(4));

    await act(async () => result.current.updateLayout(['assignments', 'attendance']));

    expect(mocks.patchWorkspaceLayout.mock.calls[0]?.[0].body.layoutTarget).toBe('mobile');
  });

  it('reuses the exact operation ID after an ambiguous response and remount', async () => {
    mocks.patchWorkspaceLayout.mockRejectedValueOnce(new Error('response was lost'));
    const first = renderHook(() => useTeacherClassroomWorkspaceData('classroom-1'), { wrapper });
    await waitFor(() => expect(first.result.current.layout?.revision).toBe(4));
    await expect(
      act(async () => first.result.current.updateLayout(['assignments', 'attendance'])),
    ).rejects.toThrow('response was lost');
    const firstPatch = mocks.patchWorkspaceLayout.mock.calls[0]?.[0].body;
    expect(firstPatch?.operationId).toBeTruthy();
    first.unmount();

    mocks.patchWorkspaceLayout.mockImplementation(async ({ body }) => ({
      status: 'completed',
      operationId: body.operationId,
      serverRevision: 5,
    }));
    const second = renderHook(() => useTeacherClassroomWorkspaceData('classroom-1'), { wrapper });
    await waitFor(() => expect(mocks.patchWorkspaceLayout).toHaveBeenCalledTimes(2));
    expect(mocks.patchWorkspaceLayout.mock.calls[1]?.[0].body.operationId).toBe(
      firstPatch.operationId,
    );
    second.unmount();
  });

  it('keeps a newer local order while an earlier patch is in flight', async () => {
    const firstResponse = deferred<{
      status: 'completed';
      operationId: string;
      serverRevision: number;
    }>();
    mocks.patchWorkspaceLayout
      .mockImplementationOnce(() => firstResponse.promise)
      .mockImplementation(async ({ body }) => ({
        status: 'completed',
        operationId: body.operationId,
        serverRevision: 6,
      }));
    const { result } = renderHook(() => useTeacherClassroomWorkspaceData('classroom-1'), {
      wrapper,
    });
    await waitFor(() => expect(result.current.layout?.revision).toBe(4));

    let firstUpdate: Promise<void> | undefined;
    act(() => {
      firstUpdate = result.current.updateLayout(['assignments', 'attendance']);
    });
    await waitFor(() => expect(mocks.patchWorkspaceLayout).toHaveBeenCalledTimes(1));
    await act(async () => result.current.updateLayout(['attendance', 'assignments', 'notes']));
    const intentDuringFlight = JSON.parse(mocks.intent ?? 'null') as {
      values: { arrangement: { order: string[] } };
      pendingPatch: { operationId: string };
    };
    expect(intentDuringFlight.values.arrangement.order).toEqual([
      'attendance',
      'assignments',
      'notes',
    ]);
    expect(intentDuringFlight.pendingPatch.operationId).toBe(
      mocks.patchWorkspaceLayout.mock.calls[0]?.[0].body.operationId,
    );

    firstResponse.resolve({
      status: 'completed',
      operationId: mocks.patchWorkspaceLayout.mock.calls[0]?.[0].body.operationId,
      serverRevision: 5,
    });
    await firstUpdate;
    await waitFor(() => expect(mocks.patchWorkspaceLayout).toHaveBeenCalledTimes(2));
    expect(
      mocks.patchWorkspaceLayout.mock.calls[1]?.[0].body.changes.arrangement.value.order,
    ).toEqual(['attendance', 'assignments', 'notes']);
  });
});
