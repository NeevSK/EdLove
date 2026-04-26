import React, { createContext, useContext, useMemo } from 'react';
import { View, Pressable, type ViewProps } from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { cssInterop } from 'nativewind';
import { Portal } from '../portal';
import { Overlay } from '../overlay';
import { Box } from '../box';
import { Text } from '../text';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });

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
  if (!isOpen) return null;

  const contextValue = useMemo(() => ({ onClose }), [onClose]);

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
    accessibilityRole="menu"
  >
    <Box 
      className={`bg-phase-elevated rounded-t-[32px] overflow-hidden shadow-2xl border-t border-phase-interactive/10 pb-8 ${className || ''}`}
    >
      <ActionsheetDragIndicatorWrapper>
         <ActionsheetDragIndicator />
      </ActionsheetDragIndicatorWrapper>
      {children}
    </Box>
  </Animated.View>
);

export const ActionsheetItem = ({ children, onPress, isDisabled, className, ...props }: any) => {
  const { onClose } = useActionsheet();

  return (
    <Pressable
      {...props}
      onPress={() => {
        if (isDisabled) return;
        onPress?.();
      }}
      disabled={isDisabled}
      accessibilityRole="menuitem"
      accessibilityState={{ disabled: !!isDisabled }}
      className={`px-5 py-4 flex-row items-center active:bg-phase-interactive/5 rounded-2xl mx-3 my-0.5 ${isDisabled ? 'opacity-40' : ''} ${className || ''}`}
    >
      {children}
    </Pressable>
  );
};

export const ActionsheetItemText = ({ children, className }: any) => (
  <Text className={`text-phase-text-primary text-base font-semibold tracking-tight ${className || ''}`}>
    {children}
  </Text>
);

export const ActionsheetDragIndicatorWrapper = ({ children, className }: any) => (
  <Box className={`w-full items-center py-4 ${className || ''}`}>{children}</Box>
);

export const ActionsheetDragIndicator = () => (
  <Box className="w-12 h-1.5 bg-phase-interactive/20 rounded-full" />
);

Actionsheet.displayName = 'Actionsheet';
ActionsheetContent.displayName = 'ActionsheetContent';
ActionsheetItem.displayName = 'ActionsheetItem';

export { Actionsheet as default };
