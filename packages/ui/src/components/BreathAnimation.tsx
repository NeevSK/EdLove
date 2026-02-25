import React, { useEffect } from 'react';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withDelay,
    withTiming,
    Easing
} from 'react-native-reanimated';

interface BreathAnimationProps {
    children: React.ReactNode;
    delay?: number;
    duration?: number;
    direction?: 'up' | 'down' | 'none';
}

/**
 * BreathAnimation - Implements the "Breath-like Motion" from TAIL_FIN.md
 * Provides a staggered, smooth entry for UI elements.
 */
export const BreathAnimation = ({
    children,
    delay = 0,
    duration = 500,
    direction = 'up'
}: BreathAnimationProps) => {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(direction === 'up' ? 20 : direction === 'down' ? -20 : 0);

    useEffect(() => {
        opacity.value = withDelay(delay, withTiming(1, { duration, easing: Easing.out(Easing.quad) }));
        translateY.value = withDelay(delay, withTiming(0, { duration, easing: Easing.out(Easing.quad) }));
    }, [delay, duration]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    return (
        <Animated.View style={animatedStyle}>
            {children}
        </Animated.View>
    );
};
