/** Web skeletons keep the same anatomy as native while using one restrained
 * material sweep instead of a JS animation loop. */
import { tokens } from '@repo/ui/tokens';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { useResponsiveGrid } from './layout';
import { duration } from './motion';

type ShimmerBlockProps = {
  width?: number | `${number}%`;
  height: number;
  radius?: number;
  style?: ViewStyle;
  className?: string;
};

export function ShimmerBlock({
  width = '100%',
  height,
  radius = tokens.radii.sm,
  style,
  className,
}: ShimmerBlockProps) {
  const outerStyle: any = {
    width,
    height,
    borderRadius: radius,
    backgroundColor: tokens.colors.skeletonBase,
    overflow: 'hidden',
    ...(style || {}),
  };

  return (
    <div className={className} style={outerStyle} aria-hidden="true">
      <style>{`
        @keyframes sanctuary-skeleton-sweep {
          0% { transform: translateX(-100%); opacity: 0.35; }
          50% { opacity: 0.7; }
          100% { transform: translateX(100%); opacity: 0.35; }
        }
        .sanctuary-skeleton-sheen {
          width: 100%;
          height: 100%;
          background: linear-gradient(105deg, transparent 18%, ${tokens.colors.skeletonHighlight} 50%, transparent 82%);
          animation: sanctuary-skeleton-sweep ${duration.breathe * 0.55}ms ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .sanctuary-skeleton-sheen { animation: none; opacity: 0.5; }
        }
      `}</style>
      <div className="sanctuary-skeleton-sheen" />
    </div>
  );
}

export function SkeletonCard({ className, style }: { className?: string; style?: ViewStyle }) {
  return (
    <View style={[styles.card, style]} className={className} accessibilityElementsHidden>
      <ShimmerBlock width={52} height={52} radius={tokens.radii.md} />
      <View style={styles.lines}>
        <ShimmerBlock height={tokens.typography.sizes.sm} width="70%" />
        <ShimmerBlock height={tokens.typography.sizes.sm} width="45%" />
      </View>
    </View>
  );
}

type SkeletonListProps = {
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
        {Array.from({ length: count }).map((_, index) => (
          <View key={index} style={[styles.cell, { width: cellWidthPct }]}>
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
    alignSelf: 'center',
  },
  gridInner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    padding: tokens.spacing.xs,
  },
});
