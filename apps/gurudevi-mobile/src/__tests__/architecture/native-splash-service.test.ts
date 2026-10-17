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
});
