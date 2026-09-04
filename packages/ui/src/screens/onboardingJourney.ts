import type { Capacity } from '@repo/core/types';

export const ONBOARDING_LAST_STEP = 6;

export type OnboardingCompletionStatus = 'idle' | 'submitting' | 'failed' | 'completed';

export interface OnboardingJourneyState {
  currentStep: number;
  name: string;
  selectedCapacity: Capacity;
  schoolId: string | null;
  isProcessing: boolean;
  error: string | null;
  showDevSandbox: boolean;
  pricingTier: string;
  citizenship: string;
  completionStatus: OnboardingCompletionStatus;
}

export type OnboardingJourneyAction =
  | { type: 'SET_STEP'; step: number }
  | { type: 'SET_NAME'; name: string }
  | { type: 'SET_CAPACITY'; capacity: Capacity }
  | { type: 'SET_SCHOOL_ID'; schoolId: string | null }
  | { type: 'SET_PROCESSING'; isProcessing: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'RESTORE_PROGRESS'; progress: Partial<OnboardingJourneyState> }
  | { type: 'SHOW_DEV_SANDBOX'; visible: boolean }
  | { type: 'SET_PRICING'; pricing: string }
  | { type: 'SET_CITIZENSHIP'; citizenship: string }
  | { type: 'BEGIN_COMPLETION' }
  | { type: 'COMPLETE' }
  | { type: 'FAIL_COMPLETION'; error: string }
  | { type: 'RETRY_COMPLETION' };

export const initialOnboardingJourneyState: OnboardingJourneyState = {
  currentStep: 0,
  name: '',
  selectedCapacity: 'teacher',
  schoolId: null,
  isProcessing: false,
  error: null,
  showDevSandbox: false,
  pricingTier: 'FREE',
  citizenship: 'WANDERER',
  completionStatus: 'idle',
};

function normalizeStep(step: number): number {
  return Math.max(0, Math.min(ONBOARDING_LAST_STEP, step));
}

export function onboardingJourneyReducer(
  state: OnboardingJourneyState,
  action: OnboardingJourneyAction,
): OnboardingJourneyState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: normalizeStep(action.step) };
    case 'SET_NAME':
      return { ...state, name: action.name, error: null };
    case 'SET_CAPACITY':
      return { ...state, selectedCapacity: action.capacity, error: null };
    case 'SET_SCHOOL_ID':
      return { ...state, schoolId: action.schoolId };
    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.isProcessing };
    case 'SET_ERROR':
      return { ...state, error: action.error, isProcessing: false };
    case 'NEXT_STEP':
      return { ...state, currentStep: normalizeStep(state.currentStep + 1), error: null };
    case 'PREV_STEP':
      return { ...state, currentStep: normalizeStep(state.currentStep - 1), error: null };
    case 'RESTORE_PROGRESS':
      return {
        ...state,
        ...action.progress,
        currentStep:
          action.progress.currentStep === undefined
            ? state.currentStep
            : normalizeStep(action.progress.currentStep),
        isProcessing: false,
        error: null,
        completionStatus: 'idle',
      };
    case 'SHOW_DEV_SANDBOX':
      return { ...state, showDevSandbox: action.visible };
    case 'SET_PRICING':
      return { ...state, pricingTier: action.pricing };
    case 'SET_CITIZENSHIP':
      return { ...state, citizenship: action.citizenship };
    case 'BEGIN_COMPLETION':
      return { ...state, isProcessing: true, error: null, completionStatus: 'submitting' };
    case 'COMPLETE':
      return { ...state, isProcessing: false, error: null, completionStatus: 'completed' };
    case 'FAIL_COMPLETION':
      return { ...state, isProcessing: false, error: action.error, completionStatus: 'failed' };
    case 'RETRY_COMPLETION':
      return { ...state, error: null, completionStatus: 'idle' };
    default:
      return state;
  }
}
