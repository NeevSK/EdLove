import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useAccessibility } from '../hooks/useAccessibility';
import { type HapticImpact, hapticImpact } from '../utils/haptics';
import { duration, easingPoints, scale } from './motion';

const standardEasing = Easing.bezier(
  easingPoints.standard[0],
  easingPoints.standard[1],
  easingPoints.standard[2],
  easingPoints.standard[3],
);

export interface PressableScaleProps {
  /** Scale factor on press. Default 0.96. */
  activeScale?: number;
  /** Press-down animation duration in ms. Default duration.micro (150). */
  pressInDuration?: number;
  /** Release animation duration in ms. Default duration.transition (240).
   *  Asymmetric (slower release) is the key to comfortable feel. */
  pressOutDuration?: number;
  /** Haptic on press. Default 'light'. Pass false to disable. */
  haptic?: HapticImpact | false;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: import('react-native').AccessibilityRole;
  accessibilityState?: import('react-native').AccessibilityState;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  testID?: string;
}

/**
 * PressableScale — shared press-feedback primitive.
 *
 * Uses Reanimated shared values with asymmetric timing:
 * press-in at 80ms, release at 160ms (the detail that separates
 * "twitchy" from "comfortable").
 *
 * Reduced-motion: falls back to opacity (no scale) when active.
 */
export function PressableScale({
  activeScale = 0.96,
  pressInDuration = duration.micro,
  pressOutDuration = duration.transition,
  haptic = 'light',
  onPress,
  onLongPress,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  accessibilityState,
  style,
  children,
  testID,
}: PressableScaleProps) {
  const scaleValue = useSharedValue<number>(scale.rest);
  const opacityValue = useSharedValue(1);
  const { isReduceMotionEnabled } = useAccessibility();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
    opacity: opacityValue.value,
  }));

  const handlePressIn = () => {
    if (isReduceMotionEnabled) {
      opacityValue.value = withTiming(0.7, { duration: pressInDuration, easing: standardEasing });
    } else {
      scaleValue.value = withTiming(activeScale, { duration: pressInDuration, easing: standardEasing });
    }
    if (haptic !== false) hapticImpact(haptic);
  };

  const handlePressOut = () => {
    if (isReduceMotionEnabled) {
      opacityValue.value = withTiming(1, { duration: pressOutDuration, easing: standardEasing });
    } else {
      scaleValue.value = withTiming(scale.rest, { duration: pressOutDuration, easing: standardEasing });
    }
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => {
          if (!disabled) onPress?.();
        }}
        onLongPress={() => {
          if (!disabled) onLongPress?.();
        }}
        disabled={disabled}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityRole={accessibilityRole}
        accessibilityState={{ disabled, ...accessibilityState }}
        testID={testID}
        style={[{ opacity: disabled ? 0.5 : 1 }, style]}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
