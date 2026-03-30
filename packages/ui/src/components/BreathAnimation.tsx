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

interface AnimatedContentProps {
    children: React.ReactNode;
    delay: number;
    duration: number;
    direction: 'up' | 'down' | 'none';
}

/**
 * AnimatedContent - Internal component that owns the Reanimated shared values.
 * Only mounted when the JSI runtime is confirmed ready, preventing Bridgeless crashes.
 */
const AnimatedContent = ({ children, delay, duration, direction }: AnimatedContentProps) => {
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

/**
 * BreathAnimation - Implements the "Breath-like Motion" from TAIL_FIN.md
 * Provides a staggered, smooth entry for UI elements.
 * Defers JSI-heavy Reanimated hooks into a child component that is only
 * rendered once the runtime is ready, preventing Bridgeless-mode crashes.
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

    if (!isReady) {
        return <View>{children}</View>;
    }

    return (
        <AnimatedContent delay={delay} duration={duration} direction={direction}>
            {children}
        </AnimatedContent>
    );
};
