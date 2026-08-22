import { describe, expect, it, vi } from 'vitest';
import { scheduleNativeSplashHandoff } from '@/boot/nativeSplashHandoff';

describe('native splash handoff', () => {
  it('hides native splash only after the next committed frame', async () => {
    let frameCallback: (() => void) | undefined;
    const hide = vi.fn().mockResolvedValue(undefined);

    scheduleNativeSplashHandoff({
      requestFrame: (callback) => {
        frameCallback = callback;
        return 1;
      },
      cancelFrame: vi.fn(),
      hide,
      onError: vi.fn(),
    });

    expect(hide).not.toHaveBeenCalled();
    frameCallback?.();
    await Promise.resolve();
    expect(hide).toHaveBeenCalledTimes(1);
  });

  it('does not hide after the app shell unmounts before the frame', () => {
    let frameCallback: (() => void) | undefined;
    const cancelFrame = vi.fn();
    const hide = vi.fn().mockResolvedValue(undefined);

    const cancel = scheduleNativeSplashHandoff({
      requestFrame: (callback) => {
        frameCallback = callback;
        return 7;
      },
      cancelFrame,
      hide,
      onError: vi.fn(),
    });
    cancel();
    frameCallback?.();

    expect(cancelFrame).toHaveBeenCalledWith(7);
    expect(hide).not.toHaveBeenCalled();
  });

  it('contains native hide failures instead of breaking the app shell', async () => {
    let frameCallback: (() => void) | undefined;
    const error = new Error('native splash unavailable');
    const onError = vi.fn();

    scheduleNativeSplashHandoff({
      requestFrame: (callback) => {
        frameCallback = callback;
        return 1;
      },
      cancelFrame: vi.fn(),
      hide: vi.fn().mockRejectedValue(error),
      onError,
    });
    frameCallback?.();
    await Promise.resolve();
    await Promise.resolve();

    expect(onError).toHaveBeenCalledWith(error);
  });
});
