/**
 * Feedback on the phone (and React Native Web): the shared engine
 * (`./engine.ts`) with expo-haptics and the app's sound player plugged in.
 * Worklets must schedule an explicit runtime crossing before calling it.
 */

import { Platform } from 'react-native';
import type { FeedbackEvent, FeedbackEventAlias, FeedbackPlan, SoundCue } from '../theme/feedback';
import { haptic } from '../utils/haptics';
import { createFeel, type FeelOptions, type FeelSettings } from './engine';
import { playWebSound } from './webSynthesizer';

export type SensoryEvent = FeedbackEvent | FeedbackEventAlias;
export type SensoryFeedbackOptions = FeelOptions;

class SensoryFeedbackService {
  private nativeSoundPlayer?: { play: (cue: SoundCue) => void };
  private readonly feel = createFeel({
    haptic,
    sound: (cue) => {
      if (Platform.OS === 'web') playWebSound(cue);
      else this.nativeSoundPlayer?.play(cue);
    },
  });

  /** The person's switches, verger's levels and the world's character. */
  configure(settings: Partial<FeelSettings>) {
    this.feel.configure(settings);
  }

  /** Registers a native audio player (expo-audio on the phone). */
  registerNativeSoundPlayer(play: (cue: SoundCue) => void): () => void {
    const registration = { play };
    this.nativeSoundPlayer = registration;
    return () => {
      if (this.nativeSoundPlayer === registration) this.nativeSoundPlayer = undefined;
    };
  }

  emit(event: SensoryEvent, options?: SensoryFeedbackOptions): FeedbackPlan {
    return this.feel.emit(event, options);
  }
}

export const sensoryFeedback = new SensoryFeedbackService();
