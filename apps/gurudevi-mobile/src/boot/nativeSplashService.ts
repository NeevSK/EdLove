import * as SplashScreen from 'expo-splash-screen';

import { scheduleNativeSplashHandoff } from '@/boot/nativeSplashHandoff';

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
  return scheduleNativeSplashHandoff({
    requestFrame: (callback) =>
      requestAnimationFrame(() => {
        onCommit?.();
        callback();
      }),
    cancelFrame: cancelAnimationFrame,
    hide: SplashScreen.hideAsync,
    onError,
  });
}
