/**
 * LOTUS BUTTON - Reusable Button Component
 * 
 * A themed button component that supports:
 * - Three variants: primary, secondary, ghost
 * - Three sizes: sm, md, lg
 * - Loading state with ActivityIndicator
 * - Disabled state with reduced opacity
 * - Haptic feedback on press
 * - Optional icon support
 * 
 * Philosophy: Consistent, accessible buttons that match sanctuary aesthetic
 * 
 * @example
 * ```tsx
 * import LotusButton from './components/LotusButton';
 * 
 * function MyScreen() {
 *   const handlePress = () => {
 *     console.log('Button pressed!');
 *   };
 * 
 *   return (
 *     <LotusButton
 *       title="Submit"
 *       onPress={handlePress}
 *       variant="primary"
 *       size="md"
 *     />
 *   );
 * }
 * ```
 */

import React, { FC } from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import Theme from '../constants/Theme';
import { hapticLight } from '../utils/haptics';

// ============================================================================
// TYPES
// ============================================================================

interface LotusButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    disabled?: boolean;
    icon?: React.ReactNode;
}

// ============================================================================
// SIZE CONFIGURATIONS
// ============================================================================

const SIZE_CONFIG = {
    sm: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        fontSize: 14,
    },
    md: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        fontSize: 16,
    },
    lg: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        fontSize: 18,
    },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const LotusButton: FC<LotusButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    icon,
}) => {
    const sizeConfig = SIZE_CONFIG[size];
    const isDisabled = disabled || loading;

    const handlePress = () => {
        if (!isDisabled) {
            hapticLight();
            onPress();
        }
    };

    return (
        <Pressable
            onPress={handlePress}
            disabled={isDisabled}
            style={({ pressed }) => [
                styles.button,
                styles[`button_${variant}`],
                {
                    paddingVertical: sizeConfig.paddingVertical,
                    paddingHorizontal: sizeConfig.paddingHorizontal,
                    opacity: isDisabled ? 0.5 : pressed ? 0.8 : 1,
                },
            ]}
        >
            <View style={styles.content}>
                {loading ? (
                    <ActivityIndicator
                        size="small"
                        color={
                            variant === 'primary'
                                ? Theme.colors.sacredWhite
                                : variant === 'secondary'
                                    ? Theme.colors.sanctuarySaffron
                                    : Theme.colors.dimGray
                        }
                    />
                ) : (
                    <>
                        {icon && <View style={styles.iconContainer}>{icon as any}</View>}
                        <Text
                            style={[
                                styles.text,
                                styles[`text_${variant}`],
                                { fontSize: sizeConfig.fontSize },
                            ]}
                        >
                            {title}
                        </Text>
                    </>
                )}
            </View>
        </Pressable>
    );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
    button: {
        borderRadius: Theme.corners.comfortable,
        alignItems: 'center',
        justifyContent: 'center',
    },
    button_primary: {
        backgroundColor: Theme.colors.sanctuarySaffron,
    },
    button_secondary: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: Theme.colors.sanctuarySaffron,
    },
    button_ghost: {
        backgroundColor: 'transparent',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        marginRight: Theme.spacing.sm,
    },
    text: {
        fontWeight: Theme.typography.fontWeight.semibold,
    },
    text_primary: {
        color: Theme.colors.sacredWhite,
    },
    text_secondary: {
        color: Theme.colors.sanctuarySaffron,
    },
    text_ghost: {
        color: Theme.colors.dimGray,
    },
});

export default LotusButton;
