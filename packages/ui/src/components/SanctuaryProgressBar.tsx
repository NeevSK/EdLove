import { useEffect, useRef } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import { Text } from '../primitives';
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Box, HStack, VStack } from '../gluestack';

export interface SanctuaryProgressBarProps {
  percentage: number; // 0–100
  isComplete?: boolean; // true — gold/reward state
  nextHint?: string; // text shown below bar
  showPercentage?: boolean; // default true
  compact?: boolean; // 4px bar instead of 8px
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
  const fillWidth = useSharedValue(0);

  useEffect(() => {
    fillWidth.value = withTiming(Math.min(100, Math.max(0, percentage)), { duration: 600 });
  }, [percentage, fillWidth]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${fillWidth.value}%`,
  }));

  // Reanimated glow pulse when complete
  const glowOpacity = useSharedValue(0);
  useEffect(() => {
    if (isComplete) {
      glowOpacity.value = withSequence(
        withTiming(1, { duration: 400 }),
        withRepeat(
          withSequence(withTiming(0.3, { duration: 800 }), withTiming(1, { duration: 800 })),
          3,
          false,
        ),
        withTiming(0.6, { duration: 500 }),
      );
    } else {
      glowOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [isComplete, glowOpacity]);

  const glowAnimStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const barHeight = compact ? 4 : 8;

  return (
    <VStack className="py-2 gap-2" style={style}>
      {/* Header row: label + percentage */}
      {showPercentage && (
        <HStack className="justify-between items-center mb-1">
          <Text className="text-[11px] font-semibold uppercase tracking-wider text-phase-text-secondary">
            Profile Completion
          </Text>
          <Text
            className={`text-[13px] font-bold ${isComplete ? 'text-phase-reward' : 'text-phase-text-primary'}`}
          >
            {percentage}%
          </Text>
        </HStack>
      )}

      {/* Track */}
      <Box
        className="bg-phase-surface/30 rounded-full overflow-hidden"
        style={{ height: barHeight }}
      >
        {/* Animated fill */}
        <Reanimated.View
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: isComplete ? '#10B981' : '#F6BF8C', // phase-reward : phase-accent
              borderRadius: barHeight / 2,
            },
            fillStyle,
          ]}
        />
        {/* Reanimated glow overlay on completion */}
        {isComplete && (
          <Reanimated.View
            style={[
              StyleSheet.absoluteFillObject,
              {
                backgroundColor: 'rgba(16, 185, 129, 0.3)',
                borderRadius: barHeight / 2,
              },
              glowAnimStyle,
            ]}
          />
        )}
      </Box>

      {/* Hint / complete text */}
      {!isComplete && nextHint ? (
        <Text className="text-[12px] text-phase-text-secondary" numberOfLines={1}>
          {nextHint}
        </Text>
      ) : isComplete ? (
        <Text className="text-[12px] text-phase-reward">🏅 Profile complete!</Text>
      ) : null}
    </VStack>
  );
}
