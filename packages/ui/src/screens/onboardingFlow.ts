import type { Capacity } from '@repo/core/types';

export type OnboardingPhase = 'arrival' | 'identity' | 'mandatory' | 'optional' | 'complete';

export const ONBOARDING_FLOW = [
  { step: 0, phase: 'arrival' as const, label: 'STEP 1 · ARRIVAL' },
  { step: 1, phase: 'identity' as const, label: 'STEP 2 · IDENTITY' },
  { step: 2, phase: 'mandatory' as const, label: 'STEP 3 · FOUNDATION' },
  { step: 3, phase: 'mandatory' as const, label: 'STEP 4 · FOUNDATION' },
  { step: 4, phase: 'mandatory' as const, label: 'STEP 5 · FOUNDATION' },
  { step: 5, phase: 'optional' as const, label: 'STEP 6 · EXPLORE' },
  { step: 6, phase: 'complete' as const, label: 'STEP 7 · COMPLETE' },
] as const;

export function getOnboardingPhase(step: number): OnboardingPhase {
  return ONBOARDING_FLOW.find((item) => item.step === step)?.phase ?? 'arrival';
}

export function getOnboardingStepLabel(step: number): string {
  return ONBOARDING_FLOW.find((item) => item.step === step)?.label ?? 'STEP';
}

export function canProceedOnboardingStep(params: {
  phase: OnboardingPhase;
  name: string;
  selectedCapacity: Capacity;
  schoolId: string | null;
}): boolean {
  const { phase, name } = params;
  const trimmedName = name.trim();

  switch (phase) {
    case 'arrival':
      return trimmedName.length > 0;
    case 'identity':
      return true;
    case 'mandatory':
    case 'optional':
    case 'complete':
      return trimmedName.length > 0;
    default:
      return false;
  }
}

export function getNextOnboardingStep(step: number, phase: OnboardingPhase): number {
  if (phase === 'complete') return step;
  return Math.min(6, step + 1);
}

export function getPreviousOnboardingStep(step: number): number {
  return Math.max(0, step - 1);
}

export function canSkipOnboardingStep(phase: OnboardingPhase): boolean {
  return phase === 'mandatory' || phase === 'optional' || phase === 'complete';
}
