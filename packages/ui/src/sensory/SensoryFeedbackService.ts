/**
 * Feedback dispatch in the React Native JavaScript runtime. Worklets must
 * schedule an explicit runtime crossing before invoking this service.
 */

import { Platform } from 'react-native';
import type { SoundCue } from '../utils/feedbackPolicy';
import {
  hapticError,
  hapticLight,
  hapticMedium,
  hapticSelection,
  hapticSuccess,
} from '../utils/haptics';
import { playWebSound } from './webSynthesizer';

export type SensoryEvent =
  | 'press'
  | 'selection'
  | 'success'
  | 'error'
  | 'milestone'
  | 'breath-start'
  | 'breath-end'
  | 'sync-restored';

export interface SensoryFeedbackOptions {
  skipHaptics?: boolean;
  skipSound?: boolean;
}

class SensoryFeedbackService {
  private hapticsEnabled = true;
  private soundEnabled = true;
  private quietMode = false;
  private nativeSoundPlayer?: { play: (cue: SoundCue) => void };

  /**
   * Configures user sensory preferences (synced from storage/store).
   */
  configure(preferences: {
    hapticsEnabled?: boolean;
    soundEnabled?: boolean;
    quietMode?: boolean;
  }) {
    if (preferences.hapticsEnabled !== undefined) {
      this.hapticsEnabled = preferences.hapticsEnabled;
    }
    if (preferences.soundEnabled !== undefined) {
      this.soundEnabled = preferences.soundEnabled;
    }
    if (preferences.quietMode !== undefined) {
      this.quietMode = preferences.quietMode;
    }
  }

  /**
   * Registers a native audio player (e.g. expo-audio on mobile).
   */
  registerNativeSoundPlayer(play: (cue: SoundCue) => void): () => void {
    const registration = { play };
    this.nativeSoundPlayer = registration;
    return () => {
      if (this.nativeSoundPlayer === registration) this.nativeSoundPlayer = undefined;
    };
  }

  /**
   * Emits a synchronized sensory event (Haptics + Sound).
   */
  emit(event: SensoryEvent, options?: SensoryFeedbackOptions) {
    // 1. Tactile Haptics (Physical JSI on native, pseudohaptic on web)
    if (this.hapticsEnabled && !options?.skipHaptics) {
      this.dispatchHaptic(event);
    }

    // 2. Acoustics (expo-audio on native, Web Audio API on web)
    if (this.soundEnabled && !this.quietMode && !options?.skipSound) {
      this.dispatchSound(event);
    }
  }

  private dispatchHaptic(event: SensoryEvent) {
    switch (event) {
      case 'press':
      case 'breath-start':
      case 'breath-end':
        hapticLight();
        break;
      case 'selection':
        hapticSelection();
        break;
      case 'success':
      case 'sync-restored':
        hapticSuccess();
        break;
      case 'milestone':
        hapticMedium();
        break;
      case 'error':
        hapticError();
        break;
    }
  }

  private dispatchSound(event: SensoryEvent) {
    if (Platform.OS === 'web') {
      playWebSound(event);
    } else if (event !== 'press' && event !== 'selection' && event !== 'error') {
      this.nativeSoundPlayer?.play(event);
    }
  }
}

export const sensoryFeedback = new SensoryFeedbackService();
