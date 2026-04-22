import React from 'react';
import { View, Pressable } from '../view';
import { Text } from '../text';

export const RadioGroup = ({ children, className }: any) => (
  <View accessibilityRole="radiogroup" className={`gap-2 ${className || ''}`}>
    {children}
  </View>
);

export const Radio = ({ children, isChecked, onPress, className }: any) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="radio"
    accessibilityState={{ checked: !!isChecked }}
    className={`flex-row items-center gap-2 ${className || ''}`}
  >
    {children}
  </Pressable>
);

export const RadioIndicator = ({ isChecked, className }: any) => (
  <View
    className={`w-5 h-5 rounded-full border-2 border-phase-accent items-center justify-center ${className || ''}`}
  >
    {isChecked && <View className="w-2.5 h-2.5 rounded-full bg-phase-accent" />}
  </View>
);

export const RadioLabel = ({ children, className }: any) => (
  <Text className={`text-phase-text-primary ${className || ''}`}>{children}</Text>
);

export const RadioIcon = ({ as: Icon, className, ...props }: any) => {
  if (!Icon) return null;
  return <Icon {...props} className={`text-phase-accent ${className || ''}`} />;
};

RadioGroup.displayName = 'RadioGroup';
Radio.displayName = 'Radio';
RadioIndicator.displayName = 'RadioIndicator';
RadioLabel.displayName = 'RadioLabel';
RadioIcon.displayName = 'RadioIcon';
