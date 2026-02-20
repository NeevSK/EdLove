/**
 * SANCTUARY CARD - Reusable Card Component
 *
 * A versatile card component following sanctuary design principles:
 * - Organic corners (never sharp)
 * - Soft shadows when elevated
 * - Lift animation when pressable (bypassed for reduced-motion preference)
 * - WCAG 2.2 Level AA compliant accessibility props
 *
 * Philosophy: Simple, reusable foundation for UI cards
 */

import React, { FC, ReactNode } from 'react';
import { View, Pressable, Text, StyleSheet, TextStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
import { Theme } from '@repo/ui';
import { VStack } from '@gluestack-ui/themed';
import { useAccessibility } from '../hooks/useAccessibility';

interface SanctuaryCardProps {
    title?: string;
    children: ReactNode;
    footer?: ReactNode;
    onPress?: () => void;
    elevated?: boolean;
    accessibilityLabel?: string;
}

const LIFT_SCALE_NORMAL = 1.0;
const LIFT_SCALE_PRESSED = 1.02;

const SanctuaryCard: FC<SanctuaryCardProps> = ({
    title,
    children,
    footer,
    onPress,
    elevated = false,
    accessibilityLabel,
}) => {
    const { isReduceMotionEnabled } = useAccessibility();
    const scale = useSharedValue(LIFT_SCALE_NORMAL);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        if (onPress && !isReduceMotionEnabled) {
            scale.value = withSpring(LIFT_SCALE_PRESSED, {
                damping: 15,
                stiffness: 150,
            });
        }
    };

    const handlePressOut = () => {
        if (onPress && !isReduceMotionEnabled) {
            scale.value = withSpring(LIFT_SCALE_NORMAL, {
                damping: 15,
                stiffness: 150,
            });
        }
    };

    const cardStyle = [styles.card, elevated && styles.elevated];

    const renderContent = () => (
        <View style={cardStyle}>
            {title && <Text style={styles.title}>{title}</Text>}
            <VStack space="md">{children}</VStack>
            {footer && (
                <View style={styles.footerContainer}>
                    <View style={styles.footerBorder} />
                    {footer}
                </View>
            )}
        </View>
    );

    if (onPress) {
        return (
            <Animated.View style={animatedStyle}>
                <Pressable
                    onPress={onPress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={accessibilityLabel ?? title}
                >
                    {renderContent()}
                </Pressable>
            </Animated.View>
        );
    }

    return (
        <View
            accessible={true}
            accessibilityRole="none"
            accessibilityLabel={accessibilityLabel ?? title}
        >
            {renderContent()}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: Theme.colors.midnightBlue,
        borderRadius: Theme.corners.generous,
        padding: Theme.spacing.lg,
    },
    elevated: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
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
