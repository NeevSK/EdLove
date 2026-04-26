import React, { createContext, useContext, useMemo } from 'react';
import { Pressable, View, Text, type ViewProps } from 'react-native';
import { cssInterop } from 'nativewind';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(Text, { className: 'style' });

/**
 * Radio Component
 *
 * A high-impact form primitive for single-choice selection.
 * Hardened for type safety and synchronized group behavior.
 */

// --- Contexts ---
interface RadioGroupContextType {
  value?: string;
  onValueChange: (value: string) => void;
  isDisabled?: boolean;
}

const RadioGroupContext = createContext<RadioGroupContextType | null>(null);

interface RadioContextType {
  isChecked: boolean;
  isDisabled: boolean;
  isInvalid?: boolean;
}

const RadioContext = createContext<RadioContextType | null>(null);

function useRadio() {
  const context = useContext(RadioContext);
  if (!context) throw new Error('useRadio must be used within a Radio');
  return context;
}

// --- Sub-components ---

export const RadioIndicator = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  const { isChecked, isDisabled, isInvalid } = useRadio();

  return (
    <View
      className={`
        w-6 h-6 rounded-full border-2 items-center justify-center transition-all duration-200
        ${isChecked ? 'border-phase-accent' : 'border-phase-interactive/30'}
        ${isInvalid ? 'border-phase-danger' : ''}
        ${isDisabled ? 'opacity-40' : ''}
        ${className || ''}
      `}
    >
      {isChecked && <View className="w-3 h-3 rounded-full bg-phase-accent" />}
      {children}
    </View>
  );
};

export const RadioLabel = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const { isDisabled } = useRadio();
  return (
    <Text
      className={`text-phase-text-primary ml-3 text-base font-medium tracking-tight ${isDisabled ? 'opacity-50' : ''} ${className || ''}`}
    >
      {children}
    </Text>
  );
};

// --- Main Components ---

export interface IRadioProps extends ViewProps {
  value: string;
  isDisabled?: boolean;
  isInvalid?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export const Radio = ({
  children,
  value,
  isDisabled: isDisabledProp,
  isInvalid,
  className,
  ...props
}: IRadioProps) => {
  const groupContext = useContext(RadioGroupContext);

  const isChecked = groupContext ? groupContext.value === value : false;
  const isDisabled = isDisabledProp || groupContext?.isDisabled || false;

  const handlePress = () => {
    if (isDisabled) return;
    groupContext?.onValueChange(value);
  };

  const contextValue = useMemo(
    () => ({
      isChecked,
      isDisabled,
      isInvalid,
    }),
    [isChecked, isDisabled, isInvalid],
  );

  return (
    <RadioContext.Provider value={contextValue}>
      <Pressable
        onPress={handlePress}
        disabled={isDisabled}
        accessibilityRole="radio"
        accessibilityState={{
          checked: isChecked,
          disabled: isDisabled,
        }}
        className={`flex-row items-center py-2 active:opacity-80 ${className || ''}`}
        {...props}
      >
        {children}
      </Pressable>
    </RadioContext.Provider>
  );
};

export const RadioGroup = ({
  children,
  value,
  onChange,
  isDisabled,
  className,
  ...props
}: {
  children: React.ReactNode;
  value?: string;
  onChange?: (value: string) => void;
  isDisabled?: boolean;
  className?: string;
} & ViewProps) => {
  const contextValue = useMemo(
    () => ({
      value,
      onValueChange: (val: string) => onChange?.(val),
      isDisabled,
    }),
    [value, onChange, isDisabled],
  );

  return (
    <RadioGroupContext.Provider value={contextValue}>
      <View {...props} accessibilityRole="radiogroup" className={`${className || ''}`}>
        {children}
      </View>
    </RadioGroupContext.Provider>
  );
};

Radio.displayName = 'Radio';
RadioGroup.displayName = 'RadioGroup';

export { Radio as default };
