import React from 'react';
import { Switch as RNSwitch, Platform } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

/**
 * Switch Component
 *
 * Hardened primitive for boolean inputs.
 * Uses native Switch with phase-aware colors.
 */
export const Switch = ({ value, onValueChange, isDisabled, className, ...props }: any) => {
  const { accent } = useTheme();

  // Default phase colors if theme hook not available or during hydration
  const activeColor = accent?.action || '#D4843A';
  const trackColor = Platform.OS === 'ios' ? '#E9E9EA' : '#ccc';

  return (
    <RNSwitch
      value={value}
      onValueChange={onValueChange}
      disabled={isDisabled}
      trackColor={{
        false: trackColor,
        true: activeColor,
      }}
      thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : value ? '#FFFFFF' : '#f4f3f4'}
      ios_backgroundColor={trackColor}
      className={`${className || ''}`}
      {...props}
    />
  );
};
