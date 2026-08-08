import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import WelcomeScreen from '@repo/ui/screens/WelcomeScreen';

const mockSignInAnonymously = jest.fn();
const mockShowToast = jest.fn();

jest.mock('@repo/core/auth', () => ({
  authAPI: { signInAnonymously: () => mockSignInAnonymously() },
}));

jest.mock('@repo/ui/providers/ToastProvider', () => ({
  useSanctuaryToast: () => ({ showToast: mockShowToast }),
}));

describe('WelcomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the public welcome surface and can enter as guest', async () => {
    mockSignInAnonymously.mockResolvedValue({ session: {}, user: { is_anonymous: true } });
    const onGuest = jest.fn();
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
