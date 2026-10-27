import { focusManager, onlineManager, QueryObserver } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';

const fixture = vi.hoisted(() => ({
  state: 'background' as string | null,
  platform: 'android',
  status: 'unknown',
  change: null as ((state: string) => void) | null,
  networkChange: null as (() => void) | null,
  remove: vi.fn(),
  unsubscribe: vi.fn(),
}));
vi.mock('react-native', () => ({
  Platform: {
    get OS() {
      return fixture.platform;
    },
  },
  AppState: {
    get currentState() {
      return fixture.state;
    },
    addEventListener: (_event: string, callback: (state: string) => void) => {
      fixture.change = callback;
      return { remove: fixture.remove };
    },
  },
}));
vi.mock('@repo/core/logic/managers/NetworkManager', () => ({
  networkManager: {
    getSnapshot: () => ({ status: fixture.status }),
    subscribe: (callback: () => void) => {
      fixture.networkChange = callback;
      return fixture.unsubscribe;
    },
  },
}));
afterEach(() => {
  focusManager.setEventListener(() => undefined);
  onlineManager.setEventListener(() => undefined);
  focusManager.setFocused(undefined);
  onlineManager.setOnline(true);
  vi.resetModules();
  vi.clearAllMocks();
  fixture.change = null;
  fixture.state = 'background';
  fixture.platform = 'android';
  fixture.status = 'unknown';
});

describe('native Query lifecycle', () => {
  it('initializes from native state, refetches stale reads on wake and releases listeners', async () => {
    const { queryClient } = await import('@/lib/queryClient');
    expect(focusManager.isFocused()).toBe(false);
    expect(onlineManager.isOnline()).toBe(true);
    queryClient.mount();
    const queryFn = vi.fn(async () => 'loaded');
    const observer = new QueryObserver(queryClient, {
      queryKey: ['lifecycle'],
      queryFn,
      staleTime: 0,
    });
    const release = observer.subscribe(() => undefined);
    await vi.waitFor(() => expect(queryFn).toHaveBeenCalledOnce());
    fixture.change?.('active');
    await vi.waitFor(() => expect(queryFn).toHaveBeenCalledTimes(2));
    fixture.change?.('inactive');
    expect(focusManager.isFocused()).toBe(false);
    fixture.status = 'offline';
    fixture.networkChange?.();
    expect(onlineManager.isOnline()).toBe(false);
    release();
    queryClient.unmount();
    queryClient.clear();
    expect(fixture.remove).toHaveBeenCalled();
    expect(fixture.unsubscribe).toHaveBeenCalled();
  });

  it('does not install native focus handling on web', async () => {
    fixture.platform = 'web';
    await import('@/lib/queryClient');
    expect(fixture.change).toBeNull();
  });

  it('accepts a late initial native state without guessing that null means background', async () => {
    fixture.state = null;
    await import('@/lib/queryClient');
    expect(focusManager.isFocused()).toBe(true);
    fixture.change?.('background');
    expect(focusManager.isFocused()).toBe(false);
    fixture.change?.('active');
    expect(focusManager.isFocused()).toBe(true);
  });
});
