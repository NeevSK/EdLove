/* eslint-disable react/react-compiler */
/**
 * SanctuaryBackground
 *
 * The living backdrop of the app. Rendered ONCE at TabNavigator level,
 * behind all tab screens (which are transparent over it).
 *
 * High/Mid: Animated gradient mesh - 2 LinearGradient layers crossfading.
 * Low/Battery: Static LinearGradient snapshot - same palette, zero animation cost.
 *
 * Phase transitions: 2s crossfade between palettes.
 */

'use no memo';

import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import Reanimated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '@repo/ui/hooks/useTheme';
import { View } from '@repo/ui/primitives';

export function SanctuaryBackground() {
  'use no memo';
  const { gradientNodes, animationsEnabled } = useTheme();

  // Two gradient layers for crossfade transition
  const fadeValue = useSharedValue(0);
  
  // Store gradient colors in state to comply with React Compiler immutability rules
  const [colors, setColors] = useState({
    prev: gradientNodes,
    current: gradientNodes,
  });

  useEffect(() => {
    if (!animationsEnabled) {
      setColors({ prev: gradientNodes, current: gradientNodes });
      fadeValue.value = 1;
      return;
    }

    // Crossfade: prev layer stays, new layer fades in over 2s
    setColors((prevColors) => ({
      prev: prevColors.current,
      current: gradientNodes,
    }));

    fadeValue.value = 0;
    fadeValue.value = withTiming(1, { duration: 2000 });
  }, [gradientNodes, animationsEnabled, fadeValue]); // Re-run when phase OR theme mode changes.

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeValue.value,
  }));

  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
      {/* Layer 0: Previous phase (fades out) */}
      <LinearGradient
        colors={colors.prev}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Layer 1: Current phase (fades in) */}
      <Reanimated.View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }, animatedStyle]}>
        <LinearGradient
          colors={colors.current}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Reanimated.View>
    </View>
  );
}
