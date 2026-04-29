import { cssInterop } from 'nativewind';
import React, { createContext, useContext, useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  type StyleProp,
  Text,
  type TextProps,
  View,
  type ViewStyle,
} from 'react-native';

cssInterop(Pressable, { className: 'style' });
cssInterop(Text, { className: 'style' });

// --- Context ---
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

// --- Components ---

export interface IButtonProps extends PressableProps {
  className?: string;
  variant?: 'solid' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  action?: 'primary' | 'secondary' | 'positive' | 'negative' | 'default';
  isDisabled?: boolean;
  isLoading?: boolean;
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
      sx,
      children,
      onPress,
      style,
      ...props
    },
    ref,
  ) => {
    const contextValue = useMemo(
      () => ({
        variant,
        action,
        size,
        isDisabled: isDisabled || isLoading,
      }),
      [variant, action, size, isDisabled, isLoading],
    );

    const variants = {
      solid: {
        primary: 'bg-phase-accent active:bg-phase-accent/90',
        secondary: 'bg-phase-interactive active:bg-phase-interactive/90',
        positive: 'bg-phase-reward active:bg-phase-reward/90',
        negative: 'bg-phase-danger active:bg-phase-danger/90',
        default: 'bg-phase-surface active:bg-phase-surface/90',
      },
      outline: {
        primary: 'bg-transparent border border-phase-accent active:bg-phase-accent/5',
        secondary: 'bg-transparent border border-phase-interactive active:bg-phase-interactive/5',
        positive: 'bg-transparent border border-phase-reward active:bg-phase-reward/5',
        negative: 'bg-transparent border border-phase-danger active:bg-phase-danger/5',
        default: 'bg-transparent border border-phase-interactive/20 active:bg-phase-interactive/5',
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
      sm: 'px-3 h-9',
      md: 'px-4 h-12',
      lg: 'px-6 h-14',
    };

    const baseStyle = 'flex-row items-center justify-center rounded-xl transition-all duration-200';
    const variantStyle = (variants[variant] as any)?.[action] || variants.solid.primary;
    const sizeStyle = sizes[size] || sizes.md;

    return (
      <ButtonContext.Provider value={contextValue}>
        <Pressable
          {...props}
          ref={ref as any}
          disabled={isDisabled || isLoading}
          onPress={onPress}
          accessibilityRole="button"
          accessibilityState={{
            disabled: !!(isDisabled || isLoading),
            busy: !!isLoading,
          }}
          className={`${baseStyle} ${variantStyle} ${sizeStyle} ${isDisabled || isLoading ? 'opacity-40' : ''} ${className || ''}`}
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

export const ButtonText = React.forwardRef<Text, TextProps & { className?: string }>(
  ({ className, children, ...props }, ref) => {
    const { variant, action } = useButton();

    const textColors = {
      solid: 'text-white',
      outline: {
        primary: 'text-phase-accent',
        secondary: 'text-phase-interactive',
        positive: 'text-phase-reward',
        negative: 'text-phase-danger',
        default: 'text-phase-text-primary',
      },
      ghost: {
        primary: 'text-phase-accent',
        secondary: 'text-phase-interactive',
        positive: 'text-phase-reward',
        negative: 'text-phase-danger',
        default: 'text-phase-text-primary',
      },
    };

    const colorStyle =
      variant === 'solid'
        ? textColors.solid
        : (textColors[variant!] as any)?.[action!] || 'text-phase-text-primary';

    return (
      <Text
        {...props}
        ref={ref}
        className={`font-bold text-center tracking-tight ${colorStyle} ${className || ''}`}
      >
        {children}
      </Text>
    );
  },
);

export const ButtonIcon = ({ as: Icon, className, size, ...props }: any) => {
  const { variant, action, size: buttonSize } = useButton();
  if (!Icon) return null;

  const _iconColors = {
    solid: '#FFFFFF',
    outline: {
      primary: 'var(--phase-accent)',
      secondary: 'var(--phase-interactive)',
      positive: 'var(--phase-reward)',
      negative: 'var(--phase-danger)',
      default: 'var(--phase-text-secondary)',
    },
  };

  const defaultSize = buttonSize === 'sm' ? 16 : buttonSize === 'lg' ? 22 : 18;

  return (
    <View className="mx-1">
      <Icon
        {...props}
        size={size || defaultSize}
        className={`${variant === 'solid' ? 'text-white' : ''} ${className || ''}`}
      />
    </View>
  );
};

export const ButtonSpinner = ({ className, color }: any) => {
  const { action } = useButton();
  const defaultColor = action === 'primary' ? '#FFFFFF' : '#8B8599';
  return <ActivityIndicator color={color || defaultColor} className={className} />;
};

ButtonText.displayName = 'ButtonText';
ButtonIcon.displayName = 'ButtonIcon';
ButtonSpinner.displayName = 'ButtonSpinner';

export { Button };
