/**
 * SANCTUARY CARD - Reusable Card Component
 * 
 * A versatile card component that follows sanctuary design principles:
 * - Organic corners (never sharp)
 * - Soft shadows when elevated
 * - Lift animation when pressable
 * - GLASSMORPHISM support (BlurView) with simplified fallback
 * 
 * Philosophy: Simple, reusable foundation for UI cards
 */

import React, { FC, useMemo } from 'react';
import { View, Pressable, Text, StyleSheet, TextStyle, Platform, useColorScheme } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Theme, typography } from '../../constants/Theme';
import { IS_LOW_POWER_MODE } from '../../utils/DeviceUtils';

// ============================================================================
// TYPES
// ============================================================================

interface SanctuaryCardProps {
    title?: string;
    children: any;
    footer?: any;
    onPress?: () => void;
    elevated?: boolean;
    variant?: 'glass' | 'solid'; // New variant prop
}

// ============================================================================
// CONSTANTS
// ============================================================================

const LIFT_SCALE_NORMAL = 1.0;
const LIFT_SCALE_PRESSED = 1.02;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const SanctuaryCard: FC<SanctuaryCardProps> = ({
    title,
    children,
    footer,
    onPress,
    elevated = false,
    variant = 'glass', // Default to glass
}) => {
    const isDark = useColorScheme() === 'dark';

    // Check if we should use glass (High Power + Glass Variant supported)
    // Android BlurView can be expensive, so check performance/variant
    const useGlass = !IS_LOW_POWER_MODE && variant === 'glass' && Platform.OS !== 'android';
    // Note: Expo Blur on Android is improved but still heavy. Defaulting to solid for safety unless explicitly tuned.
    // Use semi-transparent solid background for "faux-glass" on generally.

    // Shared value for lift animation
    const scale = useSharedValue(LIFT_SCALE_NORMAL);

    // ============================================================================
    // STYLES
    // ============================================================================

    const cardStyles = useMemo(() => {
        const glassTokens = isDark ? Theme.colors.glass.dark : Theme.colors.glass.light;

        return {
            container: {
                borderRadius: Theme.corners.generous,
                overflow: 'hidden' as const, // For BlurView
                borderWidth: 1,
                borderColor: useGlass ? glassTokens.border : 'rgba(255,255,255,0.05)',
                backgroundColor: useGlass
                    ? glassTokens.surface
                    : (isDark ? Theme.colors.midnightBlue : Theme.colors.creamSilence), // Solid Fallback
            },
            elevated: {
                ...Theme.shadows.md,
                // On Android, elevation needs a solid background to cast shadow properly if not careful
                // We rely on the container background
            },
            contentPadding: {
                padding: Theme.spacing.lg,
            },
            title: {
                fontSize: typography.h3.fontSize,
                fontWeight: typography.h3.fontWeight as TextStyle['fontWeight'],
                letterSpacing: typography.h3.letterSpacing,
                lineHeight: typography.h3.lineHeight,
                color: isDark ? Theme.colors.sacredWhite : Theme.colors.charcoalTruth,
                marginBottom: Theme.spacing.md,
            },
            footerContainer: {
                marginTop: Theme.spacing.md,
            },
            footerBorder: {
                height: 1,
                backgroundColor: isDark ? Theme.colors.mistGray : Theme.colors.stoneGray,
                marginBottom: Theme.spacing.md,
                opacity: 0.2,
            },
        };
    }, [isDark, useGlass, elevated]);

    // ============================================================================
    // ANIMATION: LIFT EFFECT (when pressable)
    // ============================================================================

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    const handlePressIn = () => {
        if (onPress) {
            scale.value = withSpring(LIFT_SCALE_PRESSED, {
                damping: 15,
                stiffness: 150,
            });
        }
    };

    const handlePressOut = () => {
        if (onPress) {
            scale.value = withSpring(LIFT_SCALE_NORMAL, {
                damping: 15,
                stiffness: 150,
            });
        }
    };

    // ============================================================================
    // RENDER CONTENT
    // ============================================================================

    const InnerContent = () => (
        <View style={cardStyles.contentPadding}>
            {/* Title Section */}
            {title && (
                <Text style={cardStyles.title}>{title}</Text>
            )}

            {/* Children Content */}
            <View style={{ gap: Theme.spacing.md }}>
                {/* @ts-ignore */}
                {children}
            </View>

            {/* Footer Section */}
            {footer && (
                <View style={cardStyles.footerContainer}>
                    <View style={cardStyles.footerBorder} />
                    {footer}
                </View>
            )}
        </View>
    );

    // ============================================================================
    // RENDER: Container Level (Glass vs Solid)
    // ============================================================================

    const renderCard = () => (
        <Animated.View
            style={[
                cardStyles.container,
                elevated && cardStyles.elevated,
                onPress && animatedStyle
            ]}
        >
            {useGlass ? (
                <BlurView
                    intensity={20}
                    tint={isDark ? 'dark' : 'light'}
                    style={StyleSheet.absoluteFill}
                >
                    <InnerContent />
                </BlurView>
            ) : (
                <InnerContent />
            )}
        </Animated.View>
    );

    if (onPress) {
        return (
            <Pressable
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
            >
                {renderCard()}
            </Pressable>
        );
    }

    return renderCard();
};

export default SanctuaryCard;
