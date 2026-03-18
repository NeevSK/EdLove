import React from 'react';
import { StyleSheet, View, Text, PanResponder, Animated, Dimensions } from 'react-native';
import { useResonanceStore } from '@repo/core';
import { Theme } from '../theme/Theme';



const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCRUBBER_WIDTH = SCREEN_WIDTH * 0.8;

/**
 * TemporalScrubber
 * 
 * A premium, gesture-based component for "sliding" through the user's journey.
 * Adheres to the "Breath-like Motion" and "Sanctuary Glass" principles.
 */
export const TemporalScrubber: React.FC = () => {
  const { resonanceDate, setResonanceDate, intensity, phase } = useResonanceStore();
  
  // Animation value for the scrubber handle
  const pan = React.useRef(new Animated.Value(0)).current;

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan }], { useNativeDriver: false }),
      onPanResponderRelease: (e, gestureState) => {
        // Simple logic to change date based on swipe direction
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        if (gestureState.dx < -50) {
          // Swipe Left -> Past
          setResonanceDate(pastDate.toISOString().split('T')[0]!);
        } else if (gestureState.dx > 50) {
          // Swipe Right -> Reset to Present
          setResonanceDate(today.toISOString().split('T')[0]!);
        }



        
        Animated.spring(pan, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  const color = phase === 'past' ? '#968E80' : '#F6BF8C';

  return (
    <View style={styles.container}>
      <View style={[styles.track, { backgroundColor: `${color}22` }]}>
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.handle,
            {
              transform: [{ translateX: pan }],
              backgroundColor: color,
              shadowColor: color,
              opacity: intensity,
            },
          ]}
        >
          <View style={styles.handleInner} />
        </Animated.View>
      </View>
      <Text style={[styles.label, { color }]}>
        {resonanceDate === new Date().toISOString().split('T')[0] ? 'LIVING PRESENT' : resonanceDate}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: {
    width: SCRUBBER_WIDTH,
    height: 4,
    borderRadius: 2,
    justifyContent: 'center',
    marginBottom: 16,
  },
  handle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    position: 'absolute',
    left: SCRUBBER_WIDTH / 2 - 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  handleInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    opacity: 0.8,
  },
});
