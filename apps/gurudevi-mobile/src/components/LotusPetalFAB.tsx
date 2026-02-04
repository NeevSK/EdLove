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
 */

import React, { FC } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
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

interface LotusPetalFABProps {
    currentTab: TabType;
    onPress: () => void;
    scrollY?: SharedValue<number>;
    disabled?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const FAB_SIZE = 56;
const FAB_HEIGHT = 72; // Taller than wide for petal shape
const ICON_SIZE = 24;

// Context-aware configuration
const fabConfig: Record<TabType, { IconComponent: any; label: string }> = {
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
// PETAL SHAPE COMPONENT
// ============================================================================

interface PetalShapeProps {
    size: number;
    height: number;
    color: string;
    opacity?: number;
}

const PetalShape: FC<PetalShapeProps> = ({ size, height, color, opacity = 0.95 }) => {
    // Create an organic petal shape using SVG path
    // The shape is taller than wide, with a pointed top and rounded bottom
    const petalPath = `
        M ${size / 2} 0
        C ${size * 0.35} ${height * 0.15}, ${size * 0.25} ${height * 0.3}, ${size * 0.25} ${height * 0.45}
        C ${size * 0.25} ${height * 0.6}, ${size * 0.3} ${height * 0.75}, ${size / 2} ${height}
        C ${size * 0.7} ${height * 0.75}, ${size * 0.75} ${height * 0.6}, ${size * 0.75} ${height * 0.45}
        C ${size * 0.75} ${height * 0.3}, ${size * 0.65} ${height * 0.15}, ${size / 2} 0
        Z
    `;

    return (
        <Svg width={size} height={height} viewBox={`0 0 ${size} ${height}`}>
            <Path
                d={petalPath}
                fill={color}
                opacity={opacity}
            />
        </Svg>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const LotusPetalFAB: FC<LotusPetalFABProps> = ({
    currentTab,
    onPress,
    scrollY,
    disabled = false,
}) => {
    // Shared value for press animation
    const scale = useSharedValue(1);

    // Get current configuration
    const config = fabConfig[currentTab];
    const IconComponent = config.IconComponent;

    // ============================================================================
    // ANIMATION 1: BREATHING (Always-on when not disabled)
    // ============================================================================
    
    const breathingStyle = useAnimatedStyle(() => {
        if (disabled) {
            return { transform: [{ scale: 1 }] };
        }

        return {
            transform: [{
                scale: withRepeat(
                    withTiming(0.95, { 
                        duration: 2000, 
                        easing: Easing.inOut(Easing.ease) 
                    }),
                    -1, // infinite
                    true // reverse (yoyo effect)
                )
            }]
        };
    });

    // ============================================================================
    // ANIMATION 2: PRESS RESPONSE
    // ============================================================================
    
    const pressStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }]
        };
    });

    const handlePress = () => {
        if (disabled) return;

        // Haptic feedback
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        // Visual feedback - scale down then spring back
        scale.value = withSequence(
            withTiming(0.9, { duration: 100 }),
            withSpring(1.0, { 
                damping: 15, 
                stiffness: 150 
            })
        );

        // Execute callback
        onPress();
    };

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
    });

    // ============================================================================
    // RENDER
    // ============================================================================

    return (
        <Animated.View 
            style={[
                styles.container,
                breathingStyle,
                pressStyle,
                scrollStyle,
                disabled && styles.disabled
            ]}
        >
            <Pressable
                onPress={handlePress}
                disabled={disabled}
                style={styles.pressable}
            >
                <View style={styles.petalContainer}>
                    <PetalShape
                        size={FAB_SIZE}
                        height={FAB_HEIGHT}
                        color={Theme.colors.sanctuarySaffron}
                        opacity={disabled ? 0.5 : 0.95}
                    />
                    <View style={styles.iconContainer}>
                        <IconComponent
                            size={ICON_SIZE}
                            color={Theme.colors.sacredWhite}
                            strokeWidth={2}
                        />
                    </View>
                </View>
            </Pressable>
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
    },
    petalContainer: {
        width: FAB_SIZE,
        height: FAB_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center',
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
});

export default LotusPetalFAB;
