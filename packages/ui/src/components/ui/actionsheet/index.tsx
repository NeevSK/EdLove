import type React from 'react';
import { createContext, useContext, useMemo } from 'react';
import { type ViewProps } from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { Box } from '@repo/ui/components/ui/box';
import { Overlay } from '@repo/ui/components/ui/overlay';
import { Portal } from '@repo/ui/components/ui/portal';
import { Pressable } from '@repo/ui/components/ui/pressable';
import { Text } from '@repo/ui/components/ui/text';
import { View } from '@repo/ui/components/ui/view';
import { cn } from '@repo/ui/utils/classNames';

/**
 * Actionsheet Component
 *
 * A high-impact, hardened bottom-sheet primitive.
 * Optimized for mobile reachability and premium design tokens.
 */

interface ActionsheetContextType {
  onClose: () => void;
}

const ActionsheetContext = createContext<ActionsheetContextType | undefined>(undefined);

function useActionsheet() {
  const context = useContext(ActionsheetContext);
  if (!context) throw new Error('useActionsheet must be used within an Actionsheet');
  return context;
}

export const Actionsheet = ({
  isOpen,
  onClose,
  children,
  ...props
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
} & ViewProps) => {
  const contextValue = useMemo(() => ({ onClose }), [onClose]);

  if (!isOpen) return null;

  return (
    <ActionsheetContext.Provider value={contextValue}>
      <Portal>
        <Overlay isOpen={isOpen} onPress={onClose} />
        <View
          className="absolute inset-0 justify-end"
          pointerEvents="box-none"
          style={{ zIndex: 1001 }}
          {...props}
        >
          {children}
        </View>
      </Portal>
    </ActionsheetContext.Provider>
  );
};

export const ActionsheetBackdrop = Overlay;

export const ActionsheetContent = ({ children, className }: any) => (
  <Animated.View
    entering={SlideInDown.duration(300).springify().damping(20)}
    exiting={SlideOutDown.duration(200)}
    className="w-full"
    accessible
    accessibilityRole="menu"
  >
    <Box
      className={cn(
        'bg-phase-modal-card rounded-t-[32px] overflow-hidden shadow-2xl border-t border-phase-modal-border pb-8',
        className,
      )}
    >
      <ActionsheetDragIndicatorWrapper>
        <ActionsheetDragIndicator />
      </ActionsheetDragIndicatorWrapper>
      {children}
    </Box>
  </Animated.View>
);

export const ActionsheetItem = ({
  children,
  onPress,
  isDisabled,
  disabled,
  className,
  ...props
}: any) => {
  const { onClose } = useActionsheet();
  const resolvedDisabled = disabled || isDisabled;

  return (
    <Pressable
      {...props}
      onPress={() => {
        if (resolvedDisabled) return;
        onPress?.();
      }}
      disabled={resolvedDisabled}
      accessibilityRole="menuitem"
      accessibilityState={{ disabled: !!resolvedDisabled }}
      className={cn(
        'px-5 py-4 flex-row items-center active:bg-phase-interactive/10 rounded-2xl mx-3 my-0.5',
        resolvedDisabled ? 'opacity-40' : undefined,
        className,
      )}
    >
      {children}
    </Pressable>
  );
};

export const ActionsheetItemText = ({ children, className }: any) => (
  <Text className={cn('text-phase-text-primary text-base font-semibold tracking-tight', className)}>
    {children}
  </Text>
);

export const ActionsheetDragIndicatorWrapper = ({ children, className }: any) => (
  <Box className={cn('w-full items-center py-4', className)}>{children}</Box>
);

export const ActionsheetDragIndicator = () => (
  <Box className="w-12 h-1.5 bg-phase-text-primary/25 rounded-full" />
);

export const ActionsheetIcon = ({ children, className }: any) => (
  <Box className={cn('mr-3', className)}>{children}</Box>
);

Actionsheet.displayName = 'Actionsheet';
ActionsheetContent.displayName = 'ActionsheetContent';
ActionsheetItem.displayName = 'ActionsheetItem';

export { Actionsheet as default };
