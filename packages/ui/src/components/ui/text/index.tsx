import { styled } from 'nativewind';
import { cn } from '@repo/ui/utils/classNames';
import React from 'react';
import { Text as RNText, type StyleProp, type TextProps, type TextStyle } from 'react-native';

// Standard primitive: use the NativeWind v5 adapter directly. The wrappers
// preserve Gurudevi's size/default-token API at the facade boundary.
const StyledText = styled(RNText);

export const Text = React.forwardRef<
  RNText,
  TextProps & { className?: string; size?: string; sx?: StyleProp<TextStyle> }
>(({ className, size, sx, style, children, allowFontScaling = true, ...props }, ref) => {
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

  return (
    <StyledText
      {...props}
      ref={ref}
      allowFontScaling={allowFontScaling}
      className={cn('text-phase-text-primary', sizeMap[size ?? ''] ?? 'text-base', className)}
      style={[sx, style]}
    >
      {children}
    </StyledText>
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
>(({ className, size = 'lg', sx, style, children, allowFontScaling = true, ...props }, ref) => {
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

  return (
    <StyledText
      {...props}
      ref={ref}
      allowFontScaling={allowFontScaling}
      className={cn('font-bold text-phase-text-primary', sizeMap[size], className)}
      style={[sx, style]}
    >
      {children}
    </StyledText>
  );
});
Heading.displayName = 'Heading';
