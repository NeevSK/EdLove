// Simplified WelcomeScreen Test
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import WelcomeScreen from '../../screens/WelcomeScreen';

// Local mocks for this specific test
const mockSignInAnonymously = jest.fn();
jest.mock('../../lib/supabase', () => ({
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

describe('WelcomeScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders and allows guest sign in', async () => {
        mockSignInAnonymously.mockResolvedValue({ data: { session: {} }, error: null });
        render(<WelcomeScreen />);

        // Use generic text from mock
        expect(screen.getByText('welcome.title')).toBeTruthy();

        const guestButton = screen.getByText('welcome.exploreGuest');
        fireEvent.press(guestButton);

        await waitFor(() => expect(mockSignInAnonymously).toHaveBeenCalled());
    });

    it('navigates to Login', () => {
        render(<WelcomeScreen />);
        fireEvent.press(screen.getByText('welcome.alreadyHaveAccount'));
        expect(mockNavigate).toHaveBeenCalledWith('Auth');
    });
});
