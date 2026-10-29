import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  hideAsync: vi.fn(),
  schedule: vi.fn(),
}));

vi.mock('expo-splash-screen', () => ({ hideAsync: mocks.hideAsync }));
vi.mock('@/boot/nativeSplashHandoff', () => ({
  scheduleNativeSplashHandoff: mocks.schedule,
}));

import { handoffNativeSplashAfterCommit } from '@/boot/nativeSplashService';

describe('native splash service', () => {
  it('binds the production Expo API through the single testable handoff policy', () => {
    const onError = vi.fn();
    const onCommit = vi.fn();
    const cancel = vi.fn();
    mocks.schedule.mockReturnValue(cancel);

    expect(handoffNativeSplashAfterCommit({ onCommit, onError })).toBe(cancel);
    expect(mocks.schedule).toHaveBeenCalledWith(
      expect.objectContaining({
        hide: mocks.hideAsync,
        onError,
      }),
    );
  });

  it('hides the splash once however many entry surfaces ask', () => {
    vi.stubGlobal('requestAnimationFrame', (callback: () => void) => {
      callback();
      return 1;
    });
    mocks.schedule.mockReset();
    mocks.schedule.mockImplementation(
      ({ requestFrame, hide }: { requestFrame: (cb: () => void) => number; hide: () => void }) => {
        requestFrame(() => hide());
        return vi.fn();
      },
    );
    const onCommit = vi.fn();

    handoffNativeSplashAfterCommit({ onCommit, onError: vi.fn() });
    handoffNativeSplashAfterCommit({ onCommit, onError: vi.fn() });

    expect(mocks.hideAsync).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(mocks.schedule).toHaveBeenCalledTimes(1);
    vi.unstubAllGlobals();
  });
});
