import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, ViewStyle } from 'react-native';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
} from 'react-native-reanimated';
import { useTheme } from '../hooks/useTheme';
import { Theme } from '../theme/Theme';

export interface SanctuaryProgressBarProps {
  percentage: number;        // 0â€“100
  isComplete?: boolean;      // true â†’ gold/reward state
  nextHint?: string;         // text shown below bar
  showPercentage?: boolean;  // default true
  compact?: boolean;         // 4px bar instead of 8px
  style?: ViewStyle;
}

export function SanctuaryProgressBar({
  percentage,
  isComplete = false,
  nextHint,
  showPercentage = true,
  compact = false,
  style,
}: SanctuaryProgressBarProps) {
  const { accent, glow, glass, text } = useTheme();

  // Animated.Value for fill width â€” useNativeDriver must be false (width interpolation)
  const fillAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fillAnim, {
      toValue: Math.min(100, Math.max(0, percentage)),
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  // Reanimated glow pulse when complete
  const glowOpacity = useSharedValue(0);
  useEffect(() => {
    if (isComplete) {
      glowOpacity.value = withSequence(
        withTiming(1, { duration: 400 }),
        withRepeat(
          withSequence(
            withTiming(0.3, { duration: 800 }),
            withTiming(1, { duration: 800 }),
          ),
          3,
          false,
        ),
        withTiming(0.6, { duration: 500 }),
      );
    } else {
      glowOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [isComplete]);

  const glowAnimStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const barColor = isComplete ? accent.reward : accent.action;
  const glowColor = isComplete ? glow.reward.color : glow.action.color;
  const barHeight = compact ? 4 : 8;

  return (
    <View style={[styles.container, style]}>
      {/* Header row: label + percentage */}
      {showPercentage && (
        <View style={styles.headerRow}>
          <Text style={[styles.label, { color: text.secondary }]}>
            Profile Completion
          </Text>
          <Text style={[styles.percentage, { color: isComplete ? accent.reward : text.primary }]}>
            {percentage}%
          </Text>
        </View>
      )}

      {/* Track */}
      <View style={[styles.track, { height: barHeight, backgroundColor: glass.surface.bg }]}>
        {/* Animated fill */}
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: barColor,
              width: fillAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
              borderRadius: barHeight / 2,
            },
          ]}
        />
        {/* Reanimated glow overlay on completion */}
        {isComplete && (
          <Reanimated.View
            style={[
              StyleSheet.absoluteFillObject,
              { backgroundColor: glowColor, borderRadius: barHeight / 2 },
              glowAnimStyle,
            ]}
          />
        )}
      </View>

      {/* Hint / complete text */}
      {!isComplete && nextHint ? (
        <Text style={[styles.hint, { color: text.secondary }]} numberOfLines={1}>
          {nextHint}
        </Text>
      ) : isComplete ? (
        <Text style={[styles.hint, { color: accent.reward }]}>
          ðŸŽ‰ Profile complete!
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Theme.spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  percentage: {
    fontSize: 13,
    fontWeight: '700',
  },
  track: {
    borderRadius: 4,
    overflow: 'hidden',
  },
  hint: {
    fontSize: 12,
    marginTop: Theme.spacing.xs,
  },
});

