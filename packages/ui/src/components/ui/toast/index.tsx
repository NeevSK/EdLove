import type React from 'react';
import { createContext, useMemo } from 'react';
import { type ViewProps } from 'react-native';
import { Box } from '@repo/ui/components/ui/box';
import { Text } from '@repo/ui/components/ui/text';
import { tokens } from '@repo/ui/tokens';
import { cn } from '@repo/ui/utils/classNames';


/**
 * Toast Component
 *
 * A high-impact, hardened primitive for system feedback.
 * Synchronized with Sanctuary V3 action behaviors.
 */

type ToastAction = 'success' | 'error' | 'warning' | 'info' | 'attention';

interface ToastContextType {
  action: ToastAction;
  variant: 'solid' | 'outline';
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const Toast = ({
  children,
  action = 'attention',
  variant = 'solid',
  className,
  ...props
}: {
  children: React.ReactNode;
  action?: ToastAction;
  variant?: 'solid' | 'outline';
  className?: string;
} & ViewProps) => {
  const contextValue = useMemo(() => ({ action, variant }), [action, variant]);

  const actionStyles = {
    success: tokens.colors.toastSuccess,
    error: tokens.colors.toastError,
    warning: tokens.colors.toastWarning,
    info: tokens.colors.toastInfo,
    attention: tokens.colors.primary,
  };

  const variantStyles =
    variant === 'outline' ? 'bg-phase-elevated/80 border-2' : 'border shadow-2xl backdrop-blur-xl';

  const accentColor = actionStyles[action];

  return (
    <ToastContext.Provider value={contextValue}>
      <Box
        className={cn('p-4 rounded-2xl flex-row items-center gap-3', variantStyles, className)}
        style={{
          backgroundColor: tokens.colors.toastSurface,
          borderColor: accentColor,
          borderLeftWidth: 4,
        }}
        accessible
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        {...props}
      >
        {children}
      </Box>
    </ToastContext.Provider>
  );
};

export const ToastTitle = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <Text
      className={cn('font-bold text-base tracking-tight', className)}
      style={{ color: tokens.colors.toastText }}
    >
      {children}
    </Text>
  );
};

export const ToastDescription = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <Text
      className={cn('text-sm font-medium leading-tight', className)}
      style={{ color: tokens.colors.toastTextMuted }}
    >
      {children}
    </Text>
  );
};

Toast.displayName = 'Toast';
ToastTitle.displayName = 'ToastTitle';
ToastDescription.displayName = 'ToastDescription';

export { Toast as default };

