import React from 'react';
import type { View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Pressable } from '../view';

/**
 * Overlay (Backdrop)
 *
 * A hardened primitive for backdrops.
 * Blocks interactions and provides a dimming layer.
 */
export const Overlay = React.forwardRef<View, any>(({ className, isOpen, ...props }, ref) => {
  if (!isOpen) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
      }}
    >
      <Pressable
        {...props}
        ref={ref}
        accessibilityLabel="backdrop"
        className={`flex-1 bg-ink/60 ${className || ''}`}
      />
    </Animated.View>
  );
});

Overlay.displayName = 'Overlay';
