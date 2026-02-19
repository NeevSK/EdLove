/**
 * Haptic Feedback Utilities
 * Consistent haptic patterns across the app
 */

import * as Haptics from 'expo-haptics';

/**
 * Light haptic feedback
 * Use for: Button presses, taps, toggles
 */
export function hapticLight() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

/**
 * Medium haptic feedback
 * Use for: Important actions, confirmations, selection changes
 */
export function hapticMedium() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

/**
 * Heavy haptic feedback
 * Use for: Destructive actions, warnings, errors
 */
export function hapticHeavy() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
}

/**
 * Success haptic feedback
 * Use for: Successful operations, achievements, completion
 */
export function hapticSuccess() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

/**
 * Warning haptic feedback
 * Use for: Warnings, attention needed
 */
export function hapticWarning() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
}

/**
 * Error haptic feedback
 * Use for: Errors, validation failures
 */
export function hapticError() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}

/**
 * Selection haptic feedback
 * Use for: Scrolling through lists, picker changes
 */
export function hapticSelection() {
    Haptics.selectionAsync();
}

/**
 * Custom haptic pattern (breathing rhythm for Lotus companion)
 * Creates a gentle pulse pattern
 */
export async function hapticBreathing() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await new Promise(resolve => setTimeout(resolve, 200));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}
