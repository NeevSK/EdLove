/* eslint-disable */
/* oxlint-disable */
'use no memo';
import type React from 'react';
import { StyleSheet } from 'react-native';
import {
  GestureDetector,
  useLongPressGesture,
  usePanGesture,
  useSimultaneousGestures,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { runOnJS } from 'react-native-worklets';
import { hapticMedium } from '@repo/ui/utils/haptics';
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

  const longPressGesture = useLongPressGesture({
    minDuration: 300,
    onActivate: () => {
      'worklet';
      isDragging.value = true;
      scale.value = withSpring(1.05);
      zIndex.value = 100;
      shadowOpacity.value = withTiming(0.3);
      shadowRadius.value = withTiming(20);
      runOnJS(hapticMedium)();
      if (onDragStart) runOnJS(onDragStart)();
    },
  });

  const dragGesture = usePanGesture({
    onUpdate: (event) => {
      'worklet';
      if (!isDragging.value) return;
      const translation = resolveDragTranslation(dragAxis, {
        x: event.translationX,
        y: event.translationY,
      });
      translateX.value = translation.x;
      translateY.value = translation.y;
    },
    onDeactivate: (event) => {
      'worklet';
      if (!isDragging.value) return;

      if (!event.canceled && onDragEnd) {
        runOnJS(onDragEnd)(id, { x: translateX.value, y: translateY.value });
      }

      // Snap back animation
      isDragging.value = false;
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      scale.value = withSpring(1);
      zIndex.value = withTiming(1);
      shadowOpacity.value = withTiming(0);
      shadowRadius.value = withTiming(0);
    },
  });

  // Combine gestures using v3 hook API
  const composed = useSimultaneousGestures(longPressGesture, dragGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    zIndex: zIndex.value,
    shadowOpacity: shadowOpacity.value,
    shadowRadius: shadowRadius.value,
    elevation: isDragging.value ? 10 : 0,
  }));

  if (!enabled) return children;

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[styles.wrapper, animatedStyle]}>{children}</Animated.View>
    </GestureDetector>
  );
};

