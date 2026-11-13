/**
 * The one feedback engine, with no platform code in it.
 *
 * Every component, on web and phone, names an event; this engine asks the
 * world's grammar (`theme/feedback.ts` `planFeedback`) what it means right now
 * and hands the answer to the platform's players. Who decides:
 *
 *   world     how it feels (a soft world taps lightly, a crisp one firmly)
 *   verger    how much the device may spend (`essential` drops everyday taps)
 *   person    vibration on/off, sounds on/off, quiet hours
 *   page      nothing: it only names the event
 */

import {
  type FeedbackEvent,
  type FeedbackEventAlias,
  type FeedbackLevel,
  type FeedbackPlan,
  type HapticKind,
  planFeedback,
  type SoundCue,
} from '../theme/feedback';
import type { WorldMotion } from '../theme/types';

export interface FeelPlayers {
  haptic?: (kind: HapticKind) => void;
  sound?: (cue: SoundCue) => void;
}

export interface FeelSettings {
  /** The person's switches. */
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  quietMode: boolean;
  /** What verger allows on this device. */
  hapticsLevel: FeedbackLevel;
  soundLevel: FeedbackLevel;
  /** The active world's touch character. */
  character: WorldMotion['haptic'];
}

export const DEFAULT_FEEL: Readonly<FeelSettings> = {
  hapticsEnabled: true,
  soundEnabled: false,
  quietMode: false,
  hapticsLevel: 'rich',
  soundLevel: 'rich',
  character: 'soft',
};

export interface FeelOptions {
  skipHaptics?: boolean;
  skipSound?: boolean;
}

export interface Feel {
  configure(settings: Partial<FeelSettings>): void;
  settings(): Readonly<FeelSettings>;
  plan(event: FeedbackEvent | FeedbackEventAlias, options?: FeelOptions): FeedbackPlan;
  emit(event: FeedbackEvent | FeedbackEventAlias, options?: FeelOptions): FeedbackPlan;
}

export function createFeel(players: FeelPlayers, initial: Partial<FeelSettings> = {}): Feel {
  let current: FeelSettings = { ...DEFAULT_FEEL, ...initial };
  const plan = (event: FeedbackEvent | FeedbackEventAlias, options?: FeelOptions): FeedbackPlan =>
    planFeedback(event, {
      character: current.character,
      haptics: !current.hapticsEnabled || options?.skipHaptics ? 'off' : current.hapticsLevel,
      sound:
        !current.soundEnabled || current.quietMode || options?.skipSound
          ? 'off'
          : current.soundLevel,
    });
  return {
    configure(settings) {
      const next = { ...current };
      for (const [k, v] of Object.entries(settings)) {
        if (v !== undefined) (next as Record<string, unknown>)[k] = v;
      }
      current = next;
    },
    settings: () => current,
    plan,
    emit(event, options) {
      const result = plan(event, options);
      if (result.haptic) players.haptic?.(result.haptic);
      if (result.sound) players.sound?.(result.sound);
      return result;
    },
  };
}
