import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const store = {
    setUser: vi.fn(),
    showToast: vi.fn(),
    user: { id: 'account-1', is_anonymous: false },
  };
  const useAuthStore = Object.assign(
    <T,>(selector: (state: typeof store) => T) => selector(store),
    {
      getState: () => store,
    },
  );

  return {
    capturedOnComplete: undefined as undefined | (() => void),
    refreshProfile: vi.fn(),
    store,
    useAuthStore,
  };
});

vi.mock('@repo/core/logic', () => ({
  suggestDisplayName: () => 'Nila',
}));
vi.mock('@repo/core/providers', () => ({
  useAuth: () => ({
    refreshProfile: mocks.refreshProfile,
    session: { user: { id: 'account-1', is_anonymous: false } },
  }),
}));
vi.mock('@repo/core/store/useAuthStore', () => ({ useAuthStore: mocks.useAuthStore }));
vi.mock('@repo/core/lib/feedback', () => ({ showToast: mocks.store.showToast }));
vi.mock('@repo/core/native', () => ({ discardLocalGuestSession: vi.fn() }));
vi.mock('@repo/core/native/localGuestOnboarding', () => ({ discardLocalGuestOnboarding: vi.fn() }));
vi.mock('@repo/core/native/localGuestSession', () => ({
  restoreLocalGuestSession: async () => null,
}));
vi.mock('@repo/ui/components/CelebrationOverlay', () => ({
  CelebrationOverlay: () => null,
}));
vi.mock('@repo/ui/screens/OnboardingScreen', () => ({
  default: ({ onComplete }: { onComplete: () => void }) => {
    mocks.capturedOnComplete = onComplete;
    return null;
  },
}));
vi.mock('@repo/ui/primitives', () => ({
  Box: 'Box',
  Pressable: 'Pressable',
  Text: 'Text',
}));

import { OnboardingWrapper } from './OnboardingWrapper';

describe('OnboardingWrapper admission reconciliation', () => {
  beforeEach(() => {
    mocks.capturedOnComplete = undefined;
    mocks.refreshProfile.mockReset();
    mocks.store.setUser.mockReset();
    mocks.store.user.is_anonymous = false;
    mocks.store.showToast.mockReset();
  });

  it('updates the guest profile completion field without a separate auth completion mirror', async () => {
    mocks.store.user.is_anonymous = true;
    await render(<OnboardingWrapper />);
    await act(async () => {
      mocks.capturedOnComplete?.();
    });
    expect(mocks.store.setUser).toHaveBeenCalledWith({
      id: 'account-1',
      is_anonymous: true,
      onboarding_completed: true,
    });
  });

  it('keeps a saved authenticated onboarding completion retryable when admission refresh fails', async () => {
    mocks.refreshProfile
      .mockRejectedValueOnce(new Error('profile unavailable'))
      .mockResolvedValueOnce(undefined);
    let screen: Awaited<ReturnType<typeof render>>;

    await act(async () => {
      screen = await render(<OnboardingWrapper />);
    });
    await act(async () => {
      mocks.capturedOnComplete?.();
      await Promise.resolve();
      await Promise.resolve();
    });

    const retry = screen!.getByLabelText('Retry sanctuary admission');
    expect(mocks.store.showToast).toHaveBeenCalledWith(
      'Your setup is saved. Reconnect when you are ready to enter.',
      'error',
      5000,
    );

    fireEvent.press(retry);
    await waitFor(() => {
      expect(mocks.refreshProfile).toHaveBeenCalledTimes(2);
      expect(screen!.queryByLabelText('Retry sanctuary admission')).toBeNull();
    });
  });
});
