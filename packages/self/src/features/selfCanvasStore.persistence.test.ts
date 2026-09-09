import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { describeSelfCanvasPersistence } from './selfCanvasPersistence';
import { useSelfCanvasStore } from './selfCanvasStore';
import { DEFAULT_SELF_PREFERENCES } from './userPreferences';

describe('Self canvas local-first persistence', () => {
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    useSelfCanvasStore.setState({
      ...DEFAULT_SELF_PREFERENCES,
      userId: null,
      isHydrated: false,
      lastIdempotencyKey: null,
      persistenceState: 'idle',
    });
  });

  it('marks a layout change as saving before it claims a local device save', () => {
    vi.useFakeTimers();
    useSelfCanvasStore.setState({ userId: 'user-1', isHydrated: true, persistenceState: 'idle' });

    useSelfCanvasStore.getState().setViewMode('carousel');

    expect(useSelfCanvasStore.getState().viewMode).toBe('carousel');
    expect(useSelfCanvasStore.getState().persistenceState).toBe('saving');
  });

  it('keeps a failed device write retryable instead of claiming it was queued remotely', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(SafeZustandStorage, 'setItem').mockImplementation(() => {
      throw new Error('Storage is unavailable');
    });
    useSelfCanvasStore.setState({ userId: 'user-1', isHydrated: true, persistenceState: 'idle' });

    useSelfCanvasStore.getState().setViewMode('carousel');
    await Promise.resolve();

    expect(useSelfCanvasStore.getState().persistenceState).toBe('localError');
    expect(describeSelfCanvasPersistence(useSelfCanvasStore.getState().persistenceState)).toEqual({
      label: 'Could not save your sanctuary layout on this device.',
      canRetry: true,
    });
  });
});
