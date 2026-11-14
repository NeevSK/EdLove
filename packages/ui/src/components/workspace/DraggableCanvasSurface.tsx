'use no memo';
import { hapticMedium } from '@repo/ui/utils/haptics';
import React from 'react';
import { StyleSheet } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
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

  // The native recognizer waits for the hold, so ordinary scrolling and child taps
  // do not compete with an already-active pan whose updates are merely ignored.
  const dragGesture = usePanGesture({
    enabled,
    activateAfterLongPress: 260,
    onActivate: () => {
      'worklet';
      isDragging.set(true);
      scale.set(withSpring(1.025, { damping: 14, stiffness: 180 }));
      zIndex.set(100);
      shadowOpacity.set(withTiming(0.25, { duration: 150 }));
      shadowRadius.set(withTiming(16, { duration: 150 }));
      scheduleOnRN(hapticMedium);
      if (onDragStart) scheduleOnRN(onDragStart);
    },
    onUpdate: (event) => {
      'worklet';
      if (!isDragging.value) return;
      const translation = resolveDragTranslation(dragAxis, {
        x: event.translationX,
        y: event.translationY,
      });
      translateX.set(translation.x);
      translateY.set(translation.y);
    },
    onDeactivate: (event) => {
      'worklet';
      if (!event.canceled && isDragging.value && onDragEnd) {
        scheduleOnRN(onDragEnd, id, { x: translateX.value, y: translateY.value });
      }
    },
    onFinalize: () => {
      'worklet';
      isDragging.set(false);
      translateX.set(withSpring(0, { damping: 18, stiffness: 220 }));
      translateY.set(withSpring(0, { damping: 18, stiffness: 220 }));
      scale.set(withSpring(1, { damping: 18, stiffness: 220 }));
      zIndex.set(withTiming(1, { duration: 150 }));
      shadowOpacity.set(withTiming(0, { duration: 150 }));
      shadowRadius.set(withTiming(0, { duration: 150 }));
    },
  });

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
    <GestureDetector gesture={dragGesture}>
      <Animated.View style={[styles.wrapper, animatedStyle]}>{children}</Animated.View>
    </GestureDetector>
  );
};
