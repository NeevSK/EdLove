import React, { useEffect } from 'react';
import { ViewProps } from 'react-native';
import Animated, {
    useAnimatedStyle,
    withRepeat,
    withTiming,
    useSharedValue,
    withSequence,
    Easing
} from 'react-native-reanimated';
import { useThemedColors } from '../hooks/useThemedColors';
import { Theme } from '../theme/Theme';

interface LivingGlowProps extends ViewProps {
    children: React.ReactNode;
    active?: boolean;
    duration?: number;
}

/**
 * LivingGlow - Pulses with "Restorative Energy"
 * 
 * Philosophy: Focal points in the Sanctuary should not be static. 
 * They should have a "Breath-like" pulse that signifies life.
 */
export function LivingGlow({ children, active = true, duration = 2000, style, ...props }: LivingGlowProps) {
    const colors = useThemedColors();
    const opacity = useSharedValue(0.4);

    useEffect(() => {
        if (active) {
            opacity.value = withRepeat(
                withSequence(
                    withTiming(0.8, { duration, easing: Easing.inOut(Easing.ease) }),
                    withTiming(0.4, { duration, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            );
        } else {
            opacity.value = 0;
        }
    }, [active, duration]);

    const animatedStyle = useAnimatedStyle(() => ({
        shadowColor: colors.glow,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: opacity.value,
        shadowRadius: 10,
        elevation: active ? 5 : 0,
    }));

    return (
        <Animated.View style={[animatedStyle, style]} {...props}>
            {children}
        </Animated.View>
    );
}
