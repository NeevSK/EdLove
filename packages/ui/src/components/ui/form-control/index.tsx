import { Text } from '@repo/ui/components/ui/text';
import { View } from '@repo/ui/components/ui/view';
import { VStack } from '@repo/ui/components/ui/vstack';
import { cn } from '@repo/ui/utils/classNames';
import type { ComponentType, ReactNode } from 'react';
import React from 'react';

const FormControlContext = React.createContext<{
  id?: string;
  isInvalid?: boolean;
  isDisabled?: boolean;
  helperId?: string;
  errorId?: string;
}>({});

interface FormControlProps {
  children: ReactNode;
  id?: string;
  isInvalid?: boolean;
  isDisabled?: boolean;
  className?: string;
}

interface FormControlSlotProps {
  children?: ReactNode;
  className?: string;
}

interface FormControlIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export const FormControl = ({
  children,
  isInvalid,
  isDisabled,
  className,
  id: idProp,
}: FormControlProps) => {
  const generatedId = React.useId();
  const id = idProp || generatedId;

  return (
    <FormControlContext.Provider
      value={{
        id,
        isInvalid,
        isDisabled,
        helperId: `${id}-helper`,
        errorId: `${id}-error`,
      }}
    >
      <VStack space="xs" className={cn(className)}>
        {children}
      </VStack>
    </FormControlContext.Provider>
  );
};

export const useFormControlContext = () => React.useContext(FormControlContext);

export const FormControlLabel = ({ children, className }: FormControlSlotProps) => (
  <View className={cn('mb-1', className)}>{children}</View>
);

export const FormControlLabelText = ({ children, className }: FormControlSlotProps) => {
  const { id } = React.useContext(FormControlContext);
  return (
    <Text
      nativeID={`${id}-label`}
      className={cn('text-sm font-medium text-phase-text-primary', className)}
    >
      {children}
    </Text>
  );
};

export const FormControlError = ({ children, className }: FormControlSlotProps) => (
  <View className={cn('flex-row items-center mt-1', className)}>{children}</View>
);

export const FormControlErrorIcon = ({
  as: Icon,
  className,
  ...props
}: FormControlIconProps & { as?: ComponentType<FormControlIconProps> }) => {
  if (!Icon) return null;
  return <Icon {...props} size={14} className={cn('text-phase-danger', className)} />;
};

export const FormControlErrorText = ({ children, className }: FormControlSlotProps) => {
  const { errorId } = React.useContext(FormControlContext);
  return (
    <Text nativeID={errorId} className={cn('text-xs text-phase-danger ml-1', className)}>
      {children}
    </Text>
  );
};

export const FormControlHelper = ({ children, className }: FormControlSlotProps) => (
  <View className={cn('mt-1', className)}>{children}</View>
);

export const FormControlHelperText = ({ children, className }: FormControlSlotProps) => {
  const { helperId } = React.useContext(FormControlContext);
  return (
    <Text nativeID={helperId} className={cn('text-xs text-phase-text-secondary', className)}>
      {children}
    </Text>
  );
};
