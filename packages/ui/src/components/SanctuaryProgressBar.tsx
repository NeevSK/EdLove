import { StyleSheet, type ViewStyle } from 'react-native';
import { EaseView } from 'react-native-ease';
import { Box, HStack, VStack } from '@/gluestack';
import { Text } from '@/primitives';

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
  const barHeight = compact ? 4 : 8;

  return (
    <VStack className="py-2 gap-2" style={style}>
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

      <Box
        className="bg-phase-surface/30 rounded-full overflow-hidden"
        style={{ height: barHeight }}
      >
        <EaseView
          animate={{ scaleX: Math.min(100, Math.max(0, percentage)) / 100 }}
          transition={{ type: 'timing', duration: 600 }}
          transformOrigin={{ x: 0, y: 0.5 }}
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: isComplete ? '#10B981' : '#F6BF8C',
              borderRadius: barHeight / 2,
            },
          ]}
        />
        {isComplete && (
          <EaseView
            initialAnimate={{ opacity: 0.3 }}
            animate={{ opacity: 0.7 }}
            transition={{ type: 'timing', duration: 800, loop: 'reverse' }}
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: 'rgba(16, 185, 129, 0.3)',
                borderRadius: barHeight / 2,
              },
            ]}
          />
        )}
      </Box>

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
