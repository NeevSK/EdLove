/**
 * ErrorState.tsx — "something's wrong," without alarm.
 *
 * Deliberately reuses the same three-petal mark as BrandPulse, but:
 *   - rendered in muted amber (color.state.caution), never red
 *   - NOT breathing — everywhere else in the app, the mark pulses when
 *     something is active/alive. Here it's still, once, on purpose. The
 *     absence of the loop IS the signal ("paused"), not a separate icon.
 *
 * This keeps error/offline in the same visual language as everything else
 * instead of breaking character with a triangle-and-exclamation-point that
 * belongs to no other part of the product.
 *
 * Platform note: Uses platform-specific animation implementations.
 */
import { tokens } from '@repo/ui/tokens';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { FireflyMascot } from './FireflyMascot';
import { useBreakpoint } from './layout';
import { duration, nativeEasing } from './motion';

// Same verified geometry as BrandPulse — see that file for the source trace.
const PATHS = {
  top: 'M 180.26,282.24 L 179.71,254.58 L 181.90,231.84 L 187.10,207.19 L 195.87,181.16 L 207.65,156.51 L 222.17,133.22 L 238.06,112.95 L 255.86,95.42 L 271.20,109.66 L 289.56,132.67 L 304.90,157.60 L 316.13,181.16 L 324.07,204.17 L 329.83,230.47 L 332.29,257.86 L 331.47,282.24 L 318.05,283.61 L 303.53,286.90 L 295.58,289.92 L 282.98,297.04 L 271.48,307.45 L 266.27,314.02 L 259.97,324.98 L 255.86,335.94 L 252.58,326.62 L 244.63,312.65 L 234.22,301.15 L 228.74,296.76 L 216.14,289.64 L 207.10,286.35 L 194.23,283.61 L 180.53,282.52 Z',
  bl: 'M 180.26,282.24 L 144.92,284.98 L 106.29,295.39 L 70.68,312.93 L 51.78,326.07 L 40.00,336.76 L 57.81,367.17 L 84.93,396.75 L 116.43,418.94 L 150.67,433.73 L 174.78,439.21 L 204.09,440.58 L 232.30,435.92 L 256.14,425.79 L 255.59,425.51 L 244.08,416.75 L 227.65,400.86 L 215.05,385.25 L 202.99,365.80 L 193.41,344.70 L 187.10,324.98 L 182.45,303.06 L 180.53,282.52 Z',
  br: 'M 256.14,425.79 L 277.78,435.38 L 303.53,440.31 L 333.11,439.76 L 361.60,433.73 L 394.48,419.76 L 427.90,396.20 L 452.82,369.08 L 472.00,336.21 L 441.05,312.65 L 406.53,295.67 L 367.63,284.98 L 331.47,282.24 L 328.46,308.27 L 323.80,328.27 L 318.05,345.52 L 308.73,366.07 L 300.24,380.31 L 286.54,398.39 L 271.48,413.73 L 256.96,425.24 Z',
};

export type ErrorStateProps = {
  title: string;
  message?: string;
  /** Usually a "Try again" button. */
  children?: React.ReactNode;
  className?: string;
  style?: any;
};

export function ErrorState({ title, message, children, className, style }: ErrorStateProps) {
  // Platform-safe breakpoint hook
  const breakpoint = useBreakpoint();
  const size = breakpoint === 'phone' ? 88 : breakpoint === 'tablet' ? 110 : 128;

  // Web implementation using CSS animations
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.wrap, style]} className={className}>
        <div style={{ width: size, height: size }}>
          <style>{`
            @keyframes error-fade-in {
              0% { opacity: 0; }
              100% { opacity: 1; }
            }
            .error-icon-animated svg {
              animation: error-fade-in ${duration.transition}ms cubic-bezier(0.33, 1, 0.42, 0) forwards;
            }
            @media (prefers-reduced-motion: reduce) {
              .error-icon-animated svg { animation: none; }
            }
          `}</style>
          <div className="error-icon-animated">
            <FireflyMascot size={size} mode="offline" />
          </div>
        </div>
        <Text style={styles.title}>{title}</Text>
        {message ? <Text style={styles.message}>{message}</Text> : null}
        {children ? <View style={styles.actions}>{children}</View> : null}
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

  const AnimatedView = Animated?.createAnimatedComponent(View) || View;

  return (
    <View style={[styles.wrap, style]} className={className}>
      <AnimatedView
        style={{
          width: size,
          height: size,
          ...(Animated
            ? ({
                animationName: {
                  '0%': { opacity: 0 },
                  '100%': { opacity: 1 },
                },
                animationDuration: duration.transition,
                animationTimingFunction: nativeEasing.decelerate,
                animationFillMode: 'forwards',
              } as any)
            : {}),
        }}
      >
        <FireflyMascot size={size} mode="offline" />
      </AnimatedView>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {children ? <View style={styles.actions}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.spacing.xxl,
    paddingHorizontal: tokens.spacing.lg,
    gap: tokens.spacing.md,
  },
  title: {
    fontSize: tokens.typography.sizes.md,
    fontWeight: '600',
    color: tokens.semantic.text.primary,
    textAlign: 'center',
    marginTop: tokens.spacing.sm,
  },
  message: {
    fontSize: tokens.typography.sizes.sm,
    color: tokens.semantic.text.secondary,
    textAlign: 'center',
    lineHeight: tokens.typography.sizes.sm * 1.5,
    maxWidth: tokens.layout.pageFrame.stateMessageMaxWidth,
  },
  actions: {
    marginTop: tokens.spacing.sm,
  },
});
