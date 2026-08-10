/**
 * screenTransitions.ts — the default "everyday nav" transition.
 *
 * This is Layer 1 in the motion plan: the thing felt hundreds of times a
 * session, so it stays fast (duration.transition, ~240ms) and never slides
 * or bounces — a soft crossfade with a slight scale-in, same decelerating
 * curve as the splash, just compressed in time.
 *
 * Built on react-native-screen-transitions (the Bounds API is reserved for
 * the rarer "shared element" moments — see sharedTransition below — this
 * export is the plain default every other screen should use).
 *
 * Usage (per-screen, in Expo Router):
 *   export const unstable_settings = { ... }
 *   <Stack.Screen name="..." options={softCrossfadeScale} />
 *
 * Platform note: Reanimated imports are conditional to avoid web bundle issues.
 */
import { Platform } from 'react-native';

// Conditional imports for Reanimated
let Reanimated: any = null;
try {
  Reanimated = require('react-native-reanimated');
} catch (e) {
  // Reanimated not available, exports will be null
}

// Safe imports that work on all platforms
const Easing = Reanimated?.Easing;
const interpolate = Reanimated?.interpolate;

const timingConfig = (ms: number) => ({
  duration: ms,
  easing: Easing?.bezier(0.33, 1, 0.42, 0) || 'ease-out',
});

export const softCrossfadeScale = {
  transitionSpec: {
    open: { animation: 'timing' as const, config: timingConfig(240) },
    close: { animation: 'timing' as const, config: timingConfig(240) },
  },
  screenStyleInterpolator: ({ progress }: { progress: number }) => {
    if (!interpolate) {
      return { contentStyle: { opacity: progress } };
    }
    return {
      contentStyle: {
        opacity: interpolate(progress, [0, 1, 2], [0, 1, 0]),
        transform: [
          {
            scale: interpolate(
              progress,
              [0, 1, 2],
              [0.98, 1, 0.98]
            ),
          },
        ],
      },
    };
  },
};

/**
 * For the rarer moments that deserve a real shared-element feel (tapping a
 * card into its detail view, a profile into its full page) — same easing
 * language, but the longer `shared` duration and driven by the library's
 * Bounds API instead of a plain crossfade. Wire actual bounds per usage;
 * this just centralizes the timing/easing so it stays consistent with
 * everything else rather than being tuned ad hoc per screen.
 */
export const sharedTransitionTiming = timingConfig(380);

/**
 * Platform-safe export that can be used without conditional checks
 * Falls back to no-op transitions on web if Reanimated isn't available
 */
export const getScreenTransitions = () => {
  if (Platform.OS === 'web' && !Reanimated) {
    return {
      softCrossfadeScale: {
        transitionSpec: {
          open: { animation: 'timing' as const, config: { duration: 240 } },
          close: { animation: 'timing' as const, config: { duration: 240 } },
        },
        screenStyleInterpolator: ({ progress }: { progress: number }) => ({
          contentStyle: { opacity: progress },
        }),
      },
      sharedTransitionTiming: { duration: 380 },
    };
  }
  return {
    softCrossfadeScale,
    sharedTransitionTiming,
  };
};
