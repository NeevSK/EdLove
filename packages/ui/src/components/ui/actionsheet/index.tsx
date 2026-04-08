import React from 'react';
import { View, Pressable } from 'react-native';
import Animated, { SlideInDown, SlideOutDown, FadeIn, FadeOut } from 'react-native-reanimated';
import { Portal } from '../portal';
import { Overlay } from '../overlay';
import { Box } from '../box';
import { Text } from '../text';

/**
 * Actionsheet Component
 * 
 * Hardened primitive for bottom-sheet style actions.
 */
export const Actionsheet = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) => {
    if (!isOpen) return null;

    return (
        <Portal>
            <Overlay isOpen={isOpen} onPress={onClose} />
            <View 
                className="absolute inset-0 justify-end" 
                pointerEvents="box-none" 
                style={{ zIndex: 1001 }}
            >
                <Animated.View
                    entering={SlideInDown.duration(300).springify().damping(20)}
                    exiting={SlideOutDown.duration(200)}
                    className="w-full"
                >
                    <Box className="bg-silk rounded-t-3xl overflow-hidden shadow-2xl border-t border-linen pb-8">
                        {/* Handle bar */}
                        <Box className="w-12 h-1 bg-linen rounded-full self-center my-3 opacity-50" />
                        {children}
                    </Box>
                </Animated.View>
            </View>
        </Portal>
    );
};

export const ActionsheetBackdrop = Overlay;

export const ActionsheetContent = ({ children, className }: any) => (
    <Box className={`px-2 ${className || ''}`}>
        {children}
    </Box>
);

export const ActionsheetItem = ({ children, onPress, className }: any) => (
    <Pressable 
        onPress={onPress}
        className={`px-5 py-4 flex-row items-center active:bg-linen/20 rounded-xl mx-2 ${className || ''}`}
    >
        {children}
    </Pressable>
);

export const ActionsheetItemText = ({ children, className }: any) => (
    <Text className={`text-phase-text-primary text-lg ${className || ''}`}>
        {children}
    </Text>
);

export const ActionsheetDragIndicatorWrapper = ({ children }: any) => (
    <Box className="w-full items-center">
        {children}
    </Box>
);

export const ActionsheetDragIndicator = () => (
    <Box className="w-12 h-1 bg-linen rounded-full my-3" />
);
