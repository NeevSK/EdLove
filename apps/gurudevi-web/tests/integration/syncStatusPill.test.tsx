import { stopNetworkBusAdapter } from '@repo/core/adapters/NetworkBusAdapter';
import { WebNetworkAdapter } from '@repo/core/adapters/WebNetworkAdapter';
import { networkManager } from '@repo/core/logic/managers/NetworkManager';
import { act, cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SyncStatusPill } from '@/app/(sanctuary)/components/SyncStatusPill';

describe('Unit/Integration: SyncStatusPill Ambient Network Telemetry', () => {
  beforeEach(() => {
    stopNetworkBusAdapter();
    networkManager.registerAdapter(new WebNetworkAdapter());
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ type: 'opaque', status: 0 }));
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: true,
      writable: true,
    });
  });

  afterEach(() => {
    cleanup();
    stopNetworkBusAdapter();
    vi.unstubAllGlobals();
    vi.useRealTimers();
    Reflect.deleteProperty(navigator, 'connection');
  });

  it('renders online after page reachability without claiming data is synced', async () => {
    await act(async () => {
      render(<SyncStatusPill />);
    });
    expect(screen.getByText('Online')).toBeDefined();
    expect(screen.getByTitle('Connection status: Online')).toBeDefined();
    expect(screen.queryByText('Synced')).toBeNull();
  });

  it('transitions offline when the shared browser observation goes offline', async () => {
    await act(async () => {
      render(<SyncStatusPill />);
    });
    expect(screen.getByText('Online')).toBeDefined();

    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        configurable: true,
        value: false,
        writable: true,
      });
      window.dispatchEvent(new Event('offline'));
    });

    expect(screen.getByText('Offline')).toBeDefined();
    expect(screen.getByTitle('Connection status: Offline')).toBeDefined();
  });

  it('restores online when the shared observation reconnects and the probe completes', async () => {
    await act(async () => {
      render(<SyncStatusPill />);
    });

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(screen.getByText('Offline')).toBeDefined();

    await act(async () => {
      window.dispatchEvent(new Event('online'));
    });
    expect(screen.getByText('Online')).toBeDefined();
  });

  it('keeps page failure separate from device connectivity and recovers on focus', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new TypeError('Network request failed'));
    await act(async () => {
      render(<SyncStatusPill />);
    });
    expect(screen.getByText('Site unavailable')).toBeDefined();
    expect(networkManager.getSnapshot().status).toBe('online');
    await act(async () => {
      window.dispatchEvent(new Event('focus'));
    });
    expect(screen.getByText('Online')).toBeDefined();
  });

  it('refreshes page reachability and the slow-link label when shared connection estimates change', async () => {
    const connection = Object.assign(new EventTarget(), { effectiveType: '2g', rtt: 1200 });
    Object.defineProperty(navigator, 'connection', { configurable: true, value: connection });
    networkManager.registerAdapter(new WebNetworkAdapter());
    await act(async () => {
      render(<SyncStatusPill />);
    });
    expect(screen.getByText('Unstable')).toBeDefined();
    connection.effectiveType = '4g';
    connection.rtt = 100;
    await act(async () => {
      connection.dispatchEvent(new Event('change'));
    });
    expect(screen.getByText('Online')).toBeDefined();
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('aborts an in-flight probe on disconnect and ignores its late completion', async () => {
    let complete: (() => void) | undefined;
    vi.mocked(fetch).mockImplementationOnce(
      () =>
        new Promise<Response>((resolve) => {
          complete = () => resolve(new Response());
        }),
    );
    render(<SyncStatusPill />);
    const signal = vi.mocked(fetch).mock.calls[0]?.[1]?.signal;
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(signal?.aborted).toBe(true);
    await act(async () => {
      complete?.();
    });
    expect(screen.getByText('Offline')).toBeDefined();
  });

  it('retains the timeout and retries after a timed-out page probe', async () => {
    vi.useFakeTimers();
    vi.mocked(fetch).mockImplementationOnce(
      (_url, options) =>
        new Promise((_resolve, reject) => {
          options?.signal?.addEventListener('abort', () =>
            reject(new DOMException('Aborted', 'AbortError')),
          );
        }),
    );
    render(<SyncStatusPill />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    expect(screen.getByText('Site unavailable')).toBeDefined();
    expect(networkManager.getSnapshot().status).toBe('online');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(25000);
    });
    expect(screen.getByText('Online')).toBeDefined();
  });

  it('defers probes while hidden and stops listeners and timers on unmount', async () => {
    vi.useFakeTimers();
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
    const { unmount } = render(<SyncStatusPill />);
    expect(fetch).not.toHaveBeenCalled();
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(fetch).toHaveBeenCalledTimes(1);
    unmount();
    await act(async () => {
      window.dispatchEvent(new Event('focus'));
      await vi.advanceTimersByTimeAsync(60000);
    });
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
