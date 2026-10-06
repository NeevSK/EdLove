import { tokens } from '@repo/ui/tokens';
import { cn } from '@repo/ui/utils/classNames';
import React from 'react';
import { Platform, Pressable, StyleSheet, type View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

/**
 * Overlay (Backdrop)
 *
 * A hardened primitive for backdrops.
 * Blocks interactions and provides a dimming layer.
 */
export const Overlay = React.forwardRef<any, any>(
  ({ className, isOpen, onPress, onClick, ...props }, ref) => {
    if (!isOpen) return null;

    const handlePress = (e: any) => {
      onPress?.(e);
      onClick?.(e);
    };

    if (Platform.OS === 'web') {
      return (
        <Pressable
          {...props}
          ref={ref as any}
          onPress={handlePress}
          accessibilityRole="button"
          accessibilityLabel="backdrop"
          className={className}
          style={[
            {
              position: 'fixed' as any,
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1000,
              backgroundColor: tokens.colors.overlay,
              cursor: 'pointer',
            },
            props.style,
          ]}
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
          ref={ref as any}
          onPress={handlePress}
          accessibilityRole="button"
          accessibilityLabel="backdrop"
          accessibilityHint="Double tap to dismiss"
          className={cn('flex-1', className)}
          style={{ backgroundColor: tokens.colors.overlayFallback }}
        />
      </Animated.View>
    );
  },
);

Overlay.displayName = 'Overlay';
