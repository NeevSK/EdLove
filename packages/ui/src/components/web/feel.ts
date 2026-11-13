/**
 * Feedback on the web: the same engine and world grammar as the phone
 * (`sensory/engine.ts`, `theme/feedback.ts`), played with the browser's own
 * means. Web kit components call `feel(event)`; pages never pick a sound or a
 * vibration.
 *
 * What it reads, every time (so a change in Settings applies at once):
 *   world     <html data-world>                 soft or crisp touch
 *   verger    <html data-visual-quality>        `essential` drops everyday taps
 *   person    localStorage gurudevi_sound_enabled, gurudevi_quiet_mode,
 *             gurudevi_haptics_enabled           (the Settings page writes them)
 *
 * Vibration only on touch screens that support it (Android browsers); sound is
 * synthesised (no files) and only for results and moments, never for presses.
 */

import { createFeel } from '../../sensory/engine';
import { playWebSound } from '../../sensory/webSynthesizer';
import { MOTION } from '../../theme/faces';
import type {
  FeedbackEvent,
  FeedbackEventAlias,
  FeedbackLevel,
  FeedbackPlan,
  HapticKind,
} from '../../theme/feedback';
import type { WorldId } from '../../theme/types';

const VIBRATION: Readonly<Record<HapticKind, number | number[]>> = {
  selection: 6,
  light: 10,
  medium: 18,
  heavy: 28,
  success: [12, 40, 12],
  warning: [20, 60, 20],
  error: [30, 50, 30],
};

function canVibrate(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.vibrate === 'function' &&
    typeof matchMedia === 'function' &&
    matchMedia('(pointer: coarse)').matches
  );
}

const engine = createFeel({
  haptic: (kind) => {
    if (canVibrate()) navigator.vibrate(VIBRATION[kind]);
  },
  sound: (cue) => playWebSound(cue),
});

function stored(key: string, fallback: boolean): boolean {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : v === 'true';
  } catch {
    return fallback;
  }
}

const LEVEL_OF_QUALITY: Readonly<Record<string, FeedbackLevel>> = {
  full: 'rich',
  reduced: 'refined',
  essential: 'essential',
};

function readSettings() {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const world = root.dataset.world as WorldId | undefined;
  const level = LEVEL_OF_QUALITY[root.dataset.visualQuality ?? 'full'] ?? 'rich';
  engine.configure({
    character: (world && MOTION[world]?.haptic) || 'soft',
    hapticsLevel: level,
    soundLevel: level,
    hapticsEnabled: stored('gurudevi_haptics_enabled', true),
    // Sounds are off until the person turns them on.
    soundEnabled: stored('gurudevi_sound_enabled', false),
    quietMode: stored('gurudevi_quiet_mode', false),
  });
}

/** Feel an event in the active world, as the person and verger allow. */
export function feel(event: FeedbackEvent | FeedbackEventAlias): FeedbackPlan | null {
  if (typeof window === 'undefined') return null;
  readSettings();
  return engine.emit(event);
}
