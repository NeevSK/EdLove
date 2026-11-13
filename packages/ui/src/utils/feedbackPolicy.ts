/**
 * Feedback from an experience profile. Kept for callers that hold a verger
 * profile; the decision itself is the world grammar's `planFeedback`, so it
 * matches what every kit component does.
 */

import type { ExperienceProfile } from '../context/types';
import {
  type FeedbackEventAlias,
  type FeedbackEvent as GrammarEvent,
  type HapticKind,
  planFeedback,
  type SoundCue,
} from '../theme/feedback';
import { haptic as playHaptic } from './haptics';

export type FeedbackEvent = GrammarEvent | FeedbackEventAlias;
export type { SoundCue };

export interface FeedbackDecision {
  haptic: HapticKind | null;
  sound: SoundCue | null;
}

export function resolveFeedbackDecision(
  event: FeedbackEvent,
  profile: ExperienceProfile,
): FeedbackDecision {
  const plan = planFeedback(event, {
    character: 'soft',
    haptics: profile.haptics,
    sound: profile.sound,
  });
  return { haptic: plan.haptic, sound: plan.sound };
}

export interface FeedbackController {
  emit: (event: FeedbackEvent) => void;
}

export function createFeedbackController(
  profile: ExperienceProfile,
  playSound?: (cue: SoundCue) => void,
): FeedbackController {
  return {
    emit(event) {
      const decision = resolveFeedbackDecision(event, profile);
      if (decision.haptic) playHaptic(decision.haptic);
      if (decision.sound && playSound) playSound(decision.sound);
    },
  };
}
