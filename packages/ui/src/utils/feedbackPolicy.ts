import type { ExperienceLevel, ExperienceProfile } from '../context/types';
import {
  hapticError,
  hapticLight,
  hapticMedium,
  hapticSelection,
  hapticSuccess,
} from './haptics';

export type FeedbackEvent =
  | 'press'
  | 'selection'
  | 'success'
  | 'error'
  | 'milestone'
  | 'breath-start'
  | 'breath-end'
  | 'sync-restored';

export type SoundCue =
  | 'success'
  | 'milestone'
  | 'breath-start'
  | 'breath-end'
  | 'sync-restored';

export interface FeedbackDecision {
  haptic: 'light' | 'medium' | 'selection' | 'success' | 'error' | null;
  sound: SoundCue | null;
}

function atLeast(level: ExperienceLevel, minimum: ExperienceLevel): boolean {
  const rank: Record<ExperienceLevel, number> = { off: 0, essential: 1, refined: 2, rich: 3 };
  return rank[level] >= rank[minimum];
}

export function resolveFeedbackDecision(
  event: FeedbackEvent,
  profile: ExperienceProfile,
): FeedbackDecision {
  switch (event) {
    case 'press':
      return { haptic: atLeast(profile.haptics, 'refined') ? 'light' : null, sound: null };
    case 'selection':
      return {
        haptic: atLeast(profile.haptics, 'refined') ? 'selection' : null,
        sound: null,
      };
    case 'success':
      return {
        haptic: atLeast(profile.haptics, 'essential') ? 'success' : null,
        sound: atLeast(profile.sound, 'essential') ? 'success' : null,
      };
    case 'error':
      return {
        haptic: atLeast(profile.haptics, 'essential') ? 'error' : null,
        sound: null,
      };
    case 'milestone':
      return {
        haptic: atLeast(profile.haptics, 'refined') ? 'success' : 'medium',
        sound: atLeast(profile.sound, 'refined') ? 'milestone' : null,
      };
    case 'breath-start':
    case 'breath-end':
      return {
        haptic: atLeast(profile.haptics, 'refined') ? 'light' : null,
        sound: atLeast(profile.sound, 'refined') ? event : null,
      };
    case 'sync-restored':
      return {
        haptic: atLeast(profile.haptics, 'essential') ? 'success' : null,
        sound: atLeast(profile.sound, 'essential') ? 'sync-restored' : null,
      };
  }
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
      switch (decision.haptic) {
        case 'light':
          hapticLight();
          break;
        case 'medium':
          hapticMedium();
          break;
        case 'selection':
          hapticSelection();
          break;
        case 'success':
          hapticSuccess();
          break;
        case 'error':
          hapticError();
          break;
        case null:
          break;
      }
      if (decision.sound && playSound) playSound(decision.sound);
    },
  };
}
