/**
 * SANCTUARY CARD - Reusable Card Component
 * 
 * A versatile card component that follows sanctuary design principles:
 * - Organic corners (never sharp)
 * - Soft shadows when elevated
 * - Lift animation when pressable
 * - Consistent with theme system
 * 
 * Philosophy: Simple, reusable foundation for UI cards
 * 
 * @example
 * ```tsx
 * import SanctuaryCard from './components/SanctuaryCard';
 * 
 * // Simple card with children
 * <SanctuaryCard>
 *   <Text>Card content</Text>
 * </SanctuaryCard>
 * 
 * // Card with title and footer
 * <SanctuaryCard 
 *   title="Morning Reflection"
 *   footer={<Button>Continue</Button>}
 * >
 *   <Text>Your journey begins...</Text>
 * </SanctuaryCard>
 * 
 * // Pressable card with lift animation
 * <SanctuaryCard 
 *   onPress={() => navigate('Details')}
 *   elevated={true}
 * >
 *   <Text>Tap to explore</Text>
 * </SanctuaryCard>
 * ```
 */

import React, { FC, ReactNode } from 'react';
import { View, Pressable, Text, StyleSheet, TextStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
import Theme from '../constants/Theme';
import { VStack } from '@gluestack-ui/themed';

// ============================================================================
// TYPES
// ============================================================================

interface SanctuaryCardProps {
    title?: string;
    children: ReactNode;
    footer?: ReactNode;
    onPress?: () => void;
    elevated?: boolean;
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
}) => {
    // Shared value for lift animation
    const scale = useSharedValue(LIFT_SCALE_NORMAL);

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
    // STYLES
    // ============================================================================

    const cardStyle = [
        styles.card,
        elevated && styles.elevated,
    ];

    // ============================================================================
    // RENDER CONTENT
    // ============================================================================

    const renderContent = () => (
        <View style={cardStyle}>
            {/* Title Section */}
            {title && (
                <Text style={styles.title}>{title}</Text>
            )}

            {/* Children Content */}
            <View style={{ gap: Theme.spacing.md }}>
                {/* @ts-ignore */}
                {children}
            </View>

            {/* Footer Section */}
            {footer && (
                <View style={styles.footerContainer}>
                    <View style={styles.footerBorder} />
                    {footer}
                </View>
            )}
        </View>
    );

    // ============================================================================
    // RENDER: Pressable vs Static
    // ============================================================================

    if (onPress) {
        return (
            <Animated.View style={animatedStyle}>
                <Pressable
                    onPress={onPress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                >
                    {renderContent()}
                </Pressable>
            </Animated.View>
        );
    }

    return renderContent();
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
    card: {
        backgroundColor: Theme.colors.midnightBlue,
        borderRadius: Theme.corners.generous,
        padding: Theme.spacing.lg,
    },
    elevated: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5, // Android shadow
    },
    title: {
        fontSize: Theme.typography.h3.fontSize,
        fontWeight: Theme.typography.h3.fontWeight as TextStyle['fontWeight'],
        letterSpacing: Theme.typography.h3.letterSpacing,
        lineHeight: Theme.typography.h3.lineHeight,
        color: Theme.colors.sacredWhite,
        marginBottom: Theme.spacing.md,
    },
    footerContainer: {
        marginTop: Theme.spacing.md,
    },
    footerBorder: {
        height: 1,
        backgroundColor: Theme.colors.dimGray,
        marginBottom: Theme.spacing.md,
        opacity: 0.3,
    },
});

export default SanctuaryCard;
