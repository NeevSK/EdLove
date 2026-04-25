/**
 * Haptic Feedback Utilities
 * Consistent haptic patterns across the app
 */

import { coreRuntime } from '@repo/core/logic';

/**
 * Light haptic feedback
 * Use for: Button presses, taps, toggles
 */
export function hapticLight() {
  try {
    coreRuntime.haptics.impactLight();
  } catch {
    // Fail silently if runtime not registered
  }
}

/**
 * Medium haptic feedback
 * Use for: Important actions, confirmations, selection changes
 */
export function hapticMedium() {
  try {
    coreRuntime.haptics.impactMedium();
  } catch {
    // Fail silently
  }
}

/**
 * Heavy haptic feedback
 * Use for: Destructive actions, warnings, errors
 */
export function hapticHeavy() {
  try {
    coreRuntime.haptics.impactHeavy();
  } catch {
    // Fail silently
  }
}

/**
 * Success haptic feedback
 * Use for: Successful operations, achievements, completion
 */
export function hapticSuccess() {
  try {
    coreRuntime.haptics.notificationSuccess();
  } catch {
    // Fail silently
  }
}

/**
 * Warning haptic feedback
 * Use for: Warnings, attention needed
 */
export function hapticWarning() {
  try {
    coreRuntime.haptics.notificationWarning();
  } catch {
    // Fail silently
  }
}

/**
 * Error haptic feedback
 * Use for: Errors, validation failures
 */
export function hapticError() {
  try {
    coreRuntime.haptics.notificationError();
  } catch {
    // Fail silently
  }
}

/**
 * Selection haptic feedback
 * Use for: Scrolling through lists, picker changes
 */
export function hapticSelection() {
  try {
    coreRuntime.haptics.selection();
  } catch {
    // Fail silently
  }
}

/**
 * Custom haptic pattern (breathing rhythm for Lotus companion)
 * Creates a gentle pulse pattern
 */
export async function hapticBreathing() {
  try {
    coreRuntime.haptics.impactLight();
    await new Promise((resolve) => setTimeout(resolve, 200));
    coreRuntime.haptics.impactLight();
  } catch {
    // Fail silently
  }
}
