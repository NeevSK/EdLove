/* eslint-disable */
/* oxlint-disable */
'use no memo';
import type React from 'react';
import { StyleSheet } from 'react-native';
import type {
  LongPressGestureEvent,
} from 'react-native-gesture-handler';
import {
  GestureDetector,
  GestureHandlerRootView,
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
  container: {
    // We don't want the root view to block layout
  },
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

  const longPressGesture = useLongPressGesture({
    minDuration: 300,
    onActivate: () => {
      'worklet';
      isDragging.value = true;
      scale.value = withSpring(1.05);
      zIndex.value = 100;
      if (onDragStart) runOnJS(onDragStart)();
    },
  });

  const dragGesture = usePanGesture({
    manualActivation: true,
    onUpdate: (event) => {
      'worklet';
      if (!isDragging.value) return;
      // @ts-ignore - translationX/translationY exist in runtime but type definition is incomplete
      const translation = resolveDragTranslation(dragAxis, {
        // @ts-ignore - translationX/translationY exist in runtime but type definition is incomplete
        x: event.translationX,
        // @ts-ignore - translationX/translationY exist in runtime but type definition is incomplete
        y: event.translationY,
      });
      translateX.value = translation.x;
      translateY.value = translation.y;
    },
    onDeactivate: () => {
      'worklet';
      if (!isDragging.value) return;

      if (onDragEnd) {
        runOnJS(onDragEnd)(id, { x: translateX.value, y: translateY.value });
      }

      // Snap back animation
      isDragging.value = false;
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      scale.value = withSpring(1);
      zIndex.value = withTiming(1);
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
    shadowOpacity: withSpring(isDragging.value ? 0.3 : 0),
    shadowRadius: withSpring(isDragging.value ? 20 : 0),
    elevation: isDragging.value ? 10 : 0,
  }));

  return (
    <GestureHandlerRootView style={styles.container}>
      {enabled ? (
        <GestureDetector gesture={composed}>
          <Animated.View style={[styles.wrapper, animatedStyle]}>{children}</Animated.View>
        </GestureDetector>
      ) : (
        children
      )}
    </GestureHandlerRootView>
  );
};

