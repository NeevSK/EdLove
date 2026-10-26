import { useEffect } from 'react';
import {
  type DimensionValue,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useVisualCapabilities } from '../../context/VisualCapabilities';
import type { Radius } from '../types';
import { radiusStyle } from './style';
import { Text } from './Text';
import { WaitingSign } from './WaitingSign';
import { useWorld } from './WorldContext';

const SIGN_SIZE = { sm: 28, md: 44, lg: 64 } as const;

export interface WorldLoadingProps {
  /** What is happening, already translated ("Loading lessons"). Read aloud and shown. */
  label: string;
  size?: keyof typeof SIGN_SIZE;
  /** Hide the words visually; they are still read aloud. */
  quiet?: boolean;
  /** Cover the screen with the world's ground. */
  fullscreen?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Waiting, in the world's own sign, with the words people need. */
export function WorldLoading({ label, size = 'md', quiet, fullscreen, style }: WorldLoadingProps) {
  const world = useWorld();
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityState={{ busy: true }}
      style={[
        styles.center,
        fullscreen
          ? [StyleSheet.absoluteFill, { backgroundColor: world.tokens.ground, zIndex: 1000 }]
          : styles.padded,
        style,
      ]}
    >
      <WaitingSign size={SIGN_SIZE[size]} />
      {quiet ? null : (
        <Text kind="caption" tone="soft" align="center">
          {label}
        </Text>
      )}
    </View>
  );
}

export interface WorldSkeletonProps {
  width?: DimensionValue;
  height: number;
  /** Defaults to the world's inset corners, capped to stay a bar. */
  radius?: Radius;
  /** Hold still even when shimmer is allowed. */
  still?: boolean;
  /** Layout classes from screens that still use NativeWind (margins only). */
  className?: string;
  style?: StyleProp<ViewStyle>;
}

function capRadius(r: Radius, max: number): Radius {
  if (typeof r === 'number') return Math.min(r, max);
  return [Math.min(r[0], max), Math.min(r[1], max), Math.min(r[2], max), Math.min(r[3], max)];
}

/**
 * A placeholder in the world's sunken colour and corners. Its shimmer is the
 * world's lamp at low strength, at the world's breathing pace; verger's
 * `loading-shimmer` lever (and still motion) hold it still.
 */
export function WorldSkeleton({
  width = '100%',
  height,
  radius,
  still = false,
  className,
  style,
}: WorldSkeletonProps) {
  const world = useWorld();
  const { allowShimmer, experience } = useVisualCapabilities();
  const shimmer = !still && allowShimmer && experience.motion !== 'off';
  const pace = Math.round(world.recipes.motion.breatheMs * 0.5);
  const glow = useSharedValue(0);

  useEffect(() => {
    if (!shimmer) {
      glow.value = 0;
      return;
    }
    glow.value = withRepeat(
      withTiming(1, { duration: pace, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    return () => cancelAnimation(glow);
  }, [shimmer, pace, glow]);

  const lit = useAnimatedStyle(() => ({ opacity: glow.value * 0.16 }));
  const shape = radiusStyle(radius ?? capRadius(world.recipes.surface.inset.radius, height / 2));

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className={className}
      style={[
        { width, height, overflow: 'hidden', backgroundColor: world.tokens.sunken },
        shape,
        style,
      ]}
    >
      {shimmer ? (
        <Animated.View
          testID="world-skeleton-shimmer"
          style={[StyleSheet.absoluteFill, { backgroundColor: world.tokens.lamp }, lit]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', gap: 12 },
  padded: { padding: 32 },
});
