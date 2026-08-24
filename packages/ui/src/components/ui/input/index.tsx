import React, { createContext, useContext, useMemo, useState } from 'react';
import { type PressableProps, type TextInputProps, type ViewProps } from 'react-native';
import { Pressable } from '@repo/ui/components/ui/pressable';
import { TextInput } from '@repo/ui/components/ui/text-input';
import { View } from '@repo/ui/components/ui/view';

// --- Context ---
interface InputContextType {
  isDisabled?: boolean;
  isInvalid?: boolean;
  isFocused: boolean;
  setIsFocused: (focused: boolean) => void;
}

const InputContext = createContext<InputContextType | undefined>(undefined);

function useInput() {
  const context = useContext(InputContext);
  if (!context) throw new Error('useInput must be used within an Input component');
  return context;
}

// --- Components ---

export interface IInputProps extends ViewProps {
  className?: string;
  isDisabled?: boolean;
  isInvalid?: boolean;
}

const Input = React.forwardRef<React.ElementRef<typeof View>, IInputProps>(
  ({ className, isDisabled, isInvalid, children, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    const contextValue = useMemo(
      () => ({
        isDisabled,
        isInvalid,
        isFocused,
        setIsFocused,
      }),
      [isDisabled, isInvalid, isFocused],
    );

    return (
      <InputContext.Provider value={contextValue}>
        <View
          {...props}
          ref={ref}
          accessibilityState={{
            disabled: !!isDisabled,
          }}
          className={`flex-row items-center border rounded-xl px-3 min-h-[48px] bg-phase-surface transition-colors duration-200
            ${isInvalid ? 'border-phase-danger' : isFocused ? 'border-phase-accent' : 'border-phase-interactive/30'} 
            ${isDisabled ? 'opacity-40' : ''} 
            ${className || ''}`}
        >
          {children}
        </View>
      </InputContext.Provider>
    );
  },
);

Input.displayName = 'Input';

export const InputField = React.forwardRef<
  React.ElementRef<typeof TextInput>,
  TextInputProps & { className?: string; type?: 'text' | 'password' | 'number' }
>(({ className, type, onFocus, onBlur, ...props }, ref) => {
  const { isDisabled, setIsFocused } = useInput();

  return (
    <TextInput
      {...props}
      ref={ref}
      editable={!isDisabled}
      accessibilityState={{ disabled: isDisabled }}
      secureTextEntry={type === 'password'}
      keyboardType={type === 'number' ? 'numeric' : props.keyboardType}
      placeholderTextColor="#8B8599"
      onFocus={(e) => {
        setIsFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setIsFocused(false);
        onBlur?.(e);
      }}
      className={`flex-1 text-phase-text-primary text-base py-2 pl-1 ${className || ''}`}
    />
  );
});

InputField.displayName = 'InputField';

export const InputSlot = ({
  className,
  children,
  ...props
}: PressableProps & { className?: string; children?: React.ReactNode }) => (
  <Pressable
    {...props}
    className={`px-2 py-1 justify-center items-center active:opacity-60 ${className || ''}`}
  >
    {children}
  </Pressable>
);

export const InputIcon = ({ as: Icon, className, color, size, ...props }: any) => {
  if (!Icon) return null;
  return (
    <Icon {...props} size={size || 18} color={color} className={`text-phase-text-secondary ${className || ''}`} />
  );
};

export { Input };
