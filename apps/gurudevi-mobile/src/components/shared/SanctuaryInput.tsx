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
} from '@gluestack-ui/themed';
import { AlertCircle } from 'lucide-react-native';
import { Theme } from '../../constants/Theme';

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
    autoFocus = false
}: SanctuaryInputProps) {
    const hasError = isInvalid || !!error;

    return (
        <FormControl isInvalid={hasError} isDisabled={isDisabled}>
            {label && (
                <FormControlLabel mb="$2">
                    <FormControlLabelText
                        color={Theme.colors.pearlGray}
                        size="sm"
                        fontWeight="$medium"
                    >
                        {label}
                    </FormControlLabelText>
                </FormControlLabel>
            )}

            <Input
                variant="outline"
                size="md"
                isDisabled={isDisabled}
                isInvalid={hasError}
                sx={{
                    borderColor: hasError ? Theme.colors.emberRed : Theme.colors.deepIndigo,
                    backgroundColor: Theme.colors.midnightBlue,
                    borderRadius: Theme.corners.comfortable,
                    minHeight: multiline ? (24 * numberOfLines + 24) : 48,
                    paddingHorizontal: Theme.spacing.md,
                    ':focus': {
                        borderColor: Theme.colors.sanctuarySaffron,
                        borderWidth: 1,
                        backgroundColor: Theme.colors.deepIndigo
                    },
                    ':disabled': {
                        opacity: 0.5,
                        backgroundColor: Theme.colors.voidIndigo
                    }
                }}
            >
                {leftIcon && (
                    <InputSlot pl="$0" pr="$3">
                        <InputIcon as={leftIcon} color={Theme.colors.slateGray} />
                    </InputSlot>
                )}

                <InputField
                    placeholder={placeholder}
                    value={value}
                    onChangeText={onChangeText}
                    autoFocus={autoFocus}
                    type={type}
                    color={Theme.colors.sacredWhite}
                    placeholderTextColor={Theme.colors.slateGray}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                    textAlignVertical={multiline ? 'top' : 'center'}
                    sx={{
                        fontFamily: Theme.typography.fontFamily.english,
                        paddingVertical: multiline ? Theme.spacing.sm : 0,
                    }}
                />

                {rightIcon && (
                    <InputSlot pr="$0" pl="$3" onPress={onRightIconPress}>
                        <InputIcon as={rightIcon} color={Theme.colors.sanctuarySaffron} />
                    </InputSlot>
                )}
            </Input>

            {hasError && (
                <FormControlError mt="$1">
                    <FormControlErrorIcon as={AlertCircle} color={Theme.colors.emberRed} size="xs" />
                    <FormControlErrorText color={Theme.colors.emberRed} size="xs" ml="$1">
                        {error || 'Invalid input'}
                    </FormControlErrorText>
                </FormControlError>
            )}
        </FormControl>
    );
}
