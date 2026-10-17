import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useBrowserWorkspaceAppearance } from '../../../lib/canvas/useBrowserWorkspaceAppearance';

describe('workspace appearance local storage', () => {
  afterEach(() => window.localStorage.clear());

  it('restores validated appearance preferences and ignores malformed cached data', async () => {
    const key = 'workspace-appearance:self:web:account-1';
    window.localStorage.setItem(key, JSON.stringify({ preset: 'garden', motion: 'subtle' }));
    const restored = renderHook(() =>
      useBrowserWorkspaceAppearance({
        accountId: 'account-1',
        workspaceId: 'self',
        enableRemoteSync: false,
      }),
    );
    await waitFor(() => expect(restored.result.current.status).toBe('ready'));
    expect(restored.result.current.appearance).toEqual({ preset: 'garden', motion: 'subtle' });
    restored.unmount();
    cleanup();

    window.localStorage.setItem(key, '{');
    const malformed = renderHook(() =>
      useBrowserWorkspaceAppearance({
        accountId: 'account-1',
        workspaceId: 'self',
        enableRemoteSync: false,
      }),
    );
    await waitFor(() => expect(malformed.result.current.status).toBe('ready'));
    expect(malformed.result.current.appearance).toEqual({ preset: 'default', motion: 'off' });
    await act(async () => {
      await malformed.result.current.setAppearance({ preset: 'dawn', motion: 'off' });
    });
    expect(window.localStorage.getItem(key)).toBe(JSON.stringify({ preset: 'dawn', motion: 'off' }));
  });
});
