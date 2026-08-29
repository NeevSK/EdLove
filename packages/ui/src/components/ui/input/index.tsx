import React, { createContext, useContext, useMemo, useState } from 'react';
import { type PressableProps, type TextInputProps, type ViewProps } from 'react-native';
import { Pressable } from '@repo/ui/components/ui/pressable';
import { TextInput } from '@repo/ui/components/ui/text-input';
import { View } from '@repo/ui/components/ui/view';
import { useFormControlContext } from '@repo/ui/components/ui/form-control';
import { useTheme } from '@repo/ui/hooks/useTheme';
import { cn } from '@repo/ui/utils/classNames';

// --- Context ---
interface InputContextType {
  id?: string;
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
    const formControl = useFormControlContext();
    const resolvedId = props.nativeID ?? formControl.id;
    const resolvedDisabled = isDisabled ?? formControl.isDisabled;
    const resolvedInvalid = isInvalid ?? formControl.isInvalid;

    const contextValue = useMemo(
      () => ({
        id: resolvedId,
        isDisabled: resolvedDisabled,
        isInvalid: resolvedInvalid,
        isFocused,
        setIsFocused,
      }),
      [resolvedDisabled, resolvedInvalid, resolvedId, isFocused],
    );

    return (
      <InputContext.Provider value={contextValue}>
        <View
          {...props}
          ref={ref}
          nativeID={resolvedId}
          accessibilityState={{
            disabled: !!resolvedDisabled,
          }}
          className={cn(
            'flex-row items-center border rounded-xl px-3 min-h-[48px] bg-phase-surface transition-colors duration-200',
            resolvedInvalid ? 'border-phase-danger' : isFocused ? 'border-phase-accent' : 'border-phase-interactive/30',
            resolvedDisabled ? 'opacity-40' : undefined,
            className,
          )}
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
  const { id, isDisabled, isInvalid, setIsFocused } = useInput();
  const theme = useTheme();

  return (
    <TextInput
      {...props}
      ref={ref}
      editable={!isDisabled}
      accessibilityState={{ disabled: isDisabled }}
      aria-invalid={isInvalid || undefined}
      accessibilityLabelledBy={id ? `${id}-label` : undefined}
      secureTextEntry={type === 'password'}
      keyboardType={type === 'number' ? 'numeric' : props.keyboardType}
      placeholderTextColor={theme.text.muted}
      onFocus={(e) => {
        setIsFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setIsFocused(false);
        onBlur?.(e);
      }}
      className={cn('flex-1 text-phase-text-primary text-base py-2 pl-1', className)}
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
    className={cn('px-2 py-1 justify-center items-center active:opacity-60', className)}
  >
    {children}
  </Pressable>
);

export const InputIcon = ({ as: Icon, className, color, size, ...props }: any) => {
  if (!Icon) return null;
  return <Icon {...props} size={size || 18} color={color} className={cn('text-phase-text-secondary', className)} />;
};

export { Input };
