import { RefreshCw } from '@repo/ui/icons';
import { HStack, Pressable, Text } from '@repo/ui/primitives';

export interface SyncStatusRetryButtonProps {
  /** Whether a retry is in progress */
  isRetrying: boolean;
  /** Handler for retry action */
  onRetry: () => void;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Custom accessibility label for retrying state */
  retryingLabel?: string;
  /** Custom accessibility label for idle state */
  idleLabel?: string;
  /** Custom accessibility hint describing the action's effect */
  retryHint?: string;
}

/**
 * SyncStatusRetryButton
 *
 * Accessible retry button for failed sync operations.
 * Handles loading state, disabled state, and proper accessibility.
 */
export function SyncStatusRetryButton({
  isRetrying,
  onRetry,
  disabled = false,
  retryingLabel = 'Retrying failed sync',
  idleLabel = 'Retry failed sync',
  retryHint = 'Attempts to sync queued changes again',
}: SyncStatusRetryButtonProps) {
  return (
    <Pressable
      onPress={onRetry}
      disabled={disabled || isRetrying}
      className="w-full p-2 rounded-xl bg-phase-interactive/10 border border-phase-interactive/20 active:opacity-70 min-h-[44px]"
      accessibilityRole="button"
      accessibilityLabel={isRetrying ? retryingLabel : idleLabel}
      accessibilityHint={retryHint}
    >
      <HStack className="gap-2 items-center justify-center">
        {isRetrying ? (
          <RefreshCw className="text-phase-interactive animate-spin" size={16} />
        ) : (
          <RefreshCw className="text-phase-interactive" size={16} />
        )}
        <Text className="text-sm font-bold text-phase-interactive">
          {isRetrying ? 'Retrying...' : 'Retry Failed'}
        </Text>
      </HStack>
    </Pressable>
  );
}
