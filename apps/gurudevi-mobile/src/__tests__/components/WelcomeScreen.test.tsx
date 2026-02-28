// Simplified WelcomeScreen Test
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import WelcomeScreen from '../../screens/WelcomeScreen';

// Local mocks for this specific test
const mockSignInAnonymously = jest.fn();
jest.mock('@repo/core', () => ({
    supabase: {
        auth: {
            signInAnonymously: () => mockSignInAnonymously(),
        },
    },
}));

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({ navigate: mockNavigate }),
}));

// i18next singleton used directly by WelcomeScreen (i18n.language)
jest.mock('i18next', () => ({
    language: 'en',
    t: (key: string) => key,
    use: jest.fn().mockReturnThis(),
    init: jest.fn().mockResolvedValue(undefined),
    changeLanguage: jest.fn().mockResolvedValue(undefined),
}));

describe('WelcomeScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders and allows guest sign in', async () => {
        mockSignInAnonymously.mockResolvedValue({ data: { session: {} }, error: null });
        const { getByText } = await render(<WelcomeScreen />);

        expect(getByText('welcome.title')).toBeTruthy();

        const guestButton = getByText('welcome.exploreGuest');
        fireEvent.press(guestButton);

        await waitFor(() => expect(mockSignInAnonymously).toHaveBeenCalled());
    });

    it('navigates to Login', async () => {
        const { getByText } = await render(<WelcomeScreen />);
        fireEvent.press(getByText('welcome.alreadyHaveAccount'));
        expect(mockNavigate).toHaveBeenCalledWith('Auth');
    });
});
