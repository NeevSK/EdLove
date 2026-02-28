// Mock expo-camera BEFORE any imports
jest.mock('expo-camera', () => ({
    CameraView: 'CameraView',
    CameraType: { back: 'back', front: 'front' },
    useCameraPermissions: () => [{ granted: true }, jest.fn()],
}));

jest.mock('expo-image-picker', () => ({
    launchImageLibraryAsync: jest.fn(),
    MediaTypeOptions: { Images: 'Images' },
}));

// TDD Unit Tests for OnboardingScreen Component
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import OnboardingScreen from '../../screens/OnboardingScreen';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallback?: string) => {
            const map: Record<string, string> = {
                'onboarding.nameTitle': 'Welcome! What should we call you?',
                'onboarding.namePlaceholder': 'Enter your name',
                'onboarding.roleTitle': 'What is your role?',
                'onboarding.philosophyTitle': 'The Sanctuary Philosophy',
                'onboarding.continue': 'Continue',
                'onboarding.back': 'Back',
                'onboarding.next': 'Next',
                'onboarding.skip': 'Skip',
                'role.teacher': 'Teacher',
                'role.student': 'Student',
            };
            return map[key] || fallback || key;
        },
    }),
}));

jest.mock('@repo/ui', () => ({
    useThemedColors: () => ({
        action: '#D4AF37', text: '#000000',
        textSecondary: '#666666', textTertiary: '#999999',
    }),
}));

jest.mock('@repo/core', () => ({
    useStore: {
        getState: () => ({
            setTeacherName: jest.fn(),
            setUserRole: jest.fn(),
            setOnboardingCompleted: jest.fn(),
            setJustFinishedOnboarding: jest.fn(),
        }),
    },
    supabase: {
        auth: {
            getUser: () => Promise.resolve({ data: { user: { id: 'test-user-id' } }, error: null }),
        },
        from: () => ({
            insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: { id: 'school-id' }, error: null }) }) }),
            upsert: () => Promise.resolve({ error: null }),
            select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
        }),
    },
}));

jest.mock('expo-haptics', () => ({
    impactAsync: jest.fn(),
    ImpactFeedbackStyle: { Light: 'light' },
}));

describe('OnboardingScreen Component', () => {
    const mockOnComplete = jest.fn();
    beforeEach(() => { jest.clearAllMocks(); });

    describe('Initial Rendering', () => {
        it('starts at step 0 (Name)', async () => {
            const { getByText } = await render(<OnboardingScreen onComplete={mockOnComplete} />);
            expect(getByText('Welcome! What should we call you?')).toBeTruthy();
            expect(getByText('Step 1 of 8')).toBeTruthy();
        });

        it('renders ProgressIndicator on first step', async () => {
            const { getByText, getAllByTestId } = await render(<OnboardingScreen onComplete={mockOnComplete} />);
            expect(getByText('Step 1 of 8')).toBeTruthy();
            const dots = getAllByTestId(/progress-dot-/);
            expect(dots).toHaveLength(8);
        });
    });

    describe('Name Step Validation', () => {
        it('disables Continue button when name is empty', async () => {
            const { getByText } = await render(<OnboardingScreen onComplete={mockOnComplete} />);
            const continueButton = getByText('Continue');
            expect(continueButton.props.isDisabled).toBe(true);
        });

        it('enables Continue button when name is entered', async () => {
            const { getByText, getByPlaceholderText } = await render(<OnboardingScreen onComplete={mockOnComplete} />);
            const input = getByPlaceholderText('Enter your name');
            fireEvent.changeText(input, 'Test User');
            const continueButton = getByText('Continue');
            expect(continueButton.props.isDisabled).toBe(false);
        });

        it('trims whitespace from name input', async () => {
            const { getByText, getByPlaceholderText } = await render(<OnboardingScreen onComplete={mockOnComplete} />);
            const input = getByPlaceholderText('Enter your name');
            fireEvent.changeText(input, '   ');
            const continueButton = getByText('Continue');
            expect(continueButton.props.isDisabled).toBe(true);
        });
    });

    describe('Progress Indicator Updates', () => {
        it('updates progress indicator when moving to step 2', async () => {
            const { getByText, getByPlaceholderText } = await render(<OnboardingScreen onComplete={mockOnComplete} />);
            fireEvent.changeText(getByPlaceholderText('Enter your name'), 'Test');
            fireEvent.press(getByText('Continue'));
            await waitFor(() => expect(getByText('Step 2 of 8')).toBeTruthy());
        });

        it('highlights correct dot on each step', async () => {
            const { getByText, getByTestId, getByPlaceholderText } = await render(<OnboardingScreen onComplete={mockOnComplete} />);
            let activeDot = getByTestId('progress-dot-0');
            expect(activeDot.props.sx.width).toBe(24);
            fireEvent.changeText(getByPlaceholderText('Enter your name'), 'Test');
            fireEvent.press(getByText('Continue'));
            await waitFor(() => {
                const dot1 = getByTestId('progress-dot-1');
                expect(dot1.props.sx.width).toBe(24);
            });
        });
    });

    describe('Tour Screens with Emoji Icons', () => {
        it('displays emoji icon on tour screens', async () => {
            const { getByText, getByPlaceholderText } = await render(<OnboardingScreen onComplete={mockOnComplete} />);
            fireEvent.changeText(getByPlaceholderText('Enter your name'), 'Test');
            fireEvent.press(getByText('Continue'));
            fireEvent.press(getByText('Continue'));
            await waitFor(() => expect(getByText('🪷')).toBeTruthy());
        });

        it('displays Back, Next, and Skip buttons on tour screens', async () => {
            const { getByText, getByPlaceholderText } = await render(<OnboardingScreen onComplete={mockOnComplete} />);
            fireEvent.changeText(getByPlaceholderText('Enter your name'), 'Test');
            fireEvent.press(getByText('Continue'));
            fireEvent.press(getByText('Continue'));
            await waitFor(() => {
                expect(getByText('Back')).toBeTruthy();
                expect(getByText('Next')).toBeTruthy();
                expect(getByText('Skip')).toBeTruthy();
            });
        });
    });

    describe('Skip Tour Functionality', () => {
        it('jumps to step 8 when Skip is pressed', async () => {
            const { getByText, getByPlaceholderText } = await render(<OnboardingScreen onComplete={mockOnComplete} />);
            fireEvent.changeText(getByPlaceholderText('Enter your name'), 'Test');
            fireEvent.press(getByText('Continue'));
            fireEvent.press(getByText('Continue'));
            await waitFor(() => fireEvent.press(getByText('Skip')));
            await waitFor(() => expect(getByText('Step 8 of 8')).toBeTruthy());
        });
    });

    describe('Back Navigation', () => {
        it('allows going back from role to name step', async () => {
            const { getByText, getByPlaceholderText } = await render(<OnboardingScreen onComplete={mockOnComplete} />);
            fireEvent.changeText(getByPlaceholderText('Enter your name'), 'Test');
            fireEvent.press(getByText('Continue'));
            await waitFor(() => fireEvent.press(getByText('Back')));
            await waitFor(() => expect(getByText('Welcome! What should we call you?')).toBeTruthy());
        });
    });

    describe('Anonymous vs Registered Flow', () => {
        it('shows guest flow when isAnonymous is true', async () => {
            const { getByText } = await render(<OnboardingScreen onComplete={mockOnComplete} isAnonymous={true} />);
            expect(getByText('Welcome! What should we call you?')).toBeTruthy();
        });

        it('shows regular flow when isAnonymous is false', async () => {
            const { getByText } = await render(<OnboardingScreen onComplete={mockOnComplete} isAnonymous={false} />);
            expect(getByText('Welcome! What should we call you?')).toBeTruthy();
        });
    });
});
