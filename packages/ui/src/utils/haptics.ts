/**
 * Haptic Feedback Utilities
 * Consistent haptic patterns across the app
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export type HapticImpact = 'light' | 'medium' | 'heavy';

let lastImpact: { kind: HapticImpact; at: number } | null = null;
let hapticsEnabled = true;

export function setHapticsEnabled(enabled: boolean) {
  hapticsEnabled = enabled;
}

function runHaptic(label: string, callback: () => void | Promise<void>) {
  if (!hapticsEnabled || Platform.OS === 'web') return;

  try {
    void Promise.resolve(callback()).catch((error: unknown) => {
      console.warn(`[Haptics] ${label} failed`, error);
    });
  } catch (error) {
    console.warn(`[Haptics] ${label} failed`, error);
  }
}

/**
 * Fires an impact haptic while coalescing the same impact emitted twice by a
 * shared control and its existing action handler.
 */
export function hapticImpact(kind: HapticImpact) {
  if (!hapticsEnabled) return;

  const now = Date.now();
  if (lastImpact?.kind === kind && now - lastImpact.at < 80) return;
  lastImpact = { kind, at: now };

  runHaptic(`impact.${kind}`, () => {
    switch (kind) {
      case 'light':
        return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      case 'medium':
        return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      case 'heavy':
        return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  });
}

/**
 * Light haptic feedback
 * Use for: Button presses, taps, toggles
 */
export function hapticLight() {
  hapticImpact('light');
}

/**
 * Medium haptic feedback
 * Use for: Important actions, confirmations, selection changes
 */
export function hapticMedium() {
  hapticImpact('medium');
}

/**
 * Heavy haptic feedback
 * Use for: Destructive actions, warnings, errors
 */
export function hapticHeavy() {
  hapticImpact('heavy');
}

/**
 * Success haptic feedback
 * Use for: Successful operations, achievements, completion
 */
export function hapticSuccess() {
  runHaptic('notification.success', () => {
    return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  });
}

/**
 * Warning haptic feedback
 * Use for: Warnings, attention needed
 */
export function hapticWarning() {
  runHaptic('notification.warning', () => {
    return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  });
}

/**
 * Error haptic feedback
 * Use for: Errors, validation failures
 */
export function hapticError() {
  runHaptic('notification.error', () => {
    return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  });
}

/**
 * Selection haptic feedback
 * Use for: Scrolling through lists, picker changes
 */
export function hapticSelection() {
  runHaptic('selection', () => {
    return Haptics.selectionAsync();
  });
}

/**
 * Custom haptic pattern (breathing rhythm for Lotus companion)
 * Creates a gentle pulse pattern
 */
export async function hapticBreathing() {
  hapticImpact('light');
  await new Promise((resolve) => setTimeout(resolve, 200));
  hapticImpact('light');
}
