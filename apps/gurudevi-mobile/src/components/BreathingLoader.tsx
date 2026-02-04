/**
 * BREATHING LOADER - Pulsing Circle Animation
 * 
 * A simple loader component with a breathing animation:
 * - Pulsing circle that scales from 0.8 to 1.0
 * - 1.5 second infinite loop cycle
 * - Centered in parent container
 * - Customizable size and color
 * 
 * Philosophy: Calm, meditative loading state that doesn't distract
 * 
 * @example
 * ```tsx
 * import BreathingLoader from './components/BreathingLoader';
 * 
 * function MyScreen() {
 *   return (
 *     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
 *       <BreathingLoader size={60} color="#E67E22" />
 *     </View>
 *   );
 * }
 * ```
 */

import React, { FC, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';
import { Easing } from 'react-native';
import Theme from '../constants/Theme';

// ============================================================================
// TYPES
// ============================================================================

interface BreathingLoaderProps {
    size?: number; // default 50
    color?: string; // default Theme.colors.sanctuarySaffron
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_SIZE = 50;
const DEFAULT_COLOR = Theme.colors.sanctuarySaffron;
const SCALE_MIN = 0.8;
const SCALE_MAX = 1.0;
const ANIMATION_DURATION = 1500; // 1.5 seconds

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const BreathingLoader: FC<BreathingLoaderProps> = ({
    size = DEFAULT_SIZE,
    color = DEFAULT_COLOR,
}) => {
    // Shared value for breathing animation
    const scale = useSharedValue(SCALE_MIN);

    // ============================================================================
    // ANIMATION: BREATHING EFFECT
    // ============================================================================

    useEffect(() => {
        // Start the breathing animation
        scale.value = withRepeat(
            withTiming(SCALE_MAX, {
                duration: ANIMATION_DURATION,
                easing: Easing.inOut(Easing.ease),
            }),
            -1, // infinite loop
            true // reverse (yoyo effect: 0.8 -> 1.0 -> 0.8)
        );
    }, [scale]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    // ============================================================================
    // RENDER
    // ============================================================================

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.circle,
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        backgroundColor: color,
                    },
                    animatedStyle,
                ]}
            />
        </View>
    );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    circle: {
        // Dynamic styles applied inline: width, height, borderRadius, backgroundColor
    },
});

export default BreathingLoader;
