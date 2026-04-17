import React from 'react';
import { View, Text } from 'react-native';
import { Image } from '../image';
import { cssInterop } from 'nativewind';

cssInterop(View, { className: 'style' });
cssInterop(Text, { className: 'style' });

export const Avatar = ({ children, className, size = 'md' }: any) => {
  const sizeMap: Record<string, string> = {
    'xs': 'w-6 h-6',
    'sm': 'w-8 h-8',
    'md': 'w-10 h-10',
    'lg': 'w-12 h-12',
    'xl': 'w-16 h-16',
    '2xl': 'w-24 h-24',
  };

  return (
    <View {...({ className: `relative overflow-hidden rounded-full bg-phase-surface border border-phase-surface items-center justify-center ${sizeMap[size] || sizeMap.md} ${className || ''}` } as any)}>
      {children}
    </View>
  );
};

export const AvatarFallbackText = ({ children, className }: any) => (
  <Text {...({ className: `font-bold text-phase-text-primary ${className || ''}` } as any)}>{children}</Text>
);

export const AvatarImage = ({ source, className }: any) => (
  <Image source={source} className={`w-full h-full ${className || ''}`} resizeMode="cover" />
);

Avatar.displayName = 'Avatar';
AvatarFallbackText.displayName = 'AvatarFallbackText';
AvatarImage.displayName = 'AvatarImage';
