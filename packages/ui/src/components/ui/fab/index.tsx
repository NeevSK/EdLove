import React from 'react';
import { Pressable } from '../view';
import { Text } from '../text';

export const Fab = ({ children, className, onPress, placement = 'bottom-right' }: any) => {
  const placementMap: Record<string, string> = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  return (
    <Pressable onPress={onPress} className={`absolute z-30 p-4 rounded-full bg-phase-accent shadow-lg active:opacity-80 items-center justify-center ${placementMap[placement] || placementMap['bottom-right']} ${className || ''}`}>
      {children}
    </Pressable>
  );
};

export const FabLabel = ({ children, className }: any) => (
  <Text className={`font-bold text-sacredWhite ${className || ''}`}>{children}</Text>
);

export const FabIcon = ({ as: Icon, className, ...props }: any) => {
  if (!Icon) return null;
  return <Icon {...props} className={`text-sacredWhite ${className || ''}`} />;
};

Fab.displayName = 'Fab';
FabLabel.displayName = 'FabLabel';
FabIcon.displayName = 'FabIcon';
