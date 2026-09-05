import { Pressable } from '@repo/ui/components/ui/pressable';
import { Text } from '@repo/ui/components/ui/text';
import { View } from '@repo/ui/components/ui/view';
import { Check } from '@repo/ui/icons';
import ExpoCheckbox from 'expo-checkbox';
import type React from 'react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Platform, type ViewProps } from 'react-native';

/**
 * Checkbox Component
 *
 * A high-impact, hardened form primitive.
 * Enforces strong types and accessibility standards for data integrity.
 */

// --- Contexts ---
interface CheckboxGroupContextType {
  values: string[];
  onValueChange: (value: string) => void;
  isDisabled?: boolean;
}

const CheckboxGroupContext = createContext<CheckboxGroupContextType | null>(null);

interface CheckboxContextType {
  isChecked: boolean;
  isDisabled: boolean;
  isInvalid?: boolean;
}

const CheckboxContext = createContext<CheckboxContextType | null>(null);

function useCheckbox() {
  const context = useContext(CheckboxContext);
  if (!context) throw new Error('useCheckbox must be used within a Checkbox');
  return context;
}

// --- Sub-components ---

export const CheckboxIndicator = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  const { isChecked, isDisabled, isInvalid } = useCheckbox();

  if (Platform.OS !== 'web') {
    return (
      <ExpoCheckbox
        value={isChecked}
        disabled={isDisabled}
        color={isChecked ? '#F6BF8C' : undefined}
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
        }}
      />
    );
  }

  return (
    <View
      className={`
        w-6 h-6 rounded-lg border-2 items-center justify-center transition-all duration-200
        ${
          isChecked
            ? 'bg-phase-accent border-phase-accent shadow-sm'
            : 'bg-transparent border-phase-interactive/30'
        }
        ${isInvalid ? 'border-phase-danger' : ''}
        ${isDisabled ? 'opacity-40' : ''}
        ${className || ''}
      `}
    >
      {children}
    </View>
  );
};

export const CheckIcon: import('@repo/ui/icons').LucideIcon = Check;

export const CheckboxIcon = ({ as: Icon = Check, className, size = 14 }: any) => {
  const { isChecked } = useCheckbox();
  if (!isChecked) return null;

  return <Icon size={size} color="white" strokeWidth={3} className={`${className || ''}`} />;
};

export const CheckboxLabel = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const { isDisabled } = useCheckbox();
  return (
    <Text
      className={`text-phase-text-primary ml-3 text-base font-medium tracking-tight ${isDisabled ? 'opacity-50' : ''} ${className || ''}`}
    >
      {children}
    </Text>
  );
};

// --- Main Components ---

export interface ICheckboxProps extends ViewProps {
  value: string;
  isChecked?: boolean;
  isDisabled?: boolean;
  isInvalid?: boolean;
  onChange?: (checked: boolean) => void;
  children?: React.ReactNode;
  className?: string;
}

export const Checkbox = ({
  children,
  value,
  isChecked: isCheckedProp,
  onChange,
  className,
  isDisabled: isDisabledProp,
  isInvalid,
  ...props
}: ICheckboxProps) => {
  const groupContext = useContext(CheckboxGroupContext);
  const [internalChecked, setInternalChecked] = useState(false);

  const isDisabled = isDisabledProp || groupContext?.isDisabled || false;

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

  const contextValue = useMemo(
    () => ({
      isChecked,
      isDisabled,
      isInvalid,
    }),
    [isChecked, isDisabled, isInvalid],
  );

  return (
    <CheckboxContext.Provider value={contextValue}>
      <Pressable
        onPress={handlePress}
        disabled={isDisabled}
        accessibilityRole="checkbox"
        accessibilityState={{
          checked: isChecked,
          disabled: isDisabled,
        }}
        className={`flex-row items-center py-2 active:opacity-80 ${className || ''}`}
        {...props}
      >
        {children}
      </Pressable>
    </CheckboxContext.Provider>
  );
};

export const CheckboxGroup = ({
  children,
  value = [],
  onChange,
  isDisabled,
  className,
  ...props
}: {
  children: React.ReactNode;
  value?: string[];
  onChange?: (values: string[]) => void;
  isDisabled?: boolean;
  className?: string;
} & ViewProps) => {
  const handleValueChange = useCallback(
    (val: string) => {
      if (isDisabled) return;

      const currentValues = value || [];
      const nextValue = currentValues.includes(val)
        ? currentValues.filter((v) => v !== val)
        : [...currentValues, val];
      onChange?.(nextValue);
    },
    [isDisabled, value, onChange],
  );

  const contextValue = useMemo(
    () => ({
      values: value || [],
      onValueChange: handleValueChange,
      isDisabled,
    }),
    [value, isDisabled, handleValueChange],
  );

  return (
    <CheckboxGroupContext.Provider value={contextValue}>
      <View {...props} className={`${className || ''}`}>
        {children}
      </View>
    </CheckboxGroupContext.Provider>
  );
};

Checkbox.displayName = 'Checkbox';
CheckboxGroup.displayName = 'CheckboxGroup';

export { Checkbox as default };
