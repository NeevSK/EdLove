import React from 'react';
import {
    FormControl,
    FormControlLabel,
    FormControlLabelText,
    Input,
    InputField,
    FormControlError,
    FormControlErrorText,
    FormControlErrorIcon,
    Box,
    InputSlot,
    InputIcon
} from '../gluestack';
import { AlertCircle } from 'lucide-react-native';
import { Theme } from '../theme/Theme';
import { useThemedColors } from '../hooks/useThemedColors';

interface SanctuaryInputProps {
    label?: string;
    placeholder?: string;
    value: string;
    onChangeText: (text: string) => void;
    error?: string;
    isInvalid?: boolean;
    type?: 'text' | 'password';
    leftIcon?: React.ElementType;
    rightIcon?: React.ElementType;
    onRightIconPress?: () => void;
    helperText?: string;
    isDisabled?: boolean;
    multiline?: boolean;
    numberOfLines?: number;
    autoFocus?: boolean;
    accessibilityLabel?: string;
    accessibilityHint?: string;
}

export default function SanctuaryInput({
    label,
    placeholder,
    value,
    onChangeText,
    error,
    isInvalid = false,
    type = 'text',
    leftIcon,
    rightIcon,
    onRightIconPress,
    helperText,
    isDisabled = false,
    multiline = false,
    numberOfLines = 1,
    autoFocus = false,
    accessibilityLabel,
    accessibilityHint
}: SanctuaryInputProps) {
    const hasError = isInvalid || !!error;
    const colors = useThemedColors();

    return (
        <FormControl isInvalid={hasError} isDisabled={isDisabled}>
            {label && (
                <FormControlLabel sx={{ marginBottom: '$2' as any }}>
                    <FormControlLabelText
                        color={colors.textSecondary}
                        sx={{ fontSize: '$sm' as any, fontWeight: '$medium' }}
                    >
                        {label}
                    </FormControlLabelText>
                </FormControlLabel>
            )}

            <Input
                variant="outline"
                isDisabled={isDisabled}
                isInvalid={hasError}
                accessible={true}
                accessibilityLabel={accessibilityLabel || label}
                accessibilityHint={accessibilityHint}
                accessibilityRole="text"
                accessibilityState={{
                    disabled: isDisabled,
                    invalid: hasError
                }}
                {...({ size: 'md' } as any)}
                sx={{
                    borderColor: hasError ? colors.error : colors.border,
                    backgroundColor: colors.secondary,
                    borderRadius: Theme.corners.comfortable,
                    minHeight: multiline ? (24 * numberOfLines + 24) : 48,
                    paddingHorizontal: Theme.spacing.md,
                    borderWidth: 1,
                    ':focus': {
                        borderColor: colors.action,
                        borderWidth: 2,
                        backgroundColor: colors.tertiary
                    },
                    ':disabled': {
                        opacity: 0.5,
                        backgroundColor: colors.primary
                    }
                }}
            >
                {leftIcon && (
                    <InputSlot sx={{ paddingLeft: '$0' as any, paddingRight: '$3' as any }}>
                        <InputIcon as={leftIcon} color={Theme.colors.slateGray} />
                    </InputSlot>
                )}

                <InputField
                    placeholder={placeholder}
                    value={value}
                    onChangeText={onChangeText}
                    autoFocus={autoFocus}
                    type={type}
                    color={colors.text}
                    placeholderTextColor={colors.textTertiary}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                    textAlignVertical={multiline ? 'top' : 'center'}
                    sx={{
                        fontFamily: Theme.typography.fontFamily.english,
                        paddingVertical: multiline ? Theme.spacing.sm : 0,
                    }}
                />

                {rightIcon && (
                    <InputSlot sx={{ paddingRight: '$0' as any, paddingLeft: '$3' as any }} onPress={onRightIconPress}>
                        <InputIcon as={rightIcon} color={Theme.colors.sanctuarySaffron} />
                    </InputSlot>
                )}
            </Input>

            {hasError && (
                <FormControlError sx={{ marginTop: '$1' as any }}>
                    <FormControlErrorIcon as={AlertCircle} color={colors.error} {...({ size: 'xs' } as any)} />
                    <FormControlErrorText color={colors.error} sx={{ fontSize: '$xs' as any, marginLeft: '$1' as any }}>
                        {error || 'Invalid input'}
                    </FormControlErrorText>
                </FormControlError>
            )}
        </FormControl>
    );
}
