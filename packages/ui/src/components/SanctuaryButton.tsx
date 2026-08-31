import type React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Button, ButtonIcon, ButtonSpinner, ButtonText } from '@repo/ui/components/ui/button';
import { cn } from '@repo/ui/utils/classNames';
import type { HapticImpact } from '@repo/ui/utils/haptics';

interface SanctuaryButtonProps {
  onPress?: () => void;
  children: React.ReactNode;
  variant?: 'solid' | 'outline' | 'ghost' | 'link';
  isLoading?: boolean;
  isDisabled?: boolean;
  leftIcon?: React.ElementType;
  rightIcon?: React.ElementType;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  action?: 'primary' | 'secondary' | 'negative' | 'positive';
  haptic?: HapticImpact | false;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  className?: string;
  iconProps?: Record<string, string | number | boolean>;
}

export function SanctuaryButton({
  onPress,
  children,
  variant = 'solid',
  isLoading = false,
  isDisabled = false,
  leftIcon,
  rightIcon,
  size = 'md',
  fullWidth = false,
  action = 'primary',
  haptic = 'light',
  style,
  accessibilityLabel,
  accessibilityHint,
  className = '',
  iconProps,
}: SanctuaryButtonProps) {
  // Semantic Mapping using Phase Tokens
  const getBgClass = () => {
    if (variant === 'outline' || variant === 'ghost' || variant === 'link') return 'bg-transparent';
    switch (action) {
      case 'primary':
        return 'bg-phase-accent';
      case 'secondary':
        return 'bg-phase-interactive';
      case 'negative':
        return 'bg-phase-danger';
      case 'positive':
        return 'bg-phase-reward';
      default:
        return 'bg-phase-accent';
    }
  };

  const getTextClass = () => {
    if (variant === 'solid') {
      switch (action) {
        case 'primary':
          return 'text-phase-text-on-accent';
        case 'secondary':
          return 'text-phase-text-primary';
        case 'negative':
          return 'text-white';
        case 'positive':
          return 'text-phase-text-on-accent';
        default:
          return 'text-phase-text-on-accent';
      }
    }
    switch (action) {
      case 'primary':
        return 'text-phase-accent';
      case 'secondary':
        return 'text-phase-text-primary';
      case 'negative':
        return 'text-phase-danger';
      case 'positive':
        return 'text-phase-reward';
      default:
        return 'text-phase-accent';
    }
  };

  const getBorderClass = () => {
    if (variant !== 'outline') return 'border-transparent';
    switch (action) {
      case 'primary':
        return 'border-phase-accent';
      case 'secondary':
        return 'border-phase-surface';
      case 'negative':
        return 'border-phase-danger';
      case 'positive':
        return 'border-phase-reward';
      default:
        return 'border-phase-accent';
    }
  };

  const sizeClasses = {
    xs: 'h-8 px-2',
    sm: 'h-9 px-3',
    md: 'h-11 px-6',
    lg: 'h-14 px-8',
  };

  return (
    <Button
      className={cn(
        fullWidth ? 'w-full' : 'w-auto',
        getBgClass(),
        getBorderClass(),
        variant === 'outline' ? 'border' : 'border-0',
        sizeClasses[size],
        isDisabled || isLoading ? 'opacity-40' : 'opacity-100',
        className,
      )}
      variant={variant === 'link' ? 'ghost' : variant}
      action={action === 'negative' ? 'negative' : action === 'positive' ? 'positive' : action}
      isDisabled={isDisabled || isLoading}
      haptic={haptic}
      onPress={onPress}
      style={style}
      accessibilityLabel={
        accessibilityLabel || (typeof children === 'string' ? children : undefined)
      }
      accessibilityHint={accessibilityHint}
      accessibilityState={{
        busy: isLoading,
        disabled: isDisabled || isLoading,
      }}
    >
      {isLoading ? (
        <ButtonSpinner className={`mr-2 ${getTextClass()}`} />
      ) : leftIcon ? (
        <ButtonIcon as={leftIcon} className={`mr-2 ${getTextClass()}`} {...iconProps} />
      ) : null}

      <ButtonText className={`font-semibold ${getTextClass()}`}>{children}</ButtonText>

      {!isLoading && rightIcon && (
        <ButtonIcon as={rightIcon} className={`ml-2 ${getTextClass()}`} {...iconProps} />
      )}
    </Button>
  );
}
