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

import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import Reanimated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '../hooks/useTheme';
import { View } from '../primitives';

export function SanctuaryBackground() {
  const { gradientNodes, animationsEnabled } = useTheme();

  // Two gradient layers for crossfade transition
  const fadeValue = useSharedValue(0);
  const prevNodes = useRef<[string, string, string]>(gradientNodes);
  const currentNodes = useRef<[string, string, string]>(gradientNodes);

  useEffect(() => {
    if (!animationsEnabled) {
      // Static - just update immediately
      prevNodes.current = gradientNodes;
      currentNodes.current = gradientNodes;
      fadeValue.value = 1;
      return;
    }

    // Crossfade: prev layer stays, new layer fades in over 2s
    prevNodes.current = currentNodes.current;
    currentNodes.current = gradientNodes;

    fadeValue.value = 0;
    fadeValue.value = withTiming(1, { duration: 2000 });
  }, [fadeValue, gradientNodes, animationsEnabled]); // Re-run when phase OR theme mode changes.

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeValue.value,
  }));

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
      {/* Layer 0: Previous phase (fades out) */}
      <LinearGradient
        colors={prevNodes.current}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      {/* Layer 1: Current phase (fades in) */}
      <Reanimated.View pointerEvents="none" style={[StyleSheet.absoluteFillObject, animatedStyle]}>
        <LinearGradient
          colors={currentNodes.current}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      </Reanimated.View>
    </View>
  );
}
