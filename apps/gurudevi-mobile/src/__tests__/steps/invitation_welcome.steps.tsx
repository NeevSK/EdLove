// @ts-nocheck
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { defineFeature, loadFeature } from 'jest-cucumber';
import InvitationWelcomeScreen from '../../screens/InvitationWelcomeScreen';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
    }),
}));

// Mock Supabase
const mockUpdate = jest.fn(() => ({
    eq: jest.fn(() => Promise.resolve({ error: null }))
}));
const mockFrom = jest.fn(() => ({
    insert: jest.fn(() => Promise.resolve({ error: null })),
    update: mockUpdate,
}));
const mockGetSession = jest.fn(() => Promise.resolve({
    data: { session: { user: { id: 'test-user-id' } } },
    error: null
}));

jest.mock('../../lib/supabase', () => ({
    supabase: {
        auth: {
            getSession: () => mockGetSession(),
        },
        from: (table: string) => mockFrom(table),
    },
}));

// Simplified Global Mocks for UI Components
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
const feature = loadFeature('./src/features/invitation_welcome.feature');

defineFeature(feature, (test) => {
    test('Arriving via Teacher invitation', ({ given, when, then, and }) => {
        let role: string;
        let schoolName: string;

        given(/^I have a deep-link invitation for a "(.*)" role in "(.*)"$/, (invRole: string, invSchool: string) => {
            role = invRole;
            schoolName = invSchool;
        });

        when('I open the app via the invitation link', () => {
            render(<InvitationWelcomeScreen route={{ params: { role, schoolName } } as any} />);
        });

        then(/^I should see a welcome message "Welcome to (.*)"$/, (expectedSchool: string) => {
            expect(screen.getByText(`Welcome to ${expectedSchool}`)).toBeTruthy();
        });

        and(/^I should see my invited role as "(.*)"$/, (expectedRole: string) => {
            expect(screen.getByText(expectedRole)).toBeTruthy();
        });

        and(/^I should see a button to "(.*)"$/, (buttonText: string) => {
            expect(screen.getByText(buttonText)).toBeTruthy();
        });
    });

    test('Accepting an invitation', ({ given, when, then, and }) => {
        let role: string;
        let schoolName: string;

        given(/^I am on the invitation welcome screen for "(.*)" in "(.*)"$/, (invRole: string, invSchool: string) => {
            role = invRole;
            schoolName = invSchool;
            render(<InvitationWelcomeScreen route={{ params: { role, schoolName } } as any} />);
        });

        when(/^I press "(.*)"$/, (buttonText: string) => {
            const button = screen.getByText(buttonText);
            fireEvent.click(button);
        });

        then(/^I should be redirected to the "(.*)" screen$/, async (screenName: string) => {
            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith(screenName);
            });
        });

        and(/^my role should be saved as "(.*)" in the database$/, async (expectedRole: string) => {
            await waitFor(() => {
                expect(mockFrom).toHaveBeenCalledWith('users');
                expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
                    role: expectedRole.toLowerCase(),
                    onboarding_completed: true
                }));
            });
        });
    });
});
