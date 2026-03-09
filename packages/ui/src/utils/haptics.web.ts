/**
 * Haptic Feedback Utilities (Web Shim)
 * No-op implementation for web to prevent native crashes.
 */

export function hapticLight() { }
export function hapticMedium() { }
export function hapticHeavy() { }
export function hapticSuccess() { }
export function hapticWarning() { }
export function hapticError() { }
export function hapticSelection() { }

export async function hapticBreathing() {
    // No-op on web
    return Promise.resolve();
}
