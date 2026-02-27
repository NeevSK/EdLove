/**
 * LOTUS PETAL FAB - Floating Action Button
 * 
 * A petal-shaped floating action button with:
 * - Golden Lotus Art image
 * - Breathing animation (4-second cycle)
 * - Context-aware icons per tab
 * - Press animation with haptic feedback
 * - Floating bubble physics for dragging
 * 
 * Philosophy: Organic, living UI that breathes with intention
 */

import React, { FC, useMemo, useEffect, useCallback, useState, useRef } from 'react';
import { View, Pressable, StyleSheet, Text, PanResponder, Dimensions, Image } from 'react-native';
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
    runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
    Flower2,
    Plus,
    MessageCircle,
    Upload,
    Edit
} from 'lucide-react-native';
import { Theme } from './theme/Theme';
import { useAccessibility } from '../hooks/useAccessibility';

// ============================================================================
// TYPES
// ============================================================================

type TabType = 'self' | 'classroom' | 'community' | 'library' | 'profile';

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
    bottomInset?: number; // New prop for safe area handling
}

// ============================================================================
// CONSTANTS
// ============================================================================


const FAB_SIZE = 72; // Slightly larger for the art
const FAB_HIT_SLOP = 10;
const ACTION_BUBBLE_SIZE = 48;
const ACTION_BUBBLE_SPACING = 12;
const LONG_PRESS_DURATION = 400; // milliseconds
const SCREEN_WIDTH = Dimensions.get('window').width;

// Context-aware configuration
type IconComponentType = React.ComponentType<{ size: number; color: string; strokeWidth: number }>;

const fabConfig: Record<TabType, { IconComponent: IconComponentType; label: string }> = {
    self: {
        IconComponent: Flower2,
        label: 'Log mood',
    },
    classroom: {
        IconComponent: Plus,
        label: 'Create lesson',
    },
    community: {
        IconComponent: MessageCircle,
        label: 'Post announcement',
    },
    library: {
        IconComponent: Upload,
        label: 'Upload resource',
    },
    profile: {
        IconComponent: Edit,
        label: 'Edit profile',
    }
};

const LOTUS_IMAGE = require('../../assets/images/lotus_bloom.png');

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const LotusPetalFAB: FC<LotusPetalFABProps> = ({
    currentTab = 'self',
    onPress,
    icon,
    actions,
    scrollY,
    disabled = true,
    bottomInset = Theme.spacing.lg, // Default value if not provided
}) => {
    const { isReduceMotionEnabled, announce } = useAccessibility();

    // TEMPORARY: Return null if disabled to completely hide the FAB
    if (disabled) return null;

    // Shared value for press animation
    const pressScale = useSharedValue(1);
    // Shared value for breathing animation
    const breathingScale = useSharedValue(0.95);
    // Position for dragging
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    // Base position accumulator
    const baseX = useRef(0);
    const baseY = useRef(0);
    // State for showing action menu
    const [showActions, setShowActions] = useState(false);
    const actionMenuScale = useSharedValue(0);
    // Track long press
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Memoize current configuration to avoid unnecessary recalculations
    const config = useMemo(() => fabConfig[currentTab], [currentTab]);
    const IconComponent = config.IconComponent;

    // Safe haptic feedback wrapper
    const triggerHaptic = useCallback(async () => {
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (error) {
            console.warn('Haptic feedback not available');
        }
    }, []);

    // Pan responder for drag functionality
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return isDragging || Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
            },
            onPanResponderGrant: () => {
                longPressTimer.current = setTimeout(() => {
                    setIsDragging(true);
                    triggerHaptic();
                    // Slight lift effect
                    pressScale.value = withSpring(1.1);
                }, LONG_PRESS_DURATION);
            },
            onPanResponderMove: (_, gestureState) => {
                if (isDragging) {
                    translateX.value = baseX.current + gestureState.dx;
                    translateY.value = baseY.current + gestureState.dy;
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (longPressTimer.current) {
                    clearTimeout(longPressTimer.current);
                    longPressTimer.current = null;
                }

                if (isDragging) {
                    baseX.current += gestureState.dx;
                    baseY.current += gestureState.dy;
                    setIsDragging(false);
                    // Spring back slightly on release (bubble effect)
                    pressScale.value = withSpring(1.0);

                    // Optional: Snap back if near edge? For now, free floating.
                } else {
                    const moved = Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
                    if (!moved) {
                        handlePress();
                    }
                }
            },
        })
    ).current;

    // ============================================================================
    // ANIMATION INITIALIZATION
    // ============================================================================

    useEffect(() => {
        if (!disabled && !isReduceMotionEnabled) {
            breathingScale.value = 0.95;
            breathingScale.value = withRepeat(
                withTiming(1.02, {
                    duration: 3000,
                    easing: Easing.inOut(Easing.ease)
                }),
                -1,
                true
            );
        } else {
            breathingScale.value = withTiming(1.0, { duration: 200 });
        }
    }, [disabled, isReduceMotionEnabled]);

    // ============================================================================
    // ANIMATION STYLES
    // ============================================================================

    const breathingStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: breathingScale.value }]
        };
    });

    const pressStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: pressScale.value }]
        };
    });

    const handlePress = useCallback(() => {
        if (disabled) return;

        if (actions && actions.length > 0) {
            triggerHaptic();
            setShowActions(!showActions);
            actionMenuScale.value = withSpring(showActions ? 0 : 1, {
                damping: 15,
                stiffness: 150
            });
            announce(showActions ? "Actions menu closed" : "Actions menu opened");
            return;
        }

        if (onPress) {
            triggerHaptic();
            pressScale.value = withSequence(
                withTiming(0.85, { duration: 100 }),
                withSpring(1.0, { damping: 12, stiffness: 200 })
            );
            onPress();
        }
    }, [disabled, onPress, actions, showActions, triggerHaptic]);

    const actionMenuStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: actionMenuScale.value }, { translateY: -10 }], // Pop up slightly
            opacity: actionMenuScale.value,
        } as any;
    });

    useEffect(() => {
        actionMenuScale.value = withSpring(showActions ? 1 : 0, {
            damping: 15,
            stiffness: 150
        });
    }, [showActions]);

    useEffect(() => {
        return () => {
            if (longPressTimer.current) {
                clearTimeout(longPressTimer.current);
            }
        };
    }, []);

    const scrollStyle = useAnimatedStyle(() => {
        if (!scrollY) return {};
        return {
            transform: [{
                translateY: interpolate(
                    scrollY.value,
                    [0, 100],
                    [0, 100],
                    Extrapolate.CLAMP
                )
            }],
            opacity: interpolate(
                scrollY.value,
                [0, 50, 100],
                [1, 0.5, 0],
                Extrapolate.CLAMP
            )
        };
    });

    const dragStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value }
            ]
        } as any;
    });

    const containerStyle = useMemo(() => [
        styles.container,
        { bottom: bottomInset }, // Override bottom with prop
        breathingStyle,
        pressStyle,
        scrollStyle,
        dragStyle,
        disabled && styles.disabled
    ], [bottomInset, breathingStyle, pressStyle, scrollStyle, dragStyle, disabled]);

    return (
        <Animated.View
            {...panResponder.panHandlers}
            style={containerStyle}
            accessible={true}
            accessibilityRole="image" // The FAB itself is an image/button
            accessibilityLabel={config.label}
            accessibilityHint={actions && actions.length > 0 ? "Double tap to view actions" : undefined}
            accessibilityState={{ disabled, expanded: showActions }}
            accessibilityActions={[{ name: 'activate', label: 'Activate' }]}
            onAccessibilityAction={handlePress}
        >
            <View style={styles.contentContainer}>
                {/* Glow Behind */}
                <View style={styles.glow} />

                {/* Lotus Image */}
                <Image
                    source={LOTUS_IMAGE}
                    style={styles.lotusImage}
                    resizeMode="contain"
                />

                {/* Optional Icon Overlay */}
                {icon && (
                    <View style={styles.iconOverlay}>
                        <>{icon}</>
                    </View>
                )}
            </View>

            {/* Action Menu */}
            {actions && actions.length > 0 && (
                <Animated.View style={[styles.actionMenu, actionMenuStyle]}>
                    {actions.map((action, index) => (
                        <Pressable
                            key={index}
                            style={styles.actionBubble}
                            onPress={() => {
                                triggerHaptic();
                            }}
                            accessible={true}
                            accessibilityRole="button"
                            accessibilityLabel={action.label}
                        >
                            <View style={styles.actionBubbleContent}>
                                {action.icon && (
                                    <action.icon
                                        size={18}
                                        color={Theme.colors.lotusDeepPink}
                                        strokeWidth={2}
                                    />
                                )}
                                <Text style={styles.actionLabel}>{action.label}</Text>
                            </View>
                        </Pressable>
                    ))}
                </Animated.View>
            )}
        </Animated.View>
    );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        // bottom set dynamically
        right: Theme.spacing.lg,
        zIndex: Theme.zIndex.fab,
        alignItems: 'center',
        justifyContent: 'center',
    },
    contentContainer: {
        width: FAB_SIZE,
        height: FAB_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    lotusImage: {
        width: '100%',
        height: '100%',
        zIndex: 2,
        backgroundColor: 'transparent',
    },
    iconOverlay: {
        position: 'absolute',
        zIndex: 3,
        alignItems: 'center',
        justifyContent: 'center',
    },
    glow: {
        position: 'absolute',
        width: FAB_SIZE * 0.8,
        height: FAB_SIZE * 0.8,
        borderRadius: FAB_SIZE,
        backgroundColor: Theme.colors.sanctuarySaffron,
        opacity: 0.4,
        shadowColor: Theme.colors.sanctuarySaffron,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
        elevation: 10,
        zIndex: 1,
    },
    disabled: {
        opacity: 0.5,
    },
    actionMenu: {
        position: 'absolute',
        bottom: FAB_SIZE + ACTION_BUBBLE_SPACING,
        right: 0,
        alignItems: 'flex-end',
    },
    actionBubble: {
        backgroundColor: Theme.colors.voidIndigo,
        borderRadius: 24,
        marginBottom: ACTION_BUBBLE_SPACING,
        paddingHorizontal: 16,
        paddingVertical: 10,
        ...Theme.shadows.md,
        minWidth: 100,
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
    },
    actionBubbleContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 8,
    },
    actionLabel: {
        color: Theme.colors.sacredWhite,
        fontSize: 14,
        fontWeight: '600',
    },
});

export default LotusPetalFAB;
