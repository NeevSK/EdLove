import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ networkStatus: 'online' as 'online' | 'offline' }));

vi.mock('@repo/core/api/client', () => ({
  identityAPI: { identifyActiveCitizen: vi.fn(async () => null) },
  onboardingAPI: {},
}));
vi.mock('@repo/core/hooks', async () => import('@repo/core/hooks/useActorSnapshot'));
vi.mock('@repo/core/api/onboardingClient', () => ({
  completeOnboarding: vi.fn(),
  createInitialBond: vi.fn(),
  createOnboardingCompletionKey: vi.fn(),
}));
vi.mock('@repo/core/lib/feedback', () => ({ showToast: vi.fn() }));
vi.mock('@repo/core/lib/inviteCodes', () => ({ resolveStoredInvite: async () => null }));
vi.mock('@repo/core/lib/storage', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@repo/core/lib/storage')>();
  return {
    ...actual,
    storage: { getStringAsync: async () => null, delete: vi.fn(), set: vi.fn() },
  };
});
vi.mock('@repo/core/logic/managers/StorageManager', () => ({
  storage: { getStringAsync: async () => null, set: vi.fn() },
}));
vi.mock('@repo/core/native/localGuestOnboarding', () => ({
  completeLocalGuestOnboarding: vi.fn(),
  createLocalGuestInitialBond: vi.fn(),
}));
vi.mock('@repo/core/offline/useOfflineStatus', () => ({
  useOfflineStatus: () => ({
    status: mocks.networkStatus,
    isOnline: mocks.networkStatus === 'online',
  }),
}));
vi.mock('@repo/ui/components/FireflyFeedbackScene', () => ({ FireflyFeedbackScene: () => null }));
vi.mock('@repo/ui/components/IdentityCard', () => ({ default: () => null }));
vi.mock('@repo/ui/components/ProgressIndicator', () => ({ ProgressIndicator: () => null }));
vi.mock('@repo/ui/components/ScreenWrapper', () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock('@repo/ui/icons', () => ({
  BookOpen: () => null,
  Compass: () => null,
  Flower2: () => null,
  GraduationCap: () => null,
  Lock: () => null,
  School: () => null,
  Sprout: () => null,
}));
vi.mock('@repo/ui/primitives', () => ({
  Box: View,
  Center: View,
  HStack: View,
  VStack: View,
  Input: View,
  InputField: TextInput,
  Text,
  Heading: Text,
  ButtonText: Text,
  Button: Pressable,
  Pressable,
}));
vi.mock('@repo/ui/utils/haptics', () => ({
  hapticError: vi.fn(),
  hapticLight: vi.fn(),
  hapticSuccess: vi.fn(),
}));
vi.mock('@repo/ui/utils/navigation', () => ({ safeBack: vi.fn() }));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { defaultValue?: string }) => options?.defaultValue ?? key,
  }),
}));

import OnboardingScreen from './OnboardingScreen';

afterEach(() => {
  vi.unstubAllGlobals();
  mocks.networkStatus = 'online';
});

describe('onboarding identity resolution', () => {
  it('marks arrival content interactive while account identity is unresolved', async () => {
    const onInteractive = vi.fn();
    const screen = await render(
      <OnboardingScreen onComplete={vi.fn()} onInteractive={onInteractive} />,
    );

    await waitFor(() => expect(onInteractive).toHaveBeenCalledTimes(1));
    expect(screen.getByPlaceholderText('e.g. Maya, Alex, Coach David')).toBeTruthy();
  });

  it('edits the currently rendered actor after the local guest resolves', async () => {
    const onComplete = vi.fn();
    const screen = await render(<OnboardingScreen isLocalGuest onComplete={onComplete} />);
    await act(async () => {
      await Promise.resolve();
    });
    await screen.rerender(
      <OnboardingScreen isLocalGuest userId="guest-resolved" onComplete={onComplete} />,
    );
    await act(async () => {
      await Promise.resolve();
    });
    const input = screen.getByPlaceholderText('e.g. Maya, Alex, Coach David');
    await fireEvent.changeText(input, 'dev::sandbox');
    await waitFor(() =>
      expect(screen.getByPlaceholderText('e.g. Maya, Alex, Coach David').props.value).toBe(
        'dev::sandbox',
      ),
    );
  });

  it('opens the developer sandbox shortcut offline before resolving an account', async () => {
    vi.stubGlobal('__DEV__', true);
    mocks.networkStatus = 'offline';
    const screen = await render(<OnboardingScreen onComplete={vi.fn()} />);
    await act(async () => {
      await Promise.resolve();
    });

    await fireEvent.changeText(
      screen.getByPlaceholderText('e.g. Maya, Alex, Coach David'),
      'dev::sandbox',
    );
    await fireEvent.press(screen.getByText('Continue'));

    await waitFor(() => expect(screen.getByText(/Sandbox Console/)).toBeTruthy());
    expect(
      screen.queryByText('No internet connection detected. Please try again when you are online.'),
    ).toBeNull();
    const { identityAPI } = await import('@repo/core/api/client');
    expect(identityAPI.identifyActiveCitizen).not.toHaveBeenCalled();
  });

  it('lets a device-local guest continue onboarding offline', async () => {
    mocks.networkStatus = 'offline';
    const screen = await render(
      <OnboardingScreen isLocalGuest userId="local-guest-test" onComplete={vi.fn()} />,
    );
    await act(async () => {
      await Promise.resolve();
    });

    await fireEvent.changeText(
      screen.getByPlaceholderText('e.g. Maya, Alex, Coach David'),
      'Guest',
    );
    await fireEvent.press(screen.getByText('Continue'));

    await waitFor(() => expect(screen.getByText('STEP 2 · IDENTITY')).toBeTruthy());
    expect(
      screen.queryByText('No internet connection detected. Please try again when you are online.'),
    ).toBeNull();
  });
});
