import React, { useEffect } from 'react';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    runOnJS
} from 'react-native-reanimated';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Box, Text, HStack } from '../gluestack';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react-native';
import { Theme } from '../theme/Theme';

export type ToastType = 'success' | 'error' | 'info';

interface SanctuaryToastProps {
    message: string;
    type?: ToastType;
    visible: boolean;
    onHide: () => void;
    duration?: number;
}

export default function SanctuaryToast({
    message,
    type = 'info',
    visible,
    onHide,
    duration = 3000
}: SanctuaryToastProps) {
    const translateY = useSharedValue(100);
    const opacity = useSharedValue(0);

    const getIcon = () => {
        switch (type) {
            case 'success': return CheckCircle;
            case 'error': return AlertCircle;
            case 'info': return Info;
        }
    };

    const getColor = () => {
        switch (type) {
            case 'success': return Theme.colors.sageGreen;
            case 'error': return Theme.colors.emberRed;
            case 'info': return Theme.colors.sanctuarySaffron;
        }
    };

    const Icon = getIcon();
    const color = getColor();

    useEffect(() => {
        if (visible) {
            translateY.value = withSpring(0, { damping: 15 });
            opacity.value = withTiming(1);

            const timer = setTimeout(() => {
                hide();
            }, duration);

            return () => clearTimeout(timer);
        } else {
            hide();
        }
    }, [visible]);

    const hide = () => {
        opacity.value = withTiming(0);
        translateY.value = withTiming(100, {}, (finished) => {
            if (finished && visible) {
                runOnJS(onHide)();
            }
        });
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value
    }));

    if (!visible) return null;

    return (
        <Animated.View style={[styles.container, animatedStyle]}>
            <Box sx={{
                borderRadius: Theme.corners.medium,
                backgroundColor: Theme.colors.shroud,
                padding: Theme.spacing.md,
                flexDirection: 'row',
                alignItems: 'center',
                gap: Theme.spacing.md,
                borderWidth: 1,
                borderColor: Theme.colors.glass.dark.border,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 10,
                width: '100%',
                maxWidth: 400
            }}>
                <HStack sx={{ gap: '$md' as any, alignItems: 'center' }}>
                    <Icon color={color} size={24} />
                    <Text>
                        color={Theme.colors.sacredWhite}
                        sx={{ fontSize: '$sm' as any, flex: 1, fontWeight: '500' }}
                    
                        {message}
                    </Text>
                    <TouchableOpacity accessibilityRole="button" onPress={hide}>
                        <X color={Theme.colors.mistGray} size={18} />
                    </TouchableOpacity>
                </HStack>
            </Box>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 100, // Above tabs/FAB
        left: 20,
        right: 20,
        alignItems: 'center',
        zIndex: Theme.zIndex.toast,
    }
});
