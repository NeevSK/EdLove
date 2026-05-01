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
import OnboardingScreen from '@repo/ui/screens/OnboardingScreen';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({ navigate: jest.fn() }),
}));
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallback?: string) => {
            const map: Record<string, string> = {
                'onboarding.nameTitle': 'Welcome! What should we call you?',
                'onboarding.namePlaceholder': 'Enter your name',
                'onboarding.roleTitle': 'What is your role?',
                'onboarding.continue': 'Continue',
                'onboarding.back': 'Back',
                'onboarding.next': 'Next',
                'onboarding.skip': 'Skip',
                'role.teacher': 'Teacher',
                'role.student': 'Student',
            };
            return map[key] || fallback || key;
        },
        i18n: { language: 'en', changeLanguage: jest.fn() },
    }),
}));
jest.mock("@repo/core/api", () => ({
    UserRole: {},
    useStore: Object.assign(jest.fn(), {
        getState: () => ({
            onboardingCompleted: false,
            setTeacherName: jest.fn(),
            setUserRole: jest.fn(),
            setOnboardingCompleted: jest.fn(),
            setJustFinishedOnboarding: jest.fn(),
        }),
    }),
    supabase: {
        auth: {
            getUser: () => Promise.resolve({ data: { user: { id: 'test-user-id' } }, error: null }),
            getSession: () => Promise.resolve({ data: { session: { user: { is_anonymous: true } } }, error: null }),
        },
        from: () => ({
            insert: () => ({
                select: () => ({
                    single: () => Promise.resolve({ data: { id: 'school-id' }, error: null }),
                }),
            }),
            upsert: () => Promise.resolve({ error: null }),
            update: () => ({ eq: () => Promise.resolve({ error: null }) }),
            select: () => ({
                select: () => ({
                    eq: () => ({ maybeSingle: () => Promise.resolve({ data: null, error: null }) }),
                }),
                eq: () => ({
                    maybeSingle: () => Promise.resolve({ data: null, error: null }),
                    single: () => Promise.resolve({ data: null, error: null }),
                }),
            }),
        }),
    },
    identityAPI: {
        getMyInternalId: jest.fn().mockResolvedValue('test-internal-id'),
    },
    hapticLight: jest.fn(),
    hapticSuccess: jest.fn(),
    hapticError: jest.fn(),
}));
jest.mock('expo-haptics', () => ({
    impactAsync: jest.fn(),
    ImpactFeedbackStyle: { Light: 'light' },
}));
// Stub components rendered at steps not tested here (steps 2+ and auth)
jest.mock('../../screens/AuthScreen', () => {
    const React = require('react');
    return () => React.createElement('View', { testID: 'auth-screen' });
});
jest.mock('@repo/self', () => ({
    OrientationCaptureStep: () => {
        const React = require('react');
        return React.createElement('View', { testID: 'orientation-step' });
    },
}));
describe('OnboardingScreen Component', () => {
    const mockOnComplete = jest.fn();
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('Initial Rendering', () => {
        it('starts at step 0 (Name) with totalSteps=9', async () => {
            const { getByText } = await render(<OnboardingScreen onComplete={mockOnComplete}/>);
            expect(getByText('Welcome! What should we call you?')).toBeTruthy();
            expect(getByText('Step 1 of 9')).toBeTruthy();
        });
        it('renders 9 progress dots on first step', async () => {
            const { getAllByTestId } = await render(<OnboardingScreen onComplete={mockOnComplete}/>);
            expect(getAllByTestId(/progress-dot-/)).toHaveLength(9);
        });
    });
    describe('Name Step Validation', () => {
        it('Continue does not advance step when name is empty (disabled behaviour)', async () => {
            const { getByText } = await render(<OnboardingScreen onComplete={mockOnComplete}/>);
            // Press Continue with no name  component guards: if (!canProceed) return
            await fireEvent.press(getByText('Continue'));
            // Step must remain at 1 of 9 (not advance)
            expect(getByText('Step 1 of 9')).toBeTruthy();
        });
        it('Continue advances step when valid name is entered', async () => {
            const { getByText, getByPlaceholderText } = await render(<OnboardingScreen onComplete={mockOnComplete}/>);
            await fireEvent.changeText(getByPlaceholderText('Enter your name'), 'Test User');
            await fireEvent.press(getByText('Continue'));
            await waitFor(() => expect(getByText('Step 2 of 9')).toBeTruthy());
        });
        it('Continue stays on step 1 for whitespace-only input', async () => {
            const { getByText, getByPlaceholderText } = await render(<OnboardingScreen onComplete={mockOnComplete}/>);
            await fireEvent.changeText(getByPlaceholderText('Enter your name'), '   ');
            await fireEvent.press(getByText('Continue'));
            expect(getByText('Step 1 of 9')).toBeTruthy();
        });
    });
    describe('Progress Indicator Updates', () => {
        it('advances to Step 2 of 9 after valid name + Continue', async () => {
            const { getByText, getByPlaceholderText } = await render(<OnboardingScreen onComplete={mockOnComplete}/>);
            await fireEvent.changeText(getByPlaceholderText('Enter your name'), 'Test');
            await fireEvent.press(getByText('Continue'));
            await waitFor(() => expect(getByText('Step 2 of 9')).toBeTruthy());
        });
        it('first progress dot is active (width=24) on step 0', async () => {
            const { getByTestId } = await render(<OnboardingScreen onComplete={mockOnComplete}/>);
            await waitFor(() => {
                const dot = getByTestId('progress-dot-0');
                expect(dot.props.sx.width).toBe(24);
            });
        });
    });
    describe('Back Navigation', () => {
        it('goes back to Name step from Role step', async () => {
            const { getByText, getByPlaceholderText } = await render(<OnboardingScreen onComplete={mockOnComplete}/>);
            await fireEvent.changeText(getByPlaceholderText('Enter your name'), 'Test');
            await fireEvent.press(getByText('Continue'));
            await waitFor(() => expect(getByText('Step 2 of 9')).toBeTruthy());
            await fireEvent.press(getByText('Back'));
            await waitFor(() => expect(getByText('Welcome! What should we call you?')).toBeTruthy());
        });
    });
    describe('Anonymous vs Registered Flow', () => {
        it('renders name step for anonymous user', async () => {
            const { getByText } = await render(<OnboardingScreen onComplete={mockOnComplete} isAnonymous={true}/>);
            expect(getByText('Welcome! What should we call you?')).toBeTruthy();
        });
        it('renders name step for registered user', async () => {
            const { getByText } = await render(<OnboardingScreen onComplete={mockOnComplete} isAnonymous={false}/>);
            expect(getByText('Welcome! What should we call you?')).toBeTruthy();
        });
    });
});
