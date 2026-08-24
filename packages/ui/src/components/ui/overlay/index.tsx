import { Pressable } from '@repo/ui/components/ui/view';
import { tokens } from '@repo/ui/tokens';
import React from 'react';
import { Platform, type View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

/**
 * Overlay (Backdrop)
 *
 * A hardened primitive for backdrops.
 * Blocks interactions and provides a dimming layer.
 */
export const Overlay = React.forwardRef<View, any>(({ className, isOpen, ...props }, ref) => {
  if (!isOpen) return null;

  if (Platform.OS === 'web') {
    return (
      <div
        {...props}
        ref={ref as any}
        role="button"
        aria-label="backdrop"
        className={className}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1000,
          backgroundColor: 'rgba(26, 22, 16, 0.82)',
          backdropFilter: 'blur(4px) saturate(1.1)',
          WebkitBackdropFilter: 'blur(4px) saturate(1.1)',
          cursor: 'pointer',
        }}
      />
    );
  }

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
        accessibilityRole="button"
        accessibilityLabel="backdrop"
        accessibilityHint="Double tap to dismiss"
        className={`flex-1 ${className || ''}`}
        style={{ backgroundColor: tokens.colors.overlayFallback }}
      />
    </Animated.View>
  );
});

Overlay.displayName = 'Overlay';
