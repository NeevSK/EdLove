import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    withSequence,
    interpolateColor
} from 'react-native-reanimated';
import { Theme } from '../theme/Theme';
import { useThemedColors } from '../hooks/useThemedColors';

interface SkeletonProps {
    width?: number | string;
    height?: number | string;
    borderRadius?: number;
    style?: any;
}

const SkeletonLoader: React.FC<SkeletonProps> = ({
    width = '100%',
    height = 20,
    borderRadius = Theme.corners.comfortable,
    style
}) => {
    const colors = useThemedColors();
    const opacity = useSharedValue(1);

    useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(0.4, { duration: 800 }),
                withTiming(1, { duration: 800 })
            ),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                styles.skeleton,
                {
                    width,
                    height,
                    borderRadius,
                    backgroundColor: colors.secondary
                },
                animatedStyle,
                style
            ]}
        />
    );
};

export const SkeletonCard = ({ height = 150, width = '100%', style }: { height?: number; width?: number | string; style?: any }) => (
    <SkeletonLoader
        width={width}
        height={height}
        borderRadius={Theme.corners.generous}
        style={[{ marginBottom: Theme.spacing.md }, style]}
    />
);

export const SkeletonAvatar = ({ size = 50 }: { size?: number }) => (
    <SkeletonLoader
        width={size}
        height={size}
        borderRadius={size / 2}
    />
);

export const SkeletonTextLine = ({ width = '100%', mb = 8 }: { width?: string | number, mb?: number }) => (
    <SkeletonLoader
        width={width}
        height={16}
        borderRadius={4}
        style={{ marginBottom: mb }}
    />
);

const styles = StyleSheet.create({
    skeleton: {
        overflow: 'hidden',
    },
});

export { SkeletonLoader };
export default SkeletonLoader;

