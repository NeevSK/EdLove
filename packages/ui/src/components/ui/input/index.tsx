import React from 'react';
import { View, TextInput, Pressable, type ViewProps, type TextInputProps, type PressableProps } from 'react-native';

export interface IInputProps extends ViewProps {
  className?: string;
  isDisabled?: boolean;
  isInvalid?: boolean;
}

const Input = React.forwardRef<View, IInputProps>(
  ({ className, isDisabled, isInvalid, ...props }, ref) => (
    <View 
      {...props} 
      ref={ref} 
      className={`flex-row items-center border rounded-xl px-3 min-h-[48px] bg-silk
        ${isInvalid ? 'border-emberRed' : 'border-linen'} 
        ${isDisabled ? 'opacity-50' : ''} 
        ${className || ''}`} 
    />
  )
);

Input.displayName = 'Input';

export const InputField = React.forwardRef<TextInput, TextInputProps & { className?: string; type?: 'text' | 'password' }>(
  ({ className, type, ...props }, ref) => (
    <TextInput
      {...props}
      ref={ref}
      secureTextEntry={type === 'password'}
      placeholderTextColor="#968E80" // mistGray
      className={`flex-1 text-inkTruth text-base py-2 ${className || ''}`}
    />
  )
);

InputField.displayName = 'InputField';

export const InputSlot = ({ className, children, ...props }: PressableProps & { className?: string; children?: React.ReactNode }) => (
  <Pressable {...props} className={`px-2 py-1 justify-center items-center ${className || ''}`}>
    {children}
  </Pressable>
);

export const InputIcon = ({ as: Icon, className, color, size, ...props }: any) => {
  if (!Icon) return null;
  return <Icon {...props} size={size || 20} color={color || '#544A3D'} className={className} />;
};

export { Input };
