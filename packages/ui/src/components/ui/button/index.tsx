import React from 'react';
import {
  Pressable,
  Text,
  type PressableProps,
  type TextProps,
  View,
  ActivityIndicator,
} from 'react-native';
import { cssInterop } from 'nativewind';

cssInterop(Pressable, { className: 'style' });
cssInterop(Text, { className: 'style' });

export interface IButtonProps extends PressableProps {
  className?: string;
  variant?: 'solid' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  action?: 'primary' | 'secondary' | 'positive' | 'negative' | 'default';
  isDisabled?: boolean;
}

const Button = React.forwardRef<View, IButtonProps>(
  (
    {
      className,
      variant = 'solid',
      action = 'primary',
      size = 'md',
      isDisabled,
      children,
      ...props
    },
    ref,
  ) => {
    const variants = {
      solid: {
        primary: 'bg-phase-accent active:opacity-90',
        secondary: 'bg-phase-interactive active:opacity-90',
        positive: 'bg-phase-reward active:opacity-90',
        negative: 'bg-phase-danger active:opacity-90',
        default: 'bg-phase-surface active:opacity-90',
      },
      outline: {
        primary: 'bg-transparent border border-phase-accent',
        secondary: 'bg-transparent border border-phase-interactive',
        positive: 'bg-transparent border border-phase-reward',
        negative: 'bg-transparent border border-phase-danger',
        default: 'bg-transparent border border-border',
      },
      ghost: {
        primary: 'bg-transparent active:bg-phase-accent/10',
        secondary: 'bg-transparent active:bg-phase-interactive/10',
        positive: 'bg-transparent active:bg-phase-reward/10',
        negative: 'bg-transparent active:bg-phase-danger/10',
        default: 'bg-transparent active:bg-phase-surface/10',
      },
    };

    const sizes = {
      sm: 'px-3 py-1.5',
      md: 'px-4 py-2',
      lg: 'px-6 py-3',
    };

    const baseStyle = 'flex-row items-center justify-center rounded-xl';
    const variantStyle = (variants[variant] as any)?.[action] || variants.solid.primary;
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
  },
);

Button.displayName = 'Button';

export const ButtonText = React.forwardRef<Text, TextProps & { className?: string }>(
  ({ className, ...props }, ref) => (
    <Text {...props} ref={ref} className={`font-semibold text-center ${className || ''}`} />
  ),
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
