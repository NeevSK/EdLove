/** Native-stack options shared by Expo Router screens. */
export const softCrossfadeScale = {
  animation: 'fade' as const,
  animationDuration: 240,
};

/** Timing token for less frequent shared-element implementations. */
export const sharedTransitionTiming = {
  duration: 380,
};

/** Returns the platform-safe transition exports used by consumers. */
export const getScreenTransitions = () => ({
  softCrossfadeScale,
  sharedTransitionTiming,
});
