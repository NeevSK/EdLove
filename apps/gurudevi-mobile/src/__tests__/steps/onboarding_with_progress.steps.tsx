// @ts-nocheck
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { defineFeature, loadFeature } from 'jest-cucumber';
import OnboardingScreen from '../../screens/OnboardingScreen';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
    }),
}));

// Mock Supabase
jest.mock('../../lib/supabase', () => ({
    supabase: {
        auth: {
            getUser: () => Promise.resolve({
                data: { user: { id: 'test-user-id' } },
                error: null
            }),
        },
        from: () => ({
            insert: () => ({
                select: () => ({
                    single: () => Promise.resolve({ data: { id: 'school-id' }, error: null })
                })
            }),
            upsert: () => Promise.resolve({ error: null }),
            select: () => ({
                eq: () => ({
                    single: () => Promise.resolve({ data: null, error: null })
                })
            })
        }),
    },
}));

// Mock i18next
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallback?: string) => {
            const translations = {
                'onboarding.nameTitle': 'Welcome! What should we call you?',
                'onboarding.roleTitle': 'What is your role?',
                'onboarding.philosophyTitle': 'The Sanctuary Philosophy',
                'onboarding.continue': 'Continue',
                'onboarding.back': 'Back',
                'onboarding.next': 'Next',
                'onboarding.skip': 'Skip',
            };
            return translations[key] || fallback || key;
        },
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

// Mock store
jest.mock('../../store/useStore', () => ({
    useStore: {
        getState: () => ({
            setTeacherName: jest.fn(),
            setUserRole: jest.fn(),
            setOnboardingCompleted: jest.fn(),
            setJustFinishedOnboarding: jest.fn(),
        }),
    },
}));

// Load the feature
const feature = loadFeature('./features/onboarding_with_progress.feature');

defineFeature(feature, (test) => {
    const mockOnComplete = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Name Input with Progress Indicator', ({ given, when, then, and }) => {
        given('I have started as a guest', () => {
            // Guest session established
        });

        and('I am on the Onboarding Screen', () => {
            render(<OnboardingScreen onComplete={mockOnComplete} isAnonymous={true} />);
        });

        when('I am on Step 1 (Name)', () => {
            // Already on step 1 by default
        });

        then('I should see a progress indicator showing "Step 1 of 8"', () => {
            expect(screen.getByText('Step 1 of 8')).toBeTruthy();
        });

        and('I should see 8 progress dots', () => {
            const dots = screen.getAllByTestId(/progress-dot-/);
            expect(dots).toHaveLength(8);
        });

        and('the first dot should be highlighted', () => {
            const firstDot = screen.getByTestId('progress-dot-0');
            expect(firstDot.props.sx.width).toBe(24); // Active dot is larger
        });

        and('I should see a heading "Welcome! What should we call you?"', () => {
            expect(screen.getByText('Welcome! What should we call you?')).toBeTruthy();
        });

        and('I should see an input field with placeholder text', () => {
            expect(screen.getByPlaceholderText(/name/i)).toBeTruthy();
        });

        and('the Continue button should be disabled until I enter a name', () => {
            const button = screen.getByText('Continue');
            expect(button.props.isDisabled).toBe(true);
        });
    });

    test('Completing Name Step', ({ given, when, then, and }) => {
        given('I am on Step 1 (Name)', () => {
            render(<OnboardingScreen onComplete={mockOnComplete} isAnonymous={true} />);
        });

        when('I enter "Naween" in the name field', () => {
            const input = screen.getByPlaceholderText(/name/i);
            fireEvent.changeText(input, 'Naween');
        });

        then('the Continue button should become enabled', () => {
            const button = screen.getByText('Continue');
            expect(button.props.isDisabled).toBe(false);
        });

        when('I press Continue', () => {
            const button = screen.getByText('Continue');
            fireEvent.press(button);
        });

        then('I should move to Step 2 (Role)', () => {
            expect(screen.getByText('What is your role?')).toBeTruthy();
        });

        and('the progress indicator should show "Step 2 of 8"', () => {
            expect(screen.getByText('Step 2 of 8')).toBeTruthy();
        });

        and('the second dot should be highlighted', () => {
            const secondDot = screen.getByTestId('progress-dot-1');
            expect(secondDot.props.sx.width).toBe(24);
        });
    });

    test('Sanctuary Tour with Visual Icons', ({ given, then, and }) => {
        given('I am on Step 3 (Philosophy Tour)', () => {
            render(<OnboardingScreen onComplete={mockOnComplete} isAnonymous={true} />);
            // Navigate to step 3
            const nameInput = screen.getByPlaceholderText(/name/i);
            fireEvent.changeText(nameInput, 'Test');
            fireEvent.press(screen.getByText('Continue'));
            fireEvent.press(screen.getByText('Continue')); // Skip role step
        });

        then('I should see a large emoji icon "🪷"', () => {
            expect(screen.getByText('🪷')).toBeTruthy();
        });

        and('I should see a heading with the tour title', () => {
            expect(screen.getByText('The Sanctuary Philosophy')).toBeTruthy();
        });

        and('I should see a "Back" button', () => {
            expect(screen.getByText('Back')).toBeTruthy();
        });

        and('I should see a "Next" button', () => {
            expect(screen.getByText('Next')).toBeTruthy();
        });

        and('I should see a "Skip" link', () => {
            expect(screen.getByText('Skip')).toBeTruthy();
        });
    });

    test('Skipping Tour', ({ given, when, then, and }) => {
        given('I am on Step 3 (Philosophy Tour)', () => {
            render(<OnboardingScreen onComplete={mockOnComplete} isAnonymous={true} />);
            // Navigate to tour
            const nameInput = screen.getByPlaceholderText(/name/i);
            fireEvent.changeText(nameInput, 'Test');
            fireEvent.press(screen.getByText('Continue'));
            fireEvent.press(screen.getByText('Continue'));
        });

        when('I press "Skip"', () => {
            const skipButton = screen.getByText('Skip');
            fireEvent.press(skipButton);
        });

        then('I should jump to Step 8 (Auth/Completion)', () => {
            expect(screen.getByText('Step 8 of 8')).toBeTruthy();
        });

        and('the progress indicator should show "Step 8 of 8"', () => {
            expect(screen.getByText('Step 8 of 8')).toBeTruthy();
        });
    });
});
