import { type ReactNode } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useAccessibility } from '../hooks/useAccessibility';
import { duration } from './motion';

export interface CollapseProps {
  expanded: boolean;
  children: ReactNode;
  /** Animation duration in ms. Default duration.transition (240). */
  animationDuration?: number;
  onExpandEnd?: () => void;
  onCollapseEnd?: () => void;
}

/**
 * Collapse — token-driven expand/collapse transition.
 *
 * Uses the canonical Reanimated accordion pattern: onLayout to measure
 * content height, useDerivedValue to animate between 0 and measured height.
 * Reduced-motion: instant show/hide (duration 0).
 */
export function Collapse({
  expanded,
  children,
  animationDuration = duration.transition,
  onExpandEnd,
  onCollapseEnd,
}: CollapseProps) {
  const contentHeight = useSharedValue(0);
  const { isReduceMotionEnabled } = useAccessibility();
  const effectiveDuration = isReduceMotionEnabled ? 0 : animationDuration;

  const derivedHeight = useDerivedValue(() =>
    withTiming(
      contentHeight.value * Number(expanded),
      { duration: effectiveDuration },
      (finished) => {
        'worklet';
        if (finished) {
          expanded ? onExpandEnd?.() : onCollapseEnd?.();
        }
      },
    ),
  );

  const bodyStyle = useAnimatedStyle(() => ({
    height: derivedHeight.value,
    overflow: 'hidden',
  }));

  return (
    <Animated.View style={bodyStyle}>
      <View
        onLayout={(e) => {
          contentHeight.value = e.nativeEvent.layout.height;
        }}
      >
        {children}
      </View>
    </Animated.View>
  );
}
