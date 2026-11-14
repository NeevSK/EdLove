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
  | 'destructive';

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
  }
}

/** Motion an event may carry, when the world's motion level allows it. */
export type FeedbackMotion = 'none' | 'shake';

export function motionFor(event: FeedbackEvent): FeedbackMotion {
  // A failure is the one event that moves the thing itself, so it is noticed
  // without colour; everything else is said by haptics and state.
  return event === 'error' ? 'shake' : 'none';
}
