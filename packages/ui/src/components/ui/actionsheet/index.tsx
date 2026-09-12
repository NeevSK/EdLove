import { Box } from '@repo/ui/components/ui/box';
import { Overlay } from '@repo/ui/components/ui/overlay';
import { Portal } from '@repo/ui/components/ui/portal';
import { Pressable } from '@repo/ui/components/ui/pressable';
import { Text } from '@repo/ui/components/ui/text';
import { View } from '@repo/ui/components/ui/view';
import { cn } from '@repo/ui/utils/classNames';
import type React from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { type ViewProps } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { runOnJS } from 'react-native-worklets';

/**
 * Actionsheet Component
 *
 * A high-impact, hardened bottom-sheet primitive.
 * Optimized for mobile reachability and premium design tokens.
 */

interface ActionsheetContextType {
  onClose: () => void;
  isOpen: boolean;
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
  closeOnBackdropPress = true,
  ...props
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  closeOnBackdropPress?: boolean;
} & ViewProps) => {
  const contextValue = useMemo(() => ({ onClose, isOpen }), [isOpen, onClose]);
  const [isPresent, setIsPresent] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setIsPresent(true);
      return;
    }

    const timeout = setTimeout(() => setIsPresent(false), 220);
    return () => clearTimeout(timeout);
  }, [isOpen]);

  if (!isPresent) return null;

  return (
    <ActionsheetContext.Provider value={contextValue}>
      <Portal>
        <Overlay isOpen={isOpen} onPress={closeOnBackdropPress ? onClose : undefined} />
        <View
          className="absolute inset-0 justify-end"
          style={{ zIndex: 1001, pointerEvents: 'box-none' }}
          {...props}
        >
          {children}
        </View>
      </Portal>
    </ActionsheetContext.Provider>
  );
};

export const ActionsheetBackdrop = Overlay;

export interface ActionsheetContentProps {
  children?: React.ReactNode;
  className?: string;
}

export const ActionsheetContent = ({ children, className }: ActionsheetContentProps) => {
  const { isOpen, onClose } = useActionsheet();
  const translateY = useSharedValue(0);
  const panGesture = Gesture.Pan()
    .activeOffsetY?.(8)
    .failOffsetX?.([-24, 24])
    .onUpdate((event: { translationY: number }) => {
      'worklet';
      translateY.value = Math.max(0, event.translationY);
    })
    .onEnd((event: { canceled?: boolean }) => {
      'worklet';
      const shouldClose = !event.canceled && translateY.value > 120;
      if (shouldClose) runOnJS(onClose)();
      translateY.value = withSpring(0);
    });
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!isOpen) return null;

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        entering={SlideInDown.duration(300).springify().damping(20)}
        exiting={SlideOutDown.duration(200)}
        className="w-full"
        style={animatedStyle}
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
    </GestureDetector>
  );
};

export interface ActionsheetItemProps
  extends Omit<React.ComponentProps<typeof Pressable>, 'children' | 'onPress'> {
  children?: React.ReactNode;
  onPress?: () => void;
  isDisabled?: boolean;
}

export const ActionsheetItem = ({
  children,
  onPress,
  isDisabled,
  disabled,
  className,
  ...props
}: ActionsheetItemProps) => {
  const { onClose } = useActionsheet();
  const resolvedDisabled = disabled || isDisabled;

  return (
    <Pressable
      {...props}
      onPress={() => {
        if (resolvedDisabled) return;
        onPress?.();
        onClose();
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

export const ActionsheetItemText = ({ children, className }: ActionsheetContentProps) => (
  <Text className={cn('text-phase-text-primary text-base font-semibold tracking-tight', className)}>
    {children}
  </Text>
);

export const ActionsheetDragIndicatorWrapper = ({
  children,
  className,
}: ActionsheetContentProps) => (
  <Box className={cn('w-full items-center py-4', className)}>{children}</Box>
);

export const ActionsheetDragIndicator = () => (
  <Box className="w-12 h-1.5 bg-phase-text-primary/25 rounded-full" />
);

export const ActionsheetIcon = ({ children, className }: ActionsheetContentProps) => (
  <Box className={cn('mr-3', className)}>{children}</Box>
);

Actionsheet.displayName = 'Actionsheet';
ActionsheetContent.displayName = 'ActionsheetContent';
ActionsheetItem.displayName = 'ActionsheetItem';

export { Actionsheet as default };
