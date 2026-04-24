import React, { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  className?: string;
  style?: any;
}

const SkeletonLoader: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 12,
  className = '',
  style,
}) => {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(withTiming(0.4, { duration: 800 }), withTiming(1, { duration: 800 })),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      className={`bg-phase-surface/40 overflow-hidden ${className}`}
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
    />
  );
};

export const SkeletonCard = ({
  height = 150,
  width = '100%',
  className = '',
  style,
}: {
  height?: number;
  width?: number | string;
  className?: string;
  style?: any;
}) => (
  <SkeletonLoader
    width={width}
    height={height}
    borderRadius={20}
    className={`mb-4 max-w-[800px] ${className}`}
    style={style}
  />
);

export const SkeletonAvatar = ({
  size = 50,
  className = '',
}: {
  size?: number;
  className?: string;
}) => <SkeletonLoader width={size} height={size} borderRadius={size / 2} className={className} />;

export const SkeletonTextLine = ({
  width = '100%',
  mb = 8,
  className = '',
}: {
  width?: string | number;
  mb?: number;
  className?: string;
}) => (
  <SkeletonLoader
    width={width}
    height={16}
    borderRadius={4}
    className={className}
    style={{ marginBottom: mb }}
  />
);

export { SkeletonLoader };
export default SkeletonLoader;
