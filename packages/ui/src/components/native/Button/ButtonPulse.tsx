import { useEffect } from 'react';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useWorldMotion } from '../../../theme/native/motion';

/** Matches `.gd-button-pulse` on the web: a dot in the button's ink that breathes. */
const BREATH_MS = 800;

export function ButtonPulse({ size, color }: { size: number; color: string }) {
  const { animates } = useWorldMotion();
  const breath = useSharedValue(0);

  useEffect(() => {
    if (!animates) {
      breath.set(0);
      return;
    }
    breath.set(
      withRepeat(withTiming(1, { duration: BREATH_MS, easing: Easing.inOut(Easing.ease) }), -1, true),
    );
    return () => cancelAnimation(breath);
  }, [animates, breath]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.5 - breath.get() * 0.35,
    transform: [{ scale: 1 - breath.get() * 0.2 }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }, style]}
    />
  );
}
