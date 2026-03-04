import React, { useEffect } from 'react';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withDelay,
    withTiming,
    Easing
} from 'react-native-reanimated';
import { View } from 'react-native';
import { Runtime } from '@repo/core';

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
    const [isReady, setIsReady] = React.useState(Runtime.isReady());

    useEffect(() => {
        if (!isReady) {
            return Runtime.onReady(() => setIsReady(true));
        }
    }, [isReady]);

    // Defer JSI-heavy hooks until the runtime is confirmed ready.
    // In Bridgeless mode, calling these too early can cause a crash.
    const opacity = useSharedValue(isReady ? 0 : 1);
    const translateY = useSharedValue(isReady ? (direction === 'up' ? 20 : direction === 'down' ? -20 : 0) : 0);

    useEffect(() => {
        if (isReady) {
            opacity.value = withDelay(delay, withTiming(1, { duration, easing: Easing.out(Easing.quad) }));
            translateY.value = withDelay(delay, withTiming(0, { duration, easing: Easing.out(Easing.quad) }));
        }
    }, [isReady, delay, duration]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    if (!isReady) {
        return <View>{children}</View>;
    }

    return (
        <Animated.View style={animatedStyle}>
            {children}
        </Animated.View>
    );
};
