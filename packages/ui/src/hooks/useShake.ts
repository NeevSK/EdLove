import {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useAccessibility } from './useAccessibility';

/**
 * useShake — token-driven error feedback animation.
 *
 * Returns a trigger function and animated style. When reduced motion is
 * active, triggerShake is a no-op (no animation fires).
 */
export function useShake() {
  const shakeX = useSharedValue(0);
  const { isReduceMotionEnabled } = useAccessibility();

  const triggerShake = () => {
    'worklet';
    if (isReduceMotionEnabled) return;
    shakeX.value = withSequence(
      withTiming(-12, { duration: 50 }),
      withTiming(12, { duration: 50 }),
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-4, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  return { triggerShake, animatedStyle };
}
