import React from 'react';
import { Platform, type View } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Pressable } from '@repo/ui/components/ui/view';
import { tokens } from '@repo/ui/tokens';

/**
 * Overlay (Backdrop)
 *
 * A hardened primitive for backdrops.
 * Blocks interactions and provides a dimming layer.
 */
export const Overlay = React.forwardRef<View, any>(
  ({ className, isOpen, blur = true, ...props }, ref) => {
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
      {Platform.OS !== 'web' && blur ? (
        <BlurView
          intensity={tokens.performance.maxBlurRadius}
          tint="dark"
          style={{ flex: 1, backgroundColor: tokens.colors.overlay }}
        >
          <Pressable
            {...props}
            ref={ref}
            accessibilityRole="button"
            accessibilityLabel="backdrop"
            accessibilityHint="Double tap to dismiss"
            className={`flex-1 ${className || ''}`}
          />
        </BlurView>
      ) : (
        <Pressable
          {...props}
          ref={ref}
          accessibilityRole="button"
          accessibilityLabel="backdrop"
          accessibilityHint="Double tap to dismiss"
          className={`flex-1 ${className || ''}`}
          style={Platform.OS === 'web' ? ({ backgroundColor: tokens.colors.overlay, backdropFilter: blur ? 'blur(8px)' : undefined } as any) : { backgroundColor: tokens.colors.overlayFallback }}
        />
      )}
    </Animated.View>
  );
  },
);

Overlay.displayName = 'Overlay';
