import { Pressable } from '@repo/ui/components/ui/pressable';
import { Spinner } from '@repo/ui/components/ui/spinner';
import { Text } from '@repo/ui/components/ui/text';
import { View as StyledView } from '@repo/ui/components/ui/view';
import { cn } from '@repo/ui/utils/classNames';
import { type HapticImpact, hapticImpact } from '@repo/ui/utils/haptics';
import React, { createContext, useContext, useMemo } from 'react';
import {
  type PressableProps,
  Text as RNText,
  type StyleProp,
  type TextProps,
  View,
  type ViewStyle,
} from 'react-native';

interface ButtonContextType {
  variant?: 'solid' | 'outline' | 'ghost';
  action?: 'primary' | 'secondary' | 'positive' | 'negative' | 'default';
  size?: 'sm' | 'md' | 'lg';
  isDisabled?: boolean;
}

const ButtonContext = createContext<ButtonContextType | undefined>(undefined);

function useButton() {
  const context = useContext(ButtonContext);
  if (!context) throw new Error('useButton must be used within a Button component');
  return context;
}

export interface IButtonProps extends PressableProps {
  className?: string;
  variant?: 'solid' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  action?: 'primary' | 'secondary' | 'positive' | 'negative' | 'default';
  isDisabled?: boolean;
  isLoading?: boolean;
  haptic?: HapticImpact | false;
  sx?: StyleProp<ViewStyle>;
}

const Button = React.forwardRef<View, IButtonProps>(
  (
    {
      className,
      variant = 'solid',
      action = 'primary',
      size = 'md',
      isDisabled,
      isLoading,
      disabled,
      sx,
      haptic = 'light',
      onPressIn,
      children,
      onPress,
      style,
      ...props
    },
    ref,
  ) => {
    const resolvedDisabled = disabled || isDisabled || isLoading;
    const contextValue = useMemo(
      () => ({ variant, action, size, isDisabled: resolvedDisabled }),
      [variant, action, size, resolvedDisabled],
    );

    const variants = {
      solid: {
        primary: 'bg-phase-accent border border-phase-accent active:opacity-90 shadow-sm',
        secondary:
          'bg-phase-interactive border border-phase-interactive/30 active:opacity-90 shadow-sm',
        positive: 'bg-phase-reward border border-phase-reward active:opacity-90 shadow-sm',
        negative: 'bg-phase-danger border border-phase-danger active:opacity-90 shadow-sm',
        default: 'bg-phase-surface border border-phase-interactive/20 active:opacity-90 shadow-sm',
      },
      outline: {
        primary: 'bg-transparent border-2 border-phase-accent active:bg-phase-accent/10',
        secondary:
          'bg-transparent border-2 border-phase-interactive/40 active:bg-phase-interactive/10',
        positive: 'bg-transparent border-2 border-phase-reward active:bg-phase-reward/10',
        negative: 'bg-transparent border-2 border-phase-danger active:bg-phase-danger/10',
        default:
          'bg-transparent border-2 border-phase-interactive/30 active:bg-phase-interactive/10',
      },
      ghost: {
        primary: 'bg-transparent active:bg-phase-accent/10',
        secondary: 'bg-transparent active:bg-phase-interactive/10',
        positive: 'bg-transparent active:bg-phase-reward/10',
        negative: 'bg-transparent active:bg-phase-danger/10',
        default: 'bg-transparent active:bg-phase-surface/10',
      },
    };
    const sizes = { sm: 'px-3 h-9', md: 'px-4 h-12', lg: 'px-6 h-14' };
    const baseStyle = 'flex-row items-center justify-center rounded-xl transition-all duration-200';
    const variantStyle = variants[variant][action];
    const sizeStyle = sizes[size];

    return (
      <ButtonContext.Provider value={contextValue}>
        <Pressable
          {...props}
          ref={ref as any}
          disabled={resolvedDisabled}
          onPressIn={(event) => {
            if (haptic !== false) hapticImpact(haptic);
            onPressIn?.(event);
          }}
          onPress={onPress}
          accessibilityRole="button"
          accessibilityState={{ disabled: !!resolvedDisabled, busy: !!isLoading }}
          className={cn(
            baseStyle,
            variantStyle,
            sizeStyle,
            resolvedDisabled ? 'opacity-40' : undefined,
            className,
          )}
          style={typeof style === 'function' ? (state) => [sx, style(state)] : [sx, style]}
        >
          {isLoading ? (
            <ButtonSpinner color={variant === 'solid' ? '#FFFFFF' : undefined} />
          ) : (
            children
          )}
        </Pressable>
      </ButtonContext.Provider>
    );
  },
);

Button.displayName = 'Button';

export const ButtonText = React.forwardRef<RNText, TextProps & { className?: string }>(
  ({ className, children, ...props }, ref) => {
    const { variant, action } = useButton();
    const textColors = {
      solid: {
        primary: 'text-phase-text-on-accent',
        secondary: 'text-phase-text-primary',
        positive: 'text-phase-text-on-accent',
        negative: 'text-white',
        default: 'text-phase-text-primary',
      },
      outline: {
        primary: 'text-phase-accent',
        secondary: 'text-phase-text-primary',
        positive: 'text-phase-reward',
        negative: 'text-phase-danger',
        default: 'text-phase-text-primary',
      },
      ghost: {
        primary: 'text-phase-accent',
        secondary: 'text-phase-text-primary',
        positive: 'text-phase-reward',
        negative: 'text-phase-danger',
        default: 'text-phase-text-primary',
      },
    };
    const colorStyle = textColors[variant!][action!];
    return (
      <Text
        {...props}
        ref={ref}
        className={cn('font-bold text-center tracking-tight', colorStyle, className)}
      >
        {children}
      </Text>
    );
  },
);

interface ButtonIconProps {
  as?: React.ComponentType<{
    size?: number;
    className?: string;
    testID?: string;
    accessibilityLabel?: string;
  }>;
  className?: string;
  size?: number;
  testID?: string;
  accessibilityLabel?: string;
}

export const ButtonIcon = ({ as: Icon, className, size, ...props }: ButtonIconProps) => {
  const { variant, size: buttonSize } = useButton();
  if (!Icon) return null;
  const defaultSize = buttonSize === 'sm' ? 16 : buttonSize === 'lg' ? 22 : 18;
  return (
    <StyledView className="mx-1" testID={props.testID}>
      <Icon
        {...props}
        size={size || defaultSize}
        className={cn(variant === 'solid' ? 'text-phase-text-on-accent' : undefined, className)}
      />
    </StyledView>
  );
};

export interface ButtonSpinnerProps {
  className?: string;
  color?: string;
}

export const ButtonSpinner = ({ className, color }: ButtonSpinnerProps) => {
  const { action } = useButton();
  const defaultColor = action === 'primary' ? '#FFFFFF' : '#8B8599';
  return <Spinner color={color || defaultColor} className={className} />;
};

ButtonText.displayName = 'ButtonText';
ButtonIcon.displayName = 'ButtonIcon';
ButtonSpinner.displayName = 'ButtonSpinner';

export { Button };
