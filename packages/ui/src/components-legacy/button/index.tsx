import React from 'react';
import { Pressable as RNPressable, Text as RNText, type PressableProps, type TextProps, View as BaseView, ScrollView as BaseScrollView } from 'react-native';
import { cssInterop } from 'nativewind';

const StyledPressable = RNPressable;
const StyledText = RNText;

cssInterop(StyledPressable, { className: 'style' });
cssInterop(StyledText, { className: 'style' });

export const View = BaseView as any;
export const ScrollView = BaseScrollView as any;
export const Pressable = RNPressable as any;

export interface IButtonProps extends PressableProps {
  className?: string;
  variant?: 'solid' | 'outline' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isDisabled?: boolean;
}

const Button = React.forwardRef<any, IButtonProps>(
  ({ className, variant = 'solid', size = 'md', isDisabled, ...props }, ref) => {
    return (
      <StyledPressable
        {...props}
        ref={ref}
        disabled={isDisabled}
        className={`flex-row items-center justify-center rounded-comfortable ${className || ''}`}
      />
    );
  }
);

export interface IButtonTextProps extends TextProps {
  className?: string;
}

const ButtonText = React.forwardRef<RNText, IButtonTextProps>(
  ({ className, ...props }, ref) => {
    return (
      <StyledText
        {...props}
        ref={ref}
        className={`font-medium text-inherit ${className || ''}`}
      />
    );
  }
);

Button.displayName = 'Button';
ButtonText.displayName = 'ButtonText';

export { Button, ButtonText };
