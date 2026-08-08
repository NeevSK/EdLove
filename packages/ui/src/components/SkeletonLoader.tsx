import type React from 'react';
import { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  className?: string;
  style?: any;
  withFlower?: boolean;
  shimmer?: boolean;
}

const SkeletonLoader: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 12,
  className = '',
  style,
  withFlower = false,
  shimmer = false,
}) => {
  const opacity = useSharedValue(0.4);
  const scale = useSharedValue(1);
  const containerScale = useSharedValue(1);
  const shimmerOffset = useSharedValue(-1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(withTiming(0.7, { duration: 1500 }), withTiming(0.4, { duration: 1500 })),
      -1,
      true,
    );

    containerScale.value = withRepeat(
      withSequence(withTiming(1.005, { duration: 2000 }), withTiming(1, { duration: 2000 })),
      -1,
      true,
    );

    if (withFlower) {
      scale.value = withRepeat(
        withSequence(withTiming(1.2, { duration: 3000 }), withTiming(1.0, { duration: 3000 })),
        -1,
        true,
      );
    }

    if (shimmer) {
      shimmerOffset.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1200 }),
          withTiming(-1, { duration: 1200 }),
        ),
        -1,
        true,
      );
    }
  }, [opacity, scale, containerScale, withFlower, shimmer]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: containerScale.value }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(shimmerOffset.value, [-1, 1], [-200, 200]) }],
    opacity: 0.3,
  }));

  const flowerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${(scale.value - 1) * 30}deg` }],
    opacity: opacity.value * 0.15,
  }));

  return (
    <Animated.View
      className={`bg-phase-surface/40 overflow-hidden items-center justify-center ${className}`}
      style={[
        {
          width,
          height,
          borderRadius,
          maxWidth: 1200,
        },
        animatedStyle,
        style,
      ]}
    >
      {shimmer && (
        <Animated.View
          className="absolute inset-0 bg-white/20 rounded"
          style={shimmerStyle}
        />
      )}
      {withFlower && (
        <Animated.Text style={[{ fontSize: 24, textAlign: 'center' }, flowerStyle]}>
          🌸
        </Animated.Text>
      )}
    </Animated.View>
  );
};

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
