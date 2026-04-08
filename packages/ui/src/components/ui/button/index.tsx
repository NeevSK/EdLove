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
    const variants = {
      solid: 'bg-phase-accent active:opacity-90',
      outline: 'bg-transparent border border-phase-accent',
      ghost: 'bg-transparent active:bg-phase-interactive/10',
    };
    const sizes = {
      sm: 'px-3 py-1.5',
      md: 'px-4 py-2',
      lg: 'px-6 py-3',
    };
    
    const baseStyle = 'flex-row items-center justify-center rounded-xl';
    const variantStyle = variants[variant] || variants.solid;
    const sizeStyle = sizes[size] || sizes.md;

    return (
      <Pressable
        {...props}
        ref={ref as any}
        disabled={isDisabled}
        className={`${baseStyle} ${variantStyle} ${sizeStyle} ${isDisabled ? 'opacity-40' : ''} ${className || ''}`}
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
