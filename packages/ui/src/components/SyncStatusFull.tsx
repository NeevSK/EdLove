import { CircleCheck, RefreshCw, TriangleAlert } from '@repo/ui/icons';
import { Box, HStack, Text, VStack } from '@repo/ui/primitives';
import { SyncStatusRetryButton } from './SyncStatusRetryButton';
import { SyncStatusStats } from './SyncStatusStats';

export interface SyncStatusFullProps {
  queueLength: number;
  deadLetterLength: number;
  isSyncing: boolean;
  isRetrying: boolean;
  onRetry: () => void;
}

export function SyncStatusFull({
  queueLength,
  deadLetterLength,
  isSyncing,
  isRetrying,
  onRetry,
}: SyncStatusFullProps) {
  // Determine which icon to show
  let statusIcon;
  if (isSyncing) {
    statusIcon = <RefreshCw className="text-phase-interactive animate-spin" size={20} />;
  } else if (deadLetterLength > 0) {
    statusIcon = <TriangleAlert className="text-phase-danger" size={20} />;
  } else if (queueLength > 0) {
    statusIcon = <RefreshCw className="text-phase-text-muted" size={20} />;
  } else {
    statusIcon = <CircleCheck className="text-phase-interactive" size={20} />;
  }

  // Determine status text
  let statusText;
  if (isSyncing) {
    statusText = 'Syncing...';
  } else if (deadLetterLength > 0) {
    statusText = 'Sync Issues';
  } else if (queueLength > 0) {
    statusText = 'Pending Sync';
  } else {
    statusText = 'All Synced';
  }

  return (
    <VStack className="gap-3">
      {/* Status Header */}
      <HStack className="gap-2 items-center justify-between">
        <HStack className="gap-2 items-center">{statusIcon}</HStack>
        <Text className="text-sm font-bold text-phase-text-primary">{statusText}</Text>
      </HStack>

      {/* Stats Row */}
      <VStack className="gap-1">
        <SyncStatusStats queueLength={queueLength} deadLetterLength={deadLetterLength} />
      </VStack>

      {/* Retry Button (conditional) */}
      {deadLetterLength > 0 && (
        <Box className="mt-2 gap-2">
          <SyncStatusRetryButton isRetrying={isRetrying} onRetry={onRetry} />
        </Box>
      )}
    </VStack>
  );
}
