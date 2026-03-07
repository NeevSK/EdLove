import React from 'react';
import { Button, ButtonText, ButtonSpinner, ButtonIcon } from '../gluestack';
import { Theme } from '../theme/Theme';
import { useTheme } from '../hooks/useTheme';

interface SanctuaryButtonProps {
    onPress: () => void;
    children: React.ReactNode; // The text or content
    variant?: 'solid' | 'outline' | 'ghost' | 'link';
    isLoading?: boolean;
    isDisabled?: boolean; // Using Gluestack's isDisabled prop name
    leftIcon?: React.ElementType;
    rightIcon?: React.ElementType;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    action?: 'primary' | 'secondary' | 'negative' | 'positive';
    accessibilityLabel?: string;
    accessibilityHint?: string;
}

export default function SanctuaryButton({
    onPress,
    children,
    variant = 'solid',
    isLoading = false,
    isDisabled = false,
    leftIcon,
    rightIcon,
    size = 'md',
    fullWidth = false,
    action = 'primary',
    accessibilityLabel,
    accessibilityHint
}: SanctuaryButtonProps) {
    const { accent, glass, textOnAccent, textOnReward } = useTheme();

    // Determine colors based on action and variant
    const getBgColor = () => {
        if (variant === 'outline' || variant === 'ghost' || variant === 'link') return 'transparent';

        switch (action) {
            case 'primary': return accent.action;
            case 'secondary': return glass.surface.bg;
            case 'negative': return accent.danger;
            case 'positive': return accent.reward;
            default: return accent.action;
        }
    };

    const getTextColor = () => {
        if (variant === 'solid') {
            // Use WCAG-computed adaptive text color — handles bright phases like
            // Temple Gold (#FDD925) that need dark ink text instead of sacredWhite.
            switch (action) {
                case 'primary':   return textOnAccent;
                case 'positive':  return textOnReward;
                case 'negative':  return Theme.colors.sacredWhite;
                case 'secondary': return accent.action;
                default:          return textOnAccent;
            }
        }

        switch (action) {
            case 'primary': return accent.action;
            case 'secondary': return accent.action;
            case 'negative': return accent.danger;
            case 'positive': return accent.reward;
            default: return accent.action;
        }
    };

    const getBorderColor = () => {
        if (variant !== 'outline') return 'transparent';

        switch (action) {
            case 'primary': return accent.action;
            case 'secondary': return accent.action;
            case 'negative': return accent.danger;
            case 'positive': return accent.reward;
            default: return accent.action;
        }
    };

    return (
        <Button
            {...({ size } as any)}
            variant={variant === 'ghost' ? 'link' : variant}
            action={action === 'negative' ? 'negative' : 'primary'} // Map to Gluestack actions somewhat
            isDisabled={isDisabled || isLoading}
            isFocusVisible={false}
            onPress={onPress}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel || (typeof children === 'string' ? children : undefined)}
            accessibilityHint={accessibilityHint}
            accessibilityState={{
                disabled: isDisabled || isLoading,
                busy: isLoading
            }}
            sx={{
                width: fullWidth ? '100%' : 'auto',
                backgroundColor: getBgColor(),
                borderColor: getBorderColor(),
                borderRadius: Theme.corners.comfortable,
                opacity: (isDisabled || isLoading) ? 0.6 : 1,
                ':active': {
                    opacity: 0.8,
                    transform: [{ scale: 0.98 }]
                },
                // Custom handling for 'secondary' styling that might conflict with Gluestack defaults
                ...(variant === 'solid' && action === 'secondary' ? { backgroundColor: glass.surface.bg } : {})
            }}
        >
            {isLoading ? (
                <ButtonSpinner color={getTextColor()} sx={{ marginRight: '$2' as any }} />
            ) : leftIcon ? (
                <ButtonIcon as={leftIcon} color={getTextColor()} sx={{ marginRight: '$2' as any }} />
            ) : null}

            <ButtonText
                color={getTextColor()}
                sx={{ fontWeight: '$semibold', letterSpacing: 0.5 }}
            >
                {children}
            </ButtonText>

            {!isLoading && rightIcon && (
                <ButtonIcon as={rightIcon} color={getTextColor()} sx={{ marginLeft: '$2' as any }} />
            )}
        </Button>
    );
}

