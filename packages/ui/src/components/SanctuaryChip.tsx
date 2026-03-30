import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Theme } from '../theme/Theme';
import { useTheme } from '../hooks/useTheme';

export interface SanctuaryChipProps {
    label: string;
    selected?: boolean;
    onPress?: () => void;
    variant?: 'filter' | 'tag' | 'category';
    size?: 'sm' | 'md';
}

/**
 * SanctuaryChip - canonical chip/pill component for filters, tags, and categories.
 * Uses the scene token hierarchy so the chip always resolves against the
 * current interactive layer rather than hardcoded glass colors.
 */
export const SanctuaryChip: React.FC<SanctuaryChipProps> = ({
    label,
    selected = false,
    onPress,
    variant = 'filter',
    size = 'md',
}) => {
    const { accent, scene, text } = useTheme();
    const isSmall = size === 'sm';

    return (
        <TouchableOpacity>
            onPress={onPress}
            style={[
                styles.chip,
                {
                    borderColor: selected ? accent.action : scene.interactive.border,
                    backgroundColor: selected ? accent.action : scene.interactive.bg,
                },
                isSmall && styles.small,
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            activeOpacity={0.75}
        
            <Text>
                style={[
                    styles.label,
                    {
                        color: selected ? text.onAccent : text.onInteractive,
                        fontWeight: selected ? '700' : '500',
                    },
                    isSmall && styles.smallLabel,
                ]}
                numberOfLines={1}
            
                {variant === 'tag' ? `#${label}` : label}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    chip: {
        paddingHorizontal: Theme.spacing.md,
        paddingVertical: Theme.spacing.xs,
        borderRadius: Theme.corners.full,
        borderWidth: 1,
        marginRight: Theme.spacing.sm,
    },
    small: {
        paddingHorizontal: Theme.spacing.sm,
        paddingVertical: 2,
    },
    label: {
        fontSize: Theme.typography.fontSize.sm,
    },
    smallLabel: {
        fontSize: Theme.typography.fontSize.xs,
    },
});
