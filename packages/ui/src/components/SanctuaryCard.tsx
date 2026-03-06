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

import React, { FC, useMemo, useState } from 'react';
import { View, Pressable, Text, StyleSheet, TextStyle, ViewStyle, Platform } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Theme, typography } from '../theme/Theme';
import { useTheme } from '../hooks/useTheme';

// ============================================================================
// TYPES
// ============================================================================

interface SanctuaryCardProps {
    title?: string;
    children: any;
    footer?: any;
    onPress?: () => void;
    href?: string;
    target?: '_blank' | '_self';
    elevated?: boolean;
    variant?: 'glass' | 'solid'; // New variant prop
    style?: any;
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
    href,
    target = '_self',
    elevated = false,
    variant = 'glass', // Default to glass
    style
}) => {
    const { isDark, glass, glow, blurEnabled } = useTheme();

    // Hover state — only meaningful on web (desktop pointer devices)
    const [hovered, setHovered] = useState(false);

    // Check if we should use glass (blur enabled + glass variant)
    const useGlass = blurEnabled && variant === 'glass';
    // Note: blurEnabled accounts for device tier and fidelity settings.

    // Hover style — memoized so the object reference is stable between renders
    // `cursor` is a web-only CSS property; typed via ViewStyle intersection to avoid `as any`
    const hoverStyle = useMemo(
        () => ({ opacity: 0.93, transform: [{ scale: 1.012 }], cursor: 'pointer' } as ViewStyle & { cursor?: string }),
        [],
    );

    // Shared value for lift animation
    const scale = useSharedValue(LIFT_SCALE_NORMAL);

    // ============================================================================
    // STYLES
    // ============================================================================

    const cardStyles = useMemo(() => {
        return {
            container: {
                borderRadius: Theme.corners.generous,
                overflow: 'hidden' as const, // For BlurView
                borderWidth: 1,
                borderColor: useGlass ? glass.surface.border : Theme.colors.border,
                backgroundColor: useGlass
                    ? glass.surface.bg
                    : (isDark ? Theme.colors.shroud : Theme.colors.silk), // Level 2 Surface
            },
            elevated: {
                shadowColor: Theme.colors.shadowViolet,
                shadowOpacity: 0.24,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 8 },
                elevation: 8,
                ...(Platform.OS === 'web' && {
                    boxShadow: `0 8px 16px ${Theme.colors.shadowViolet}3D`, // 3D is ~24% opacity
                }),
            },
            contentPadding: {
                padding: Theme.spacing.lg,
            },
            title: {
                fontSize: typography.h3.fontSize,
                fontWeight: typography.h3.fontWeight as TextStyle['fontWeight'],
                letterSpacing: typography.h3.letterSpacing,
                lineHeight: typography.h3.lineHeight,
                color: isDark ? Theme.colors.sacredWhite : Theme.colors.inkTruth,
                marginBottom: Theme.spacing.md,
            },
            footerContainer: {
                marginTop: Theme.spacing.md,
            },
            footerBorder: {
                height: 1,
                backgroundColor: Theme.colors.border,
                marginBottom: Theme.spacing.md,
                opacity: 0.3,
            },
        };
    }, [isDark, useGlass, elevated, glass, glow]);

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
                onPress && animatedStyle,
                style
            ]}
        >
            {useGlass && (
                <BlurView
                    intensity={36} // Retina Protocol: 36 is the magic number
                    tint={isDark ? 'dark' : 'light'}
                    style={StyleSheet.absoluteFill}
                />
            )}
            <InnerContent />
        </Animated.View>
    );

    if (onPress || href) {
        const PressableAny = Pressable as any;
        return (
            <PressableAny
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onHoverIn={Platform.OS === 'web' ? () => setHovered(true) : undefined}
                onHoverOut={Platform.OS === 'web' ? () => setHovered(false) : undefined}
                style={Platform.OS === 'web' && hovered ? hoverStyle : undefined}
                // @ts-ignore
                accessibilityRole={href ? 'link' : 'button'}
                // @ts-ignore
                href={href}
                // @ts-ignore
                hrefAttrs={{
                    target: target,
                    rel: target === '_blank' ? 'noopener noreferrer' : undefined,
                }}
            >
                {renderCard()}
            </PressableAny>
        );
    }

    return renderCard();
};

export default SanctuaryCard;
