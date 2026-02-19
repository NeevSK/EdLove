import React, { useEffect } from 'react';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withDelay,
    withSequence,
    withTiming,
    runOnJS
} from 'react-native-reanimated';
import { StyleSheet, Dimensions } from 'react-native';
import { Box, VStack, Text, Theme } from '@repo/ui';
import { Trophy } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface AchievementUnlockOverlayProps {
    title: string;
    visible: boolean;
    onHide: () => void;
}

export default function AchievementUnlockOverlay({
    title,
    visible,
    onHide
}: AchievementUnlockOverlayProps) {
    const translateY = useSharedValue(-200);
    const scale = useSharedValue(0.8);
    const opacity = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            // Animate In
            translateY.value = withSpring(60, { damping: 12 });
            opacity.value = withTiming(1, { duration: 400 });
            scale.value = withSpring(1, { damping: 10 });

            // Auto Hide after 4 seconds
            const timer = setTimeout(() => {
                hide();
            }, 4000);

            return () => clearTimeout(timer);
        }
    }, [visible]);

    const hide = () => {
        opacity.value = withTiming(0, { duration: 300 });
        scale.value = withTiming(0.8, { duration: 300 });
        translateY.value = withTiming(-200, { duration: 400 }, (finished) => {
            if (finished) {
                runOnJS(onHide)();
            }
        });
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: translateY.value },
            { scale: scale.value }
        ] as any,
        opacity: opacity.value
    }));

    if (!visible) return null;

    return (
        <Animated.View style={[styles.container, animatedStyle]}>
            <Box sx={{
                width: width * 0.85,
                backgroundColor: Theme.colors.voidIndigo,
                borderRadius: Theme.corners.generous,
                padding: Theme.spacing.lg,
                borderWidth: 2,
                borderColor: Theme.colors.templeGold,
                shadowColor: Theme.colors.templeGold,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.5,
                shadowRadius: 15,
                elevation: 20,
                alignItems: 'center',
            }}>
                <VStack space="sm" alignItems="center">
                    <Box
                        p="$3"
                        backgroundColor={`${Theme.colors.templeGold}20`}
                        borderRadius={Theme.corners.full}
                        mb="$2"
                    >
                        <Trophy color={Theme.colors.templeGold} size={40} />
                    </Box>
                    <Text color={Theme.colors.templeGold} bold size="lg">
                        ACHIEVEMENT UNLOCKED!
                    </Text>
                    <Text color={Theme.colors.sacredWhite} bold textAlign="center" size="xl">
                        {title}
                    </Text>
                    <Text color={Theme.colors.starlightGray} size="sm" textAlign="center">
                        Your discovery adds to the sanctuary.
                    </Text>
                </VStack>
            </Box>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: Theme.zIndex.modal + 100,
    }
});
