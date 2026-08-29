import type { ThemeTransitionType } from './nitroThemeTransition.types';

let nitroThemeModule: any = null;

try {
  nitroThemeModule = require('react-native-nitro-theme-transition');
} catch {
  // Graceful fallback if native Nitro Theme module is missing or on web
}

/**
 * Starts a GPU-driven theme transition using Nitro Modules when available,
 * falling back gracefully on unsupported platforms or web.
 */
export async function startThemeTransition(
  updateThemeCallback: () => void | Promise<void>,
  options?: {
    type?: ThemeTransitionType;
    duration?: number;
  }
): Promise<void> {
  const transitionType = options?.type || 'circularReveal';

  if (nitroThemeModule && typeof nitroThemeModule.startTransition === 'function') {
    try {
      await nitroThemeModule.startTransition(transitionType, async () => {
        await updateThemeCallback();
      });
      return;
    } catch (error) {
      console.warn('[ThemeTransition] Native transition failed, falling back to direct update:', error);
    }
  }

  // Graceful fallback: Execute state change directly
  await updateThemeCallback();
}
