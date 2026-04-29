import { cssInterop } from 'nativewind';
import React from 'react';
import { Text as RNText, type StyleProp, type TextProps, type TextStyle } from 'react-native';

cssInterop(RNText, { className: 'style' });

export const Text = React.forwardRef<
  RNText,
  TextProps & { className?: string; size?: string; sx?: StyleProp<TextStyle> }
>(({ className, size, sx, style, ...props }, ref) => {
    const Component = RNText as any;
    return (
      <Component
        {...props}
        ref={ref}
        className={`text-phase-text-primary ${size ? `text-${size}` : 'text-base'} ${className || ''}`}
        style={[sx, style]}
      />
    );
  });
Text.displayName = 'Text';

export const Heading = React.forwardRef<
  RNText,
  TextProps & {
    className?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
    sx?: StyleProp<TextStyle>;
  }
>(({ className, size = 'lg', sx, style, ...props }, ref) => {
  const sizeMap: Record<string, string> = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
    '5xl': 'text-5xl',
  };
  const Component = RNText as any;
  return (
    <Component
      {...props}
      ref={ref}
      className={`font-bold text-phase-text-primary ${sizeMap[size]} ${className || ''}`}
      style={[sx, style]}
    />
  );
});
Heading.displayName = 'Heading';
