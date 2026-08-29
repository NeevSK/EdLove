import React, { useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import {
  Canvas,
  RadialGradient,
  Rect,
  Blur,
} from '@shopify/react-native-skia';
import { vec } from 'react-native-redash';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

export interface SkiaGlowAuraProps {
  size?: number;
  color?: string;
  secondaryColor?: string;
  active?: boolean;
  duration?: number;
  blurRadius?: number;
  style?: ViewStyle;
  children?: React.ReactNode;
}

const AnimatedCanvas = Animated.createAnimatedComponent(Canvas);

/**
 * High-performance, GPU-accelerated glow aura powered by @shopify/react-native-skia & Reanimated 4.
 * Operates completely off the JS thread with real-time radial gradients and Gaussian blur filters.
 */
export function SkiaGlowAura({
  size = 200,
  color = 'rgba(212, 132, 58, 0.7)',
  secondaryColor = 'rgba(255, 193, 7, 0.1)',
  active = true,
  duration = 3000,
  blurRadius = 25,
  style,
  children,
}: SkiaGlowAuraProps) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    if (!active) {
      opacity.value = 0;
      return;
    }

    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: duration / 2, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [active, duration, opacity]);

  const animatedStyle = useAnimatedProps(() => ({
    opacity: opacity.value,
  }));

  const center = vec.create(size / 2, size / 2);

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <AnimatedCanvas style={[{ width: size, height: size }, animatedStyle as any]}>
        <Rect x={0} y={0} width={size} height={size}>
          <RadialGradient
            c={center}
            r={size / 2}
            colors={[color, secondaryColor, 'transparent']}
          />
          <Blur blur={blurRadius} />
        </Rect>
      </AnimatedCanvas>
      {children && <View style={StyleSheet.absoluteFill}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
});
