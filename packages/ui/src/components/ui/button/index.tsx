import React from 'react';
import { Pressable, Text, type PressableProps, type TextProps, View, ActivityIndicator } from 'react-native';
import { cssInterop } from 'nativewind';

cssInterop(Pressable, { className: 'style' });
cssInterop(Text, { className: 'style' });

export interface IButtonProps extends PressableProps {
  className?: string;
  variant?: 'solid' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isDisabled?: boolean;
}

const Button = React.forwardRef<View, IButtonProps>(
  ({ className, variant = 'solid', size = 'md', isDisabled, children, ...props }, ref) => {
    const baseStyle = 'flex-row items-center justify-center rounded-xl px-4 py-2';
    return (
      <Pressable
        {...props}
        ref={ref as any}
        disabled={isDisabled}
        className={`${baseStyle} ${isDisabled ? 'opacity-50' : ''} ${className || ''}`}
      >
        {children}
      </Pressable>
    );
  }
);

Button.displayName = 'Button';

export const ButtonText = React.forwardRef<Text, TextProps & { className?: string }>(
  ({ className, ...props }, ref) => (
    <Text
      {...props}
      ref={ref}
      className={`font-semibold text-center ${className || ''}`}
    />
  )
);

export const ButtonIcon = ({ as: Icon, className, size = 18, ...props }: any) => {
    if (!Icon) return null;
    return <Icon {...props} size={size} className={className} />;
};

export const ButtonSpinner = ({ className, color }: any) => (
    <ActivityIndicator color={color} className={className} />
);

ButtonText.displayName = 'ButtonText';

export { Button };
