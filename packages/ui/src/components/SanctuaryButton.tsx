import React from 'react';
import { Button, ButtonText, ButtonSpinner, ButtonIcon } from './ui/button';

interface SanctuaryButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  variant?: 'solid' | 'outline' | 'ghost' | 'link';
  isLoading?: boolean;
  isDisabled?: boolean;
  leftIcon?: React.ElementType;
  rightIcon?: React.ElementType;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  action?: 'primary' | 'secondary' | 'negative' | 'positive';
  style?: any;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  className?: string;
}

export default function SanctuaryButton({
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
  style,
  accessibilityLabel,
  className = '',
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
      className={`
                ${fullWidth ? 'w-full' : 'w-auto'}
                ${getBgClass()}
                ${getBorderClass()}
                ${variant === 'outline' ? 'border' : 'border-0'}
                ${sizeClasses[size]}
                ${isDisabled || isLoading ? 'opacity-40' : 'opacity-100'}
                active:opacity-80
                ${className}
            `}
      isDisabled={isDisabled || isLoading}
      onPress={onPress}
      style={style}
      accessibilityLabel={
        accessibilityLabel || (typeof children === 'string' ? children : undefined)
      }
    >
      {isLoading ? (
        <ButtonSpinner className={`mr-2 ${getTextClass()}`} />
      ) : leftIcon ? (
        <ButtonIcon as={leftIcon} className={`mr-2 ${getTextClass()}`} />
      ) : null}

      <ButtonText className={`font-semibold ${getTextClass()}`}>{children}</ButtonText>

      {!isLoading && rightIcon && (
        <ButtonIcon as={rightIcon} className={`ml-2 ${getTextClass()}`} />
      )}
    </Button>
  );
}
