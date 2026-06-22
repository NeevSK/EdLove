import { cssInterop } from 'nativewind';
import React, { createContext, useContext, useMemo, useState } from 'react';
import { Pressable, type PressableProps, Text, View, type ViewProps } from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { Overlay } from '../overlay';
import { Portal } from '../portal';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(Text, { className: 'style' });

// --- Context ---
interface SelectContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  value: string;
  onValueChange: (val: string) => void;
  isDisabled?: boolean;
}

const SelectContext = createContext<SelectContextType | undefined>(undefined);

function useSelect() {
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

export const SelectTrigger = React.forwardRef<View, PressableProps & { className?: string }>(
  ({ children, className, ...props }, ref) => {
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
        className={`flex-row items-center justify-between p-4 border rounded-xl bg-phase-canvas border-phase-interactive/10 ${isDisabled ? 'opacity-50' : 'active:opacity-80'} ${className || ''}`}
      >
        {children}
      </Pressable>
    );
  },
);

export const SelectInput = ({ className, placeholder, value: propValue, ...props }: any) => {
  const { value: contextValue } = useSelect();
  const displayValue = propValue || contextValue;

  return (
    <Text
      className={`text-phaseText-primary flex-1 ${!displayValue ? 'opacity-40' : ''} ${className || ''}`}
      {...props}
    >
      {displayValue || placeholder}
    </Text>
  );
};

export const SelectIcon = ({ as: Icon, className, size = 18, ...props }: any) => {
  if (!Icon) return null;
  return (
    <Icon {...props} size={size} className={`text-phaseText-secondary ml-2 ${className || ''}`} />
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
        pointerEvents="box-none"
        style={{ zIndex: 1001 }}
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
      className={`absolute inset-0 bg-black/60 ${className || ''}`}
    />
  );
};

export const SelectContent = ({ children, className }: any) => (
  <Animated.View
    entering={SlideInDown.duration(300).springify().damping(20)}
    exiting={SlideOutDown.duration(200)}
    className={`bg-phase-elevated rounded-t-3xl overflow-hidden shadow-2xl border-t border-phase-interactive/10 p-4 pb-12 ${className || ''}`}
  >
    {children}
  </Animated.View>
);

export const SelectDragIndicatorWrapper = ({ children, className }: any) => (
  <View className={`items-center py-4 ${className || ''}`}>{children}</View>
);

export const SelectDragIndicator = ({ className }: any) => (
  <View className={`w-12 h-1.5 bg-phase-interactive/20 rounded-full ${className || ''}`} />
);

export const SelectItem = ({ label, value: itemValue, className, ...props }: any) => {
  const { value: selectedValue, onValueChange, setIsOpen } = useSelect();
  const isSelected = selectedValue === itemValue;

  return (
    <Pressable
      className={`py-4 px-2 border-b border-phase-interactive/5 flex-row items-center justify-between active:bg-phase-interactive/5 rounded-lg ${isSelected ? 'bg-primary/5' : ''} ${className || ''}`}
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
        className={`text-lg ${isSelected ? 'text-primary font-bold' : 'text-phaseText-primary font-medium'}`}
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
