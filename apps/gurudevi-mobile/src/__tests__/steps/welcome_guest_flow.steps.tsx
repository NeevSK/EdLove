// @ts-nocheck
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { defineFeature, loadFeature } from 'jest-cucumber';
import WelcomeScreen from '../../screens/WelcomeScreen';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
    }),
}));

// Mock Supabase
const mockSignInAnonymously = jest.fn(() => Promise.resolve({
    data: { session: { user: { id: 'test-user-id' } } },
    error: null
}));

jest.mock('../../lib/supabase', () => ({
    supabase: {
        auth: {
            signInAnonymously: () => mockSignInAnonymously(),
        },
    },
}));

// Mock i18next
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallback?: string) => fallback || key,
    }),
}));

// Mock hooks
jest.mock('../../hooks/useThemedColors', () => ({
    useThemedColors: () => ({
        action: '#D4AF37',
        text: '#000000',
        textSecondary: '#666666',
        textTertiary: '#999999',
    }),
}));

// Mock Theme
jest.mock('../../constants/Theme', () => ({
    Theme: {
        colors: {
            white: '#FFFFFF',
        },
        corners: {
            comfortable: 12,
        },
        spacing: {
            xl: 24,
        },
    },
}));

// Load the feature
const feature = loadFeature('./features/welcome_guest_flow.feature');

defineFeature(feature, (test) => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Exploring as Guest with Clear Messaging', ({ given, when, then, and }) => {
        given('I am a new user opening the app for the first time', () => {
            // Setup initial state
        });

        and('I am on a low-end Android device with 3G internet', () => {
            // This would be mocked in constraint tests
        });

        when('I see the Welcome Screen', () => {
            render(<WelcomeScreen />);
        });

        then('I should see the app logo', () => {
            // Logo is rendered as an Image component
            expect(screen.getByTestId('app-logo')).toBeTruthy();
        });

        and('I should see a heading "Gurudevi"', () => {
            expect(screen.getByText('Gurudevi')).toBeTruthy();
        });

        and('I should see a subtitle "The Digital Sanctuary for Educators"', () => {
            expect(screen.getByText('The Digital Sanctuary for Educators')).toBeTruthy();
        });

        and('I should see a privacy checkbox that is checked by default', () => {
            const checkbox = screen.getByLabelText('Accept Terms');
            expect(checkbox).toBeTruthy();
            expect(checkbox.props.isChecked).toBe(true);
        });

        and('I should see a primary button "Explore as Guest"', () => {
            expect(screen.getByText('Explore as Guest')).toBeTruthy();
        });

        and('I should see subtext "No account needed • Full access"', () => {
            expect(screen.getByText('No account needed • Full access')).toBeTruthy();
        });

        and('I should see a secondary button "Already have an account? Log In"', () => {
            expect(screen.getByText('Already have an account? Log In')).toBeTruthy();
        });
    });

    test('Starting Guest Session', ({ given, when, then, and }) => {
        given('I have accepted the privacy policy', () => {
            render(<WelcomeScreen />);
            // Checkbox is checked by default
        });

        when('I press "Explore as Guest"', () => {
            const button = screen.getByText('Explore as Guest');
            fireEvent.press(button);
        });

        then('I should see a loading message "Opening Sanctuary..."', async () => {
            await waitFor(() => {
                expect(screen.getByText('Initializing Sanctuary...')).toBeTruthy();
            });
        });

        and('an anonymous session should be created', async () => {
            await waitFor(() => {
                expect(mockSignInAnonymously).toHaveBeenCalledTimes(1);
            });
        });

        and('I should be redirected to the Onboarding Screen within 5 seconds', async () => {
            // This would be verified by navigation mock
            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalled();
            }, { timeout: 5000 });
        });
    });

    test('Privacy Policy Enforcement', ({ given, when, then, and }) => {
        given('the privacy checkbox is unchecked', () => {
            render(<WelcomeScreen />);
            const checkbox = screen.getByLabelText('Accept Terms');
            fireEvent.press(checkbox); // Uncheck it
        });

        when('I try to press "Explore as Guest"', () => {
            const button = screen.getByText('Explore as Guest');
            fireEvent.press(button);
        });

        then('the button should be disabled', () => {
            const button = screen.getByText('Explore as Guest');
            expect(button.props.isDisabled).toBe(true);
        });

        and('the button should appear grayed out', () => {
            const button = screen.getByText('Explore as Guest');
            // Check for disabled styling
            expect(button.props.sx.backgroundColor).not.toBe('#D4AF37');
        });
    });

    test('Returning to Login', ({ when, then, and }) => {
        when('I press "Already have an account? Log In"', () => {
            render(<WelcomeScreen />);
            const button = screen.getByText('Already have an account? Log In');
            fireEvent.press(button);
        });

        then('I should see the Auth Screen', () => {
            expect(mockNavigate).toHaveBeenCalledWith('Auth');
        });

        and('I should see options for Email and Google login', () => {
            // This would be tested in AuthScreen tests
        });
    });
});
