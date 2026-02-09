import React from 'react';
import { Button, ButtonText, ButtonSpinner, ButtonIcon } from '@gluestack-ui/themed';
import { Theme } from '../../constants/Theme';

interface SanctuaryButtonProps {
    onPress: () => void;
    children: string; // The text content
    variant?: 'solid' | 'outline' | 'ghost' | 'link';
    isLoading?: boolean;
    isDisabled?: boolean; // Using Gluestack's isDisabled prop name
    leftIcon?: React.ElementType;
    rightIcon?: React.ElementType;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    action?: 'primary' | 'secondary' | 'negative' | 'positive';
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
    action = 'primary'
}: SanctuaryButtonProps) {

    // Determine colors based on action and variant
    const getBgColor = () => {
        if (variant === 'outline' || variant === 'ghost' || variant === 'link') return 'transparent';

        switch (action) {
            case 'primary': return Theme.colors.sanctuarySaffron; // Gold
            case 'secondary': return Theme.colors.gurudeviBlue;   // Blue
            case 'negative': return Theme.colors.emberRed;
            case 'positive': return Theme.colors.sageGreen;
            default: return Theme.colors.sanctuarySaffron;
        }
    };

    const getTextColor = () => {
        // Solid buttons usually have light text
        if (variant === 'solid') {
            // Exception: If background is very light? No, our primary colors are dark/rich enough.
            return Theme.colors.sacredWhite;
        }

        switch (action) {
            case 'primary': return Theme.colors.sanctuarySaffron;
            case 'secondary': return Theme.colors.gurudeviBlue;
            case 'negative': return Theme.colors.emberRed;
            case 'positive': return Theme.colors.sageGreen;
            default: return Theme.colors.sanctuarySaffron;
        }
    };

    const getBorderColor = () => {
        if (variant !== 'outline') return 'transparent';

        switch (action) {
            case 'primary': return Theme.colors.sanctuarySaffron;
            case 'secondary': return Theme.colors.gurudeviBlue;
            case 'negative': return Theme.colors.emberRed;
            case 'positive': return Theme.colors.sageGreen;
            default: return Theme.colors.sanctuarySaffron;
        }
    };

    return (
        <Button
            size={size}
            variant={variant === 'ghost' ? 'link' : variant}
            action={action === 'negative' ? 'negative' : 'primary'} // Map to Gluestack actions somewhat
            isDisabled={isDisabled || isLoading}
            isFocusVisible={false}
            onPress={onPress}
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
                ...(variant === 'solid' && action === 'secondary' ? { backgroundColor: Theme.colors.gurudeviBlue } : {})
            }}
        >
            {isLoading ? (
                <ButtonSpinner color={getTextColor()} mr="$2" />
            ) : leftIcon ? (
                <ButtonIcon as={leftIcon} color={getTextColor()} mr="$2" />
            ) : null}

            <ButtonText
                fontWeight="$semibold"
                color={getTextColor()}
                sx={{ letterSpacing: 0.5 }}
            >
                {children}
            </ButtonText>

            {!isLoading && rightIcon && (
                <ButtonIcon as={rightIcon} color={getTextColor()} ml="$2" />
            )}
        </Button>
    );
}
