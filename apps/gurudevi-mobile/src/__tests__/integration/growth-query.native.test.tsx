import { useBanyanGrowth } from '@repo/core/hooks/useBanyanGrowth';
import { useNaturePaths } from '@repo/core/hooks/useNaturePaths';
import { setActiveAccountId } from '@repo/core/lib/accountScope';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const accountA = '123e4567-e89b-8101-8000-426614174000';
const accountB = '123e4567-e89b-8101-8000-426614174009';
const fixture = vi.hoisted(() => {
  const records = new Map<string, string>();
  const state: { user: { id: string; is_anonymous: boolean } | null; online: boolean } = {
    user: null,
    online: true,
  };
  return {
    records,
    state,
    getGrowth: vi.fn(),
    read: vi.fn(async (key: string) => records.get(key)),
    write: vi.fn(async (key: string, value: string) => {
      records.set(key, value);
    }),
  };
});
vi.mock('@repo/core/logic/managers/growth.factory', () => ({
  growth: { getGrowthState: fixture.getGrowth },
}));
vi.mock('@repo/core/lib/storage', () => ({
  storage: { getStringAsync: fixture.read, setAsync: fixture.write },
}));
vi.mock('@repo/core/store/useAuthStore', () => ({
  useAuthStore: <T,>(selector: (state: typeof fixture.state) => T) => selector(fixture.state),
}));
vi.mock('@repo/core/offline/useOfflineStatus', () => ({
  useOfflineStatus: () => ({ isOnline: fixture.state.online }),
}));
vi.mock('@repo/core/store/useTemporalStore', () => ({
  useTemporalStore: <T,>(selector: (state: { readPolicy: 'live' }) => T) =>
    selector({ readPolicy: 'live' }),
}));

const row = {
  user_id: accountA,
  banyan_stage: 'sapling',
  peer_mentored_count: 4,
  circles_facilitated_count: 2,
  river_stage: 'stream',
  crystal_tier: 'spark',
  crystals_found_count: 3,
  fractal_moments_count: 1,
};
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
function clientFixture() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return {
    client,
    wrapper: ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client }, children),
  };
}
function readBoth() {
  return { banyan: useBanyanGrowth(), nature: useNaturePaths() };
}
beforeEach(() => {
  fixture.records.clear();
  fixture.state.user = { id: accountA, is_anonymous: false };
  fixture.state.online = true;
  fixture.getGrowth.mockReset().mockResolvedValue(row);
  fixture.read.mockReset().mockImplementation(async (key: string) => fixture.records.get(key));
  fixture.write.mockReset().mockImplementation(async (key: string, value: string) => {
    fixture.records.set(key, value);
  });
  setActiveAccountId(accountA);
});
afterEach(() => vi.restoreAllMocks());

describe('Growth Query ownership with mounted React and substituted network/storage', () => {
  it('shares one fetch and snapshot write across both path readers', async () => {
    const mounted = clientFixture();
    const view = renderHook(readBoth, mounted);
    await waitFor(() => expect(view.result.current.banyan.banyan.peer_mentored_count).toBe(4));
    expect(view.result.current.nature.paths.crystals_found_count).toBe(3);
    expect(fixture.getGrowth).toHaveBeenCalledTimes(1);
    expect(fixture.write).toHaveBeenCalledTimes(1);
    view.unmount();
    mounted.client.clear();
  });

  it('restores only the qualified account snapshot offline and leaves legacy bytes untouched', async () => {
    fixture.state.online = false;
    const saved = JSON.stringify({ savedAt: 1, data: row });
    fixture.records.set(`growth-snapshot:v1:${accountA}`, saved);
    fixture.records.set('gurudevi-growth-storage', 'unowned legacy values');
    const mounted = clientFixture();
    const view = renderHook(readBoth, mounted);
    await waitFor(() => expect(view.result.current.banyan.isLoading).toBe(false));
    expect(view.result.current.banyan.banyan.banyan_stage).toBe('sapling');
    expect(fixture.getGrowth).not.toHaveBeenCalled();
    expect(fixture.records.get('gurudevi-growth-storage')).toBe('unowned legacy values');
    expect(fixture.write).not.toHaveBeenCalled();
    act(() => {
      fixture.state.user = { id: accountB, is_anonymous: false };
      setActiveAccountId(accountB);
      view.rerender();
    });
    await waitFor(() => expect(view.result.current.nature.isLoading).toBe(false));
    expect(view.result.current.banyan.banyan.peer_mentored_count).toBe(0);
    expect(view.result.current.nature.paths.crystal_tier).toBeNull();
    view.unmount();
    mounted.client.clear();
  });

  it('rejects delayed A responses after A to B to A and does not cache them', async () => {
    const remote = deferred<typeof row>();
    fixture.getGrowth.mockReturnValue(remote.promise);
    const mounted = clientFixture();
    const view = renderHook(readBoth, mounted);
    await waitFor(() => expect(fixture.getGrowth).toHaveBeenCalledTimes(1));
    act(() => {
      fixture.state.user = { id: accountB, is_anonymous: false };
      fixture.state.online = false;
      setActiveAccountId(accountB);
      view.rerender();
    });
    act(() => {
      fixture.state.user = { id: accountA, is_anonymous: false };
      setActiveAccountId(accountA);
      view.rerender();
    });
    await act(async () => {
      remote.resolve(row);
    });
    await waitFor(() => expect(view.result.current.banyan.isLoading).toBe(false));
    expect(view.result.current.banyan.banyan.peer_mentored_count).toBe(0);
    expect(fixture.write).not.toHaveBeenCalled();
    view.unmount();
    mounted.client.clear();
  });

  it('keeps saved content while reporting a remote refresh failure', async () => {
    fixture.records.set(
      `growth-snapshot:v1:${accountA}`,
      JSON.stringify({ savedAt: 1, data: row }),
    );
    fixture.getGrowth.mockRejectedValue(new Error('service unavailable'));
    const mounted = clientFixture();
    const view = renderHook(readBoth, mounted);
    await waitFor(() =>
      expect(view.result.current.banyan.error?.message).toBe('service unavailable'),
    );
    await waitFor(() => expect(view.result.current.banyan.banyan.peer_mentored_count).toBe(4));
    expect(fixture.write).not.toHaveBeenCalled();
    view.unmount();
    mounted.client.clear();
  });

  it('rejects a foreign remote or saved owner without rewriting its record', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const foreign = { ...row, user_id: accountB };
    const original = JSON.stringify({ savedAt: 1, data: foreign });
    fixture.records.set(`growth-snapshot:v1:${accountA}`, original);
    fixture.getGrowth.mockResolvedValue(foreign);
    const mounted = clientFixture();
    const view = renderHook(readBoth, mounted);
    await waitFor(() =>
      expect(view.result.current.nature.error?.message).toContain('another account'),
    );
    expect(view.result.current.nature.paths.crystals_found_count).toBe(0);
    expect(fixture.records.get(`growth-snapshot:v1:${accountA}`)).toBe(original);
    expect(fixture.write).not.toHaveBeenCalled();
    view.unmount();
    mounted.client.clear();
  });

  it('performs no remote or account-cache work for a local-only guest', async () => {
    fixture.state.user = { id: accountA, is_anonymous: true };
    const mounted = clientFixture();
    const view = renderHook(readBoth, mounted);
    expect(view.result.current.banyan.isLoading).toBe(false);
    expect(fixture.getGrowth).not.toHaveBeenCalled();
    expect(fixture.read).not.toHaveBeenCalled();
    view.unmount();
    mounted.client.clear();
  });
});
