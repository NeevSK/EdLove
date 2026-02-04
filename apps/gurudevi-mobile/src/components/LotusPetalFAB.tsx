/**
 * LOTUS PETAL FAB - Floating Action Button
 * 
 * A petal-shaped (NOT circular!) floating action button with:
 * - Organic petal shape using SVG
 * - Breathing animation (4-second cycle)
 * - Context-aware icons per tab
 * - Press animation with haptic feedback
 * - Scroll hide/show behavior (optional)
 * 
 * Philosophy: Organic, living UI that breathes with intention
 * 
 * @example
 * ```tsx
 * import LotusPetalFAB from './components/LotusPetalFAB';
 * import { useSharedValue } from 'react-native-reanimated';
 * 
 * function MyScreen() {
 *   const scrollY = useSharedValue(0);
 *   const [currentTab, setCurrentTab] = useState('self');
 * 
 *   return (
 *     <View>
 *       {/* Your screen content *\/}
 *       <LotusPetalFAB
 *         currentTab={currentTab}
 *         onPress={() => console.log('FAB pressed!')}
 *         scrollY={scrollY}
 *         disabled={false}
 *       />
 *     </View>
 *   );
 * }
 * ```
 */

import React, { FC, useMemo, useEffect, useCallback, useState, useRef } from 'react';
import { View, Pressable, StyleSheet, Text, PanResponder, Dimensions, Image } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
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
import {
    Flower2,
    Plus,
    MessageCircle,
    Upload,
    Edit
} from 'lucide-react-native';
import Theme from '../constants/Theme';

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
    currentTab: TabType;
    onPress?: () => void;
    actions?: ActionItem[];
    scrollY?: SharedValue<number>;
    disabled?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================


const FAB_SIZE = 64;
const FAB_HEIGHT = 64; // Make it square for better lotus flower icon
const ICON_SIZE = 32;
const ACTION_BUBBLE_SIZE = 48;
const ACTION_BUBBLE_SPACING = 8;
const LONG_PRESS_DURATION = 500; // milliseconds
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

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

// ============================================================================
// LOTUS FLOWER ICON COMPONENT
// ============================================================================

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const LotusPetalFAB: FC<LotusPetalFABProps> = ({
    currentTab,
    onPress,
    actions,
    scrollY,
    disabled = false,
}) => {
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

    // Pan responder for drag functionality
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true, // Always capture start to check for drag vs tap
            onMoveShouldSetPanResponder: (_, gestureState) => {
                // Highly sensitive drag detection for "floating" feel
                return isDragging || Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
            },
            onPanResponderGrant: () => {
                // Start long press timer
                longPressTimer.current = setTimeout(() => {
                    setIsDragging(true);
                    triggerHapticFeedback();
                }, LONG_PRESS_DURATION);
            },
            onPanResponderMove: (_, gestureState) => {
                if (isDragging) {
                    translateX.value = baseX.current + gestureState.dx;
                    translateY.value = baseY.current + gestureState.dy;
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                // Clear long press timer
                if (longPressTimer.current) {
                    clearTimeout(longPressTimer.current);
                    longPressTimer.current = null;
                }

                if (isDragging) {
                    // Update base position for next drag
                    baseX.current += gestureState.dx;
                    baseY.current += gestureState.dy;
                    setIsDragging(false);
                } else {
                    // If not dragging, treat as a tap
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

    // Initialize breathing animation in useEffect to avoid restarting on every render
    useEffect(() => {
        if (!disabled) {
            breathingScale.value = 0.95;
            breathingScale.value = withRepeat(
                withTiming(1.0, {
                    duration: 2000,
                    easing: Easing.inOut(Easing.ease)
                }),
                -1, // infinite
                true // reverse (yoyo effect)
            );
        } else {
            // Reset to 1.0 when disabled
            breathingScale.value = withTiming(1.0, { duration: 200 });
        }
    }, [disabled]); // breathingScale, withRepeat, withTiming, and Easing are stable refs, not needed in deps

    // ============================================================================
    // ANIMATION 1: BREATHING (Always-on when not disabled)
    // ============================================================================

    const breathingStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: breathingScale.value }]
        };
    }); // breathingScale is a stable ref, no need in deps

    // ============================================================================
    // ANIMATION 2: PRESS RESPONSE
    // ============================================================================

    const pressStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: pressScale.value }]
        };
    }); // pressScale is a stable ref, no need in deps

    // Safe haptic feedback with error handling
    const triggerHapticFeedback = useCallback(async () => {
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (error) {
            // Haptics not available on simulators or devices without haptic support
            console.warn('Haptic feedback not available on this device');
        }
    }, []);

    const handlePress = useCallback(() => {
        if (disabled) return;

        // If actions are provided, show action menu
        if (actions && actions.length > 0) {
            triggerHapticFeedback();
            setShowActions(!showActions);
            actionMenuScale.value = withSpring(showActions ? 0 : 1, {
                damping: 15,
                stiffness: 150
            });
            return;
        }

        // Otherwise, trigger onPress callback
        if (onPress) {
            // Haptic feedback
            triggerHapticFeedback();

            // Visual feedback - scale down then spring back
            pressScale.value = withSequence(
                withTiming(0.9, { duration: 100 }),
                withSpring(1.0, {
                    damping: 15,
                    stiffness: 150
                })
            );

            // Execute callback
            onPress();
        }
    }, [disabled, onPress, actions, showActions, triggerHapticFeedback]);

    // Animation for action menu appearance
    const actionMenuStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: actionMenuScale.value }],
            opacity: actionMenuScale.value,
        };
    });


    // Effect to handle action menu scale
    useEffect(() => {
        actionMenuScale.value = withSpring(showActions ? 1 : 0, {
            damping: 15,
            stiffness: 150
        });
    }, [showActions]);


    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (longPressTimer.current) {
                clearTimeout(longPressTimer.current);
            }
        };
    }, []);

    // ============================================================================
    // ANIMATION 3: SCROLL BEHAVIOR (Optional)
    // ============================================================================

    const scrollStyle = useAnimatedStyle(() => {
        if (!scrollY) {
            return {};
        }

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
    }); // scrollY is a stable ref, no need in deps

    // ============================================================================
    // RENDER
    // ============================================================================

    // Animated style for drag position
    const dragStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value }
            ]
        };
    });

    return (
        <Animated.View
            {...panResponder.panHandlers}

            style={[
                styles.container,
                breathingStyle,
                pressStyle,
                scrollStyle,
                dragStyle,
                disabled && styles.disabled
            ]}
        >
            <View style={styles.pressable}>
                <View style={styles.petalContainer}>
                    <Animated.Image
                        source={require('../../assets/images/lotus_bloom.png')}
                        style={{
                            width: FAB_SIZE * 1.5, // Make it bloom slightly larger than container
                            height: FAB_HEIGHT * 1.5,
                        }}
                        resizeMode="contain"
                    />
                </View>
            </View>

            {/* Action Menu */}
            {actions && actions.length > 0 && (
                <Animated.View style={[styles.actionMenu, actionMenuStyle]}>
                    {actions.map((action, index) => (
                        <Pressable
                            key={index}
                            style={styles.actionBubble}
                            onPress={() => {
                                action.onPress();
                                setShowActions(false);
                                triggerHapticFeedback();
                            }}
                        >
                            <View style={styles.actionBubbleContent}>
                                {action.icon && (
                                    <action.icon
                                        size={20}
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
        bottom: Theme.spacing.md,
        right: Theme.spacing.md,
        zIndex: Theme.zIndex.fab,
        ...Theme.shadows.glow,
    },
    pressable: {
        width: FAB_SIZE,
        height: FAB_HEIGHT,
        borderRadius: FAB_SIZE / 2,
        backgroundColor: 'transparent',
    },
    petalContainer: {
        width: FAB_SIZE,
        height: FAB_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: FAB_SIZE / 2,
    },
    iconContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [
            { translateX: -ICON_SIZE / 2 },
            { translateY: -ICON_SIZE / 2 }
        ],
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
        borderRadius: ACTION_BUBBLE_SIZE / 2,
        marginBottom: ACTION_BUBBLE_SPACING,
        paddingHorizontal: Theme.spacing.md,
        paddingVertical: Theme.spacing.sm,
        ...Theme.shadows.md,
        minWidth: ACTION_BUBBLE_SIZE,
    },
    actionBubbleContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Theme.spacing.sm,
    },
    actionLabel: {
        color: Theme.colors.sacredWhite,
        fontSize: Theme.typography.fontSize.sm,
        fontWeight: Theme.typography.fontWeight.medium as any,
    },
});

export default LotusPetalFAB;
