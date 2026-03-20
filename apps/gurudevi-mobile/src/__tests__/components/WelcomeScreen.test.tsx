// WelcomeScreen Tests — grounded in actual component behaviour
//
// Component facts (from reading WelcomeScreen.tsx):
//   - Renders a hardcoded "Gurudevi" Heading (no welcome.title translation key)
//   - Guest CTA uses t('welcome.exploreAsGuest')
//   - Login CTA uses t('welcome.login')
//   - Pressing Login sets showAuth=true → renders <AuthScreen> (not navigate('Auth'))
//   - Guest sign-in calls authAPI.signInAnonymously() from @repo/core (not supabase directly)
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import WelcomeScreen from '../../screens/WelcomeScreen';

const mockSignInAnonymously = jest.fn();
jest.mock('@repo/core', () => ({
    authAPI: { signInAnonymously: () => mockSignInAnonymously() },
    handleAPIError: jest.fn(),
    supabase: { auth: { getUser: jest.fn() } },
}));

// AuthScreen is rendered inline when Login is pressed — provide a stub
jest.mock('../../screens/AuthScreen', () => {
    const React = require('react');
    return () => React.createElement('View', { testID: 'auth-screen' });
});

jest.mock('../../utils/LanguageUtils', () => ({
    LanguageUtils: { setLanguage: jest.fn().mockResolvedValue(undefined) },
}));

describe('WelcomeScreen', () => {
    beforeEach(() => { jest.clearAllMocks(); });

    it('renders the app title and guest CTA', async () => {
        const { getByText } = await render(<WelcomeScreen />);
        // Title is hardcoded, not a translation key
        expect(getByText('Gurudevi')).toBeTruthy();
        // CTA uses the actual key (our t() mock returns the key)
        expect(getByText('welcome.exploreAsGuest')).toBeTruthy();
    });

    it('calls authAPI.signInAnonymously when guest CTA is pressed', async () => {
        mockSignInAnonymously.mockResolvedValue({ data: { session: {} }, error: null });
        const mockOnGuest = jest.fn();
        const { getByText } = await render(<WelcomeScreen onGuest={mockOnGuest} />);
        fireEvent.press(getByText('welcome.exploreAsGuest'));
        await waitFor(() => expect(mockSignInAnonymously).toHaveBeenCalled());
    });

    it('shows auth screen when Login button is pressed', async () => {
        const { getByText, getByTestId } = await render(<WelcomeScreen />);
        fireEvent.press(getByText('welcome.login'));
        await waitFor(() => expect(getByTestId('auth-screen')).toBeTruthy());
    });
});
