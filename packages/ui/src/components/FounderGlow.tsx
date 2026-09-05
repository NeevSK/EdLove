import { LivingGlow } from '@repo/ui/components/LivingGlow';
import { View } from '@repo/ui/primitives';
import type React from 'react';
import type { ViewStyle } from 'react-native';

interface FounderGlowProps {
  children: React.ReactNode;
  active?: boolean;
  intensity?: 'subtle' | 'medium' | 'high';
  style?: ViewStyle;
  className?: string;
}

/**
 * FounderGlow - A specialized "Sanctuary" effect for Founder-exclusive focal points.
 *
 * It wraps content in a LivingGlow with the canonical Sanctuary Saffron hue.
 */
export function FounderGlow({
  children,
  active = true,
  intensity = 'medium',
  style,
  className,
}: FounderGlowProps) {
  const sizeMap = {
    subtle: 8,
    medium: 16,
    high: 32,
  } as const;

  return (
    <View style={[{ position: 'relative' }, style]} className={className}>
      <LivingGlow
        active={active}
        glowColor="rgba(255, 166, 0, 0.4)"
        size={sizeMap[intensity]}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
        }}
      />
      {children}
    </View>
  );
}
