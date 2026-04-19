import React from 'react';
import { Text as RNText, type TextProps } from 'react-native';
import { cssInterop } from 'nativewind';

cssInterop(RNText, { className: 'style' });

export const Text = React.forwardRef<RNText, TextProps & { className?: string; size?: string }>(
  ({ className, size, ...props }, ref) => {
    const Component = RNText as any;
    return (
      <Component {...props} ref={ref} className={`text-phase-text-primary ${size ? `text-${size}` : 'text-base'} ${className || ''}`} />
    );
  }
);
Text.displayName = 'Text';

export const Heading = React.forwardRef<RNText, TextProps & { className?: string; size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' }>(
  ({ className, size = 'lg', ...props }, ref) => {
    const sizeMap: Record<string, string> = {
      'xs': 'text-xs',
      'sm': 'text-sm',
      'md': 'text-base',
      'lg': 'text-lg',
      'xl': 'text-xl',
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
      />
    );
  }
);
Heading.displayName = 'Heading';
