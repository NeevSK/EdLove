import { HStack, Text } from '@repo/ui/primitives';

export interface SyncStatusStatsProps {
  /** Number of items in the sync queue */
  queueLength: number;
  /** Number of items in the dead letter queue */
  deadLetterLength: number;
}

/**
 * SyncStatusStats
 *
 * Displays sync queue statistics in a compact row layout.
 * Shows queue length and dead letter count with appropriate styling.
 */
export function SyncStatusStats({ queueLength, deadLetterLength }: SyncStatusStatsProps) {
  return (
    <HStack className="gap-1">
      <HStack className="justify-between text-xs">
        <Text className="text-phase-text-secondary">Queue</Text>
        <Text className="font-bold text-phase-text-primary">{queueLength}</Text>
      </HStack>
      <HStack className="justify-between text-xs">
        <Text className="text-phase-text-secondary">Dead Letter</Text>
        <Text
          className={
            deadLetterLength > 0
              ? 'font-bold text-phase-danger'
              : 'font-bold text-phase-text-secondary'
          }
        >
          {deadLetterLength}
        </Text>
      </HStack>
    </HStack>
  );
}
