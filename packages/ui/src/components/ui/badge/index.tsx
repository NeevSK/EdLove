import { Text } from '@repo/ui/components/ui/text';
import { View } from '@repo/ui/components/ui/view';
import React, { createContext, useContext, useMemo } from 'react';
import { View as RNView, type TextProps, type ViewProps } from 'react-native';

export type BadgeVariant = 'solid' | 'outline';
export type BadgeAction = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'muted';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeContextType {
  variant: BadgeVariant;
  action: BadgeAction;
  size: BadgeSize;
}

const BadgeContext = createContext<BadgeContextType>({
  variant: 'solid',
  action: 'primary',
  size: 'md',
});

export interface IBadgeProps extends ViewProps {
  className?: string;
  size?: BadgeSize;
  variant?: BadgeVariant;
  action?: BadgeAction;
}

const Badge = React.forwardRef<RNView, IBadgeProps>(
  ({ className, size = 'md', variant = 'solid', action = 'primary', children, ...props }, ref) => {
    const contextValue = useMemo(() => ({ variant, action, size }), [variant, action, size]);

    const sizeClasses: Record<BadgeSize, string> = {
      sm: 'px-2 py-0.5 rounded-md gap-1',
      md: 'px-2.5 py-1 rounded-lg gap-1.5',
      lg: 'px-3.5 py-1.5 rounded-xl gap-2',
    };

    const variantClasses: Record<BadgeVariant, Record<BadgeAction, string>> = {
      solid: {
        primary: 'bg-phase-accent/20 border border-phase-accent/30',
        secondary: 'bg-phase-interactive/30 border border-phase-interactive/40',
        success: 'bg-phase-reward/20 border border-phase-reward/30',
        warning: 'bg-amberGlow/20 border border-amberGlow/30',
        error: 'bg-phase-danger/20 border border-phase-danger/30',
        muted: 'bg-phase-interactive/20 border border-phase-interactive/30',
      },
      outline: {
        primary: 'bg-transparent border border-phase-accent',
        secondary: 'bg-transparent border border-phase-interactive',
        success: 'bg-transparent border border-phase-reward',
        warning: 'bg-transparent border border-amberGlow',
        error: 'bg-transparent border border-phase-danger',
        muted: 'bg-transparent border border-phase-interactive/40',
      },
    };

    return (
      <BadgeContext.Provider value={contextValue}>
        <View
          {...props}
          ref={ref}
          className={`flex-row items-center justify-center self-start ${sizeClasses[size]} ${variantClasses[variant][action]} ${className || ''}`}
        >
          {children}
        </View>
      </BadgeContext.Provider>
    );
  },
);

export interface IBadgeTextProps extends TextProps {
  className?: string;
}

const BadgeText = React.forwardRef<any, IBadgeTextProps>(
  ({ className, children, ...props }, ref) => {
    const { variant, action, size } = useContext(BadgeContext);

    const textSizes: Record<BadgeSize, string> = {
      sm: 'text-xs',
      md: 'text-xs font-semibold',
      lg: 'text-sm font-semibold',
    };

    const textColors: Record<BadgeAction, string> = {
      primary: 'text-phase-accent',
      secondary: 'text-phase-text-secondary',
      success: 'text-phase-reward',
      warning: 'text-amberGlow',
      error: 'text-phase-danger',
      muted: 'text-phase-text-secondary',
    };

    return (
      <Text
        {...props}
        ref={ref}
        className={`tracking-tight uppercase ${textSizes[size]} ${textColors[action]} ${className || ''}`}
      >
        {children}
      </Text>
    );
  },
);

Badge.displayName = 'Badge';
BadgeText.displayName = 'BadgeText';

export { Badge, BadgeText };
