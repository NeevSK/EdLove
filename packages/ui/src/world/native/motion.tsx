import { type ReactNode, useEffect, useMemo } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useVisualCapabilities } from '../../context/VisualCapabilities';
import type { HapticImpact } from '../../utils/haptics';
import { type ResolvedMotion, resolveMotion } from '../motion';
import { useWorld } from './WorldContext';

export interface WorldMotionTokens extends ResolvedMotion {
  /** A Reanimated timing config on the world's curve. */
  timing: (length?: keyof ResolvedMotion['duration']) => {
    duration: number;
    easing: ReturnType<typeof Easing.bezier>;
  };
  /** The impact a press makes in this world. */
  impact: HapticImpact;
}

/** The active world's motion, calmed to the level verger allows for motion. */
export function useWorldMotion(): WorldMotionTokens {
  const world = useWorld();
  const level = useVisualCapabilities().experience.motion;
  const motion = world.definition.motion;

  return useMemo(() => {
    const m = resolveMotion(motion, level);
    const curve = Easing.bezier(...m.easing);
    return {
      ...m,
      timing: (length = 'transition') => ({ duration: m.duration[length], easing: curve }),
      impact: m.haptic === 'crisp' ? 'medium' : 'light',
    };
  }, [motion, level]);
}

export interface WorldEnterProps {
  children: ReactNode;
  /** Position among siblings entering together; each waits one stagger more. */
  index?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Brings its children in the way the world moves: Wewa rises slowly, Colombo
 * slides from the side and stops, Spark snaps in with a small overshoot. At
 * the essential level it only fades; when motion is off it simply appears.
 */
export function WorldEnter({ children, index = 0, style }: WorldEnterProps) {
  const m = useWorldMotion();
  const progress = useSharedValue(m.animates ? 0 : 1);

  useEffect(() => {
    if (!m.animates) {
      progress.value = 1;
      return;
    }
    const delay = index * m.stagger;
    const to = m.spring ? withSpring(1, m.spring) : withTiming(1, m.timing());
    progress.value = delay > 0 ? withDelay(delay, to) : to;
  }, [m, index, progress]);

  const { x, y } = m.from;
  const animated = useAnimatedStyle(() => {
    const rest = 1 - progress.value;
    return {
      // Opacity never overshoots, even when the position does.
      opacity: Math.min(1, progress.value),
      transform: [{ translateX: x * rest }, { translateY: y * rest }],
    };
  });

  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}
