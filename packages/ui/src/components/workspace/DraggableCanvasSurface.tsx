/* eslint-disable */
/* oxlint-disable */
'use no memo';
import { hapticMedium } from '@repo/ui/utils/haptics';
import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import {
  Gesture,
  GestureDetector,
  type GestureStateChangeEvent,
  type GestureUpdateEvent,
  type PanGestureChangeEventPayload,
  type PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { resolveDragTranslation } from './reorder';

interface DraggableCanvasSurfaceProps {
  children: React.ReactNode;
  id: string;
  dragAxis?: 'vertical' | 'both';
  enabled?: boolean;
  onDragStart?: () => void;
  onDragEnd?: (id: string, translation: { x: number; y: number }) => void;
}

export { resolveDragTranslation } from './reorder';

/**
 * DRAGGABLE CANVAS SURFACE
 *
 * A universal, high-fidelity wrapper for workspace surfaces.
 * Uses Reanimated 4 and Gesture Handler v3 for 60FPS fluid rearrangement.
 * Migrated to hook-based API for better TypeScript support and performance.
 */
const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
});

export const DraggableCanvasSurface: React.FC<DraggableCanvasSurfaceProps> = ({
  children,
  id,
  dragAxis = 'both',
  enabled = true,
  onDragStart,
  onDragEnd,
}) => {
  'use no memo';
  const isDragging = useSharedValue(false);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const zIndex = useSharedValue(1);
  const shadowOpacity = useSharedValue(0);
  const shadowRadius = useSharedValue(0);

  const longPressGesture = useMemo(
    () =>
      Gesture.LongPress()
        .minDuration(260)
        .onStart(() => {
          'worklet';
          isDragging.value = true;
          scale.value = withSpring(1.025, { damping: 14, stiffness: 180 });
          zIndex.value = 100;
          shadowOpacity.value = withTiming(0.25, { duration: 150 });
          shadowRadius.value = withTiming(16, { duration: 150 });
          scheduleOnRN(hapticMedium);
          if (onDragStart) scheduleOnRN(onDragStart);
        }),
    [isDragging, onDragStart, scale, shadowOpacity, shadowRadius, zIndex],
  );

  const dragGesture = useMemo(
    () =>
      Gesture.Pan()
        .onUpdate(
          (event: GestureUpdateEvent<PanGestureHandlerEventPayload & PanGestureChangeEventPayload>) => {
            'worklet';
            if (!isDragging.value) return;
            const translation = resolveDragTranslation(dragAxis, {
              x: event.translationX,
              y: event.translationY,
            });
            translateX.value = translation.x;
            translateY.value = translation.y;
          },
        )
        .onEnd((_event: GestureStateChangeEvent<PanGestureHandlerEventPayload>, success: boolean) => {
          'worklet';
          if (!isDragging.value) return;

          if (success && onDragEnd) {
            scheduleOnRN(onDragEnd, id, { x: translateX.value, y: translateY.value });
          }

          // Snap back animation
          isDragging.value = false;
          translateX.value = withSpring(0, { damping: 18, stiffness: 220 });
          translateY.value = withSpring(0, { damping: 18, stiffness: 220 });
          scale.value = withSpring(1, { damping: 18, stiffness: 220 });
          zIndex.value = withTiming(1, { duration: 150 });
          shadowOpacity.value = withTiming(0, { duration: 150 });
          shadowRadius.value = withTiming(0, { duration: 150 });
        }),
    [
      dragAxis,
      id,
      isDragging,
      onDragEnd,
      scale,
      shadowOpacity,
      shadowRadius,
      translateX,
      translateY,
      zIndex,
    ],
  );

  // Combine gestures using v3 hook API
  const composed = useMemo(
    () => Gesture.Simultaneous(longPressGesture, dragGesture),
    [longPressGesture, dragGesture],
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    zIndex: zIndex.value,
    shadowOpacity: shadowOpacity.value,
    shadowRadius: shadowRadius.value,
    elevation: isDragging.value ? 8 : 0,
  }));

  if (!enabled) return children;

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[styles.wrapper, animatedStyle]}>{children}</Animated.View>
    </GestureDetector>
  );
};
