import { cssInterop } from 'react-native-css-interop';
import React from 'react';
import { TextInput, type TextInputProps, View, type ViewProps } from 'react-native';

cssInterop(View, { className: 'style' });
cssInterop(TextInput, { className: 'style' });

export interface ITextareaProps extends ViewProps {
  className?: string;
  isDisabled?: boolean;
  isInvalid?: boolean;
  isReadOnly?: boolean;
}

const Textarea = React.forwardRef<View, ITextareaProps>(
  ({ className, isDisabled, isInvalid, isReadOnly, children, ...props }, ref) => {
    return (
      <View
        {...props}
        ref={ref}
        className={`w-full border rounded-xl bg-phase-canvas border-phase-interactive/10 ${isInvalid ? 'border-phase-danger' : ''} ${isDisabled ? 'opacity-40' : ''} ${className || ''}`}
      >
        {children}
      </View>
    );
  },
);

export const TextareaInput = React.forwardRef<TextInput, TextInputProps & { className?: string }>(
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

