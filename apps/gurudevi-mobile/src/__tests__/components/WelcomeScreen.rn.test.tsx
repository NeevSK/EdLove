import WelcomeScreen from '@repo/ui/screens/WelcomeScreen';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';

const { mockSignInAnonymously, mockShowToast } = vi.hoisted(() => ({
  mockSignInAnonymously: vi.fn(),
  mockShowToast: vi.fn(),
}));

vi.mock('@repo/core/auth', () => ({
  authAPI: { signInAnonymously: () => mockSignInAnonymously() },
}));

vi.mock('@repo/ui/providers/ToastProvider', () => ({
  useSanctuaryToast: () => ({ showToast: mockShowToast }),
}));

describe('WelcomeScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the public welcome surface and can enter as guest', async () => {
    mockSignInAnonymously.mockResolvedValue({ session: {}, user: { is_anonymous: true } });
    const onGuest = vi.fn();
    const { getByText } = await render(<WelcomeScreen onGuest={onGuest} />);

    expect(getByText('Gurudevi')).toBeTruthy();
    fireEvent.press(getByText('welcome.exploreAsGuest'));

    await waitFor(() => expect(mockSignInAnonymously).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(onGuest).toHaveBeenCalledTimes(1));
  });

  it('shows guidance when guest entry fails', async () => {
    mockSignInAnonymously.mockRejectedValue(new Error('guest session unavailable'));
    const { getByText } = await render(<WelcomeScreen />);

    fireEvent.press(getByText('welcome.exploreAsGuest'));

    await waitFor(() => expect(mockShowToast).toHaveBeenCalled());
  });
});
