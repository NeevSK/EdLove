import React from 'react';
import { type TextInputProps, type ViewProps } from 'react-native';
import { TextInput } from '@repo/ui/components/ui/text-input';
import { View } from '@repo/ui/components/ui/view';

export interface ITextareaProps extends ViewProps {
  className?: string;
  isDisabled?: boolean;
  isInvalid?: boolean;
  isReadOnly?: boolean;
}

const Textarea = React.forwardRef<any, ITextareaProps>(
  ({ className, isDisabled, isInvalid, isReadOnly, children, ...props }, ref) => (
    <View
      {...props}
      ref={ref}
      className={`w-full border rounded-xl bg-phase-canvas border-phase-interactive/10 ${isInvalid ? 'border-phase-danger' : ''} ${isDisabled ? 'opacity-40' : ''} ${className || ''}`}
    >
      {children}
    </View>
  ),
);

export const TextareaInput = React.forwardRef<any, TextInputProps & { className?: string }>(
  ({ className, ...props }, ref) => (
    <TextInput
      {...props}
      ref={ref}
      multiline
      textAlignVertical="top"
      className={`p-4 text-phaseText-primary text-base min-h-[100px] ${className || ''}`}
      placeholderTextColor="var(--phase-text-secondary)"
    />
  ),
);

Textarea.displayName = 'Textarea';
TextareaInput.displayName = 'TextareaInput';

export { Textarea };
