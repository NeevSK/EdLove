import { CircleCheck, RefreshCw, TriangleAlert } from '@repo/ui/icons';
import { HStack, Text } from '@repo/ui/primitives';

export interface SyncStatusCompactProps {
  /** Current queue length */
  queueLength: number;
  /** Current dead letter queue length */
  deadLetterLength: number;
  /** Whether sync is currently in progress */
  isSyncing: boolean;
}

/**
 * SyncStatusCompact
 *
 * Compact inline status indicator for tight spaces (headers, tabs).
 * Shows minimal status with icon + count.
 */
export function SyncStatusCompact({
  queueLength,
  deadLetterLength,
  isSyncing,
}: SyncStatusCompactProps) {
  const totalCount = queueLength + deadLetterLength;

  if (isSyncing) {
    return (
      <HStack className="gap-2 items-center min-w-[100px]">
        <RefreshCw className="text-phase-interactive animate-spin" size={16} />
        <Text className="text-[10px] font-bold text-phase-text-secondary">{totalCount}</Text>
      </HStack>
    );
  }

  if (deadLetterLength > 0) {
    return (
      <HStack className="gap-2 items-center min-w-[100px]">
        <TriangleAlert className="text-phase-danger" size={16} />
        <Text className="text-[10px] font-bold text-phase-text-secondary">{totalCount}</Text>
      </HStack>
    );
  }

  if (queueLength > 0) {
    return (
      <HStack className="gap-2 items-center min-w-[100px]">
        <RefreshCw className="text-phase-text-muted" size={16} />
        <Text className="text-[10px] font-bold text-phase-text-secondary">{totalCount}</Text>
      </HStack>
    );
  }

  return (
    <HStack className="gap-2 items-center min-w-[100px]">
      <CircleCheck className="text-phase-interactive" size={16} />
      <Text className="text-[10px] font-bold text-phase-text-secondary">{totalCount}</Text>
    </HStack>
  );
}
