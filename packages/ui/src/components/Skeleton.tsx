/**
 * Skeleton.tsx — loading placeholders that mirror real content structure.
 *
 * The responsive behavior here is deliberately thin: SkeletonList uses
 * useResponsiveGrid() (layout.ts) for column count and max width — the
 * EXACT same hook a real content grid should use. That's the actual
 * mechanism for staying correct across phone/tablet/web: the skeleton
 * doesn't have its own breakpoint logic to drift out of sync, it shares
 * the one grid logic with whatever real component it's standing in for.
 *
 * Pattern for your own screens:
 *   1. Build the real card/row with useResponsiveGrid() for its width.
 *   2. Copy its JSX structure into a skeleton version, swap text/image
 *      for <ShimmerBlock>.
 *   3. Both now move together at every breakpoint by construction.
 *
 * Platform note: Uses platform-specific animation implementations.
 */
import { tokens } from '@repo/ui/tokens';
import React from 'react';
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';
import { useResponsiveGrid } from './layout';
import { duration, easing } from './motion';

// Conditional imports for Reanimated
let Animated: any = null;
try {
  Animated = require('react-native-reanimated');
} catch (e) {
  // Reanimated not available
}

const AnimatedView = Animated?.createAnimatedComponent(View) || View;

// ---------------------------------------------------------------------------
// Primitive: one shimmering block. Width accepts a number (px) or a
// percentage string so it can flex inside whatever container it's placed in
// — it never assumes phone-sized dimensions.
// ---------------------------------------------------------------------------
type ShimmerBlockProps = {
  width?: number | `${number}%`;
  height: number;
  radius?: number;
  style?: ViewStyle;
  className?: string;
};

export function ShimmerBlock({ width = '100%', height, radius = 8, style, className }: ShimmerBlockProps) {
  // Web implementation using CSS animations
  if (Platform.OS === 'web') {
    const webStyle: any = {
      width,
      height,
      borderRadius: radius,
      backgroundColor: tokens.colors.skeletonBase,
      ...(style || {}),
    };
    
    return (
      <div
        className={className}
        style={webStyle}
      >
        <style>{`
          @keyframes shimmer-pulse {
            0%, 100% { opacity: 0.55; }
            50% { opacity: 1; }
          }
          .shimmer-animated {
            animation: shimmer-pulse ${duration.breathe * 0.55}ms cubic-bezier(0.4, 0, 0.2, 1) infinite;
          }
        `}</style>
        <div className="shimmer-animated" style={{ width: '100%', height: '100%' }} />
      </div>
    );
  }

  // Native implementation
  if (!Animated) {
    return (
      <View
        className={className}
        style={[
          {
            width,
            height,
            borderRadius: radius,
            backgroundColor: tokens.colors.skeletonBase,
          },
          style,
        ]}
      />
    );
  }

  return (
    <AnimatedView
      className={className}
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: tokens.colors.skeletonBase,
        },
        {
          animationName: {
            '0%': { opacity: 0.55 },
            '50%': { opacity: 1 },
            '100%': { opacity: 0.55 },
          },
          animationDuration: duration.breathe * 0.55, // a bit brisker than the ambient breathe
          animationTimingFunction: easing.standard,
          animationIterationCount: 'infinite',
        } as any,
        style,
      ]}
    />
  );
}

// ---------------------------------------------------------------------------
// One skeleton card — mirrors a generic "thumbnail + two lines" list item.
// Width is NOT hardcoded; it fills whatever cell SkeletonList/your grid
// gives it, exactly like the real card should.
// ---------------------------------------------------------------------------
export function SkeletonCard({ className, style }: { className?: string; style?: ViewStyle }) {
  return (
    <View style={[styles.card, style]} className={className}>
      <ShimmerBlock width={52} height={52} radius={12} />
      <View style={styles.lines}>
        <ShimmerBlock height={12} width="70%" />
        <ShimmerBlock height={12} width="45%" />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// The grid wrapper — this is where responsiveness actually lives. Column
// count and max content width come from useResponsiveGrid(), the same hook
// the real (loaded) list should use for its own layout.
// ---------------------------------------------------------------------------
type SkeletonListProps = {
  /** How many cards to show while loading — pick enough to fill one viewport. */
  count?: number;
  className?: string;
  style?: ViewStyle;
};

export function SkeletonList({ count = 6, className, style }: SkeletonListProps) {
  const { columns, maxWidth } = useResponsiveGrid();
  const cellWidthPct = `${100 / columns}%` as const;

  return (
    <View style={[styles.gridOuter, { maxWidth }, style]} className={className}>
      <View style={styles.gridInner}>
        {Array.from({ length: count }).map((_, i) => (
          <View key={i} style={[styles.cell, { width: cellWidthPct }]}>
            <SkeletonCard />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: tokens.spacing.md,
    padding: tokens.spacing.md,
    borderRadius: tokens.radii.lg,
  },
  lines: {
    flex: 1,
    justifyContent: 'center',
    gap: tokens.spacing.sm,
  },
  gridOuter: {
    width: '100%',
    alignSelf: 'center', // centers the capped-width content on tablet/web
  },
  gridInner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    padding: tokens.spacing.xs + 2,
  },
});
