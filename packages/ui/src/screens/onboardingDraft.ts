import type { Capacity } from '@repo/core/types';
import { ONBOARDING_LAST_STEP, type OnboardingJourneyState } from './onboardingJourney';

const onboardingProgressPrefix = 'onboarding_progress:';

export interface OnboardingDraft {
  userId: string;
  step: number;
  name: string;
  selectedCapacity: Capacity;
  schoolId: string | null;
}

const capacities = new Set<Capacity>(['teacher', 'student', 'principal']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isCapacity(value: unknown): value is Capacity {
  return typeof value === 'string' && capacities.has(value as Capacity);
}

/**
 * Reads both historical renderer formats. Drafts with a different owner or an
 * invalid shape are deliberately ignored instead of being applied to a journey.
 */
export function parseOnboardingDraft(raw: string, expectedUserId: string): OnboardingDraft | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.user_id !== expectedUserId) return null;

    const step = parsed.step;
    const capacity = parsed.selectedCapacity ?? parsed.capacity;
    const schoolId = parsed.schoolId;
    if (
      typeof step !== 'number' ||
      !Number.isInteger(step) ||
      step < 0 ||
      step > ONBOARDING_LAST_STEP ||
      typeof parsed.name !== 'string' ||
      !isCapacity(capacity) ||
      (schoolId !== undefined && schoolId !== null && typeof schoolId !== 'string')
    ) {
      return null;
    }

    return {
      userId: expectedUserId,
      step,
      name: parsed.name,
      selectedCapacity: capacity,
      schoolId: typeof schoolId === 'string' ? schoolId : null,
    };
  } catch {
    return null;
  }
}

export function serializeOnboardingDraft(params: {
  userId: string;
  state: Pick<OnboardingJourneyState, 'currentStep' | 'name' | 'selectedCapacity' | 'schoolId'>;
}): string {
  const { userId, state } = params;
  return JSON.stringify({
    user_id: userId,
    step: state.currentStep,
    name: state.name,
    capacity: state.selectedCapacity,
    schoolId: state.schoolId,
  });
}

/**
 * Drafts are scoped to the authenticated identity so shared devices and
 * consecutive anonymous sessions cannot restore another person's journey.
 */
export function getOnboardingProgressKey(userId: string): string {
  return `${onboardingProgressPrefix}${userId}`;
}
