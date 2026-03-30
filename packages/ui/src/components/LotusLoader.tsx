import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    Easing,
    withSequence
} from 'react-native-reanimated';
import { Text, VStack, Center } from '../gluestack';
import { Theme } from '../theme/Theme';
import { Flower } from 'lucide-react-native';

interface LotusLoaderProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
    fullscreen?: boolean;
}

const SIZES = {
    sm: 24,
    md: 48,
    lg: 72
};

export default function LotusLoader({
    size = 'md',
    text = 'Loading...',
    fullscreen = false
}: LotusLoaderProps) {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0.6);
    const rotation = useSharedValue(0);

    useEffect(() => {
        // Breathing animation
        scale.value = withRepeat(
            withSequence(
                withTiming(1.2, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                withTiming(1.0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );

        // Glow pulse
        opacity.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 1500 }),
                withTiming(0.6, { duration: 1500 })
            ),
            -1,
            true
        );

        // Gentle rotation
        rotation.value = withRepeat(
            withTiming(360, { duration: 12000, easing: Easing.linear }),
            -1,
            false
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: scale.value },
            { rotate: `${rotation.value}deg` }
        ] as any,
        opacity: opacity.value
    }));

    const content = (
        <VStack space="md" alignItems="center" justifyContent="center"
            <Animated.View style={animatedStyle}
                <Flower
                    size={SIZES[size]}
                    color={Theme.colors.sanctuarySaffron}
                    strokeWidth={1.5}
                /
            </Animated.View
            <ActivityIndicator
                size="large"
                color={Theme.colors.starlightGray}
            /
            {text && (
                <Text
                    color={Theme.colors.starlightGray}
                    fontFamily={Theme.typography.fontFamily.english}
                    size="sm"
                    sx={{ letterSpacing: 1 }}
                
                    {text}
                </Text
            )}
        </VStack
    );

    if (fullscreen) {
        return (
            <Center sx={{
                flex: 1,
                zIndex: Theme.zIndex.tooltip,
                backgroundColor: Theme.colors.obsidian,
                borderRadius: Theme.corners.comfortable,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
            }}
                {content}
            </Center
        );
    }

    return (
        <Center sx={{ padding: Theme.spacing.lg }}
            {content}
        </Center
    );
}
