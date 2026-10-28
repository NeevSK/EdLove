import { describe, expect, it } from 'vitest';
import {
  canProceedOnboardingStep,
  getOnboardingPhase,
  isOnboardingScreenReadyForInteraction,
} from '../onboardingFlow';
import { initialOnboardingJourneyState, onboardingJourneyReducer } from '../onboardingJourney';

describe('onboarding journey transitions', () => {
  it('marks visible arrival content interactive independently of account admission', () => {
    const base = {
      phase: 'arrival' as const,
      isProcessing: false,
      showingDeveloperSandbox: false,
    };
    expect(isOnboardingScreenReadyForInteraction(base)).toBe(true);
    const accountUnresolved = { ...base, userId: null };
    expect(isOnboardingScreenReadyForInteraction(accountUnresolved)).toBe(true);
    expect(isOnboardingScreenReadyForInteraction({ ...base, isProcessing: true })).toBe(false);
    expect(isOnboardingScreenReadyForInteraction({ ...base, showingDeveloperSandbox: true })).toBe(
      false,
    );
    expect(isOnboardingScreenReadyForInteraction({ ...base, phase: 'identity' })).toBe(false);
  });

  it('enforces the named arrival step and clamps navigation to the journey bounds', () => {
    expect(
      canProceedOnboardingStep({
        phase: getOnboardingPhase(0),
        name: '   ',
        selectedCapacity: 'teacher',
        schoolId: null,
      }),
    ).toBe(false);

    const atFirstStep = onboardingJourneyReducer(initialOnboardingJourneyState, {
      type: 'PREV_STEP',
    });
    expect(atFirstStep.currentStep).toBe(0);

    const atLastStep = onboardingJourneyReducer(initialOnboardingJourneyState, {
      type: 'SET_STEP',
      step: 99,
    });
    expect(atLastStep.currentStep).toBe(6);
  });

  it('models completion failure and retry without leaving the journey processing', () => {
    const submitting = onboardingJourneyReducer(initialOnboardingJourneyState, {
      type: 'BEGIN_COMPLETION',
    });
    expect(submitting).toMatchObject({
      isProcessing: true,
      completionStatus: 'submitting',
      error: null,
    });

    const failed = onboardingJourneyReducer(submitting, {
      type: 'FAIL_COMPLETION',
      error: 'Connection lost',
    });
    expect(failed).toMatchObject({
      isProcessing: false,
      completionStatus: 'failed',
      error: 'Connection lost',
    });

    expect(onboardingJourneyReducer(failed, { type: 'RETRY_COMPLETION' })).toMatchObject({
      isProcessing: false,
      completionStatus: 'idle',
      error: null,
    });
  });
});
