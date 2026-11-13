/**
 * The feedback grammar: what a person feels and sees when something happens.
 *
 * Components never pick a haptic or an animation themselves. They name the
 * event ("the selection changed", "that failed"), and the world's motion
 * character decides how it feels: a soft world taps lightly, a crisp one
 * firmly. One table, so a confirmation feels the same in every component and a
 * failure never feels like a tap.
 */

import type { WorldMotion } from './types';

export type FeedbackEvent =
  /** A button, icon button or chip was pressed. */
  | 'press'
  /** A choice changed: checkbox, radio, switch, tab, segment, menu item. */
  | 'select'
  /** A value moved one step (slider, stepper). */
  | 'step'
  /** A gesture carried something through: a swipe action, a sheet let go. */
  | 'commit'
  /** Something the person did worked (saved, sent, done). */
  | 'success'
  /** Worth noticing before going on (unsaved changes, near a limit). */
  | 'warning'
  /** It did not work, or the input is not accepted. */
  | 'error'
  /** About to delete, leave or end something. */
  | 'destructive'
  /** A bigger moment: a streak, a finished course, a goal met. */
  | 'milestone'
  /** A breathing practice starts or ends a phase. */
  | 'breath-start'
  | 'breath-end'
  /** The connection came back and waiting changes were sent. */
  | 'sync-restored';

/** Older event names some screens still send; read as the event they meant. */
export type FeedbackEventAlias = 'selection';

export function feedbackEventOf(event: FeedbackEvent | FeedbackEventAlias): FeedbackEvent {
  return event === 'selection' ? 'select' : event;
}

/** Sounds the app can make. Everyday presses and choices never make a sound. */
export type SoundCue =
  | 'success'
  | 'error'
  | 'milestone'
  | 'breath-start'
  | 'breath-end'
  | 'sync-restored';

export type HapticKind =
  | 'selection'
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'warning'
  | 'error';

/** The haptic for an event, in a world's character. */
export function hapticFor(event: FeedbackEvent, character: WorldMotion['haptic']): HapticKind {
  switch (event) {
    case 'press':
      return character === 'crisp' ? 'medium' : 'light';
    case 'select':
    case 'step':
      return 'selection';
    case 'commit':
      return character === 'crisp' ? 'heavy' : 'medium';
    case 'success':
      return 'success';
    case 'warning':
      return 'warning';
    case 'error':
      return 'error';
    case 'destructive':
      return 'heavy';
    case 'milestone':
    case 'sync-restored':
      return 'success';
    case 'breath-start':
    case 'breath-end':
      return 'light';
  }
}

/** The sound for an event, if it has one. */
export function soundFor(event: FeedbackEvent): SoundCue | null {
  switch (event) {
    case 'success':
    case 'error':
    case 'milestone':
    case 'breath-start':
    case 'breath-end':
    case 'sync-restored':
      return event;
    default:
      return null;
  }
}

/** How much feedback is allowed: the person's switches, then verger's level. */
export type FeedbackLevel = 'off' | 'essential' | 'refined' | 'rich';

const RANK: Readonly<Record<FeedbackLevel, number>> = { off: 0, essential: 1, refined: 2, rich: 3 };

/**
 * The level an event needs before it is felt. Everyday touches (press,
 * select, step) are a nicety and go first when verger saves (a low-memory
 * phone's motor stays for results only). Sound has one rule: if the person
 * turned sounds on and nothing (quiet hours, an exam, safe mode) turned them
 * off, every event that has a sound plays it.
 */
function needs(event: FeedbackEvent, channel: 'haptic' | 'sound'): FeedbackLevel {
  if (channel === 'sound') return 'essential';
  switch (event) {
    case 'press':
    case 'select':
    case 'step':
      return 'refined';
    default:
      return 'essential';
  }
}

export interface FeedbackContext {
  /** The active world's touch character. */
  character: WorldMotion['haptic'];
  /** Haptics allowed: the person's switch (off) and verger's level. */
  haptics: FeedbackLevel;
  /** Sound allowed: the person's switch and quiet hours (off) and verger's level. */
  sound: FeedbackLevel;
}

export interface FeedbackPlan {
  haptic: HapticKind | null;
  sound: SoundCue | null;
  motion: FeedbackMotion;
}

/**
 * The one decision for every platform: what an event does here, now. Web and
 * phone call this and only differ in how they play the result.
 */
export function planFeedback(
  event: FeedbackEvent | FeedbackEventAlias,
  context: FeedbackContext,
): FeedbackPlan {
  const e = feedbackEventOf(event);
  const cue = soundFor(e);
  return {
    haptic:
      context.haptics !== 'off' && RANK[context.haptics] >= RANK[needs(e, 'haptic')]
        ? hapticFor(e, context.character)
        : null,
    sound:
      cue && context.sound !== 'off' && RANK[context.sound] >= RANK[needs(e, 'sound')] ? cue : null,
    motion: motionFor(e),
  };
}

/** Motion an event may carry, when the world's motion level allows it. */
export type FeedbackMotion = 'none' | 'shake';

export function motionFor(event: FeedbackEvent): FeedbackMotion {
  // A failure is the one event that moves the thing itself, so it is noticed
  // without colour; everything else is said by haptics and state.
  return event === 'error' ? 'shake' : 'none';
}
