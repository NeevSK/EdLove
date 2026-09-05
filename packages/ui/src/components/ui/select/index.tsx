import { Overlay } from '@repo/ui/components/ui/overlay';
import { Portal } from '@repo/ui/components/ui/portal';
import { Pressable } from '@repo/ui/components/ui/pressable';
import { Text } from '@repo/ui/components/ui/text';
import { View } from '@repo/ui/components/ui/view';
import { cn } from '@repo/ui/utils/classNames';
import React, { createContext, useContext, useMemo, useState } from 'react';
import { type PressableProps, type ViewProps } from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';

// --- Context ---
interface SelectContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  value: string;
  onValueChange: (val: string) => void;
  isDisabled?: boolean;
}

const SelectContext = createContext<SelectContextType | undefined>(undefined);

export function useSelect() {
  const context = useContext(SelectContext);
  if (!context) throw new Error('useSelect must be used within a Select component');
  return context;
}

// --- Components ---

export const Select = ({
  children,
  value = '',
  selectedValue,
  onValueChange = () => {},
  isDisabled = false,
  ...props
}: {
  children: React.ReactNode;
  value?: string;
  selectedValue?: string;
  onValueChange?: (val: string) => void;
  isDisabled?: boolean;
} & ViewProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const resolvedValue = selectedValue ?? value;

  const contextValue = useMemo(
    () => ({
      isOpen,
      setIsOpen,
      value: resolvedValue,
      onValueChange,
      isDisabled,
    }),
    [isOpen, resolvedValue, onValueChange, isDisabled],
  );

  return (
    <SelectContext.Provider value={contextValue}>
      <View {...props}>{children}</View>
    </SelectContext.Provider>
  );
};

export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  PressableProps & { className?: string }
>(({ children, className, ...props }, ref) => {
  const { setIsOpen, isDisabled, isOpen } = useSelect();

  return (
    <Pressable
      {...props}
      ref={ref as any}
      disabled={isDisabled}
      onPress={() => !isDisabled && setIsOpen(true)}
      accessibilityRole="combobox"
      accessibilityState={{
        disabled: isDisabled,
        expanded: isOpen,
      }}
      className={cn(
        'flex-row items-center justify-between p-4 border rounded-xl bg-phase-canvas border-phase-interactive/10',
        isDisabled ? 'opacity-50' : 'active:opacity-80',
        className,
      )}
    >
      {children}
    </Pressable>
  );
});

export const SelectInput = ({ className, placeholder, value: propValue, ...props }: any) => {
  const { value: contextValue } = useSelect();
  const displayValue = propValue || contextValue;

  return (
    <Text
      className={cn(
        'text-phase-text-primary flex-1',
        !displayValue ? 'opacity-40' : undefined,
        className,
      )}
      {...props}
    >
      {displayValue || placeholder}
    </Text>
  );
};

export const SelectIcon = ({ as: Icon, className, size = 18, ...props }: any) => {
  if (!Icon) return null;
  return (
    <Icon {...props} size={size} className={cn('text-phase-text-secondary ml-2', className)} />
  );
};

export const SelectPortal = ({ children }: { children: React.ReactNode }) => {
  const { isOpen, setIsOpen } = useSelect();

  if (!isOpen) return null;

  return (
    <Portal>
      <Overlay isOpen={isOpen} onPress={() => setIsOpen(false)} />
      <View
        className="absolute inset-0 justify-end"
        style={{ zIndex: 1001, pointerEvents: 'box-none' }}
      >
        {children}
      </View>
    </Portal>
  );
};

export const SelectBackdrop = ({ className }: { className?: string }) => {
  const { setIsOpen } = useSelect();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => setIsOpen(false)}
      className={cn('absolute inset-0 bg-phase-scrim', className)}
    />
  );
};

export const SelectContent = ({ children, className }: any) => (
  <Animated.View
    entering={SlideInDown.duration(300).springify().damping(20)}
    exiting={SlideOutDown.duration(200)}
    className={cn(
      'bg-phase-modal-card rounded-t-3xl overflow-hidden shadow-2xl border-t border-phase-modal-border p-4 pb-12',
      className,
    )}
  >
    {children}
  </Animated.View>
);

export const SelectDragIndicatorWrapper = ({ children, className }: any) => (
  <View className={cn('items-center py-4', className)}>{children}</View>
);

export const SelectDragIndicator = ({ className }: any) => (
  <View className={cn('w-12 h-1.5 bg-phase-text-primary/25 rounded-full', className)} />
);

export const SelectItem = ({ label, value: itemValue, className, ...props }: any) => {
  const { value: selectedValue, onValueChange, setIsOpen } = useSelect();
  const isSelected = selectedValue === itemValue;

  return (
    <Pressable
      className={cn(
        'py-4 px-2 border-b border-phase-interactive/5 flex-row items-center justify-between active:bg-phase-interactive/5 rounded-lg',
        isSelected ? 'bg-primary/5' : undefined,
        className,
      )}
      onPress={() => {
        onValueChange(itemValue);
        setIsOpen(false);
      }}
      accessibilityRole="checkbox"
      accessibilityState={{
        checked: isSelected,
      }}
      {...props}
    >
      <Text
        className={cn(
          'text-lg',
          isSelected ? 'text-primary font-bold' : 'text-phase-text-primary font-medium',
        )}
      >
        {label}
      </Text>
      {isSelected && <View className="w-2 h-2 rounded-full bg-primary" />}
    </Pressable>
  );
};

Select.displayName = 'Select';
SelectTrigger.displayName = 'SelectTrigger';
SelectInput.displayName = 'SelectInput';
SelectItem.displayName = 'SelectItem';
