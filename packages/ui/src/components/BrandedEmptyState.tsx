/**
 * BrandedEmptyState.tsx — "nothing here yet," using the same mark as everything
 * else, just unfinished. The outline is the exact stroke geometry from the
 * line-draw splash concept (concept 04), held static and never colored in —
 * literally "this hasn't bloomed yet," which is why it needs no separate
 * illustration budget and can't visually contradict the rest of the system.
 *
 * Per the motion plan: empty states get NO ceremony (Layer 1, ambient,
 * ceremony budget "none/subtle"). No entrance animation by default — it's
 * there when the screen renders, quiet, not performing. `subtle` opts into
 * the barest possible breathing opacity if a screen wants a touch of life,
 * but the default is fully static on purpose.
 *
 * Platform note: Uses platform-specific animation implementations.
 */
import { tokens } from '@repo/ui/tokens';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useBreakpoint } from './layout';
import { duration, easing } from './motion';

// Same traced geometry as the line-draw splash concept — the whole
// silhouette plus the two heart-side lines, stroke only, never filled.
const PATHS = {
  outer: 'M 256.14,425.79 L 277.78,435.38 L 303.53,440.31 L 333.11,439.76 L 361.60,433.73 L 394.48,419.76 L 427.90,396.20 L 452.82,369.08 L 472.00,336.21 L 441.05,312.65 L 406.53,295.67 L 367.63,284.98 L 331.47,282.24 L 332.29,257.86 L 329.83,230.47 L 324.07,204.17 L 316.13,181.16 L 304.90,157.60 L 289.56,132.67 L 271.20,109.66 L 255.86,95.42 L 238.06,112.95 L 222.17,133.22 L 207.65,156.51 L 195.87,181.16 L 187.10,207.19 L 181.90,231.84 L 179.71,254.58 L 180.26,282.24 L 144.92,284.98 L 106.29,295.39 L 70.68,312.93 L 51.78,326.07 L 40.00,336.76 L 57.81,367.17 L 84.93,396.75 L 116.43,418.94 L 150.67,433.73 L 174.78,439.21 L 204.09,440.58 L 232.30,435.92 L 256.14,425.79 Z',
  teacherSide: 'M 256.96,425.24 L 255.59,425.51 L 244.08,416.75 L 227.65,400.86 L 215.05,385.25 L 202.99,365.80 L 193.41,344.70 L 187.10,324.98 L 182.45,303.06 L 180.53,282.52 L 194.23,283.61 L 207.10,286.35 L 216.14,289.64 L 228.74,296.76 L 234.22,301.15 L 244.63,312.65 L 252.58,326.62 L 255.86,335.94',
  studentSide: 'M 256.96,425.24 L 271.48,413.73 L 286.54,398.39 L 300.24,380.31 L 308.73,366.07 L 318.05,345.52 L 323.80,328.27 L 328.46,308.27 L 331.47,282.79 L 318.05,283.61 L 303.53,286.90 L 295.58,289.92 L 282.98,297.04 L 271.48,307.45 L 266.27,314.02 L 259.97,324.98 L 255.86,335.94',
};

export type BrandedEmptyStateProps = {
  title: string;
  message?: string;
  /** Opt into a barely-there breathing opacity. Off by default — see note above. */
  subtle?: boolean;
  children?: React.ReactNode; // e.g. an action button
  className?: string;
  style?: any;
};

export function BrandedEmptyState({ title, message, subtle = false, children, className, style }: BrandedEmptyStateProps) {
  const breakpoint = useBreakpoint();
  const size = breakpoint === 'phone' ? 120 : breakpoint === 'tablet' ? 150 : 170;

  const illustration = (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Path d={PATHS.outer} fill="none" stroke={tokens.colors.emptyIllustration} strokeWidth={9} strokeLinejoin="round" />
      <Path d={PATHS.teacherSide} fill="none" stroke={tokens.colors.emptyIllustration} strokeWidth={9} strokeLinecap="round" />
      <Path d={PATHS.studentSide} fill="none" stroke={tokens.colors.emptyIllustration} strokeWidth={9} strokeLinecap="round" />
    </Svg>
  );

  // Web implementation with subtle animation
  if (Platform.OS === 'web' && subtle) {
    return (
      <View style={[styles.wrap, style]} className={className}>
        <div style={{ width: size, height: size }}>
          <style>{`
            @keyframes empty-subtle {
              0%, 100% { opacity: 0.6; }
              50% { opacity: 1; }
            }
            .empty-subtle-animated svg {
              animation: empty-subtle ${duration.breathe * 1.4}ms cubic-bezier(0.4, 0, 0.2, 1) infinite;
            }
            @media (prefers-reduced-motion: reduce) {
              .empty-subtle-animated svg { animation: none; }
            }
          `}</style>
          <div className="empty-subtle-animated">
            {illustration}
          </div>
        </div>
        <Text style={styles.title}>{title}</Text>
        {message ? <Text style={styles.message}>{message}</Text> : null}
        {children ? <View style={styles.actions}>{children}</View> : null}
      </View>
    );
  }

  // Native implementation with subtle animation
  let Animated: any = null;
  try {
    Animated = require('react-native-reanimated');
  } catch (e) {
    // Reanimated not available
  }

  const AnimatedView = Animated?.createAnimatedComponent(View) || View;

  if (subtle && Animated) {
    return (
      <View style={[styles.wrap, style]} className={className}>
        <AnimatedView
          style={{
            width: size,
            height: size,
            animationName: {
              '0%': { opacity: 0.6 },
              '50%': { opacity: 1 },
              '100%': { opacity: 0.6 },
            },
            animationDuration: duration.breathe * 1.4,
            animationTimingFunction: easing.standard,
            animationIterationCount: 'infinite',
          } as any
        }
        >
          {illustration}
        </AnimatedView>
        <Text style={styles.title}>{title}</Text>
        {message ? <Text style={styles.message}>{message}</Text> : null}
        {children ? <View style={styles.actions}>{children}</View> : null}
      </View>
    );
  }

  // Static implementation (default or no Reanimated)
  return (
    <View style={[styles.wrap, style]} className={className}>
      {illustration}
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
    ...tokens.typography.roles.cardTitle,
    color: tokens.semantic.text.primary,
    textAlign: 'center',
    marginTop: tokens.spacing.sm,
  },
  message: {
    ...tokens.typography.roles.body,
    color: tokens.semantic.text.secondary,
    textAlign: 'center',
    maxWidth: tokens.layout.pageFrame.stateMessageMaxWidth,
  },
  actions: {
    marginTop: tokens.spacing.sm,
  },
});
