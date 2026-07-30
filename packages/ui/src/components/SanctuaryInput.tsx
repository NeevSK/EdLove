import { CircleAlert } from '@repo/ui/icons';
import type React from 'react';
import { Theme } from '@repo/ui/theme/Theme';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
  HStack,
  Input,
  InputField,
  InputIcon,
  InputSlot,
  Text,
  useFormControlContext,
} from '@repo/ui/components/ui';

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
  keyboardType?:
    | 'default'
    | 'number-pad'
    | 'decimal-pad'
    | 'numeric'
    | 'email-address'
    | 'phone-pad';
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

/**
 * SanctuaryInput
 *
 * A hardened, phase-aware input component.
 * Uses NativeWind for styling and hardened gluestack primitives.
 */
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
  keyboardType = 'default',
  accessibilityLabel,
  accessibilityHint,
}: SanctuaryInputProps) {
  const { id } = useFormControlContext();
  const hasError = isInvalid || !!error;

  return (
    <FormControl isInvalid={hasError} isDisabled={isDisabled} className="w-full">
      {label && (
        <FormControlLabel className="mb-2">
          <HStack className="justify-between items-center w-full">
            <FormControlLabelText className="text-phase-text-primary font-medium tracking-wide">
              {label}
            </FormControlLabelText>
            {helperText && !hasError && (
              <Text className="text-[10px] text-phase-text-secondary uppercase tracking-widest font-bold">
                {helperText}
              </Text>
            )}
          </HStack>
        </FormControlLabel>
      )}

      <Input
        isDisabled={isDisabled}
        isInvalid={hasError}
        className="bg-phase-surface border-phase-surface focus:border-phase-accent h-12 rounded-xl"
      >
        {leftIcon && (
          <InputSlot className="pl-3">
            <InputIcon as={leftIcon} className="text-phase-text-secondary" />
          </InputSlot>
        )}

        <InputField
          placeholder={placeholder}
          placeholderTextColor={Theme.colors.shadowViolet}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={type === 'password'}
          keyboardType={
            keyboardType as
              | 'default'
              | 'number-pad'
              | 'decimal-pad'
              | 'numeric'
              | 'email-address'
              | 'phone-pad'
          }
          className="text-phase-text-primary px-3 text-base"
          multiline={multiline}
          numberOfLines={numberOfLines}
          accessibilityLabel={accessibilityLabel || label}
          accessibilityHint={accessibilityHint}
          aria-labelledby={id ? `${id}-label` : undefined}
          aria-describedby={hasError && id ? `${id}-error` : undefined}
        />

        {rightIcon && (
          <InputSlot onPress={onRightIconPress} className="pr-3">
            <InputIcon
              as={rightIcon}
              className="text-phase-text-secondary active:text-phase-accent"
            />
          </InputSlot>
        )}
      </Input>

      {hasError && (
        <FormControlError className="mt-2">
          <FormControlErrorIcon as={CircleAlert} className="text-phase-danger" />
          <FormControlErrorText className="text-phase-danger text-sm">
            {error || 'Invalid input'}
          </FormControlErrorText>
        </FormControlError>
      )}
    </FormControl>
  );
}
