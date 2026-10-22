import { useTemporalStore } from '@repo/core/logic';
import { Box, Text } from '@repo/ui/primitives';
import React from 'react';
import { useWindowDimensions } from 'react-native';
import {
  Gesture,
  GestureDetector,
  type GestureStateChangeEvent,
  type GestureUpdateEvent,
  type PanGestureChangeEventPayload,
  type PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

/**
 * TemporalScrubber
 *
 * A premium, gesture-based component for "sliding" through the user's journey.
 * Adheres to the "Breath-like Motion" and "Sanctuary Glass" principles.
 */
export const TemporalScrubber: React.FC = () => {
  const { viewDate, setViewDate, intensity, phase } = useTemporalStore();
  const { width } = useWindowDimensions();
  const scrubberWidth = width * 0.8;

  const pan = useSharedValue(0);

  const commitSwipe = React.useCallback(
    (translationX: number) => {
      const today = new Date();
      if (translationX < -50) {
        const currentDate = viewDate ? new Date(viewDate) : today;
        currentDate.setDate(currentDate.getDate() - 1);
        scheduleOnRN(setViewDate, currentDate.toISOString().split('T')[0]!);
      } else if (translationX > 50) {
        scheduleOnRN(setViewDate, today.toISOString().split('T')[0]!);
      }
    },
    [setViewDate, viewDate],
  );

  const panGesture = React.useMemo(
    () =>
      Gesture.Pan()
        .minDistance(8)
        .maxPointers(1)
        .onUpdate(
          (event: GestureUpdateEvent<PanGestureHandlerEventPayload & PanGestureChangeEventPayload>) => {
            'worklet';
            pan.value = event.translationX;
          },
        )
        .onEnd((_event: GestureStateChangeEvent<PanGestureHandlerEventPayload>, success: boolean) => {
          'worklet';
          if (success && Math.abs(pan.value) > 50) {
            scheduleOnRN(commitSwipe, pan.value);
          }
          pan.value = withSpring(0);
        })
        .onFinalize(() => {
          'worklet';
          pan.value = withSpring(0);
        }),
    [commitSwipe, pan],
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pan.value }],
  }));

  const color = phase === 'past' ? '#968E80' : '#F6BF8C';
  const todayKey = new Date().toISOString().split('T')[0];

  return (
    <Box className="p-6 items-center justify-center">
      <Box
        className="h-1 rounded-full justify-center mb-4"
        style={{ width: scrubberWidth, backgroundColor: `${color}22` }}
      >
        <GestureDetector gesture={panGesture}>
          <Animated.View
            className="w-8 h-8 rounded-full absolute items-center justify-center shadow-lg"
            style={[
              animatedStyle,
              {
                left: scrubberWidth / 2 - 16,
                backgroundColor: color,
                shadowColor: color,
                opacity: intensity,
              },
            ]}
          >
            <Box className="w-2 h-2 rounded-full bg-white/80" />
          </Animated.View>
        </GestureDetector>
      </Box>
      <Text className="text-[10px] font-bold tracking-[2px] opacity-80" style={{ color }}>
        {viewDate === todayKey ? 'LIVING PRESENT' : viewDate}
      </Text>
    </Box>
  );
};
