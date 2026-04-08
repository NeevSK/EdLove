import React from 'react';
import { View } from '../view';
import { Text } from '../text';
import { VStack } from '../vstack';

/**
 * FormControl
 * 
 * Hardened primitive for form structures.
 * Provides label and error state management.
 */

export const FormControl = ({ children, isInvalid, isDisabled, className }: any) => (
  <VStack space="xs" className={className}>{children}</VStack>
);

export const FormControlLabel = ({ children, className }: any) => (
  <View className={`mb-1 ${className || ''}`}>{children}</View>
);

export const FormControlLabelText = ({ children, className }: any) => (
  <Text className={`text-sm font-medium text-phase-text-primary ${className || ''}`}>{children}</Text>
);

export const FormControlError = ({ children, className }: any) => (
  <View className={`flex-row items-center mt-1 ${className || ''}`}>{children}</View>
);

export const FormControlErrorIcon = ({ as: Icon, className, ...props }: any) => {
  if (!Icon) return null;
  return <Icon {...props} size={14} className={`text-phase-danger ${className || ''}`} />;
};

export const FormControlErrorText = ({ children, className }: any) => (
  <Text className={`text-xs text-phase-danger ml-1 ${className || ''}`}>{children}</Text>
);

export const FormControlHelper = ({ children, className }: any) => (
  <View className={`mt-1 ${className || ''}`}>{children}</View>
);

export const FormControlHelperText = ({ children, className }: any) => (
  <Text className={`text-xs text-phase-text-secondary ${className || ''}`}>{children}</Text>
);
