import { useVisualCapabilities } from '@repo/ui/context/VisualCapabilities';
import React, { useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
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

/**
 * Web-compatible glow aura utilizing standard CSS radial gradients and filter blur.
 * Replaces Skia Canvas with zero-overhead HTML5/CSS rendering on browser platforms.
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
  const { allowAmbientEffects, allowBlur, allowSubtleAnimation } = useVisualCapabilities();
  const effectsEnabled = active && allowAmbientEffects && allowBlur;
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    if (!effectsEnabled) {
      opacity.value = 0;
      return;
    }

    if (!allowSubtleAnimation) {
      opacity.value = 0.4;
      return;
    }

    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, [allowSubtleAnimation, duration, effectsEnabled, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {effectsEnabled ? (
        <Animated.View
          style={[
            styles.glowEffect,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              filter: `blur(${blurRadius}px)`,
              backgroundImage: `radial-gradient(circle, ${color} 0%, ${secondaryColor} 60%, transparent 100%)`,
            } as any,
            animatedStyle,
          ]}
        />
      ) : null}
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
  glowEffect: {
    position: 'absolute',
    pointerEvents: 'none',
  },
});
