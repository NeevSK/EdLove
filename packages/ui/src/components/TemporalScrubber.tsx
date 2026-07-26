import { useTemporalStore } from '@repo/core/logic';
import React from 'react';
import { Animated, Dimensions, PanResponder } from 'react-native';
import { Box, Text } from '@/gluestack';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCRUBBER_WIDTH = SCREEN_WIDTH * 0.8;

/**
 * TemporalScrubber
 *
 * A premium, gesture-based component for "sliding" through the user's journey.
 * Adheres to the "Breath-like Motion" and "Sanctuary Glass" principles.
 */
export const TemporalScrubber: React.FC = () => {
  const { viewDate, setViewDate, intensity, phase } = useTemporalStore();

  // Animation value for the scrubber handle
  const pan = React.useRef(new Animated.Value(0)).current;

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_e, gestureState) => {
        // Simple logic to change date based on swipe direction
        const today = new Date();
        if (gestureState.dx < -50) {
          // Swipe Left -> Past
          const currentDate = viewDate ? new Date(viewDate) : today;
          const pastDate = new Date(currentDate);
          pastDate.setDate(pastDate.getDate() - 1);
          setViewDate(pastDate.toISOString().split('T')[0]!);
        } else if (gestureState.dx > 50) {
          // Swipe Right -> Reset to Present
          setViewDate(today.toISOString().split('T')[0]!);
        }

        Animated.spring(pan, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      },
    }),
  ).current;

  const color = phase === 'past' ? '#968E80' : '#F6BF8C';

  return (
    <Box className="p-6 items-center justify-center">
      <Box
        className="h-1 rounded-full justify-center mb-4"
        style={{ width: SCRUBBER_WIDTH, backgroundColor: `${color}22` }}
      >
        <Animated.View
          {...panResponder.panHandlers}
          className="w-8 h-8 rounded-full absolute items-center justify-center shadow-lg"
          style={[
            {
              left: SCRUBBER_WIDTH / 2 - 16,
              transform: [{ translateX: pan }],
              backgroundColor: color,
              shadowColor: color,
              opacity: intensity,
            },
          ]}
        >
          <Box className="w-2 h-2 rounded-full bg-white/80" />
        </Animated.View>
      </Box>
      <Text className="text-[10px] font-bold tracking-[2px] opacity-80" style={{ color }}>
        {viewDate === new Date().toISOString().split('T')[0] ? 'LIVING PRESENT' : viewDate}
      </Text>
    </Box>
  );
};
