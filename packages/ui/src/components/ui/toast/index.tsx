import { cssInterop } from 'react-native-css-interop';
import type React from 'react';
import { createContext, useContext, useMemo } from 'react';
import { View, type ViewProps } from 'react-native';
import { Box } from '../box';
import { Text } from '../text';

cssInterop(View, { className: 'style' });

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

function _useToastContext() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToastContext must be used within a Toast');
  return context;
}

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
    success: 'bg-phase-reward/80 border-emerald-500/30',
    error: 'bg-phase-danger/80 border-rose-500/30',
    warning: 'bg-orange-500/80 border-orange-600/30',
    info: 'bg-phase-interactive/80 border-sky-500/30',
    attention: 'bg-phase-accent/80 border-amber-500/30',
  };

  const variantStyles =
    variant === 'outline' ? 'bg-phase-elevated/80 border-2' : 'border shadow-2xl backdrop-blur-xl';

  return (
    <ToastContext.Provider value={contextValue}>
      <Box
        className={`p-4 rounded-2xl flex-row items-center gap-3 ${actionStyles[action]} ${variantStyles} ${className || ''}`}
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
    <Text className={`text-white font-bold text-base tracking-tight ${className || ''}`}>
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
    <Text className={`text-white/90 text-sm font-medium leading-tight ${className || ''}`}>
      {children}
    </Text>
  );
};

Toast.displayName = 'Toast';
ToastTitle.displayName = 'ToastTitle';
ToastDescription.displayName = 'ToastDescription';

export { Toast as default };

