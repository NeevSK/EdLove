// Mock expo-camera BEFORE any imports
jest.mock('expo-camera', () => ({
    CameraView: 'CameraView',
    CameraType: { back: 'back', front: 'front' },
    useCameraPermissions: () => [{ granted: true }, jest.fn()],
}));

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
    launchImageLibraryAsync: jest.fn(),
    MediaTypeOptions: { Images: 'Images' },
}));

// TDD Unit Tests for OnboardingScreen Component
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
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
            const translations: Record<string, string> = {
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

// Mock haptics
jest.mock('../../utils/haptics', () => ({
    hapticLight: jest.fn(),
    hapticSuccess: jest.fn(),
    hapticError: jest.fn(),
}));

describe('OnboardingScreen Component', () => {
    const mockOnComplete = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Initial Rendering', () => {
        it('starts at step 0 (Name)', () => {
            render(<OnboardingScreen onComplete={mockOnComplete} />);

            expect(screen.getByText('Welcome! What should we call you?')).toBeTruthy();
            expect(screen.getByText('Step 1 of 8')).toBeTruthy();
        });

        it('renders ProgressIndicator on first step', () => {
            render(<OnboardingScreen onComplete={mockOnComplete} />);

            expect(screen.getByText('Step 1 of 8')).toBeTruthy();
            const dots = screen.getAllByTestId(/progress-dot-/);
            expect(dots).toHaveLength(8);
        });
    });

    describe('Name Step Validation', () => {
        it('disables Continue button when name is empty', () => {
            render(<OnboardingScreen onComplete={mockOnComplete} />);

            const continueButton = screen.getByText('Continue');
            expect(continueButton.props.isDisabled).toBe(true);
        });

        it('enables Continue button when name is entered', () => {
            render(<OnboardingScreen onComplete={mockOnComplete} />);

            const input = screen.getByPlaceholderText('Enter your name');
            fireEvent.changeText(input, 'Test User');

            const continueButton = screen.getByText('Continue');
            expect(continueButton.props.isDisabled).toBe(false);
        });

        it('trims whitespace from name input', () => {
            render(<OnboardingScreen onComplete={mockOnComplete} />);

            const input = screen.getByPlaceholderText('Enter your name');
            fireEvent.changeText(input, '   ');

            const continueButton = screen.getByText('Continue');
            expect(continueButton.props.isDisabled).toBe(true);
        });
    });

    describe('Progress Indicator Updates', () => {
        it('updates progress indicator when moving to step 2', () => {
            render(<OnboardingScreen onComplete={mockOnComplete} />);

            // Enter name and continue
            const input = screen.getByPlaceholderText('Enter your name');
            fireEvent.changeText(input, 'Test');
            fireEvent.press(screen.getByText('Continue'));

            expect(screen.getByText('Step 2 of 8')).toBeTruthy();
        });

        it('highlights correct dot on each step', () => {
            render(<OnboardingScreen onComplete={mockOnComplete} />);

            // Step 1
            let activeDot = screen.getByTestId('progress-dot-0');
            expect(activeDot.props.sx.width).toBe(24);

            // Move to step 2
            fireEvent.changeText(screen.getByPlaceholderText('Enter your name'), 'Test');
            fireEvent.press(screen.getByText('Continue'));

            activeDot = screen.getByTestId('progress-dot-1');
            expect(activeDot.props.sx.width).toBe(24);
        });
    });

    describe('Tour Screens with Emoji Icons', () => {
        it('displays emoji icon on tour screens', () => {
            render(<OnboardingScreen onComplete={mockOnComplete} />);

            // Navigate to tour (step 3)
            fireEvent.changeText(screen.getByPlaceholderText('Enter your name'), 'Test');
            fireEvent.press(screen.getByText('Continue'));
            fireEvent.press(screen.getByText('Continue')); // Skip role

            // Should see emoji
            expect(screen.getByText('🪷')).toBeTruthy();
        });

        it('shows correct emoji for each tour screen', () => {
            render(<OnboardingScreen onComplete={mockOnComplete} />);

            // Navigate to tour
            fireEvent.changeText(screen.getByPlaceholderText('Enter your name'), 'Test');
            fireEvent.press(screen.getByText('Continue'));
            fireEvent.press(screen.getByText('Continue'));

            // Philosophy screen - Lotus
            expect(screen.getByText('🪷')).toBeTruthy();

            // Move to next tour screen
            fireEvent.press(screen.getByText('Next'));
            expect(screen.getByText('🏫')).toBeTruthy(); // School
        });

        it('displays Back, Next, and Skip buttons on tour screens', () => {
            render(<OnboardingScreen onComplete={mockOnComplete} />);

            // Navigate to tour
            fireEvent.changeText(screen.getByPlaceholderText('Enter your name'), 'Test');
            fireEvent.press(screen.getByText('Continue'));
            fireEvent.press(screen.getByText('Continue'));

            expect(screen.getByText('Back')).toBeTruthy();
            expect(screen.getByText('Next')).toBeTruthy();
            expect(screen.getByText('Skip')).toBeTruthy();
        });
    });

    describe('Skip Tour Functionality', () => {
        it('jumps to step 8 when Skip is pressed', () => {
            render(<OnboardingScreen onComplete={mockOnComplete} />);

            // Navigate to tour
            fireEvent.changeText(screen.getByPlaceholderText('Enter your name'), 'Test');
            fireEvent.press(screen.getByText('Continue'));
            fireEvent.press(screen.getByText('Continue'));

            // Press Skip
            fireEvent.press(screen.getByText('Skip'));

            expect(screen.getByText('Step 8 of 8')).toBeTruthy();
        });
    });

    describe('Back Navigation', () => {
        it('allows going back from role to name step', () => {
            render(<OnboardingScreen onComplete={mockOnComplete} />);

            // Go to step 2
            fireEvent.changeText(screen.getByPlaceholderText('Enter your name'), 'Test');
            fireEvent.press(screen.getByText('Continue'));

            // Go back
            fireEvent.press(screen.getByText('Back'));

            expect(screen.getByText('Welcome! What should we call you?')).toBeTruthy();
            expect(screen.getByText('Step 1 of 8')).toBeTruthy();
        });

        it('preserves entered name when going back', () => {
            render(<OnboardingScreen onComplete={mockOnComplete} />);

            const input = screen.getByPlaceholderText('Enter your name');
            fireEvent.changeText(input, 'Test User');
            fireEvent.press(screen.getByText('Continue'));
            fireEvent.press(screen.getByText('Back'));

            expect(input.props.value).toBe('Test User');
        });
    });

    describe('Anonymous vs Registered Flow', () => {
        it('shows guest flow when isAnonymous is true', () => {
            render(<OnboardingScreen onComplete={mockOnComplete} isAnonymous={true} />);

            // Anonymous users should see the same onboarding
            expect(screen.getByText('Welcome! What should we call you?')).toBeTruthy();
        });

        it('shows regular flow when isAnonymous is false', () => {
            render(<OnboardingScreen onComplete={mockOnComplete} isAnonymous={false} />);

            expect(screen.getByText('Welcome! What should we call you?')).toBeTruthy();
        });
    });
});
