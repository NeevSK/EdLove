import * as SplashScreen from 'expo-splash-screen';

import { scheduleNativeSplashHandoff } from '@/boot/nativeSplashHandoff';

/**
 * The admitted route normally releases the splash. Surfaces that may never reach
 * it (startup still running, an error boundary above the route gate) release it
 * after this long, so a stall or failure is never hidden behind the splash.
 */
export const NATIVE_SPLASH_MAX_HOLD_MS = 8_000;

// Several surfaces may ask; only the first committed frame hides the splash.
let splashReleased = false;

/**
 * Production adapter for the sole native splash release mechanism.
 *
 * Entry surfaces decide only when their visible frame has committed. This
 * adapter owns the platform API so the handoff policy remains testable without
 * letting routes issue independent native splash calls.
 */
export function handoffNativeSplashAfterCommit({
  onCommit,
  onError,
}: {
  onCommit?: () => void;
  onError: (error: unknown) => void;
}): () => void {
  if (splashReleased) return () => {};
  return scheduleNativeSplashHandoff({
    requestFrame: (callback) =>
      requestAnimationFrame(() => {
        if (splashReleased) return;
        splashReleased = true;
        onCommit?.();
        callback();
      }),
    cancelFrame: cancelAnimationFrame,
    hide: SplashScreen.hideAsync,
    onError,
  });
}
