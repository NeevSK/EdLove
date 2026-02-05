/**
 * ERROR MESSAGE - Reusable Error/Warning/Info Message Component
 * 
 * A themed message component that supports:
 * - Three severity types: gentle, warning, severe
 * - Appropriate icons and colors for each type
 * - Optional dismiss functionality
 * - Horizontal layout with icon, message, and dismiss button
 * 
 * Philosophy: Clear, accessible feedback that matches sanctuary aesthetic
 * 
 * @example
 * ```tsx
 * import ErrorMessage from './components/ErrorMessage';
 * 
 * // Gentle info message
 * <ErrorMessage 
 *   message="Your progress has been saved" 
 *   type="gentle"
 * />
 * 
 * // Warning message with dismiss
 * <ErrorMessage 
 *   message="Please review your entries" 
 *   type="warning"
 *   onDismiss={() => console.log('dismissed')}
 * />
 * 
 * // Severe error message
 * <ErrorMessage 
 *   message="Connection failed. Please try again." 
 *   type="severe"
 * />
 * ```
 */

import React, { FC } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { HStack } from '@gluestack-ui/themed';
import { Info, AlertTriangle, AlertCircle, X } from 'lucide-react-native';
import Theme from '../../constants/Theme';

// ============================================================================
// TYPES
// ============================================================================

interface ErrorMessageProps {
    message: string;
    type?: 'gentle' | 'warning' | 'severe';
    onDismiss?: () => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ErrorMessage: FC<ErrorMessageProps> = ({
    message,
    type = 'gentle',
    onDismiss,
}) => {
    // ============================================================================
    // TYPE-SPECIFIC CONFIGURATION
    // ============================================================================

    const getTypeConfig = () => {
        switch (type) {
            case 'gentle':
                return {
                    backgroundColor: Theme.colors.deepIndigo,
                    textColor: Theme.colors.sacredWhite,
                    Icon: Info,
                };
            case 'warning':
                return {
                    backgroundColor: `${Theme.colors.amberGlow}33`, // 20% opacity (33 in hex = 51/255)
                    textColor: Theme.colors.amberGlow,
                    Icon: AlertTriangle,
                };
            case 'severe':
                return {
                    backgroundColor: `${Theme.colors.emberRed}33`, // 20% opacity (33 in hex = 51/255)
                    textColor: Theme.colors.emberRed,
                    Icon: AlertCircle,
                };
        }
    };

    const { backgroundColor, textColor, Icon } = getTypeConfig();

    // ============================================================================
    // RENDER
    // ============================================================================

    return (
        <View style={[styles.container, { backgroundColor }]}>
            <HStack space="md" style={styles.hstack}>
                {/* Icon */}
                <Icon color={textColor} size={20} />

                {/* Message Text */}
                <Text style={[styles.message, { color: textColor }]}>
                    {message}
                </Text>

                {/* Dismiss Button (X) */}
                {onDismiss && (
                    <Pressable onPress={onDismiss} style={styles.dismissButton}>
                        <X color={textColor} size={20} />
                    </Pressable>
                )}
            </HStack>
        </View>
    );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
    container: {
        padding: Theme.spacing.md,
        borderRadius: Theme.corners.comfortable,
        marginBottom: Theme.spacing.md,
    },
    hstack: {
        alignItems: 'center',
    },
    message: {
        flex: 1,
        fontSize: Theme.typography.fontSize.md,
        lineHeight: Theme.typography.lineHeight.relaxed * Theme.typography.fontSize.md,
    },
    dismissButton: {
        padding: Theme.spacing.xs,
    },
});

export default ErrorMessage;
