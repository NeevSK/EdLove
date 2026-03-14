import React, { FC, useMemo, useEffect, useCallback, useState, useRef } from 'react';
import { View, Pressable, StyleSheet, PanResponder, Dimensions, Image, Platform } from 'react-native';
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
import { Theme } from '../theme/Theme';
import { useThemedColors } from '../hooks/useThemedColors';
import { useTheme } from '../hooks/useTheme';
import { hapticLight } from '../utils/haptics';
import { useAccessibility } from '../hooks/useAccessibility';
import { X, Wind } from 'lucide-react-native';
import { Box, VStack, HStack, Text } from '../gluestack';
import { UniversalModal } from './UniversalModal';
import { useBottomTabPadding } from './ScreenWrapper';
import { useFAB } from '../context/FABContext';

// ============================================================================
// TYPES
// ============================================================================

export type TabType = 'self' | 'classroom' | 'community' | 'library' | 'profile' | 'section' | 'grade' | 'principal' | 'founder';

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
    hasActiveGaps?: boolean;
    gapPriority?: 'low' | 'medium' | 'high';
    onBreathingReset?: () => void;
    useGlobal?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const FAB_SIZE = 56;
const ACTION_DRAWER_HEIGHT = Dimensions.get('window').height * 0.4;

const fabConfig: Record<TabType, { emoji: string; label: string }> = {
    self: { emoji: '🪷', label: 'Reflection' },
    classroom: { emoji: '➕', label: 'Add' },
    community: { emoji: '💬', label: 'Community' },
    library: { emoji: '📚', label: 'Library' },
    profile: { emoji: '👤', label: 'Profile' },
    section: { emoji: '🏢', label: 'Section' },
    grade: { emoji: '🏫', label: 'Grade' },
    principal: { emoji: '👑', label: 'Management' },
    founder: { emoji: '🏛️', label: 'Founder' }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const LotusPetalFAB: FC<LotusPetalFABProps> = ({
    currentTab: propTab,
    onPress: propPress,
    icon: customIcon,
    actions: propActions,
    scrollY,
    disabled = false,
    bottomInset = Theme.spacing.lg,
    hasActiveGaps: propGaps,
    gapPriority: propPriority,
    onBreathingReset: propReset,
    useGlobal = true,
}) => {
    const { state: globalState } = useFAB();
    const { isReduceMotionEnabled, announce } = useAccessibility();
    const bottomTabPadding = useBottomTabPadding();

    // Reconcile props with global state
    const currentTab = propTab || globalState.tabType;
    const actions = propActions || globalState.actions;
    const hasActiveGaps = propGaps ?? globalState.hasActiveGaps;
    const onPress = propPress || globalState.onPress;
    const onBreathingReset = propReset || globalState.onBreathingReset;
    const isVisible = useGlobal ? globalState.visible : true;
    const icon = customIcon || globalState.icon;

    const colors = useThemedColors();
    const { glow, accent } = useTheme();
    const config = useMemo(() => fabConfig[currentTab] || fabConfig.self, [currentTab]);

    // Reanimated Shared Values
    const pressScale = useSharedValue(1);
    const breathingScale = useSharedValue(1);
    const pulseOpacity = useSharedValue(0.4);

    // Position Shared Values for Draggability
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    const [isDrawerVisible, setIsDrawerVisible] = useState(false);

    // PanResponder for Draggability
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gesture) => {
                return Math.abs(gesture.dx) > 10 || Math.abs(gesture.dy) > 10;
            },
            onPanResponderGrant: () => {
                pressScale.value = withSpring(1.1);
                hapticLight();
            },
            onPanResponderMove: (_, gesture) => {
                translateX.value = gesture.dx;
                translateY.value = gesture.dy;
            },
            onPanResponderRelease: (_, gesture) => {
                pressScale.value = withSpring(1);
                
                // If it was a small movement, trigger press
                if (Math.abs(gesture.dx) < 10 && Math.abs(gesture.dy) < 10) {
                    handlePress();
                }

                // Snap to edges behavior
                const screenWidth = Dimensions.get('window').width;
                const snapPointX = gesture.moveX > screenWidth / 2 ? 0 : -(screenWidth - FAB_SIZE - Theme.spacing.lg * 2);
                
                translateX.value = withSpring(snapPointX, Theme.motion.spring.snappy);
                translateY.value = withSpring(translateY.value, Theme.motion.spring.gentle);
            },
        })
    ).current;

    // Breathing Animation
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
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: pressScale.value }
        ],
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

    const handleLongPress = useCallback(() => {
        if (disabled || !onBreathingReset) return;
        hapticLight();
        onBreathingReset();
    }, [disabled, onBreathingReset]);

    if (!isVisible) return null;

    return (
        <View 
            style={[styles.container, { bottom: bottomInset + bottomTabPadding }]}
            pointerEvents="box-none"
        >
            <Animated.View 
                {...panResponder.panHandlers}
                style={[styles.fabWrapper, containerStyle]}
            >
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
                        shadowColor: Theme.colors.templeGold,
                        shadowOpacity: 0.8,
                        shadowRadius: 15,
                        shadowOffset: { width: 0, height: 0 },
                        elevation: 12,
                        borderWidth: 1.5,
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                    }}
                >

                    {hasActiveGaps ? (
                        <Text style={styles.emojiText}>❗</Text>
                    ) : icon ? (
                        icon
                    ) : (
                        <Text style={styles.emojiText}>{config.emoji}</Text>
                    )}
                </Box>
            </Animated.View>

            {/* Simple Action Drawer Integration */}
            <UniversalModal
                isOpen={isDrawerVisible}
                onClose={() => setIsDrawerVisible(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setIsDrawerVisible(false)}
                >
                    <Box
                        sx={{
                            backgroundColor: Theme.colors.shroud,
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
                            backgroundColor: Theme.colors.starlightGray,
                            borderRadius: 2,
                            alignSelf: 'center',
                            marginBottom: Theme.spacing.lg,
                            opacity: 0.3
                        }} />

                        <VStack sx={{ gap: '$md' as any }}>
                            <Text color={Theme.colors.sacredWhite} sx={{ fontSize: '$xl' as any, fontWeight: '600', marginBottom: '$2' as any }}>
                                {config.label} Actions
                            </Text>

                            {onBreathingReset && (
                                <Pressable
                                    onPress={() => {
                                        setIsDrawerVisible(false);
                                        onBreathingReset();
                                    }}
                                    style={({ pressed }) => [
                                        styles.actionItem,
                                        { backgroundColor: 'rgba(143, 188, 143, 0.1)' },
                                        pressed && { backgroundColor: 'rgba(143, 188, 143, 0.2)' }
                                    ]}
                                >
                                    <HStack alignItems="center" sx={{ gap: '$3' as any }}>
                                        <Wind size={20} color={Theme.colors.sageGreen} strokeWidth={2} />
                                        <Text color={Theme.colors.sacredWhite} sx={{ fontSize: '$md' as any, fontWeight: '600' }}>
                                            Breathing Reset
                                        </Text>
                                    </HStack>
                                </Pressable>
                            )}

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
            </UniversalModal>
        </View>
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
