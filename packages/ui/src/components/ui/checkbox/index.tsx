import React, { createContext, useContext, useState } from 'react';
import { Pressable, View, Text } from 'react-native';
import { Check } from 'lucide-react-native';

// --- Context for CheckboxGroup ---
const CheckboxGroupContext = createContext<{
  values: string[];
  onValueChange: (value: string) => void;
} | null>(null);

// --- Checkbox Indicator ---
export const CheckboxIndicator = ({ children, className }: any) => {
  const { isChecked }: any = useContext(CheckboxContext);
  return (
    <View
      className={`
                w-5 h-5 rounded-md border-2 items-center justify-center
                ${isChecked ? 'bg-phase-accent border-phase-accent' : 'bg-transparent border-phase-text-secondary opacity-40'}
                ${className || ''}
            `}
    >
      {children}
    </View>
  );
};

// --- Checkbox Icon ---
export const CheckboxIcon = ({ as: Icon = Check, className }: any) => {
  const { isChecked }: any = useContext(CheckboxContext);
  if (!isChecked) return null;
  return <Icon size={14} color="white" className={`${className || ''}`} />;
};

export const CheckIcon = Check;

// --- Checkbox Label ---
export const CheckboxLabel = ({ children, className }: any) => (
  <Text className={`text-phase-text-primary ml-2 text-sm font-medium ${className || ''}`}>
    {children}
  </Text>
);

// --- Checkbox Context ---
const CheckboxContext = createContext<{ isChecked: boolean } | null>(null);

// --- Checkbox Root ---
export const Checkbox = ({
  children,
  value,
  isChecked: isCheckedProp,
  onChange,
  className,
  isDisabled,
  ...props
}: any) => {
  const groupContext = useContext(CheckboxGroupContext);
  const [internalChecked, setInternalChecked] = useState(false);

  const isChecked = groupContext
    ? groupContext.values.includes(value)
    : isCheckedProp !== undefined
      ? isCheckedProp
      : internalChecked;

  const handlePress = () => {
    if (isDisabled) return;
    if (groupContext) {
      groupContext.onValueChange(value);
    } else {
      const next = !isChecked;
      if (isCheckedProp === undefined) setInternalChecked(next);
      onChange?.(next);
    }
  };

  return (
    <CheckboxContext.Provider value={{ isChecked }}>
      <Pressable
        onPress={handlePress}
        disabled={isDisabled}
        className={`flex-row items-center py-1 ${isDisabled ? 'opacity-50' : ''} ${className || ''}`}
        {...props}
      >
        {children}
      </Pressable>
    </CheckboxContext.Provider>
  );
};

// --- Checkbox Group ---
export const CheckboxGroup = ({ children, value = [], onChange, className }: any) => {
  const handleValueChange = (val: string) => {
    const nextValue = value.includes(val)
      ? value.filter((v: string) => v !== val)
      : [...value, val];
    onChange?.(nextValue);
  };

  return (
    <CheckboxGroupContext.Provider value={{ values: value, onValueChange: handleValueChange }}>
      <View className={`${className || ''}`}>{children}</View>
    </CheckboxGroupContext.Provider>
  );
};
