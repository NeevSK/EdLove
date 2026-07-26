import { cssInterop } from 'react-native-css-interop';
import React from 'react';
import type { PressableProps, TextInput, TextInputProps, View, ViewProps } from 'react-native';
import {
  Pressable,
  TextInput as PrimitiveTextInput,
  View as PrimitiveView,
} from '@/primitives';
import { useFormControl } from '@/components-legacy/form-control';

cssInterop(PrimitiveView, { className: 'style' });
cssInterop(PrimitiveTextInput, { className: 'style' });
cssInterop(Pressable, { className: 'style' });

export interface IInputProps extends ViewProps {
  className?: string;
  isDisabled?: boolean;
  isInvalid?: boolean;
}

export const Input = React.forwardRef<View, IInputProps>(
  ({ className, isDisabled: isDisabledProp, isInvalid: isInvalidProp, ...props }, ref) => {
    const { isInvalid: isInvalidContext, isDisabled: isDisabledContext } = useFormControl();
    const isInvalid = isInvalidProp ?? isInvalidContext;
    const isDisabled = isDisabledProp ?? isDisabledContext;

    return (
      <PrimitiveView
        {...props}
        ref={ref}
        className={`flex-row items-center border rounded-lg px-3 min-h-[48px] 
          ${isInvalid ? 'border-error' : 'border-border'} 
          ${isDisabled ? 'opacity-50' : ''} 
          ${className || ''}`}
      />
    );
  },
);

export const InputField = React.forwardRef<
  TextInput,
  TextInputProps & { className?: string; type?: 'text' | 'password' }
>(({ className, type, ...props }, ref) => {
  const { isDisabled } = useFormControl();
  return (
    <PrimitiveTextInput
      {...props}
      ref={ref}
      editable={!isDisabled}
      secureTextEntry={type === 'password'}
      className={`flex-1 text-textMain text-base py-2 ${className || ''}`}
      placeholderTextColor="#9CA3AF" // tailwind gray-400
    />
  );
});

export const InputSlot = ({
  className,
  children,
  ...props
}: PressableProps & { className?: string; children?: React.ReactNode }) => (
  <Pressable {...props} className={`px-2 py-1 justify-center items-center ${className || ''}`}>
    {children}
  </Pressable>
);

export const InputIcon = ({ as: Icon, className, color, size, ...props }: any) => {
  if (!Icon) return null;
  return <Icon {...props} size={size || 20} color={color || '#6B7280'} className={className} />;
};

