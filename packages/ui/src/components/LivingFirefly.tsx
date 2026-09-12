import { useEffect } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useAccessibility } from '../hooks/useAccessibility';
import { useVisualCapabilities } from '../context/VisualCapabilities';
import { Mascot, type MascotArtworkSource } from './Mascot';
import type { MascotPodVariant } from './MascotPod';
import type { MascotState, MascotTheme } from './mascotTypes';

export type LivingFireflyProps = {
  artwork?: MascotArtworkSource;
  size: number;
  state: MascotState;
  theme?: MascotTheme;
  podVariant?: MascotPodVariant;
  style?: StyleProp<ViewStyle>;
};

export function LivingFirefly({ artwork, size, state, theme = 'light', podVariant, style }: LivingFireflyProps) {
  const { isReduceMotionEnabled } = useAccessibility();
  const visualCapabilities = useVisualCapabilities();
  const breathing = useSharedValue(1);
  const lift = useSharedValue(0);

  useEffect(() => {
    breathing.value = 1;
    lift.value = 0;

    if (isReduceMotionEnabled || !visualCapabilities.allowAmbientEffects) return;

    const isActive = state === 'guiding' || state === 'curious';
    const duration = isActive ? 2100 : 2700;
    breathing.value = withRepeat(
      withSequence(
        withTiming(1.018, { duration }),
        withTiming(1, { duration }),
      ),
      -1,
      false,
    );
    lift.value = withRepeat(
      withSequence(
        withTiming(isActive ? -3 : -1, { duration }),
        withTiming(0, { duration }),
      ),
      -1,
      false,
    );

    return () => {
      breathing.value = 1;
      lift.value = 0;
    };
  }, [breathing, isReduceMotionEnabled, lift, state, visualCapabilities.allowAmbientEffects]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: lift.value }, { scale: breathing.value }],
  }));

  return (
    <Animated.View
      accessibilityLabel={artwork?.accessibilityLabel ?? 'Gurudevi firefly'}
      accessible
      style={[animatedStyle, style]}
    >
      <Mascot
        artwork={artwork}
        mode={state === 'interrupted' ? 'offline' : 'glowing'}
        podVariant={podVariant}
        size={size}
        state={state}
        theme={theme}
      />
    </Animated.View>
  );
}
