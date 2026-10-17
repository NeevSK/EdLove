import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useBrowserWorkspaceAppearance } from '../../../lib/canvas/useBrowserWorkspaceAppearance';

const mocks = vi.hoisted(() => ({
  getLayout: vi.fn(),
  upsertLayout: vi.fn(),
}));

vi.mock('@repo/core/adapters/supabase/workspaceLayoutRepository', () => ({
  createSupabaseWorkspaceLayoutRepository: () => ({
    getLayout: mocks.getLayout,
    upsertLayout: mocks.upsertLayout,
  }),
}));

vi.mock('../../../lib/supabase/browser', () => ({
  createBrowserSupabaseClient: () => ({}),
}));

function layoutRecord() {
  return {
    id: '00000000-0000-4000-8000-000000000010',
    user_id: 'account-1',
    workspace_id: 'self',
    layout_target: 'web',
    order: ['today'],
    hidden: [],
    pinned: [],
    zone_by_surface: { today: 'today' },
    is_default: false,
    surface_metadata: { __workspaceAppearance: { preset: 'garden', motion: 'off' } },
    layout_version: 2,
    revision: 9,
    created_at: '2026-10-10T00:00:00.000Z',
    updated_at: '2026-10-10T00:00:00.000Z',
  };
}

describe('browser workspace appearance persistence', () => {
  beforeEach(() => {
    window.localStorage.clear();
    mocks.getLayout.mockReset().mockResolvedValue(layoutRecord());
    mocks.upsertLayout.mockReset().mockResolvedValue(undefined);
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1440 });
  });

  afterEach(() => window.localStorage.clear());

  it('hydrates remote appearance and persists edits through the layout repository', async () => {
    const { result } = renderHook(() =>
      useBrowserWorkspaceAppearance({ accountId: 'account-1', workspaceId: 'self' }),
    );

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.appearance).toEqual({ preset: 'garden', motion: 'off' });

    await act(async () => {
      await result.current.setAppearance({ preset: 'night', motion: 'subtle' });
    });

    expect(result.current.status).toBe('saved');
    expect(result.current.appearance).toEqual({ preset: 'night', motion: 'subtle' });
    expect(mocks.upsertLayout).toHaveBeenCalledOnce();
    expect(mocks.upsertLayout.mock.calls[0]?.[0]).toMatchObject({
      userId: 'account-1',
      workspaceId: 'self',
      layoutTarget: 'web',
      surfaceMetadata: { __workspaceAppearance: { preset: 'night', motion: 'subtle' } },
    });
  });

  it('keeps the local appearance available when remote hydration fails', async () => {
    mocks.getLayout.mockRejectedValue(new Error('network unavailable'));
    window.localStorage.setItem(
      'workspace-appearance:self:web:account-1',
      JSON.stringify({ preset: 'dawn', motion: 'subtle' }),
    );
    const { result } = renderHook(() =>
      useBrowserWorkspaceAppearance({ accountId: 'account-1', workspaceId: 'self' }),
    );

    await waitFor(() => expect(result.current.status).toBe('offline'));
    expect(result.current.appearance).toEqual({ preset: 'dawn', motion: 'subtle' });
  });
});
