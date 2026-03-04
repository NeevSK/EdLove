/**
 * BREATHING LOADER - Pulsing Circle Animation
 *
 * A simple loader component with a breathing animation:
 * - Pulsing circle that scales from 0.8 to 1.0
 * - 1.5 second infinite loop cycle
 * - Centered in parent container
 * - Customizable size and color
 * - Respects reduced-motion accessibility preference
 *
 * Philosophy: Calm, meditative loading state that doesn't distract
 */

import React, { FC, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { Theme } from '../theme/Theme';
import { useAccessibility } from '../hooks/useAccessibility';
import { useTranslation } from 'react-i18next';

interface BreathingLoaderProps {
    size?: number;
    color?: string;
}

const DEFAULT_SIZE = 50;
const DEFAULT_COLOR = Theme.colors.sanctuarySaffron;
const SCALE_MIN = 0.8;
const SCALE_MAX = 1.0;
const ANIMATION_DURATION = 1500;

const BreathingLoader: FC<BreathingLoaderProps> = ({
    size = DEFAULT_SIZE,
    color = DEFAULT_COLOR,
}) => {
    const { isReduceMotionEnabled } = useAccessibility();
    const { t } = useTranslation();
    const scale = useSharedValue(SCALE_MIN);

    useEffect(() => {
        if (isReduceMotionEnabled) {
            scale.value = SCALE_MAX;
            return;
        }
        scale.value = withRepeat(
            withTiming(SCALE_MAX, {
                duration: ANIMATION_DURATION,
                easing: Easing.inOut(Easing.ease),
            }),
            -1,
            true
        );
    }, [isReduceMotionEnabled]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <View
            style={styles.container}
            accessible={true}
            accessibilityRole="progressbar"
            accessibilityLabel={t('accessibility.loading')}
        >
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

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    circle: {},
});

export default BreathingLoader;

