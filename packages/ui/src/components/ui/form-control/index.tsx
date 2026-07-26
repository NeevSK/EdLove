import React from 'react';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { VStack } from '@/components/ui/vstack';

const FormControlContext = React.createContext<{
  id?: string;
  isInvalid?: boolean;
  isDisabled?: boolean;
}>({});

export const FormControl = ({ children, isInvalid, isDisabled, className, id: idProp }: any) => {
  const generatedId = React.useId();
  const id = idProp || generatedId;

  return (
    <FormControlContext.Provider value={{ id, isInvalid, isDisabled }}>
      <VStack space="xs" className={className}>
        {children}
      </VStack>
    </FormControlContext.Provider>
  );
};

export const useFormControlContext = () => React.useContext(FormControlContext);

export const FormControlLabel = ({ children, className }: any) => (
  <View className={`mb-1 ${className || ''}`}>{children}</View>
);

export const FormControlLabelText = ({ children, className }: any) => {
  const { id } = React.useContext(FormControlContext);
  return (
    <Text
      nativeID={`${id}-label`}
      className={`text-sm font-medium text-phase-text-primary ${className || ''}`}
    >
      {children}
    </Text>
  );
};

export const FormControlError = ({ children, className }: any) => (
  <View className={`flex-row items-center mt-1 ${className || ''}`}>{children}</View>
);

export const FormControlErrorIcon = ({ as: Icon, className, ...props }: any) => {
  if (!Icon) return null;
  return <Icon {...props} size={14} className={`text-phase-danger ${className || ''}`} />;
};

export const FormControlErrorText = ({ children, className }: any) => {
  const { id } = React.useContext(FormControlContext);
  return (
    <Text nativeID={`${id}-error`} className={`text-xs text-phase-danger ml-1 ${className || ''}`}>
      {children}
    </Text>
  );
};

export const FormControlHelper = ({ children, className }: any) => (
  <View className={`mt-1 ${className || ''}`}>{children}</View>
);

export const FormControlHelperText = ({ children, className }: any) => (
  <Text className={`text-xs text-phase-text-secondary ${className || ''}`}>{children}</Text>
);
