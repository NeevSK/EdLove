/**
 * LOTUS PETAL FAB - Floating Action Button (Sanctuary Version)
 * 
 * A living UI component that represents the Agentic presence.
 */

import React, { FC, useMemo, useEffect, useCallback, useState, useRef } from 'react';
import { View, Pressable, StyleSheet, PanResponder, Dimensions, Image } from 'react-native';
import Animated, {
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    withSpring,
    interpolate,
    SharedValue,
    Extrapolate,
    useSharedValue,
    Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Theme, typography } from '../theme/Theme';
import { useThemedColors } from '../hooks/useThemedColors';
import { hapticLight } from '../utils/haptics';
import { useAccessibility } from '../hooks/useAccessibility';
import { Modal } from 'react-native';
import { X } from 'lucide-react-native';
import { Box, VStack, HStack, Text } from '../gluestack';

// ============================================================================
// TYPES
// ============================================================================

export type TabType = 'self' | 'classroom' | 'community' | 'library' | 'profile' | 'section' | 'grade' | 'principal';

export interface ActionItem {
    label: string;
    onPress: () => void;
    icon?: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
}

interface LotusPetalFABProps {
    currentTab?: TabType;
    onPress?: () => void;
    icon?: React.ReactNode;
    actions?: ActionItem[];
    scrollY?: SharedValue<number>;
    disabled?: boolean;
    bottomInset?: number;
    hasActiveGaps?: boolean; // New: Agent has a suggestion
    gapPriority?: 'low' | 'medium' | 'high';
}

// ============================================================================
// CONSTANTS
// ============================================================================

const FAB_SIZE = 56;
const ACTION_DRAWER_HEIGHT = Dimensions.get('window').height * 0.4;

type IconComponentType = React.ComponentType<{ size: number; color: string; strokeWidth: number }>;

const fabConfig: Record<TabType, { emoji: string; label: string }> = {
    self: { emoji: '🪷', label: 'Reflection' },
    classroom: { emoji: '➕', label: 'Add' },
    community: { emoji: '💬', label: 'Community' },
    library: { emoji: '📚', label: 'Library' },
    profile: { emoji: '👤', label: 'Profile' },
    section: { emoji: '🏢', label: 'Section' },
    grade: { emoji: '🏫', label: 'Grade' },
    principal: { emoji: '👑', label: 'Management' }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const LotusPetalFAB: FC<LotusPetalFABProps> = ({
    currentTab = 'self',
    onPress,
    icon: customIcon,
    actions,
    scrollY,
    disabled = false,
    bottomInset = Theme.spacing.lg,
    hasActiveGaps = false,
    gapPriority = 'low',
}) => {
    const { isReduceMotionEnabled, announce } = useAccessibility();

    const colors = useThemedColors();
    const config = useMemo(() => fabConfig[currentTab] || fabConfig.self, [currentTab]);

    // Reanimated Shared Values
    const pressScale = useSharedValue(1);
    const breathingScale = useSharedValue(1);
    const pulseOpacity = useSharedValue(0.4);

    const [isDrawerVisible, setIsDrawerVisible] = useState(false);

    // Breathing Animation (matches ShadowAgent)
    useEffect(() => {
        if (!disabled && !isReduceMotionEnabled) {
            breathingScale.value = withRepeat(
                withTiming(1.1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
                -1,
                true
            );
            pulseOpacity.value = withRepeat(
                withTiming(0.7, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
                -1,
                true
            );
        }
    }, [disabled, isReduceMotionEnabled]);

    const containerStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pressScale.value }],
    }));

    const breathingStyle = useAnimatedStyle(() => ({
        transform: [{ scale: breathingScale.value }],
        opacity: pulseOpacity.value,
    }));

    const handlePress = useCallback(() => {
        if (disabled) return;
        hapticLight();

        if (actions && actions.length > 0) {
            setIsDrawerVisible(true);
            return;
        }

        if (onPress) {
            pressScale.value = withSequence(
                withTiming(0.9, { duration: 100 }),
                withSpring(1)
            );
            onPress();
        }
    }, [disabled, onPress, actions]);

    return (
        <>
            <Pressable
                onPress={handlePress}
                style={[styles.container, { bottom: bottomInset }]}
                disabled={disabled}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={hasActiveGaps ? `Agent Insight Available: ${config.label}` : config.label}
                accessibilityHint={actions && actions.length > 0 ? 'Double tap to open actions' : 'Double tap to activate'}
                accessibilityState={{ disabled }}
            >
                <Animated.View style={[styles.fabWrapper, containerStyle]}>
                    {/* Breathing Glow */}
                    <Animated.View style={[styles.glow, breathingStyle, hasActiveGaps && styles.glowActive]} />

                    {/* Simple Circle */}
                    <Box
                        sx={{
                            width: FAB_SIZE,
                            height: FAB_SIZE,
                            borderRadius: Theme.corners.full,
                            backgroundColor: Theme.colors.sanctuarySaffron,
                            alignItems: 'center',
                            justifyContent: 'center',
                            ...Theme.shadows.glow,
                        }}
                    >
                        <Text style={styles.emojiText}>{hasActiveGaps ? '❗' : config.emoji}</Text>
                    </Box>
                </Animated.View>
            </Pressable>

            {/* Simple Action Drawer Integration */}
            <Modal
                visible={isDrawerVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setIsDrawerVisible(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setIsDrawerVisible(false)}
                >
                    <Box
                        sx={{
                            backgroundColor: Theme.colors.midnightBlue,
                            borderTopLeftRadius: Theme.corners.generous,
                            borderTopRightRadius: Theme.corners.generous,
                            padding: Theme.spacing.xl,
                            minHeight: ACTION_DRAWER_HEIGHT,
                            width: '100%',
                            marginTop: 'auto',
                        }}
                    >
                        <Box sx={{
                            width: 40,
                            height: 4,
                            backgroundColor: Theme.colors.pearlGray,
                            borderRadius: 2,
                            alignSelf: 'center',
                            marginBottom: Theme.spacing.lg,
                            opacity: 0.3
                        }} />

                        <VStack sx={{ gap: '$md' as any }}>
                            <Text color={Theme.colors.sacredWhite} sx={{ fontSize: '$xl' as any, fontWeight: '600', marginBottom: '$2' as any }}>
                                {config.label} Actions
                            </Text>
                            {actions?.map((action, idx) => (
                                <Pressable
                                    key={idx}
                                    onPress={() => {
                                        setIsDrawerVisible(false);
                                        action.onPress();
                                    }}
                                    accessible={true}
                                    accessibilityRole="button"
                                    accessibilityLabel={action.label}
                                    style={({ pressed }) => [
                                        styles.actionItem,
                                        pressed && { backgroundColor: 'rgba(255,255,255,0.05)' }
                                    ]}
                                >
                                    <HStack alignItems="center" sx={{ gap: '$3' as any }}>
                                        {action.icon && <action.icon size={20} color={Theme.colors.sanctuarySaffron} strokeWidth={2} />}
                                        <Text color={Theme.colors.sacredWhite} sx={{ fontSize: '$md' as any }}>{action.label}</Text>
                                    </HStack>
                                </Pressable>
                            ))}
                        </VStack>
                    </Box>
                </Pressable>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        right: Theme.spacing.lg,
        zIndex: Theme.zIndex.fab,
    },
    fabWrapper: {
        width: FAB_SIZE,
        height: FAB_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    glow: {
        position: 'absolute',
        width: FAB_SIZE * 1.3,
        height: FAB_SIZE * 1.3,
        borderRadius: FAB_SIZE,
        backgroundColor: Theme.colors.sanctuarySaffron,
        opacity: 0.4,
    },
    glowActive: {
        backgroundColor: Theme.colors.lotusDeepPink,
        opacity: 0.6,
    },
    emojiText: {
        fontSize: 24,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'flex-end',
    },
    actionItem: {
        paddingVertical: Theme.spacing.md,
        paddingHorizontal: Theme.spacing.sm,
        borderRadius: Theme.corners.comfortable,
    }
});

export default LotusPetalFAB;
