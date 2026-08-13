/**
 * BrandPulse.tsx — the branded micro-loader.
 *
 * Replaces every generic <ActivityIndicator /> in the app. It's the real
 * traced mark (same geometry as the splash), at 24-32px, doing a slow
 * "living breath" pulse instead of spinning. Every wait in the app reads
 * as the brand instead of a system default.
 *
 * All timing/scale/color comes from motion.ts — nothing here is a magic
 * number, so tuning the breathe rate app-wide means editing one file.
 *
 * Platform note: Uses platform-specific animation implementations for best performance.
 */
import { tokens } from '@repo/ui/tokens';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { duration, easing, scale as scaleTokens } from './motion';

// Traced directly from the logo (same source as the splash animation) —
// three petals, viewBox roughly matches the 40-472 x 95-441 bounding box
// of the original 512x512 composition.
const PATHS = {
  top: 'M 180.26,282.24 L 179.71,254.58 L 181.90,231.84 L 187.10,207.19 L 195.87,181.16 L 207.65,156.51 L 222.17,133.22 L 238.06,112.95 L 255.86,95.42 L 271.20,109.66 L 289.56,132.67 L 304.90,157.60 L 316.13,181.16 L 324.07,204.17 L 329.83,230.47 L 332.29,257.86 L 331.47,282.24 L 318.05,283.61 L 303.53,286.90 L 295.58,289.92 L 282.98,297.04 L 271.48,307.45 L 266.27,314.02 L 259.97,324.98 L 255.86,335.94 L 252.58,326.62 L 244.63,312.65 L 234.22,301.15 L 228.74,296.76 L 216.14,289.64 L 207.10,286.35 L 194.23,283.61 L 180.53,282.52 Z',
  bl: 'M 180.26,282.24 L 144.92,284.98 L 106.29,295.39 L 70.68,312.93 L 51.78,326.07 L 40.00,336.76 L 57.81,367.17 L 84.93,396.75 L 116.43,418.94 L 150.67,433.73 L 174.78,439.21 L 204.09,440.58 L 232.30,435.92 L 256.14,425.79 L 255.59,425.51 L 244.08,416.75 L 227.65,400.86 L 215.05,385.25 L 202.99,365.80 L 193.41,344.70 L 187.10,324.98 L 182.45,303.06 L 180.53,282.52 Z',
  br: 'M 256.14,425.79 L 277.78,435.38 L 303.53,440.31 L 333.11,439.76 L 361.60,433.73 L 394.48,419.76 L 427.90,396.20 L 452.82,369.08 L 472.00,336.21 L 441.05,312.65 L 406.53,295.67 L 367.63,284.98 L 331.47,282.24 L 328.46,308.27 L 323.80,328.27 L 318.05,345.52 L 308.73,366.07 L 300.24,380.31 L 286.54,398.39 L 271.48,413.73 L 256.96,425.24 Z',
};

export type BrandPulseProps = {
  /** Diameter in px. Defaults to 28, the standard inline-loader size. */
  size?: number;
  /** Overrides the brand orange if this loader sits on a colored surface. */
  tintColor?: string;
  className?: string;
  style?: any;
  accessibilityLabel?: string;
};

export function BrandPulse({
  size = 28,
  tintColor,
  className,
  style,
  accessibilityLabel = 'Loading',
}: BrandPulseProps) {
  const fill = tintColor ?? tokens.colors.primary;
  const sharedA11yProps = {
    accessible: true,
    accessibilityRole: 'progressbar' as const,
    accessibilityLabel,
    accessibilityState: { busy: true },
  };

  // Web implementation using CSS animations
  if (Platform.OS === 'web') {
    return (
        <View
          className={`brand-pulse-wrapper ${className || ''}`}
          {...sharedA11yProps}
          style={[styles.wrap, { width: size, height: size }, style]}
      >
        <style>{`
          @keyframes brand-pulse {
            0%, 100% { transform: scale(${scaleTokens.breatheMin}); opacity: 0.72; }
            50% { transform: scale(${scaleTokens.breatheMax}); opacity: 1; }
          }
           .brand-pulse-wrapper svg {
             animation: brand-pulse ${duration.breathe}ms cubic-bezier(0.4, 0, 0.2, 1) infinite;
           }
           @media (prefers-reduced-motion: reduce) {
             .brand-pulse-wrapper svg { animation: none; }
           }
        `}</style>
        <Svg width={size} height={size} viewBox="0 0 512 512">
          <Path d={PATHS.top} fill={fill} />
          <Path d={PATHS.bl} fill={fill} />
          <Path d={PATHS.br} fill={fill} />
        </Svg>
      </View>
    );
  }

  // Native implementation using Reanimated
  let Animated: any = null;
  try {
    Animated = require('react-native-reanimated');
  } catch (e) {
    // Fallback to static if Reanimated not available
  }

  if (!Animated) {
    return (
      <View {...sharedA11yProps} style={[styles.wrap, { width: size, height: size }, style]}>
        <Svg width={size} height={size} viewBox="0 0 512 512">
          <Path d={PATHS.top} fill={fill} />
          <Path d={PATHS.bl} fill={fill} />
          <Path d={PATHS.br} fill={fill} />
        </Svg>
      </View>
    );
  }

  const AnimatedView = Animated.createAnimatedComponent(View);

  return (
    <AnimatedView
      className={className}
      {...sharedA11yProps}
      style={[
        styles.wrap,
        { width: size, height: size },
        {
          animationName: {
            '0%': { transform: [{ scale: scaleTokens.breatheMin }], opacity: 0.72 },
            '50%': { transform: [{ scale: scaleTokens.breatheMax }], opacity: 1 },
            '100%': { transform: [{ scale: scaleTokens.breatheMin }], opacity: 0.72 },
          },
          animationDuration: duration.breathe,
          animationTimingFunction: easing.standard,
          animationIterationCount: 'infinite',
        } as any,
        style,
      ]}
    >
      <Svg width={size} height={size} viewBox="0 0 512 512">
        <Path d={PATHS.top} fill={fill} />
        <Path d={PATHS.bl} fill={fill} />
        <Path d={PATHS.br} fill={fill} />
      </Svg>
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
