import type React from 'react';
import type { DimensionValue, StyleProp, ViewStyle } from 'react-native';
import { WorldSkeleton } from '../world/native/Waiting';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
  /** No longer drawn: placeholders stay plain so content is the first thing that appears. */
  withFlower?: boolean;
  /** The world's lamp shimmer; verger's `loading-shimmer` lever can still hold it still. */
  shimmer?: boolean;
}

/**
 * A loading placeholder in the active world's sunken colour, with its lamp as
 * a low shimmer. Kept for existing screens; new code can use `WorldSkeleton`.
 */
const SkeletonLoader: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 12,
  className,
  style,
  shimmer = true,
}) => (
  <WorldSkeleton
    width={width as DimensionValue}
    height={typeof height === 'number' ? height : 20}
    radius={borderRadius}
    still={!shimmer}
    className={className}
    style={[
      { maxWidth: 1200 },
      typeof height === 'string' ? { height: height as DimensionValue } : null,
      style,
    ]}
  />
);

export const SkeletonCard = ({
  height = 150,
  width = '100%',
  className = '',
  style,
  shimmer = true,
}: {
  height?: number;
  width?: number | string;
  className?: string;
  style?: any;
  shimmer?: boolean;
}) => (
  <SkeletonLoader
    width={width}
    height={height}
    borderRadius={20}
    className={`mb-4 max-w-[800px] ${className}`}
    style={style}
    withFlower
    shimmer={shimmer}
  />
);

export const SkeletonAvatar = ({
  size = 50,
  className = '',
  shimmer = true,
}: {
  size?: number;
  className?: string;
  shimmer?: boolean;
}) => (
  <SkeletonLoader
    width={size}
    height={size}
    borderRadius={size / 2}
    className={className}
    withFlower
    shimmer={shimmer}
  />
);

export const SkeletonTextLine = ({
  width = '100%',
  mb = 8,
  className = '',
  shimmer = true,
}: {
  width?: string | number;
  mb?: number;
  className?: string;
  shimmer?: boolean;
}) => (
  <SkeletonLoader
    width={width}
    height={16}
    borderRadius={4}
    className={className}
    style={{ marginBottom: mb }}
    shimmer={shimmer}
  />
);

export { SkeletonLoader };
export default SkeletonLoader;
