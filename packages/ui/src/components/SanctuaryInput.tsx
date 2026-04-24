import React from 'react';
import { AlertCircle } from 'lucide-react-native';
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorText,
  FormControlErrorIcon,
  Input,
  InputField,
  InputSlot,
  InputIcon,
  HStack,
  Text,
  useFormControlContext,
} from './ui';
import { Theme } from '../theme/Theme';

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
  autoFocus?: boolean;
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
  autoFocus = false,
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
          autoFocus={autoFocus}
          secureTextEntry={type === 'password'}
          keyboardType={keyboardType as any}
          className="text-phase-text-primary px-3 text-base"
          multiline={multiline}
          numberOfLines={numberOfLines}
          accessibilityLabel={accessibilityLabel || label}
          accessibilityHint={accessibilityHint}
          accessibilityLabelledBy={id ? `${id}-label` : undefined}
          accessibilityDescribedBy={hasError && id ? `${id}-error` : undefined}
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
          <FormControlErrorIcon as={AlertCircle} className="text-phase-danger" />
          <FormControlErrorText className="text-phase-danger text-sm">
            {error || 'Invalid input'}
          </FormControlErrorText>
        </FormControlError>
      )}
    </FormControl>
  );
}
