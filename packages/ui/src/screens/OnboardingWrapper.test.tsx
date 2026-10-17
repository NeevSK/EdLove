import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const store = {
    setOnboardingCompleted: vi.fn(),
    showToast: vi.fn(),
    user: { id: 'account-1', is_anonymous: false },
  };
  const useStore = Object.assign(<T,>(selector: (state: typeof store) => T) => selector(store), {
    getState: () => store,
  });

  return {
    capturedOnComplete: undefined as undefined | (() => void),
    refreshProfile: vi.fn(),
    store,
    useStore,
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
vi.mock('@repo/core/store', () => ({ useStore: mocks.useStore }));
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
    mocks.store.setOnboardingCompleted.mockReset();
    mocks.store.showToast.mockReset();
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
