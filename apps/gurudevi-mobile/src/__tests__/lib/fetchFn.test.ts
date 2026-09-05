import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getFetchFn,
  getPrefetchFn,
  getPrefetchOnAppStartFn,
  isComposerPasteEnabled,
  isNitroFetchEnabled,
  setNitroFetchEnabled,
} from '@/lib/fetchFn';

const originalFetch = globalThis.fetch;
const mockFetch = vi.fn();

function setupPlatform(os: string) {
  vi.resetModules();
  vi.doMock('react-native', () => ({
    Platform: { OS: os },
  }));
}

describe('fetchFn factory', () => {
  beforeEach(() => {
    globalThis.fetch = mockFetch;
    mockFetch.mockResolvedValue(new Response('ok', { status: 200 }));
    setNitroFetchEnabled(false);
    vi.clearAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('returns global fetch on web regardless of flag', async () => {
    setupPlatform('web');
    const { getFetchFn: getFetchFnWeb } = await import('@/lib/fetchFn');
    const fn = await getFetchFnWeb();

    await fn('https://example.com');
    // globalThis.fetch.bind(globalThis) only receives the URL, not init
    expect(mockFetch).toHaveBeenCalledWith('https://example.com');
  });

  it('returns global fetch on native when flag is OFF', async () => {
    setupPlatform('ios');
    const { getFetchFn: getFetchFnNative } = await import('@/lib/fetchFn');
    const fn = await getFetchFnNative();

    await fn('https://example.com');
    expect(mockFetch).toHaveBeenCalledWith('https://example.com');
  });

  it('forwards AbortSignal to native fetch when flag is ON', async () => {
    setupPlatform('ios');
    setNitroFetchEnabled(true);

    const { getFetchFn: getFetchFnNative } = await import('@/lib/fetchFn');
    const fn = await getFetchFnNative();

    const controller = new AbortController();
    controller.abort();

    await expect(fn('https://example.com', { signal: controller.signal })).rejects.toThrow(
      'Aborted',
    );
  });

  it('uses nitro fetch when flag is ON (global override)', async () => {
    setupPlatform('ios');
    setNitroFetchEnabled(true);

    // Mock the nitro fetch module BEFORE importing
    vi.resetModules();
    vi.doMock('react-native-nitro-fetch', () => ({
      fetch: vi.fn().mockResolvedValue(new Response('nitro', { status: 200 })),
      prefetch: vi.fn().mockResolvedValue(undefined),
      prefetchOnAppStart: vi.fn().mockResolvedValue(undefined),
    }));

    const { getFetchFn: getFetchFnFresh } = await import('@/lib/fetchFn');
    const fn = await getFetchFnFresh();

    await fn('https://example.com');
    // The nitro fetch should be called (mockFetch is globalThis.fetch which should NOT be called)
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('prefetch returns no-op on web', async () => {
    setupPlatform('web');
    const { getPrefetchFn: getPrefetchFnWeb } = await import('@/lib/fetchFn');
    const prefetch = await getPrefetchFnWeb();

    await expect(prefetch('https://example.com')).resolves.toBeUndefined();
  });

  it('prefetch returns no-op on native when flag is OFF', async () => {
    setupPlatform('ios');
    const { getPrefetchFn: getPrefetchFnNative } = await import('@/lib/fetchFn');
    const prefetch = await getPrefetchFnNative();

    await expect(prefetch('https://example.com')).resolves.toBeUndefined();
  });

  it('isNitroFetchEnabled reflects flag state', () => {
    expect(isNitroFetchEnabled()).toBe(false);
    setNitroFetchEnabled(true);
    expect(isNitroFetchEnabled()).toBe(true);
    setNitroFetchEnabled(false);
    expect(isNitroFetchEnabled()).toBe(false);
  });

  it('isComposerPasteEnabled reflects flag state', () => {
    expect(isComposerPasteEnabled()).toBe(false);
  });
});
