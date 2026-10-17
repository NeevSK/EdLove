import { Box, Pressable, Text } from '@repo/ui/primitives';
import { tokens } from '@repo/ui/tokens';

export interface WorkspaceLayoutRecoveryNoticeProps {
  error: Error | null;
  isRetrying: boolean;
  retryError: string;
  onRetry: () => void;
}

export function WorkspaceLayoutRecoveryNotice({
  error,
  isRetrying,
  retryError,
  onRetry,
}: Readonly<WorkspaceLayoutRecoveryNoticeProps>) {
  if (!error) return null;

  return (
    <Box style={styles.container}>
      <Text accessibilityLiveRegion="assertive" style={styles.message}>
        Your floor changes have not been confirmed by the server.
      </Text>
      {retryError ? (
        <Text accessibilityLiveRegion="polite" style={styles.secondaryMessage}>
          {retryError}
        </Text>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityHint="Attempts to save your current floor arrangement again"
        accessibilityState={{ disabled: isRetrying }}
        disabled={isRetrying}
        onPress={onRetry}
        style={styles.button}
      >
        <Text style={styles.buttonText}>{isRetrying ? 'Retrying…' : 'Retry floor sync'}</Text>
      </Pressable>
    </Box>
  );
}

const styles = {
  container: {
    gap: tokens.spacing.xs,
    padding: tokens.spacing.sm,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radii.md,
  },
  message: {
    color: tokens.semantic.text.primary,
    fontSize: 13,
  },
  secondaryMessage: {
    color: tokens.semantic.text.secondary,
    fontSize: tokens.typography.sizes.xs,
  },
  button: {
    alignSelf: 'flex-start' as const,
    minHeight: 44,
    justifyContent: 'center' as const,
    paddingHorizontal: tokens.spacing.sm,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radii.sm,
  },
  buttonText: {
    color: tokens.semantic.text.primary,
    fontSize: tokens.typography.sizes.sm,
  },
};
