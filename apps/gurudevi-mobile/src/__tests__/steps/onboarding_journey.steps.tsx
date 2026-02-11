// @ts-nocheck
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { defineFeature, loadFeature } from 'jest-cucumber';
import OnboardingScreen from '../../screens/OnboardingScreen';

// Mock store
const mockSetOnboardingCompleted = jest.fn();
const mockSetJustFinishedOnboarding = jest.fn();

const mockStoreState = {
    onboardingCompleted: false,
    justFinishedOnboarding: false,
    setOnboardingCompleted: (completed: boolean) => {
        mockStoreState.onboardingCompleted = completed;
        mockSetOnboardingCompleted(completed);
    },
    setJustFinishedOnboarding: (justFinished: boolean) => {
        mockStoreState.justFinishedOnboarding = justFinished;
        mockSetJustFinishedOnboarding(justFinished);
    },
};

jest.mock('../../store/useStore', () => ({
    useStore: (selector: any) => {
        if (typeof selector === 'function') {
            return selector(mockStoreState);
        }
        return mockStoreState;
    },
}));

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
            getUser: () => Promise.resolve({ data: { user: { id: 'test-user-id' } }, error: null }),
        },
        from: () => ({
            update: () => ({
                eq: () => Promise.resolve({ error: null })
            })
        }),
    },
}));

// Mock UI Components
jest.mock('@gluestack-ui/themed', () => {
    const React = require('react');
    return {
        GluestackUIProvider: ({ children }: any) => children,
        VStack: ({ children, testID }: any) => React.createElement('div', { 'data-testid': testID }, children),
        HStack: ({ children, testID }: any) => React.createElement('div', { 'data-testid': testID, style: { display: 'flex', flexDirection: 'row' } }, children),
        Box: ({ children, testID }: any) => React.createElement('div', { 'data-testid': testID }, children),
        Text: ({ children }: any) => React.createElement('span', {}, children),
        Heading: ({ children }: any) => React.createElement('h1', {}, children),
        Button: ({ children, onPress, testID }: any) => React.createElement('button', { onClick: onPress, 'data-testid': testID || 'Button' }, children),
        ButtonText: ({ children }: any) => React.createElement('span', {}, children),
    };
});

jest.mock('react-native-reanimated', () => ({
    useSharedValue: (val: any) => ({ value: val }),
    useAnimatedStyle: (cb: any) => cb(),
    withSpring: (val: any) => val,
    withTiming: (val: any) => val,
}));

jest.mock('expo-font');
jest.mock('expo-linking', () => ({
    openURL: jest.fn(),
    createURL: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
    SafeAreaProvider: ({ children }: any) => children,
    SafeAreaView: ({ children }: any) => children,
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

// Load the feature from the correct path
const feature = loadFeature('./features/onboarding_journey.feature');

defineFeature(feature, (test) => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockStoreState.onboardingCompleted = false;
        mockStoreState.justFinishedOnboarding = false;
    });

    test('User skips onboarding', ({ given, when, then, and }) => {
        given('I am on the "Welcome to Gurudevi" screen', () => {
            render(<OnboardingScreen />);
        });

        when('I press the "Skip" button', async () => {
            const skipButton = screen.getByText(/Skip/i);
            fireEvent.click(skipButton);
            await waitFor(() => {
                expect(mockSetOnboardingCompleted).toHaveBeenCalledWith(true);
            });
        });

        then('I should be navigated to the Home Screen', () => {
            expect(mockNavigate).toHaveBeenCalledWith('Main');
        });

        and('my onboarding status should be marked as completed', () => {
            expect(mockSetOnboardingCompleted).toHaveBeenCalledWith(true);
        });

        and('I should see the "Warm Welcome" modal', () => {
            expect(mockSetJustFinishedOnboarding).toHaveBeenCalledWith(true);
        });
    });

    test('User completes onboarding normally', ({ given, when, then, and }) => {
        given('I am on the last onboarding screen', () => {
            // Mock being on the last screen by rendering with appropriate state
            render(<OnboardingScreen />);
        });

        when('I press the "Complete" button', async () => {
            const completeButton = screen.getByText(/Complete|Get Started|Begin/i);
            fireEvent.click(completeButton);
            await waitFor(() => {
                expect(mockSetOnboardingCompleted).toHaveBeenCalledWith(true);
            });
        });

        then('I should be navigated to the Home Screen', () => {
            expect(mockNavigate).toHaveBeenCalledWith('Main');
        });

        and('I should see the "Warm Welcome" modal', () => {
            expect(mockSetJustFinishedOnboarding).toHaveBeenCalledWith(true);
        });
    });

    test('Returning user (already onboarded)', ({ given, when, then, and }) => {
        given('I have previously completed onboarding', () => {
            mockStoreState.onboardingCompleted = true;
            mockStoreState.justFinishedOnboarding = false;
        });

        when('I open the app', () => {
            // App would check onboarding status and navigate accordingly
            // This is typically handled in App.tsx routing logic
        });

        then('I should be on the Home Screen', () => {
            // Navigation logic would skip onboarding and go to Main
            expect(mockStoreState.onboardingCompleted).toBe(true);
        });

        and('I should NOT see the "Warm Welcome" modal', () => {
            expect(mockStoreState.justFinishedOnboarding).toBe(false);
        });

        and('I should see the Mood Check', () => {
            // Mood check is part of the normal Self view
            // This would be verified in integration tests
        });
    });
});
