/* eslint-disable */
/* oxlint-disable */
'use no memo';
import type React from 'react';
import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { runOnJS } from 'react-native-worklets';

interface DraggableCanvasSurfaceProps {
  children: React.ReactNode;
  id: string;
  onDragStart?: () => void;
  onDragEnd?: (id: string, translation: { x: number; y: number }) => void;
}

/**
 * DRAGGABLE CANVAS SURFACE
 *
 * A universal, high-fidelity wrapper for workspace surfaces.
 * Uses Reanimated 4 and Gesture Handler for 60FPS fluid rearrangement.
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
  onDragStart,
  onDragEnd,
}) => {
  'use no memo';
  const isDragging = useSharedValue(false);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const zIndex = useSharedValue(1);

  const longPressGesture = Gesture.LongPress()
    .minDuration(300)
    .onStart(() => {
      isDragging.value = true;
      scale.value = withSpring(1.05);
      zIndex.value = 100;
      if (onDragStart) runOnJS(onDragStart)();
    });

  const dragGesture = Gesture.Pan()
    .manualActivation(true)
    .onUpdate((event: any) => {
      if (!isDragging.value) return;
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd(() => {
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
    });

  // Combine gestures
  const composed = Gesture.Simultaneous(longPressGesture, dragGesture);

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
      <GestureDetector gesture={composed}>
        <Animated.View style={[styles.wrapper, animatedStyle]}>{children}</Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

