import { describe, expect, it } from 'vitest';
import {
  canProceedOnboardingStep,
  getOnboardingPhase,
  getOnboardingStepLabel,
} from '@repo/ui/screens/onboardingFlow';

describe('onboarding flow state machine', () => {
  it('maps steps to explicit phases and labels', () => {
    expect(getOnboardingPhase(0)).toBe('arrival');
    expect(getOnboardingPhase(1)).toBe('identity');
    expect(getOnboardingPhase(5)).toBe('optional');
    expect(getOnboardingPhase(99)).toBe('arrival');
    expect(getOnboardingStepLabel(0)).toContain('ARRIVAL');
    expect(getOnboardingStepLabel(6)).toContain('COMPLETE');
  });

  it('requires a real name before arrival can advance', () => {
    expect(
      canProceedOnboardingStep({
        phase: 'arrival',
        name: '',
        selectedCapacity: 'teacher',
        schoolId: null,
      }),
    ).toBe(false);

    expect(
      canProceedOnboardingStep({
        phase: 'arrival',
        name: 'A',
        selectedCapacity: 'teacher',
        schoolId: null,
      }),
    ).toBe(true);
  });

  it('allows identity and later phases to move through the journey', () => {
    expect(
      canProceedOnboardingStep({
        phase: 'identity',
        name: 'Naween',
        selectedCapacity: 'teacher',
        schoolId: null,
      }),
    ).toBe(true);

    expect(
      canProceedOnboardingStep({
        phase: 'mandatory',
        name: 'Naween',
        selectedCapacity: 'principal',
        schoolId: 'school-1',
      }),
    ).toBe(true);
  });
});
