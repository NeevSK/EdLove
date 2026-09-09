import {
  canSkipOnboardingStep,
  getNextOnboardingStep,
  getPreviousOnboardingStep,
} from '@repo/ui/screens/onboardingFlow';
import { describe, expect, it } from 'vitest';

describe('onboarding transitions', () => {
  it('advances and rewinds by phase', () => {
    expect(getNextOnboardingStep(0, 'arrival')).toBe(1);
    expect(getNextOnboardingStep(5, 'optional')).toBe(6);
    expect(getNextOnboardingStep(6, 'complete')).toBe(6);
    expect(getPreviousOnboardingStep(0)).toBe(0);
    expect(getPreviousOnboardingStep(3)).toBe(2);
  });

  it('allows skipping only after the mandatory phases begin', () => {
    expect(canSkipOnboardingStep('arrival')).toBe(false);
    expect(canSkipOnboardingStep('identity')).toBe(false);
    expect(canSkipOnboardingStep('mandatory')).toBe(true);
    expect(canSkipOnboardingStep('optional')).toBe(true);
  });
});
