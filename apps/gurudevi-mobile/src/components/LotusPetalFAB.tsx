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
import { View, Pressable, StyleSheet, Text, PanResponder, Dimensions } from 'react-native';
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
} from 'react-native-reanimated';
import { Easing } from 'react-native';
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

interface LotusFlowerIconProps {
    size: number;
    color: string;
    opacity?: number;
}

const LotusFlowerIcon: FC<LotusFlowerIconProps> = React.memo(({ size, color, opacity = 0.95 }) => {
    // Create a stylized lotus flower shape using SVG paths
    // The lotus has 8 petals arranged in a circular pattern
    return (
        <Svg width={size} height={size} viewBox="0 0 100 100">
            <G opacity={opacity}>
                {/* Center circle */}
                <Path
                    d="M 50 45 A 5 5 0 1 1 50 55 A 5 5 0 1 1 50 45 Z"
                    fill={color}
                />
                
                {/* Top petal */}
                <Path
                    d="M 50 10 Q 40 20 45 35 Q 50 30 55 35 Q 60 20 50 10 Z"
                    fill={color}
                />
                
                {/* Top-right petal */}
                <Path
                    d="M 70 20 Q 65 30 60 40 Q 55 35 55 40 Q 60 50 70 20 Z"
                    fill={color}
                />
                
                {/* Right petal */}
                <Path
                    d="M 85 45 Q 75 45 65 50 Q 70 55 65 60 Q 75 65 85 55 Z"
                    fill={color}
                />
                
                {/* Bottom-right petal */}
                <Path
                    d="M 75 75 Q 70 65 60 60 Q 55 65 55 70 Q 60 80 75 75 Z"
                    fill={color}
                />
                
                {/* Bottom petal */}
                <Path
                    d="M 50 90 Q 40 80 45 65 Q 50 70 55 65 Q 60 80 50 90 Z"
                    fill={color}
                />
                
                {/* Bottom-left petal */}
                <Path
                    d="M 25 75 Q 30 65 40 60 Q 45 65 45 70 Q 40 80 25 75 Z"
                    fill={color}
                />
                
                {/* Left petal */}
                <Path
                    d="M 15 45 Q 25 45 35 50 Q 30 55 35 60 Q 25 65 15 55 Z"
                    fill={color}
                />
                
                {/* Top-left petal */}
                <Path
                    d="M 30 20 Q 35 30 40 40 Q 45 35 45 40 Q 40 50 30 20 Z"
                    fill={color}
                />
            </G>
        </Svg>
    );
});

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
    // State for showing action menu
    const [showActions, setShowActions] = useState(false);
    const actionMenuScale = useSharedValue(0);
    // Track long press
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Memoize current configuration to avoid unnecessary recalculations
    const config = useMemo(() => fabConfig[currentTab], [currentTab]);
    const IconComponent = config.IconComponent;

    // Pan responder for drag functionality
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                // Only start dragging if moved more than 10 pixels
                return Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10;
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
                    translateX.value = gestureState.dx;
                    translateY.value = gestureState.dy;
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                // Clear long press timer
                if (longPressTimer.current) {
                    clearTimeout(longPressTimer.current);
                    longPressTimer.current = null;
                }

                if (isDragging) {
                    // Keep the FAB in its new position
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
                    <LotusFlowerIcon
                        size={FAB_SIZE}
                        color={Theme.colors.lotusDeepPink}
                        opacity={0.95}
                    />
                    <View style={styles.iconContainer}>
                        <IconComponent
                            size={ICON_SIZE}
                            color={Theme.colors.sacredWhite}
                            strokeWidth={2}
                        />
                    </View>
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
        backgroundColor: Theme.colors.voidIndigo,
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
