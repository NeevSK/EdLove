import { Pressable } from '@repo/ui/components/ui/pressable';
import { Text } from '@repo/ui/components/ui/text';
import type React from 'react';
import { createContext, useMemo } from 'react';
import { type ViewProps } from 'react-native';

/**
 * Fab (Floating Action Button)
 *
 * A high-impact, hardened interaction primitive.
 */

type FabPlacement = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface FabContextType {
  size: 'md' | 'lg';
}

const FabContext = createContext<FabContextType | undefined>(undefined);

export const Fab = ({
  children,
  className,
  onPress,
  placement = 'bottom-right',
  size = 'md',
  ...props
}: {
  children?: React.ReactNode;
  className?: string;
  onPress?: () => void;
  placement?: FabPlacement;
  size?: 'md' | 'lg';
} & ViewProps) => {
  const placementMap: Record<FabPlacement, string> = {
    'top-left': 'top-6 left-6',
    'top-right': 'top-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'bottom-right': 'bottom-6 right-6',
  };

  const sizeStyles = size === 'lg' ? 'p-6' : 'p-4';
  const contextValue = useMemo(() => ({ size }), [size]);

  return (
    <FabContext.Provider value={contextValue}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        className={`absolute z-30 rounded-full bg-phase-accent shadow-xl active:opacity-90 active:scale-95 transition-all items-center justify-center ${placementMap[placement] || placementMap['bottom-right']} ${sizeStyles} ${className || ''}`}
        {...props}
      >
        {children}
      </Pressable>
    </FabContext.Provider>
  );
};

export const FabLabel = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <Text className={`font-bold text-white ml-2 text-base tracking-tight ${className || ''}`}>
    {children}
  </Text>
);

export const FabIcon = ({ as: Icon, className, size = 20, ...props }: any) => {
  if (!Icon) return null;
  return (
    <Icon {...props} size={size} color="white" strokeWidth={2.5} className={`${className || ''}`} />
  );
};

Fab.displayName = 'Fab';
FabLabel.displayName = 'FabLabel';
FabIcon.displayName = 'FabIcon';

export { Fab as default };
