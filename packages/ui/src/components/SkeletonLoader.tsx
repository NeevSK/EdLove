import type React from 'react';
import { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  className?: string;
  style?: any;
  /** Optional: Show a subtle blooming flower icon in the center */
  withFlower?: boolean;
}

const SkeletonLoader: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 12,
  className = '',
  style,
  withFlower = false,
}) => {
  const opacity = useSharedValue(0.4);
  const scale = useSharedValue(1);
  const containerScale = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(withTiming(0.7, { duration: 1500 }), withTiming(0.4, { duration: 1500 })),
      -1,
      true,
    );
    
    // Living Sanctuary: Subtle breathing for the whole container
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
  }, [opacity, scale, containerScale, withFlower]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: containerScale.value }],
  }));

  const flowerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${(scale.value - 1) * 30}deg` }
    ],
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
    withFlower
  />
);

export const SkeletonAvatar = ({
  size = 50,
  className = '',
}: {
  size?: number;
  className?: string;
}) => <SkeletonLoader width={size} height={size} borderRadius={size / 2} className={className} withFlower />;

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
